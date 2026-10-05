import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';

import { connectDatabase } from '../src/config/database.js';
import { CaptchaRewardConfig } from '../src/models/CaptchaRewardConfig.js';
import { CaptchaAttempt } from '../src/models/CaptchaAttempt.js';
import { CaptchaChallenge } from '../src/models/CaptchaChallenge.js';
import { User } from '../src/models/User.js';
import { Wallet } from '../src/models/Wallet.js';
import { claimChallenge, createChallenge, verifyChallenge } from '../src/services/captcha.service.js';

let user;

test.before(async () => {
  await connectDatabase();
  user = await User.create({
    email: `captcha-${randomUUID()}@veloop.test`,
    passwordHash: 'test-hash',
    displayName: 'Captcha Tester'
  });

  await Wallet.findOneAndUpdate(
    { userId: user._id },
    { $set: { balanceUnits: 200, currency: 'GEMS' } },
    { upsert: true, new: true }
  );

  await CaptchaRewardConfig.findOneAndUpdate(
    {},
    { $set: { correctRewardUnits: 2, wrongRewardUnits: 1, currency: 'GEMS', active: true } },
    { upsert: true, new: true }
  );
});

test.after(async () => {
  await CaptchaAttempt.deleteMany({ userId: user._id });
  await CaptchaChallenge.deleteMany({ userId: user._id });
  await Wallet.deleteOne({ userId: user._id });
  await User.deleteOne({ _id: user._id });
  await mongooseDisconnect();
});

test.beforeEach(async () => {
  await CaptchaAttempt.deleteMany({ userId: user._id });
  await CaptchaChallenge.deleteMany({ userId: user._id });
  await Wallet.updateOne({ userId: user._id }, { $set: { balanceUnits: 200, currency: 'GEMS' } });
});

async function mongooseDisconnect() {
  const mongoose = await import('mongoose');
  await mongoose.default.disconnect();
}

test('creates a valid challenge with exactly four safe options', async () => {
  const challenge = await createChallenge(user._id);

  assert.equal(challenge.challengeId.startsWith('CAP-'), true);
  assert.equal(challenge.question.length > 0, true);
  assert.equal(Array.isArray(challenge.options), true);
  assert.equal(challenge.options.length, 4);
  assert.ok(!Object.hasOwn(challenge, 'correctOption'));

  const saved = await CaptchaChallenge.findOne({ challengeId: challenge.challengeId, userId: user._id }).select('+correctOption');
  assert.equal(saved.options.length, 4);
  assert.equal(saved.correctOption, saved.captchaText);
});

test('verifies correct and wrong answers using server-side rewards', async () => {
  const created = await createChallenge(user._id);
  const saved = await CaptchaChallenge.findOne({ challengeId: created.challengeId, userId: user._id }).select('+correctOption');

  const correctResult = await verifyChallenge(user._id, {
    challengeId: created.challengeId,
    selectedOption: saved.correctOption
  }, { ip: '127.0.0.1' });

  assert.equal(correctResult.result, 'CORRECT');
  assert.equal(correctResult.reward.amount, 1);

  const wrongChallenge = await createChallenge(user._id);
  const wrongSaved = await CaptchaChallenge.findOne({ challengeId: wrongChallenge.challengeId, userId: user._id }).select('+correctOption');
  const wrongOption = wrongSaved.options.find(option => option !== wrongSaved.correctOption);

  const wrongResult = await verifyChallenge(user._id, {
    challengeId: wrongChallenge.challengeId,
    selectedOption: wrongOption
  }, { ip: '127.0.0.1' });

  assert.equal(wrongResult.result, 'WRONG');
  assert.equal(wrongResult.reward.amount, 0.5);
  assert.equal(wrongResult.balance.amount > 0, true);
});

test('prevents duplicate claims for the same completed challenge', async () => {
  const challenge = await createChallenge(user._id);
  const saved = await CaptchaChallenge.findOne({ challengeId: challenge.challengeId, userId: user._id }).select('+correctOption');

  await verifyChallenge(user._id, {
    challengeId: challenge.challengeId,
    selectedOption: saved.correctOption
  }, { ip: '127.0.0.1' });

  const firstClaim = await claimChallenge(user._id, challenge.challengeId);
  assert.equal(firstClaim.status, 'CLAIMED');

  await assert.rejects(
    () => claimChallenge(user._id, challenge.challengeId),
    /already been claimed|unavailable/i
  );
});
