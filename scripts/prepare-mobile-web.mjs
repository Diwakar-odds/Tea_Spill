import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const outputDir = path.join(rootDir, 'dist-mobile');

const itemsToCopy = [
  'index.html',
  'app.html',
  'runtime-config.js',
  'css',
  'js',
  'data'
];

function copyRecursive(source, destination) {
  const stat = fs.statSync(source);

  if (stat.isDirectory()) {
    fs.mkdirSync(destination, { recursive: true });
    for (const child of fs.readdirSync(source)) {
      copyRecursive(path.join(source, child), path.join(destination, child));
    }
    return;
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

for (const item of itemsToCopy) {
  const sourcePath = path.join(rootDir, item);
  const destinationPath = path.join(outputDir, item);

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`[mobile-prepare] Missing required path: ${item}`);
  }

  copyRecursive(sourcePath, destinationPath);
}

console.log('[mobile-prepare] dist-mobile generated successfully.');
