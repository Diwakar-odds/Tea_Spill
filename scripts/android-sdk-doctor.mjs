import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const rootDir = process.cwd();
const androidDir = path.join(rootDir, 'android');

if (!fs.existsSync(androidDir)) {
  console.error('[mobile-doctor] android/ directory not found. Run: npx cap add android');
  process.exit(1);
}

const candidates = [];

if (process.env.ANDROID_HOME) candidates.push(process.env.ANDROID_HOME);
if (process.env.ANDROID_SDK_ROOT) candidates.push(process.env.ANDROID_SDK_ROOT);

const localAppData =
  process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');

candidates.push(path.join(localAppData, 'Android', 'Sdk'));
candidates.push(path.join(os.homedir(), 'Android', 'Sdk'));

const sdkPath = candidates.find((candidate) => {
  if (!candidate) return false;
  const hasSdkRoot = fs.existsSync(candidate);
  const hasBuildTools = fs.existsSync(path.join(candidate, 'build-tools'));
  const hasPlatforms = fs.existsSync(path.join(candidate, 'platforms'));
  return hasSdkRoot && (hasBuildTools || hasPlatforms);
});

if (!sdkPath) {
  console.error('[mobile-doctor] Android SDK not found.');
  console.error('[mobile-doctor] Install Android Studio + Android SDK, then re-run this command.');
  process.exit(1);
}

const normalizedPath = sdkPath.replace(/\\/g, '\\\\');
const localPropertiesPath = path.join(androidDir, 'local.properties');
fs.writeFileSync(localPropertiesPath, `sdk.dir=${normalizedPath}\n`, 'utf8');

console.log(`[mobile-doctor] Android SDK detected at: ${sdkPath}`);
console.log('[mobile-doctor] android/local.properties updated.');
