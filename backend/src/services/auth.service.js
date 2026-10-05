import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Wallet } from '../models/Wallet.js';
import { signToken } from '../utils/jwt.js';

export async function registerUser({ email, password, displayName }) {
  const normalizedEmail = email.toLowerCase().trim();
  if (await User.exists({ email: normalizedEmail })) {
    const error = new Error('Email is already registered.'); error.statusCode = 409; error.code = 'EMAIL_EXISTS'; throw error;
  }
  const user = await User.create({ email: normalizedEmail, displayName, passwordHash: await bcrypt.hash(password, 12) });
  await Wallet.create({ userId: user._id, balanceUnits: 200 });
  return { token: signToken(user), user: { id: user._id, email: user.email, displayName: user.displayName } };
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    const error = new Error('Invalid email or password.'); error.statusCode = 401; error.code = 'INVALID_CREDENTIALS'; throw error;
  }
  return { token: signToken(user), user: { id: user._id, email: user.email, displayName: user.displayName } };
}
