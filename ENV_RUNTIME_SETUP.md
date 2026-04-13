# Runtime Environment Setup (Netlify + Supabase)

This project now loads frontend runtime config from `runtime-config.js`.

## How it works
1. Netlify runs `scripts/netlify-build.sh` during build.
2. That script reads environment variables and generates `runtime-config.js`.
3. `app.html` loads `runtime-config.js` before `js/api.js`.
4. `js/api.js` reads `window.TEA_SPILL_CONFIG` and connects to Supabase.

## Required Netlify Environment Variables
Set these in Netlify: Site settings -> Environment variables.

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `GOOGLE_CLIENT_ID`

## Files involved
- `netlify.toml`
- `scripts/netlify-build.sh`
- `runtime-config.js` (generated/overwritten at build)
- `app.html`

## Local test
In terminal:

```bash
cd /f/Projects/Tea_spill
export SUPABASE_URL="https://your-project-ref.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key"
export GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
bash scripts/netlify-build.sh
```

Then open `app.html` through your normal local static server.

## Security note
`SUPABASE_ANON_KEY` is expected to be public in browser apps.
Never use Supabase `service_role` key in frontend code or runtime-config.js.
