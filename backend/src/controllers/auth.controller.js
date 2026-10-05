import { loginUser, registerUser } from '../services/auth.service.js';

export async function register(request, response, next) { try { response.status(201).json({ success: true, ...(await registerUser(request.body)) }); } catch (error) { next(error); } }
export async function login(request, response, next) { try { response.json({ success: true, ...(await loginUser(request.body)) }); } catch (error) { next(error); } }
export async function me(request, response) { response.json({ success: true, user: request.user }); }
