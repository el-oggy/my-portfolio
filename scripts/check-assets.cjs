/**
 * Pre-launch asset reference checker.
 * Verifies every statically referenced /textures, /images, /fonts, /sounds
 * path in source actually exists in public/. Flags missing files (which
 * would suspend useTexture/useLoader forever in R3F).
 */
const fs = require("fs");
const path = require("path");
const ROOT = process.cwd();
const exts = [".js", ".jsx", ".ts", ".tsx"];

function walk(d, acc = []) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    const s = fs.statSync(p);
    if (s.isDirectory()) {
      if (!["node_modules", ".next", "public", "scratchpad"].includes(f)) walk(p, acc);
    } else if (exts.includes(path.extname(f))) acc.push(p);
  }
  return acc;
}

const refRe = /['"]\/((?:textures|images|fonts|sounds)\/[^'")\s]+)['"]/g;
const missing = [];
let count = 0;

/**
 * Blank out comments so commented-out asset references (e.g. the disabled
 * ROOM_ASSETS manifest) don't produce false "missing file" reports.
 * Newlines are preserved to keep diffing/debugging sane.
 */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    // Line comments — the lookbehind avoids matching `://` inside URL strings.
    .replace(/(?<!:)\/\/[^\n]*/g, (m) => " ".repeat(m.length));
}

for (const f of walk(ROOT)) {
  const src = stripComments(fs.readFileSync(f, "utf8"));
  let m;
  refRe.lastIndex = 0;
  while ((m = refRe.exec(src))) {
    const rel = m[1];
    if (rel.includes("${")) continue; // dynamic fragments
    // strip painted-suffix derivation used at runtime
    count++;
    const candidates = [rel];
    const paintedVariants = [
      rel.replace(/\.webp$/, "_painted.webp"),
      rel.replace(/\.png$/, "_painted.png"),
    ];
    const p = path.join(ROOT, "public", rel);
    if (!fs.existsSync(p)) {
      // tolerate runtime-derived twins only when base exists
      missing.push({ file: path.relative(ROOT, f), rel });
    }
    void paintedVariants;
  }
}

console.log("total static asset refs:", count);
if (missing.length) {
  console.log("\nMISSING FILES (" + missing.length + "):");
  for (const x of missing) console.log("  /" + x.rel, "\n     <-", x.file);
} else {
  console.log("all referenced assets exist ✓");
}

// Fail the build when real (non-commented) references point at missing files.
if (missing.length) process.exit(1);
