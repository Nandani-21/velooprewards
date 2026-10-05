import mongoose from 'mongoose';

const attemptSchema = new mongoose.Schema({
  attemptId: { type: String, required: true, unique: true },
  challengeId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  selectedOption: { type: String, required: true },
  result: { type: String, enum: ['CORRECT', 'WRONG'], required: true },
  rewardUnits: { type: Number, required: true },
  status: { type: String, default: 'COMPLETED' },
  metadata: { type: Object, default: {} }
}, { timestamps: true });

attemptSchema.index({ challengeId: 1 }, { unique: true });
export const CaptchaAttempt = mongoose.model('CaptchaAttempt', attemptSchema);
