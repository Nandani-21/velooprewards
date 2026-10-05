import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { CaptchaChallenge } from '../models/CaptchaChallenge.js';
import { CaptchaAttempt } from '../models/CaptchaAttempt.js';
import { CaptchaRewardConfig } from '../models/CaptchaRewardConfig.js';
import { GemTransaction } from '../models/GemTransaction.js';
import { Wallet } from '../models/Wallet.js';
import { createCaptchaPayload } from '../utils/captchaGenerator.js';
import { writeAudit } from './audit.service.js';

const publicChallenge = challenge => ({ challengeId: challenge.challengeId, question: challenge.captchaText, options: challenge.options, expiresAt: challenge.expiresAt });
const amount = units => units / 2;

async function expireActive(userId) {
  await CaptchaChallenge.updateMany({ userId, status: 'ACTIVE', expiresAt: { $lte: new Date() } }, { $set: { status: 'EXPIRED' } });
}

export async function createChallenge(userId) {
  await expireActive(userId);
  await CaptchaChallenge.updateMany({ userId, status: 'ACTIVE' }, { $set: { status: 'DISCARDED' } });
  const payload = createCaptchaPayload();
  const challenge = await CaptchaChallenge.create({ challengeId: `CAP-${crypto.randomBytes(6).toString('hex').toUpperCase()}`, userId, ...payload, expiresAt: new Date(Date.now() + env.challengeTtlSeconds * 1000), rewardStatus: 'NONE' });
  await writeAudit('CHALLENGE_CREATED', { userId, challengeId: challenge.challengeId });
  return publicChallenge(challenge);
}

