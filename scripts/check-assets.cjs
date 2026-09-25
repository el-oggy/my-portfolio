/**
 * check-assets.cjs — verifies every /public asset referenced from source exists.
 *
 * Recreated after the 29d21a9 cleanup removed the old checker. Scans the source
 * tree for quoted literals that start with a public asset prefix and reports
 * any that would 404 at runtime.
 *
 * Usage: node scripts/check-assets.cjs
 * Exit 0 = all referenced assets present; exit 1 = missing assets listed.
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');
const SCAN_DIRS = ['app', 'components', 'lib', 'hooks'].filter((d) =>
  fs.existsSync(path.join(ROOT, d))
);
const EXTS = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.css', '.scss']);
const PREFIXES = ['/textures/', '/sounds/', '/fonts/', '/images/', '/models/', '/videos/', '/audio/'];

// Step 1: grab every quoted literal. Step 2: keep the public-prefixed ones.
// (Two simple regexes instead of one nested-escape monster.)
const QUOTED = new RegExp("['\"`]([^'\"`\n]+)['\"`]", 'g');

const files = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      walk(full);
    } else if (EXTS.has(path.extname(entry.name))) {
      files.push(full);
    }
  }
};
SCAN_DIRS.forEach((d) => walk(path.join(ROOT, d)));

const refs = new Map();
let dynamicCount = 0;
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  for (const match of src.matchAll(QUOTED)) {
    const raw = match[1];
    if (!PREFIXES.some((p) => raw.startsWith(p))) continue;
    if (raw.includes('${')) {
      dynamicCount++;
      continue;
    }
    const ref = raw.split('?')[0].split('#')[0];
    if (!refs.has(ref)) refs.set(ref, new Set());
    refs.get(ref).add(path.relative(ROOT, file));
  }
}

const missing = [];
for (const [ref, sources] of refs) {
  const onDisk = path.join(PUBLIC_DIR, ref.replace(/^\//, ''));
  if (!fs.existsSync(onDisk) || fs.statSync(onDisk).isDirectory()) {
    missing.push({ ref, sources: [...sources] });
  }
}

console.log(
  `scanned ${files.length} source files, ${refs.size} static asset refs (${dynamicCount} dynamic refs skipped)`
);
if (missing.length === 0) {
  console.log('OK: every referenced public asset exists');
  process.exit(0);
}
console.log(`MISSING ${missing.length} referenced asset(s):`);
for (const m of missing) console.log(`  ${m.ref}\n    <- ${m.sources.join(', ')}`);
process.exit(1);
