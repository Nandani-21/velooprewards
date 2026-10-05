import { Wallet } from '../models/Wallet.js';

export async function getWallet(userId) {
  const wallet = await Wallet.findOne({ userId });
  if (!wallet) { const error = new Error('Wallet was not found.'); error.statusCode = 404; error.code = 'WALLET_NOT_FOUND'; throw error; }
  return { currency: wallet.currency, amount: wallet.balanceUnits / 2 };
}
