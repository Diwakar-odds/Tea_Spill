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

const brandingDir = path.join(rootDir, 'branding');

function resolveSourceIcon() {
  if (process.env.ICON_PATH) {
    return path.resolve(process.env.ICON_PATH);
  }

  if (!fs.existsSync(brandingDir)) {
    return null;
  }

  const preferredNames = [
    'spill-wise-logo.png',
    'spill-wise-logo.jpg',
    'spill-wise-logo.jpeg',
    'spill-wise-logo.webp',
    'logo.png',
    'logo.jpg',
    'logo.jpeg',
    'logo.webp'
  ];

  const files = fs.readdirSync(brandingDir);
  const lowerMap = new Map(files.map((file) => [file.toLowerCase(), file]));

  for (const preferred of preferredNames) {
    const actual = lowerMap.get(preferred.toLowerCase());
    if (actual) {
      return path.join(brandingDir, actual);
    }
  }

  const firstImage = files.find((file) => /\.(png|jpg|jpeg|webp)$/i.test(file));
  if (firstImage) {
    return path.join(brandingDir, firstImage);
  }

  return null;
}

const sourcePath = resolveSourceIcon();

const targetBaseDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'res');
const densities = ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'];
const iconFiles = ['ic_launcher.png', 'ic_launcher_foreground.png', 'ic_launcher_round.png'];
const adaptiveForegroundDrawable = path.join(targetBaseDir, 'drawable', 'ic_launcher_foreground_custom.png');

function isPngFile(filePath) {
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

if (!sourcePath || !fs.existsSync(sourcePath)) {
  console.error(
    `[mobile-icon] Source icon not found. Expected branding path: ${path.join(brandingDir, 'spill-wise-logo.png')}`
  );
  if (fs.existsSync(brandingDir)) {
    const files = fs.readdirSync(brandingDir);
    console.error(`[mobile-icon] Files in branding/: ${files.length ? files.join(', ') : '(empty)'}`);
  } else {
    console.error('[mobile-icon] branding/ folder does not exist.');
  }
  console.error('[mobile-icon] Save your logo in branding/ or set ICON_PATH to the image location.');
  process.exit(1);
}

if (!isPngFile(sourcePath)) {
  console.error(`[mobile-icon] Source file is not a valid PNG: ${sourcePath}`);
  console.error('[mobile-icon] Export the logo as a real .png file (not renamed .jpg/.webp) and retry.');
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

fs.mkdirSync(path.dirname(adaptiveForegroundDrawable), { recursive: true });
fs.copyFileSync(sourcePath, adaptiveForegroundDrawable);

console.log('[mobile-icon] Android launcher icon assets replaced successfully.');
