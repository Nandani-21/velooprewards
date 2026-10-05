import { Router } from 'express';
import { claim, config, current, history, newChallenge, verify } from '../controllers/captcha.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { protectedRateLimit, verifyRateLimit } from '../middleware/rateLimit.middleware.js';

const router = Router();
router.use(requireAuth);
router.get('/current', protectedRateLimit, current);
router.post('/new', protectedRateLimit, newChallenge);
router.post('/verify', verifyRateLimit, verify);
router.post('/claim', verifyRateLimit, claim);
router.get('/history', protectedRateLimit, history);
router.get('/config', config);
export default router;
