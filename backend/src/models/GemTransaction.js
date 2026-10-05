import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amountUnits: { type: Number, required: true },
  currency: { type: String, default: 'GEMS' },
  type: { type: String, enum: ['CAPTCHA_REWARD'], required: true },
  source: { type: String, default: 'CAPTCHA_EARN' },
  referenceId: { type: String, required: true, unique: true },
  balanceBeforeUnits: { type: Number, required: true },
  balanceAfterUnits: { type: Number, required: true },
  status: { type: String, default: 'COMPLETED' }
}, { timestamps: true });

export const GemTransaction = mongoose.model('GemTransaction', transactionSchema);