export async function getCurrentChallenge(userId) {
  await expireActive(userId);
  const challenge = await CaptchaChallenge.findOne({ userId, status: 'ACTIVE', expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
  return challenge ? publicChallenge(challenge) : createChallenge(userId);
}

async function verifyWithoutTransaction(userId, { challengeId, selectedOption }, metadata) {
  const challenge = await CaptchaChallenge.findOne({ challengeId, userId }).select('+correctOption');
  if (!challenge) { const error = new Error('Challenge was not found.'); error.statusCode = 404; error.code = 'CHALLENGE_NOT_FOUND'; throw error; }
  if (challenge.status !== 'ACTIVE') { const error = new Error('This CAPTCHA has already been completed.'); error.statusCode = 409; error.code = 'CHALLENGE_ALREADY_COMPLETED'; throw error; }
  if (challenge.expiresAt <= new Date()) { await CaptchaChallenge.updateOne({ _id: challenge._id, status: 'ACTIVE' }, { $set: { status: 'EXPIRED' } }); const error = new Error('This CAPTCHA has expired. Please continue with a new CAPTCHA.'); error.statusCode = 410; error.code = 'CHALLENGE_EXPIRED'; throw error; }
  if (!challenge.options.includes(selectedOption)) { const error = new Error('Selected option is invalid.'); error.statusCode = 422; error.code = 'INVALID_OPTION'; throw error; }
  const config = await CaptchaRewardConfig.findOne({ active: true }).sort({ createdAt: -1 }) || { correctRewardUnits: 2, wrongRewardUnits: 1, currency: 'GEMS' };
  const correct = selectedOption === challenge.correctOption;
  const rewardUnits = correct ? config.correctRewardUnits : config.wrongRewardUnits;
  const result = correct ? 'CORRECT' : 'WRONG';
  const completedAt = new Date();
  const claimed = await CaptchaChallenge.findOneAndUpdate(
    { _id: challenge._id, status: 'ACTIVE', expiresAt: { $gt: completedAt } },
    { $set: { status: 'COMPLETED', selectedOption, result, rewardAmountUnits: rewardUnits, rewardStatus: 'PENDING', completedAt } },
    { new: true }
  );
  if (!claimed) { const error = new Error('This CAPTCHA has already been completed.'); error.statusCode = 409; error.code = 'CHALLENGE_ALREADY_COMPLETED'; throw error; }
  const wallet = await Wallet.findOneAndUpdate({ userId }, { $inc: { balanceUnits: rewardUnits } }, { new: false });
  if (!wallet) { await CaptchaChallenge.updateOne({ _id: challenge._id, status: 'COMPLETED' }, { $set: { status: 'ACTIVE', rewardStatus: 'NONE' }, $unset: { selectedOption: 1, result: 1, rewardAmountUnits: 1, completedAt: 1 } }); const error = new Error('Wallet was not found.'); error.statusCode = 404; error.code = 'WALLET_NOT_FOUND'; throw error; }
  const after = wallet.balanceUnits + rewardUnits;
  await CaptchaAttempt.create({ attemptId: `ATT-${crypto.randomBytes(8).toString('hex')}`, challengeId, userId, selectedOption, result, rewardUnits, metadata });
  await GemTransaction.create({ transactionId: `TX-${crypto.randomBytes(8).toString('hex')}`, userId, amountUnits: rewardUnits, currency: config.currency, type: 'CAPTCHA_REWARD', referenceId: challengeId, balanceBeforeUnits: wallet.balanceUnits, balanceAfterUnits: after });
  await writeAudit('CHALLENGE_VERIFIED', { userId, challengeId, metadata });
  await writeAudit('REWARD_CREATED', { userId, challengeId, metadata: { rewardUnits, transactionMode: 'ATOMIC_CHALLENGE_FALLBACK' } });
  return { result, reward: { currency: config.currency, amount: amount(rewardUnits) }, balance: { currency: 'GEMS', amount: amount(after) }, challengeId };
}

export async function verifyChallenge(userId, { challengeId, selectedOption }, metadata = {}) {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const challenge = await CaptchaChallenge.findOne({ challengeId, userId }).select('+correctOption').session(session);
      if (!challenge) { const error = new Error('Challenge was not found.'); error.statusCode = 404; error.code = 'CHALLENGE_NOT_FOUND'; throw error; }
      if (challenge.status !== 'ACTIVE') { const error = new Error('This CAPTCHA has already been completed.'); error.statusCode = 409; error.code = 'CHALLENGE_ALREADY_COMPLETED'; throw error; }
      if (challenge.expiresAt <= new Date()) { challenge.status = 'EXPIRED'; await challenge.save({ session }); const error = new Error('This CAPTCHA has expired. Please continue with a new CAPTCHA.'); error.statusCode = 410; error.code = 'CHALLENGE_EXPIRED'; throw error; }
      if (!challenge.options.includes(selectedOption)) { const error = new Error('Selected option is invalid.'); error.statusCode = 422; error.code = 'INVALID_OPTION'; throw error; }
      const config = await CaptchaRewardConfig.findOne({ active: true }).sort({ createdAt: -1 }).session(session) || { correctRewardUnits: 2, wrongRewardUnits: 1, currency: 'GEMS' };
      const correct = selectedOption === challenge.correctOption;
      const rewardUnits = correct ? config.correctRewardUnits : config.wrongRewardUnits;
      const wallet = await Wallet.findOneAndUpdate({ userId }, { $inc: { balanceUnits: rewardUnits } }, { new: false, session });
      if (!wallet) { const error = new Error('Wallet was not found.'); error.statusCode = 404; error.code = 'WALLET_NOT_FOUND'; throw error; }
      const after = wallet.balanceUnits + rewardUnits;
      challenge.status = 'COMPLETED'; challenge.selectedOption = selectedOption; challenge.result = correct ? 'CORRECT' : 'WRONG'; challenge.rewardAmountUnits = rewardUnits; challenge.rewardStatus = 'PENDING'; challenge.completedAt = new Date();
      await challenge.save({ session });
      await CaptchaAttempt.create([{ attemptId: `ATT-${crypto.randomBytes(8).toString('hex')}`, challengeId, userId, selectedOption, result: challenge.result, rewardUnits, metadata }], { session });
      await GemTransaction.create([{ transactionId: `TX-${crypto.randomBytes(8).toString('hex')}`, userId, amountUnits: rewardUnits, currency: config.currency, type: 'CAPTCHA_REWARD', referenceId: challengeId, balanceBeforeUnits: wallet.balanceUnits, balanceAfterUnits: after }], { session });
      await writeAudit('CHALLENGE_VERIFIED', { userId, challengeId, metadata });
      await writeAudit('REWARD_CREATED', { userId, challengeId, metadata: { rewardUnits } });
      result = { result: challenge.result, reward: { currency: config.currency, amount: amount(rewardUnits) }, balance: { currency: 'GEMS', amount: amount(after) }, challengeId };
    });
    return result;
  } catch (error) {
    const transactionUnsupported = error.code === 20 || error.message?.includes('Transaction numbers are only allowed');
    if (transactionUnsupported) return verifyWithoutTransaction(userId, { challengeId, selectedOption }, metadata);
    throw error;
  } finally { await session.endSession(); }
}

export async function claimChallenge(userId, challengeId) {
  const challenge = await CaptchaChallenge.findOneAndUpdate({ challengeId, userId, status: 'COMPLETED', rewardStatus: 'PENDING' }, { $set: { rewardStatus: 'CLAIMED' } }, { new: true });
  if (!challenge) { const error = new Error('This reward has already been claimed or is unavailable.'); error.statusCode = 409; error.code = 'REWARD_ALREADY_CLAIMED'; throw error; }
  await writeAudit('REWARD_CLAIMED', { userId, challengeId });
  return { challengeId, status: 'CLAIMED' };
}

export async function getHistory(userId) {
  const rows = await CaptchaChallenge.find({ userId, status: 'COMPLETED' }).sort({ completedAt: -1 }).limit(50);
  return rows.map(row => ({ challengeId: row.challengeId, result: row.result, reward: amount(row.rewardAmountUnits), rewardStatus: row.rewardStatus, completedAt: row.completedAt }));
}
