# Spill Wise Android APK (Simple Mode)

This project now uses a simple hosted-first app flow by default.

- The APK opens `https://spill-wise.netlify.app/app.html` directly in app WebView.
- Website updates go live in the app without rebuilding APK.
- No hybrid switching setup needed.

## 1) One-time setup

```bash
npm install
```

Install Android Studio and Android SDK.

If Android folder is missing:

```bash
npx cap add android
```

## 2) Build release APK

```bash
npm run mobile:apk:release
```

This command does:

1. Generate runtime config.
2. Prepare mobile web files.
3. Ensure icon resources are valid.
4. Sync Android project (hosted mode by default).
5. Run Gradle release build with Windows lock retry safety.

## 3) Sign APK in Android Studio

1. Run `npm run mobile:open`.
2. Build -> Generate Signed Bundle / APK.
3. Choose APK and your keystore.

Use signed `arm64-v8a` APK for most phones.

## 4) Publish for users

1. Rename selected signed APK to `TeaSpill-latest.apk`.
2. Put it in `downloads/`.
3. Deploy website.
4. Share `/downloads/TeaSpill-latest.apk`.

## Optional local fallback mode

Only use if you intentionally want bundled local mode:

- `npm run mobile:sync:local`
- `npm run mobile:open:local`

## Notes

- If you see runtime-config warning about empty variables, set:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `GOOGLE_CLIENT_ID`
- If Android still uses old behavior, uninstall previous app and install fresh signed APK.
