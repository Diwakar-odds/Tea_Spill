import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

function findJdk21Home() {
  const candidates = [];

  const localJdkRoot = path.join(os.homedir(), '.jdk');
  if (fs.existsSync(localJdkRoot)) {
    const entries = fs.readdirSync(localJdkRoot, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.startsWith('jdk-21')) {
        candidates.push(path.join(localJdkRoot, entry.name));
      }
    }
  }

  if (process.env.JAVA_HOME) {
    candidates.push(process.env.JAVA_HOME);
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

function runGradle(args) {
  return spawnSync(gradleCommand, args, {
    cwd: androidDir,
    stdio: 'inherit',
    env,
    shell: process.platform === 'win32'
  });
}

function cleanupR8LockTargets() {
  const targets = [
    path.join(androidDir, 'app', 'build', 'intermediates', 'dex', 'release', 'minifyReleaseWithR8'),
    path.join(androidDir, 'app', 'build', 'intermediates', 'dex_archive_input_jar_hashes', 'release')
  ];

  for (const target of targets) {
    try {
      fs.rmSync(target, { recursive: true, force: true });
    } catch (error) {
      console.warn(`[mobile-build] Could not clean ${target}: ${error.message}`);
    }
  }
}

const isReleaseTask = task.toLowerCase().includes('release');
const baseArgs = isReleaseTask ? [task, '--no-daemon', '--max-workers=1'] : [task];
let result = runGradle(baseArgs);

if ((result.status ?? 1) !== 0 && isReleaseTask) {
  console.warn('[mobile-build] Release build failed. Retrying once with daemon stop + cleanup (Windows file lock recovery).');
  runGradle(['--stop']);
  cleanupR8LockTargets();
  result = runGradle([task, '--no-daemon', '--rerun-tasks', '--max-workers=1']);
}

if (result.error) {
  console.error(`[mobile-build] Failed to execute Gradle: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
