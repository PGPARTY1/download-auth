# Production Setup (pookiestudios.in)

This setup uses:

- Website/App frontend: `app.pookiestudios.in` (Vercel)
- API backend: `api.pookiestudios.in` (Railway using `backend/Dockerfile`)
- Optional marketing root: `pookiestudios.in` (Vercel)

## 1. Deploy backend to Railway

1. Create Railway project from this GitHub repo.
2. Set service root directory to `backend/`.
3. Railway will use `backend/railway.toml` + `backend/Dockerfile`.
4. Add environment variables:

- `NODE_ENV=production`
- `PORT=4100`
- `APP_PUBLIC_URL=https://app.pookiestudios.in`
- `DATABASE_URL=postgresql://...`
- `JWT_ACCESS_SECRET=<long random>`
- `JWT_REFRESH_SECRET=<long random>`
- `JWT_ACCESS_EXPIRES_IN=15m`
- `JWT_REFRESH_EXPIRES_IN=30d`
- `STRIPE_SECRET_KEY=sk_live_...`
- `STRIPE_PUBLISHABLE_KEY=pk_live_...`
- `STRIPE_WEBHOOK_SECRET=whsec_...`
- `STRIPE_MERCHANT_COUNTRY=US`
- `GOOGLE_OAUTH_CLIENT_ID=<prod google client id>`
- `APPLE_SERVICE_ID=<apple service id>`
- `SMTP_HOST=<smtp host>`
- `SMTP_PORT=587`
- `SMTP_SECURE=false`
- `SMTP_USER=<smtp user>`
- `SMTP_PASS=<smtp password>`
- `SMTP_FROM=hello@pookiestudios.in`

5. Add custom domain in Railway: `api.pookiestudios.in`.
6. In Stripe dashboard, add webhook endpoint:
- `https://api.pookiestudios.in/api/payments/webhooks/stripe`

## 2. Deploy frontend to Vercel

1. Create/Reuse Vercel project for this repo root (`./`).
2. Add custom domain `app.pookiestudios.in` to this project.
3. In Vercel env vars, set frontend API URLs:

- `VITE_API_BASE_URL=https://api.pookiestudios.in`
- `EXPO_PUBLIC_API_URL=https://api.pookiestudios.in`

If you use only the Next.js site here, keep only relevant vars for that site.

## 3. DNS records

In your DNS provider for `pookiestudios.in`:

- `app` -> CNAME to Vercel target
- `api` -> CNAME to Railway target

For `pookiestudio.in`, either:

- redirect to `pookiestudios.in`, or
- mirror same `app` and `api` subdomains if needed

## 4. OAuth callback setup

Configure providers for production domains:

- Google OAuth allowed origins/redirects should include `app.pookiestudios.in`
- Apple Service ID should include return URLs on `app.pookiestudios.in`

## 5. Verify

- `https://api.pookiestudios.in/api/health` returns `200`
- signup/login works from `https://app.pookiestudios.in`
- Stripe checkout and webhook update purchase status

