import rateLimit from 'express-rate-limit';

export const protectedRateLimit = rateLimit({ windowMs: 60 * 1000, limit: 60, standardHeaders: 'draft-8', legacyHeaders: false, message: { success: false, code: 'RATE_LIMITED', message: 'Too many requests. Please try again shortly.' } });
export const verifyRateLimit = rateLimit({ windowMs: 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false, message: { success: false, code: 'RATE_LIMITED', message: 'Verification requests are temporarily limited.' } });
