import mongoose from 'mongoose';

const configSchema = new mongoose.Schema({
  correctRewardUnits: { type: Number, default: 2 },
  wrongRewardUnits: { type: Number, default: 1 },
  currency: { type: String, default: 'GEMS' },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export const CaptchaRewardConfig = mongoose.model('CaptchaRewardConfig', configSchema);
