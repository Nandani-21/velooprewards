# Testing Plan

Backend test coverage should exercise correct and wrong answers, expired and completed challenges, duplicate verification, duplicate claims, fake `reward`, fake `isCorrect`, cross-user access, unauthorized requests, invalid/missing options, concurrent verification, rate limits, replay, and wallet consistency.

Manual acceptance flow: login, receive a challenge, select an option without a submit button, observe scanning/checking, verify the backend result, inspect the wallet and ledger in MongoDB, claim the pending reward, observe the mock rewarded-ad state, request a new challenge, and confirm the old challenge cannot be reused.

Capture screenshots for correct result, wrong result, claim, no thanks, new challenge, duplicate submission error, expired challenge error, forged reward request, concurrent request outcome, and unauthorized request.
