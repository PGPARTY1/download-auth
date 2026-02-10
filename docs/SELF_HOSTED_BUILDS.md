# Self-Hosted Builds and Security

This project can be built fully on your own machines without third-party build services.

## Core principle

- Build locally or on your own CI runners.
- Keep signing keys under your control.
- Never commit secrets to git.

## Backend security baseline

1. Use long random JWT secrets (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`).
2. Store env vars in machine secret storage or private CI secrets.
3. Run PostgreSQL with restricted network access and strong credentials.
4. Enable HTTPS in production behind a reverse proxy.
5. Configure Stripe webhook secret and verify signatures (already implemented).
6. Rotate credentials periodically.

## iOS self-hosted build

1. Use Xcode on macOS with your own Apple Developer account.
2. Use your own signing certificate and provisioning profile.
3. Build archive locally:
   - `xcodebuild -workspace <workspace> -scheme <scheme> -configuration Release archive`
4. Export IPA and upload with your own credentials.

## Android self-hosted build

1. Use Android Studio + Gradle locally.
2. Generate and protect your own keystore.
3. Build debug APK:
   - `./gradlew assembleDebug`
4. Build signed AAB:
   - `./gradlew bundleRelease`
5. Keep keystore outside repo and back it up securely.

## Windows self-hosted build

1. Install Rust + Cargo + Visual Studio C++ Build Tools + Windows SDK.
2. Build Tauri app locally:
   - `npm --prefix windows run tauri:build`
3. Sign generated `.exe`/installer with your code-signing certificate.

## Secrets handling

- Use `.env` files only locally.
- Add secret scanning in CI if possible.
- Use separate keys for dev/staging/prod.

