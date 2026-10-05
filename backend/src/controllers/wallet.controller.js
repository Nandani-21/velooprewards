import { getWallet } from '../services/wallet.service.js';

export async function wallet(request, response, next) { try { response.json({ success: true, wallet: await getWallet(request.user.sub) }); } catch (error) { next(error); } }
