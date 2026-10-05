# VELoop Rewards - CAPTCHA Earn

A full-stack MERN CAPTCHA earning module. React provides the experience; Express and MongoDB own authentication, CAPTCHA correctness, reward decisions, wallet balances, ledger transactions, claim state, and audit history.

## Local setup

1. Start MongoDB locally or provide a MongoDB Atlas URI. MongoDB Atlas or a local replica set enables full multi-document transactions; standalone local MongoDB uses the documented atomic challenge-claim fallback for development.
2. Copy `.env.example` to a local `.env` in the project root and configure `MONGO_URI`, `JWT_SECRET`, `PORT`, `CLIENT_ORIGIN`, and `CHALLENGE_TTL_SECONDS`.
3. Install dependencies at the repo root: `npm install`.
4. Seed the development account: `cd backend && node seed/seedDemo.js`.
5. Start the app from the repo root: `npm run dev`.
6. Open the frontend at `http://localhost:5173`.

Demo login: `demo@veloop.test` / `DemoPass123!`.

## Architecture

Challenges are generated server-side and expose only a question and four options. Verification uses a MongoDB transaction, integer half-Gem units, a unique challenge attempt, a wallet increment, a ledger record, and challenge state transition. JWT identity is always derived server-side. The frontend never stores wallet authority or the correct option.

Reward logic is controlled by backend configuration, where correct answers award 1 Gem and wrong answers award 0.5 Gem. Wallet balances are stored server-side in MongoDB and the frontend only reads the authoritative value from `/api/wallet/gems`.

## Security and anti-abuse design

- Every CAPTCHA challenge belongs to the authenticated user.
- Challenge ownership, expiry, duplicate verification, and duplicate claim checks are enforced in the backend.
- `POST /api/captcha/verify` ignores malicious client fields such as `reward`, `isCorrect`, or `userId`.
- The backend derives the authenticated identity from the JWT and never accepts client-supplied user identity.
- `POST /api/captcha/claim` is idempotent and rejects duplicate claims.
- `POST /api/captcha/new` invalidates the previous challenge before creating a fresh one.

## Deployment

Deploy `frontend` to Vercel/Netlify with `VITE_API_URL`. Deploy `backend` to Render/Railway with the backend environment variables and a MongoDB Atlas connection string.

See `docs/API_DOCUMENTATION.md`, `docs/DATABASE.md`, `docs/SECURITY.md`, and `docs/TESTING.md` for more operating details.
