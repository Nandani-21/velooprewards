import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  balanceUnits: { type: Number, required: true, default: 200, min: 0 },
  currency: { type: String, default: 'GEMS' }
}, { timestamps: true });

export const Wallet = mongoose.model('Wallet', walletSchema);
