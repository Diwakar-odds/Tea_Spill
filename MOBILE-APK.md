# Tea Spill Android APK (Quick Setup)

This repo is configured to wrap the web app into an Android app using Capacitor.

## 1) One-time setup

```bash
npm install
```

Install Android Studio and ensure Android SDK (platforms + build-tools) is installed.

If Android platform is not added yet:

```bash
npx cap add android
```

## 2) Sync latest web app into Android project

```bash
npm run mobile:sync
```

What this does:

1. Generates `runtime-config.js` from `.env` values.
2. Creates a clean `dist-mobile/` web bundle.
3. Syncs that bundle into `android/`.

## 3) Build a quick installable APK (fastest)

```bash
npm run mobile:apk:debug
```

If SDK path is configured correctly, `mobile:doctor` auto-creates `android/local.properties`.

APK output:

- `android/app/build/outputs/apk/debug/app-debug.apk`

## 4) Build release APK (for public users)

```bash
npm run mobile:apk:release
```

This now creates ABI-split APKs (smaller files per CPU architecture) instead of one large universal APK.
Typical outputs:

- `android/app/build/outputs/apk/release/app-arm64-v8a-release-unsigned.apk`
- `android/app/build/outputs/apk/release/app-armeabi-v7a-release-unsigned.apk`

To distribute publicly, sign using Android Studio:

1. `npm run mobile:open`
2. In Android Studio: Build -> Generate Signed Bundle / APK
3. Choose APK and your keystore

Typical signed output location:

- `android/app/release/`

Recommended for most modern phones:

- Use the signed `arm64-v8a` APK (usually much smaller than universal).

## 5) Publish APK on your website

1. Copy your signed `arm64-v8a` APK to `downloads/TeaSpill-latest.apk`
2. Deploy your site
3. Users can download directly from:

- `/downloads/TeaSpill-latest.apk`

Your landing page already links to this APK path.

## Notes

- Keep `.env` configured with `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `GOOGLE_CLIENT_ID` before syncing.
- APK build scripts prefer JDK 21 automatically (`~/.jdk/jdk-21*`) to avoid Gradle/JDK compatibility errors.
- If build says SDK not found, install Android SDK from Android Studio and run `npm run mobile:doctor`.
- Debug APK is fine for testing and quick sharing.
- For broader public sharing, use a signed release APK.
