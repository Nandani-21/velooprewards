import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/database.js';
import { User } from '../src/models/User.js';
import { Wallet } from '../src/models/Wallet.js';
import { CaptchaRewardConfig } from '../src/models/CaptchaRewardConfig.js';

await connectDatabase();
const passwordHash = await bcrypt.hash('DemoPass123!', 12);
const user = await User.findOneAndUpdate({ email: 'demo@veloop.test' }, { $set: { displayName: 'Demo Member', passwordHash, status: 'ACTIVE' } }, { upsert: true, new: true });
await Wallet.findOneAndUpdate({ userId: user._id }, { $setOnInsert: { balanceUnits: 200, currency: 'GEMS' } }, { upsert: true });
await CaptchaRewardConfig.findOneAndUpdate({}, { $set: { correctRewardUnits: 2, wrongRewardUnits: 1, currency: 'GEMS', active: true } }, { upsert: true });
console.log('Demo account ready: demo@veloop.test / DemoPass123!');
await mongoose.disconnect();
