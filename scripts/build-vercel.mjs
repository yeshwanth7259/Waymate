import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const webDir = path.join(rootDir, 'waymate-launch-v2', 'web');
const adminDir = path.join(rootDir, 'waymate-launch-v2', 'admin');
const distDir = path.join(rootDir, 'dist');
const distAdminDir = path.join(distDir, 'admin');

console.log('=== Building WayMate for Vercel ===');

function run(cmd, cwd) {
  console.log(`[EXEC] ${cmd} (in ${path.relative(rootDir, cwd) || '.'})`);
  execSync(cmd, { cwd, stdio: 'inherit', env: { ...process.env, CI: 'true' } });
}

// Ensure dependencies are installed in web and admin
if (!fs.existsSync(path.join(webDir, 'node_modules'))) {
  console.log('Installing web dependencies...');
  run('npm install --include=dev', webDir);
}

if (!fs.existsSync(path.join(adminDir, 'node_modules'))) {
  console.log('Installing admin dependencies...');
  run('npm install --include=dev', adminDir);
}

// Build Web
console.log('Building web client...');
run('npm run build', webDir);

// Build Admin
console.log('Building admin client...');
run('npm run build', adminDir);

// Prepare root dist directory
console.log('Assembling dist directory...');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Copy Web build output to root dist
const webDist = path.join(webDir, 'dist');
if (fs.existsSync(webDist)) {
  fs.cpSync(webDist, distDir, { recursive: true });
  console.log('Copied web build to dist/');
} else {
  throw new Error(`Web build output not found at ${webDist}`);
}

// Copy Admin build output to dist/admin
const adminDist = path.join(adminDir, 'dist');
if (fs.existsSync(adminDist)) {
  fs.mkdirSync(distAdminDir, { recursive: true });
  fs.cpSync(adminDist, distAdminDir, { recursive: true });
  console.log('Copied admin build to dist/admin/');
} else {
  throw new Error(`Admin build output not found at ${adminDist}`);
}

console.log('=== WayMate Vercel build complete ===');
