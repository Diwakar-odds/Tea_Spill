#!/usr/bin/env bash
set -euo pipefail

escape_for_js() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

supabase_url_raw="${SUPABASE_URL:-}"
supabase_key_raw="${SUPABASE_ANON_KEY:-${SUPABASE_KEY:-}}"
google_client_id_raw="${GOOGLE_CLIENT_ID:-}"

supabase_url="$(escape_for_js "$supabase_url_raw")"
supabase_key="$(escape_for_js "$supabase_key_raw")"
google_client_id="$(escape_for_js "$google_client_id_raw")"

cat > runtime-config.js <<EOF
window.TEA_SPILL_CONFIG = {
  SUPABASE_URL: "$supabase_url",
  SUPABASE_KEY: "$supabase_key",
  GOOGLE_CLIENT_ID: "$google_client_id",
  ALLOW_INSECURE_DB_FALLBACK: false
};
EOF

if [[ -z "$supabase_url_raw" || -z "$supabase_key_raw" || -z "$google_client_id_raw" ]]; then
  echo "[netlify-build] Warning: One or more runtime variables are empty. App may fall back to local mode."
fi

echo "[netlify-build] runtime-config.js generated."
