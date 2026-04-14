# Tea Spill

Tea Spill is a campus social web app for sharing short posts, reacting, commenting, and moderation workflows.

## Tech Stack

- Frontend: HTML, CSS, vanilla JavaScript
- Backend: Supabase (Auth, PostgREST, Storage)
- Hosting: Netlify
- Mobile wrapper: Capacitor (Android)

## Project Structure

- app.html: Main authenticated app shell
- index.html: Landing/login page
- css/: Shared and page styles
- js/: Client modules (app, feed, profile, reader, spill, admin, storage, api)
- data/: Static app data
- scripts/: Build/runtime/mobile helper scripts
- android/: Capacitor Android project
- runtime-config.js: Runtime frontend config (generated during Netlify build)

## Local Run

This project is static frontend code.

1. Serve the project folder with a local static server.
2. Open index.html or app.html in the browser.

## Runtime Configuration

The app reads runtime values from runtime-config.js.

Required values:

- SUPABASE_URL
- SUPABASE_KEY (Supabase anon key)
- GOOGLE_CLIENT_ID

Never place service_role keys in frontend runtime config.

## Netlify Deployment

Configured in netlify.toml:

- Build command: bash scripts/netlify-build.sh
- Publish directory: .

Required Netlify environment variables:

- SUPABASE_URL
- SUPABASE_ANON_KEY
- GOOGLE_CLIENT_ID

The build script writes runtime-config.js from env vars at deploy time.

## NPM Scripts

- npm run config:runtime: generate runtime-config.js from environment
- npm run mobile:prepare: prepare mobile web artifacts
- npm run mobile:copy: copy hosted build into Android project
- npm run mobile:sync: sync hosted build into Android project
- npm run mobile:open: open Android project
- npm run mobile:apk:debug: build debug APK
- npm run mobile:apk:release: build release APK
- npm run mobile:apk:debug:local: build debug APK using local bundled app
- npm run mobile:apk:release:local: build release APK using local bundled app

## Notes

- Keep .env local only (already ignored by git).
- node_modules and Android build artifacts are ignored.
- Runtime config defaults are intentionally blank in repository for security.
- For launch reliability, prefer `npm run mobile:apk:release:local` and install fresh APK.

## License

ISC
