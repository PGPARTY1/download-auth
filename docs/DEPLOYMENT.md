# Deployment Guide

## 1. Backend Deployment (Node + PostgreSQL)

Recommended platforms: Railway, Render, Fly.io, AWS ECS, or any Node host.

1. Provision PostgreSQL.
2. Set environment variables from `backend/.env.example`.
3. Run migrations:
   - `npx prisma migrate deploy`
4. Seed initial data:
   - `npx prisma db seed`
5. Start service:
   - `npm run start`

Expose:
- `GET /health` for uptime probes
- `POST /webhooks/stripe` for Stripe webhooks

## 2. Stripe Configuration

1. Create products/prices in Stripe test mode (and separately in live mode).
2. Set:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
3. In Stripe Dashboard, configure webhook endpoint:
   - `https://<api-domain>/webhooks/stripe`
4. Subscribe to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`

## 3. Mobile App Release

Use Expo EAS.

1. Configure app identifiers and signing credentials.
2. Set production env values in EAS secrets.
3. Build iOS:
   - `eas build --platform ios --profile production`
4. Build Android:
   - `eas build --platform android --profile preview` (debug APK)
   - `eas build --platform android --profile production` (release AAB)
5. Submit:
   - `eas submit --platform ios`
   - `eas submit --platform android`

## 4. Windows Desktop Release

Prerequisites:
- Rust via `rustup`
- MSVC build tools
- WebView2 runtime

Steps:
1. `cd windows`
2. `npm install`
3. `npm run tauri:build`
4. Publish generated `.exe` installer from:
   - `windows/src-tauri/target/release/bundle`

## 5. OAuth Providers

### Google

1. Create OAuth client IDs for mobile and desktop/web flows.
2. Set backend `GOOGLE_OAUTH_CLIENT_ID`.
3. Set mobile public IDs in `mobile/.env`.

### Apple

1. Configure Sign in with Apple service ID and keys.
2. Set backend `APPLE_SERVICE_ID`.
3. Enable Apple Sign In capability for iOS build.

## 6. Email Delivery

For verification/reset emails, configure SMTP in backend:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

Without SMTP config, email content is logged server-side for local testing.
