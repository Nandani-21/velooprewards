import { claimChallenge, createChallenge, getCurrentChallenge, getHistory, verifyChallenge } from '../services/captcha.service.js';

const required = (body, fields) => fields.every(field => typeof body[field] === 'string' && body[field].trim());
export async function current(request, response, next) { try { response.json({ success: true, challenge: await getCurrentChallenge(request.user.sub) }); } catch (error) { next(error); } }
export async function newChallenge(request, response, next) { try { response.status(201).json({ success: true, challenge: await createChallenge(request.user.sub) }); } catch (error) { next(error); } }
export async function verify(request, response, next) { try { if (!required(request.body, ['challengeId', 'selectedOption'])) return response.status(422).json({ success: false, code: 'VALIDATION_ERROR', message: 'challengeId and selectedOption are required.' }); response.json({ success: true, ...(await verifyChallenge(request.user.sub, request.body, { ip: request.ip, userAgent: request.get('user-agent') })) }); } catch (error) { next(error); } }
export async function claim(request, response, next) { try { if (!required(request.body, ['challengeId'])) return response.status(422).json({ success: false, code: 'VALIDATION_ERROR', message: 'challengeId is required.' }); response.json({ success: true, ...(await claimChallenge(request.user.sub, request.body.challengeId)) }); } catch (error) { next(error); } }
export async function history(request, response, next) { try { response.json({ success: true, history: await getHistory(request.user.sub) }); } catch (error) { next(error); } }
export async function config(request, response) { response.json({ success: true, config: { currency: 'GEMS', precision: 'half-gem units' } }); }
