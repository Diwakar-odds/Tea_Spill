import fs from 'node:fs';
import path from 'node:path';

function findProjectRoot(startDir) {
  let current = startDir;
  while (true) {
    const hasPackageJson = fs.existsSync(path.join(current, 'package.json'));
    const hasAndroidResDir = fs.existsSync(path.join(current, 'android', 'app', 'src', 'main', 'res'));
    if (hasPackageJson && hasAndroidResDir) return current;

    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

function isPngFile(filePath) {
  if (!fs.existsSync(filePath)) return false;
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const fd = fs.openSync(filePath, 'r');
  try {
    const header = Buffer.alloc(8);
    fs.readSync(fd, header, 0, 8, 0);
    return header.equals(signature);
  } finally {
    fs.closeSync(fd);
  }
}

function firstExistingPng(paths) {
  for (const p of paths) {
    if (isPngFile(p)) return p;
  }
  return null;
}

const rootDir = findProjectRoot(process.cwd());
if (!rootDir) {
  console.error('[mobile-icons] Could not find project root.');
  process.exit(1);
}

const resDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'res');
const brandingIcon = path.join(rootDir, 'branding', 'spill-wise-logo.png');
const densities = ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'];
const iconNames = ['ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png'];
const adaptiveForegroundDrawable = path.join(resDir, 'drawable', 'ic_launcher_foreground_custom.png');

const candidateBaseIcons = [];
for (const density of densities) {
  const dir = path.join(resDir, `mipmap-${density}`);
  candidateBaseIcons.push(path.join(dir, 'ic_launcher_foreground.png'));
  candidateBaseIcons.push(path.join(dir, 'ic_launcher.png'));
}
candidateBaseIcons.push(brandingIcon);

const sourceIcon = firstExistingPng(candidateBaseIcons);
if (!sourceIcon) {
  console.error('[mobile-icons] No valid PNG source found to repair Android launcher icons.');
  console.error('[mobile-icons] Run npm run mobile:icon after placing branding/spill-wise-logo.png.');
  process.exit(1);
}

let repaired = 0;

if (!isPngFile(adaptiveForegroundDrawable)) {
  fs.mkdirSync(path.dirname(adaptiveForegroundDrawable), { recursive: true });
  fs.copyFileSync(sourceIcon, adaptiveForegroundDrawable);
  repaired += 1;
}

for (const density of densities) {
  const dir = path.join(resDir, `mipmap-${density}`);
  if (!fs.existsSync(dir)) continue;

  for (const iconName of iconNames) {
    const target = path.join(dir, iconName);
    if (!isPngFile(target)) {
      fs.copyFileSync(sourceIcon, target);
      repaired += 1;
    }
  }
}

if (repaired > 0) {
  console.log(`[mobile-icons] Repaired ${repaired} launcher icon file(s) using: ${sourceIcon}`);
} else {
  console.log('[mobile-icons] Launcher icon files are already valid.');
}
