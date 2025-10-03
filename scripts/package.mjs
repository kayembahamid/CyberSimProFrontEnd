import { copyFile, mkdir, rm } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readdirSync, statSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');

async function cleanDist() {
  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });
}

function walkDir(dir) {
  const entries = readdirSync(dir);
  const files = [];
  for (const entry of entries) {
    if (entry === 'dist' || entry === 'node_modules' || entry.startsWith('.')) continue;
    const abs = join(dir, entry);
    const rel = abs.replace(`${ROOT}/`, '');
    const stats = statSync(abs);
    if (stats.isDirectory()) {
      files.push(...walkDir(abs));
    } else if (/^(index\.html|assets\/.+|docs\/.+|server\.js|README\.md|package\.json|package-lock\.json)$/.test(rel)) {
      files.push({ abs, rel });
    }
  }
  return files;
}

async function buildStatic() {
  await cleanDist();
  const files = walkDir(ROOT);
  for (const { abs, rel } of files) {
    const dest = join(DIST, rel);
    await mkdir(dirname(dest), { recursive: true });
    await copyFile(abs, dest);
  }
  console.log(`Packaged ${files.length} files into dist/`);
}

buildStatic().catch((error) => {
  console.error('Static packaging failed:', error);
  process.exit(1);
});
