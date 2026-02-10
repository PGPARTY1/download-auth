# API Documentation

Base URL (local): `http://localhost:4100`

## Health

- `GET /health`

## Authentication

- `POST /auth/signup`
  - body: `{ "name": "Ava", "email": "ava@example.com", "password": "Pookie1234!" }`
  - sends verification email token
- `POST /auth/verify-email`
  - body: `{ "token": "..." }`
- `POST /auth/login`
  - body: `{ "email": "...", "password": "..." }`
- `POST /auth/oauth/google`
  - body: `{ "idToken": "..." }`
- `POST /auth/oauth/apple`
  - body: `{ "identityToken": "..." }`
- `POST /auth/forgot-password`
  - body: `{ "email": "..." }`
- `POST /auth/reset-password`
  - body: `{ "token": "...", "newPassword": "..." }`
- `POST /auth/refresh`
  - body: `{ "refreshToken": "..." }`
- `POST /auth/logout`
  - body: `{ "refreshToken": "..." }`
- `GET /auth/me`
  - header: `Authorization: Bearer <accessToken>`

## Products

- `GET /products`

## Payments

- `GET /payments/config`
- `POST /payments/payment-intent`
  - auth required
  - body: `{ "productId": "<uuid>", "platform": "ios|android|windows|web" }`
  - returns Stripe Payment Sheet config data + client secret
- `POST /payments/checkout-session`
  - auth required
  - body: `{ "productId": "<uuid>", "successUrl": "...", "cancelUrl": "..." }`
  - returns Stripe Checkout URL (desktop flow)
- `GET /payments/history`
  - auth required
- `POST /payments/restore`
  - auth required
  - recomputes premium access based on successful purchases

## Stripe Webhooks

- `POST /webhooks/stripe`
  - raw body required
  - validates `stripe-signature`
  - handles:
    - `payment_intent.succeeded`
    - `payment_intent.payment_failed`
    - `checkout.session.completed`
  - updates `purchases` and `users.premiumUnlocked`

## Authentication Flow Notes

1. Client logs in/signs up and receives access + refresh token.
2. Access token is used for authenticated calls.
3. On access token expiry, call `/auth/refresh` with refresh token.
4. Refresh token is rotated and stored hashed in `sessions`.
5. Logout revokes the current refresh session.

## Payment Flow Notes

1. App fetches plans from `/products`.
2. Mobile checkout:
   - create intent via `/payments/payment-intent`
   - run Stripe Payment Sheet with returned `clientSecret`
3. Desktop checkout:
   - create checkout session via `/payments/checkout-session`
   - open returned URL in browser
4. Stripe webhook writes final purchase status.
5. Client calls `/payments/restore` to unlock premium state.
