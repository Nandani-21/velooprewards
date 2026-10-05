import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
  challengeId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  captchaText: { type: String, required: true },
  options: { type: [String], required: true, validate: value => value.length === 4 },
  correctOption: { type: String, required: true, select: false },
  status: { type: String, enum: ['ACTIVE', 'COMPLETED', 'EXPIRED', 'DISCARDED'], default: 'ACTIVE', index: true },
  selectedOption: String,
  result: { type: String, enum: ['CORRECT', 'WRONG'] },
  rewardAmountUnits: { type: Number, min: 0 },
  rewardStatus: { type: String, enum: ['PENDING', 'CLAIMED', 'NONE'], default: 'NONE' },
  expiresAt: { type: Date, required: true, index: true },
  completedAt: Date
}, { timestamps: true });

challengeSchema.index({ userId: 1, status: 1, createdAt: -1 });
export const CaptchaChallenge = mongoose.model('CaptchaChallenge', challengeSchema);
