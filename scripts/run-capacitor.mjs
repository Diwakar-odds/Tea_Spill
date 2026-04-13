import { spawnSync } from 'node:child_process';

const mode = process.argv[2] === 'hosted' ? 'hosted' : 'local';
const capArgs = process.argv.slice(3);

if (capArgs.length === 0) {
  console.error('[mobile-cap] Missing Capacitor arguments. Example: node scripts/run-capacitor.mjs local sync android');
  process.exit(1);
}

const command = 'npx';
const args = ['cap', ...capArgs];
const env = { ...process.env };

if (mode === 'hosted') {
  env.MOBILE_HOSTED = '1';
} else {
  delete env.MOBILE_HOSTED;
}

console.log(`[mobile-cap] Mode: ${mode}. Running: ${command} ${args.join(' ')}`);

const result = spawnSync(command, args, {
  stdio: 'inherit',
  env,
  shell: true
});

if (result.error) {
  console.error('[mobile-cap] Failed to run Capacitor command:', result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 0);
