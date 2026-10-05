# Database Design

Balances use integer half-Gem units: 2 units display as 1 Gem and 1 unit displays as 0.5 Gems. This avoids binary floating-point drift.

Collections: `users`, `wallets`, `captchachallenges`, `captchaattempts`, `gemtransactions`, `captcharewardconfigs`, and `auditlogs`.

Important uniqueness constraints include user email, challenge ID, attempt challenge ID, transaction ID, and transaction reference ID. Verification updates the wallet, challenge, attempt, transaction, and audit events inside a MongoDB transaction when MongoDB supports transactions. For standalone development MongoDB, the service atomically claims the active challenge before writing the reward records, preserving concurrent replay protection while Atlas remains the production recommendation.
