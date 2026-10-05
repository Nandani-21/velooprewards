import { Router } from 'express';
import { wallet } from '../controllers/wallet.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/gems', requireAuth, wallet);
export default router;
