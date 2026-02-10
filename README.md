# PookieStudios Cross-Platform Monorepo

This repository now contains a production-oriented multi-app setup for PookieStudios:

- `backend/` Node.js + Express + Prisma + PostgreSQL API
- `mobile/` React Native (Expo) app for iOS and Android
- `windows/` Tauri + React desktop app for Windows
- `docs/API.md` API reference
- `docs/DEPLOYMENT.md` build and deployment steps
- `docs/SELF_HOSTED_BUILDS.md` local builds + security hardening guidance

## Architecture

### Backend

- JWT access/refresh sessions with DB-backed refresh token revocation
- Email/password auth, Google token exchange, Apple token exchange
- Email verification + reset-password flows
- Stripe PaymentIntent APIs (mobile Payment Sheet)
- Stripe Checkout Session API (Windows desktop flow)
- Stripe webhook purchase reconciliation
- PostgreSQL models: `users`, `sessions`, `products`, `purchases`

### Mobile

- Secure token storage via `expo-secure-store`
- Splash, login/signup, home, premium store, profile/history, settings
- Premium gating with blurred overlay + "Unlock Premium"
- Stripe Payment Sheet + Apple Pay / Google Pay options
- Restore purchases flow

### Windows

- React + Tauri shell for Windows executable packaging
- Auth + premium gating + store checkout + purchase history
- Stripe checkout opens external browser, then restore sync in app
- Error and maintenance states

## Quick Start

### 1) Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

### 2) Mobile

```bash
cd mobile
cp .env.example .env
npm install
npm run start
```

### 3) Windows

```bash
cd windows
cp .env.example .env
npm install
npm run dev
```

## If You See "Failed to fetch" During Sign Up

This means the app cannot reach the backend API.

1. Start backend first:
```bash
cd backend
npm run dev
```
2. Confirm API health:
   - Open `http://localhost:4100/api/health`
3. Check app env URL:
   - Mobile: `EXPO_PUBLIC_API_URL`
   - Windows: `VITE_API_BASE_URL`
4. Use either:
   - `http://localhost:4100` or
   - `http://localhost:4100/api`
   (the app now auto-normalizes this)

## Validation Commands Run

- `backend`: `npm run typecheck`, `npm run build`
- `mobile`: `npm run typecheck`
- `windows`: `npm run typecheck`, `npm run build`

## Known Machine Requirement

Tauri installer build requires Rust/Cargo and Windows build tools.
If `npm run tauri:build` fails with `failed to get cargo metadata: program not found`, install Rust via `rustup` and retry.

## Test Credentials (Seed)

After backend seed:

- Email: `test@pookiestudios.local`
- Password: `Pookie1234!`

## Stripe Test Setup

Use your own Stripe test keys in env files:

- Publishable: `pk_test_...`
- Secret: `sk_test_...`
- Webhook secret: `whsec_...`

See `docs/DEPLOYMENT.md` for complete platform build outputs (TestFlight, APK/AAB, Windows `.exe`).
For fully self-hosted and signed builds, see `docs/SELF_HOSTED_BUILDS.md`.
