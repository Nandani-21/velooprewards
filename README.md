# VELoop Rewards - CAPTCHA Earn

A full-stack MERN CAPTCHA Earn module for VELoop Rewards, featuring secure CAPTCHA verification, backend-controlled Gem rewards, wallet and transaction ledger tracking, JWT authentication, claim flow, anti-replay protection, and a responsive premium UI.

## Overview

This project is a secure CAPTCHA earning experience where the backend owns challenge generation, answer validation, reward decisions, wallet updates, and claim protection. The frontend only receives safe display data and reads the authoritative balance from the API.

## Local setup

1. Start MongoDB locally or provide a MongoDB Atlas URI.
2. Copy `.env.example` to a local `.env` in the project root and configure `MONGO_URI`, `JWT_SECRET`, `PORT`, `CLIENT_ORIGIN`, and `CHALLENGE_TTL_SECONDS`.
3. Install dependencies at the repo root: `npm install`.
4. Seed the development account: `cd backend && node seed/seedDemo.js`.
5. Start the app from the repo root: `npm run dev`.
6. Open the frontend at `http://localhost:5173`.

Demo login: `demo@veloop.test` / `DemoPass123!`

## Architecture

- Frontend: Vite + React
- Backend: Express + MongoDB + Mongoose
- Auth: JWT-based session identity
- Rewards: backend-controlled Gem logic
- Ledger: MongoDB transaction records for wallet movement
- Security: challenge ownership, expiry, replay protection, idempotent claims

## Reward logic

- Correct answer: +1 Gem
- Wrong answer: +0.5 Gem
- Rewards are calculated server-side and stored as authoritative wallet state

## Security and anti-abuse

- Challenge ownership is enforced by the authenticated user ID from the JWT
- Expired challenges are invalidated automatically
- Duplicate verification attempts are rejected
- Duplicate claims are rejected with idempotent backend logic
- Malicious client fields such as `reward`, `isCorrect`, and `userId` are ignored

## Documentation

See the docs folder for the API, database, security, and testing documentation:

- [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)
- [docs/DATABASE.md](docs/DATABASE.md)
- [docs/SECURITY.md](docs/SECURITY.md)
- [docs/TESTING.md](docs/TESTING.md)

## Deployment

- Frontend: Netlify / Vercel
- Backend: Render / Railway
- Database: MongoDB Atlas

Use environment variables for secrets and API URLs instead of hardcoded local values in production.
>>>>>>> origin/main
