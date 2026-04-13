import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const envPath = path.join(rootDir, '.env');
const outputPath = path.join(rootDir, 'runtime-config.js');

function parseDotEnv(content) {
  const result = {};
  const lines = content.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const equalsIndex = line.indexOf('=');
    if (equalsIndex === -1) continue;

    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    result[key] = value;
  }

  return result;
}

function escapeForJs(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

let fileEnv = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  fileEnv = parseDotEnv(envContent);
}

const mergedEnv = {
  ...fileEnv,
  ...process.env
};

const supabaseUrlRaw = mergedEnv.SUPABASE_URL || '';
const supabaseKeyRaw = mergedEnv.SUPABASE_ANON_KEY || mergedEnv.SUPABASE_KEY || '';
const googleClientIdRaw = mergedEnv.GOOGLE_CLIENT_ID || '';
const mobileOtaModeRaw = (mergedEnv.MOBILE_OTA_MODE || 'hybrid').trim();
const mobileRemoteAppUrlRaw = (
  mergedEnv.MOBILE_REMOTE_APP_URL || 'https://spill-wise.netlify.app/app.html'
).trim();
const mobileRemoteBootTimeoutRaw = String(mergedEnv.MOBILE_REMOTE_BOOT_TIMEOUT_MS || '2500').trim();
const parsedBootTimeout = Number.parseInt(mobileRemoteBootTimeoutRaw, 10);
const mobileRemoteBootTimeoutMs = Number.isFinite(parsedBootTimeout) ? parsedBootTimeout : 2500;

const configContent = `window.TEA_SPILL_CONFIG = {\n  SUPABASE_URL: "${escapeForJs(supabaseUrlRaw)}",\n  SUPABASE_KEY: "${escapeForJs(supabaseKeyRaw)}",\n  GOOGLE_CLIENT_ID: "${escapeForJs(googleClientIdRaw)}",\n  ALLOW_INSECURE_DB_FALLBACK: false,\n  MOBILE_OTA_MODE: "${escapeForJs(mobileOtaModeRaw)}",\n  MOBILE_REMOTE_APP_URL: "${escapeForJs(mobileRemoteAppUrlRaw)}",\n  MOBILE_REMOTE_BOOT_TIMEOUT_MS: ${mobileRemoteBootTimeoutMs}\n};\n`;

fs.writeFileSync(outputPath, configContent, 'utf8');

if (!supabaseUrlRaw || !supabaseKeyRaw || !googleClientIdRaw) {
  console.warn('[mobile-config] Warning: One or more runtime variables are empty. App may run in local fallback mode.');
}

console.log('[mobile-config] runtime-config.js generated.');
