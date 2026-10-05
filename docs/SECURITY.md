# Security Notes

- Correct answers are stored with `select: false` and are never serialized in challenge/history responses.
- Rewards are selected from the database configuration; client `reward` and `isCorrect` fields are ignored.
- User identity comes only from JWT claims, preventing user ID substitution.
- Challenge ownership, expiry, active status, and option membership are checked server-side.
- Unique challenge attempts and transaction references prevent replay rewards.
- Wallet and ledger updates run in a MongoDB transaction.
- Claim uses a conditional `PENDING` to `CLAIMED` update, preventing duplicate claims during rapid requests.
- Rate limits protect current, new, verify, and claim operations.
- Audit events record creation, verification, reward creation, claims, and suspicious failures.
- This is abuse-resistant application architecture, not a claim of perfect fraud prevention.
