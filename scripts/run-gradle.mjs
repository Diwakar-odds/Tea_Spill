import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

function findJdk21Home() {
  const candidates = [];

  if (process.env.JAVA_HOME) {
    candidates.push(process.env.JAVA_HOME);
  }

  const localJdkRoot = path.join(os.homedir(), '.jdk');
  if (fs.existsSync(localJdkRoot)) {
    const entries = fs.readdirSync(localJdkRoot, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.startsWith('jdk-21')) {
        candidates.push(path.join(localJdkRoot, entry.name));
      }
    }
  }

  for (const candidate of candidates) {
    const javaExe =
      process.platform === 'win32'
        ? path.join(candidate, 'bin', 'java.exe')
        : path.join(candidate, 'bin', 'java');

    if (fs.existsSync(javaExe)) {
      return candidate;
    }
  }

  return null;
}

const task = process.argv[2];
if (!task) {
  console.error('[mobile-build] Missing Gradle task. Example: node scripts/run-gradle.mjs assembleDebug');
  process.exit(1);
}

const androidDir = path.join(process.cwd(), 'android');
if (!fs.existsSync(androidDir)) {
  console.error('[mobile-build] android/ directory not found. Run: npx cap add android');
  process.exit(1);
}

const env = { ...process.env };
const jdk21Home = findJdk21Home();

if (jdk21Home) {
  env.JAVA_HOME = jdk21Home;
  const javaBin = path.join(jdk21Home, 'bin');
  env.PATH =
    process.platform === 'win32'
      ? `${javaBin};${env.PATH || ''}`
      : `${javaBin}:${env.PATH || ''}`;
  console.log(`[mobile-build] Using JAVA_HOME=${jdk21Home}`);
} else {
  console.warn('[mobile-build] JDK 21 not found. Using current Java environment.');
}

const gradleCommand = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
const result = spawnSync(gradleCommand, [task], {
  cwd: androidDir,
  stdio: 'inherit',
  env,
  shell: process.platform === 'win32'
});

if (result.error) {
  console.error(`[mobile-build] Failed to execute Gradle: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
