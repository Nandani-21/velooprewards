import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import captchaRoutes from './routes/captcha.routes.js';
import walletRoutes from './routes/wallet.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

export const app = express();
app.use(helmet());
const allowedOrigins = new Set([env.clientOrigin, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175']);
app.use(cors({ origin: (origin, callback) => {
	if (!origin || allowedOrigins.has(origin)) return callback(null, true);
	return callback(new Error('Origin is not allowed by CORS.'));
} }));
app.use(express.json({ limit: '20kb' }));
app.get('/health', (request, response) => response.json({ success: true, service: 'veloop-captcha-api' }));
app.use('/api/auth', authRoutes);
app.use('/api/captcha', captchaRoutes);
app.use('/api/wallet', walletRoutes);
app.use(errorHandler);
