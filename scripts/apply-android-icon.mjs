import fs from 'node:fs';
import path from 'node:path';

function findProjectRoot(startDir) {
  let current = startDir;

  while (true) {
    const hasPackageJson = fs.existsSync(path.join(current, 'package.json'));
    const hasAndroidResDir = fs.existsSync(
      path.join(current, 'android', 'app', 'src', 'main', 'res')
    );

    if (hasPackageJson && hasAndroidResDir) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      return null;
    }
    current = parent;
  }
}

const rootDir = findProjectRoot(process.cwd());
if (!rootDir) {
  console.error('[mobile-icon] Could not find project root. Run the command inside the repository.');
  process.exit(1);
}

const sourcePath = process.env.ICON_PATH
  ? path.resolve(process.env.ICON_PATH)
  : path.join(rootDir, 'branding', 'spill-wise-logo.png');

const targetBaseDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'res');
const densities = ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'];
const iconFiles = ['ic_launcher.png', 'ic_launcher_foreground.png', 'ic_launcher_round.png'];

if (!fs.existsSync(sourcePath)) {
  console.error(`[mobile-icon] Source icon not found: ${sourcePath}`);
  console.error('[mobile-icon] Save your logo image at branding/spill-wise-logo.png or set ICON_PATH.');
  process.exit(1);
}

for (const density of densities) {
  const mipmapDir = path.join(targetBaseDir, `mipmap-${density}`);
  if (!fs.existsSync(mipmapDir)) {
    console.warn(`[mobile-icon] Skipping missing directory: ${mipmapDir}`);
    continue;
  }

  for (const iconFile of iconFiles) {
    const targetPath = path.join(mipmapDir, iconFile);
    fs.copyFileSync(sourcePath, targetPath);
  }
}

console.log('[mobile-icon] Android launcher icon assets replaced successfully.');
