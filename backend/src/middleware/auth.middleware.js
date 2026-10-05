import { verifyToken } from '../utils/jwt.js';

export function requireAuth(request, response, next) {
  try {
    const header = request.headers.authorization || '';
    if (!header.startsWith('Bearer ')) return response.status(401).json({ success: false, code: 'UNAUTHORIZED', message: 'Authentication is required.' });
    request.user = verifyToken(header.slice(7));
    next();
  } catch {
    return response.status(401).json({ success: false, code: 'INVALID_TOKEN', message: 'Your session is invalid or expired.' });
  }
}
