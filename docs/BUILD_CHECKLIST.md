# Build Checklist

## Backend

1. `cd backend`
2. `npm install`
3. `npx prisma generate`
4. `npx prisma migrate dev --name init`
5. `npx prisma db seed`
6. `npm run typecheck`
7. `npm run build`

## Mobile

1. `cd mobile`
2. `npm install`
3. `npm run typecheck`
4. `npm start`
5. Verify flows:
   - signup/login/logout
   - email verification token submit
   - forgot/reset password
   - Google and Apple sign-in
   - Stripe checkout with Payment Sheet
   - restore purchases

## Windows

1. `cd windows`
2. `npm install`
3. `npm run build`
4. `npx tauri info`
5. Install Rust (`rustup`) if missing
6. `npm run tauri:build`

## Final Smoke Tests

1. Create user and verify email.
2. Complete test payment (`4242 4242 4242 4242`).
3. Confirm webhook writes purchase row.
4. Confirm `premiumUnlocked` changes to `true`.
5. Confirm premium-gated UI unlocks on mobile and desktop.
