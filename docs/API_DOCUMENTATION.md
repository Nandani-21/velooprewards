# API Documentation

All CAPTCHA and wallet endpoints require `Authorization: Bearer <JWT>`.

## Authentication

- `POST /api/auth/register` accepts `email`, `password`, and `displayName`.
- `POST /api/auth/login` accepts `email` and `password` and returns a JWT.
- `GET /api/auth/me` returns the authenticated user payload.

## CAPTCHA

- `GET /api/captcha/current` returns the active challenge payload: `challengeId`, `question`, `options`, and `expiresAt`. It never includes `correctOption`.
- `POST /api/captcha/verify` accepts only `challengeId` and `selectedOption`. The backend verifies the challenge for the authenticated user, checks ownership, expiry, and duplicate completion, and returns the authoritative result, reward, and wallet balance. Malicious fields such as `reward`, `isCorrect`, or `userId` are ignored.
- `POST /api/captcha/claim` accepts `challengeId` and transitions a completed pending reward to `CLAIMED`. Repeated claims are rejected with `REWARD_ALREADY_CLAIMED`.
- `POST /api/captcha/new` marks the existing active challenge as discarded and creates a fresh server-side challenge.
- `GET /api/captcha/history` returns the authenticated user's reward history without exposing correct answers.
- `GET /api/captcha/config` returns display-safe precision metadata.

## Wallet and ledger

- `GET /api/wallet/gems` returns the authoritative server-side wallet balance in Gems.
- Rewards create `GemTransaction` records with the transaction ID, amount, currency, type, reference ID, and balance before/after values.

## Error format

Errors use `{ success: false, code, message }`.

Relevant codes include:

- `UNAUTHORIZED`
- `VALIDATION_ERROR`
- `CHALLENGE_NOT_FOUND`
- `CHALLENGE_EXPIRED`
- `CHALLENGE_ALREADY_COMPLETED`
- `INVALID_OPTION`
- `REWARD_ALREADY_CLAIMED`
- `RATE_LIMITED`
- `WALLET_NOT_FOUND`

## Reward policy

- Correct answer: +1 Gem
- Wrong answer: +0.5 Gem
- Rewards are controlled by the backend, not by the client.
- Reward precision is represented with half-Gem units internally, exposed as fractional Gems to the client.
