/**
 * qa-reduced-motion.cjs — verifies the app honours prefers-reduced-motion.
 *
 * PerformanceContext forces the LOW tier when the media query matches, which
 * reduces particle counts, DPR and AA. We assert the query is actually observed
 * and the canvas still renders (a frozen-but-drawn scene, not a blank page).
 *
 * Usage: node scripts/qa-reduced-motion.cjs   (server must be running)
 */
const fs = require('fs');
const path = require('path');

const PORT = process.env.QA_PORT || '3000';
const BASE = (process.env.QA_BASE || `http://localhost:${PORT}`).replace(/\/+$/, '');
const OUT = path.resolve(process.env.QA_OUT || 'qa-evidence');

function loadDeps() {
  try {
    return require('puppeteer-core');
  } catch (err) {
    console.error('DEPS MISSING — needs puppeteer-core. Install without saving:');
    console.error('  npm i --no-save puppeteer-core');
    console.error(`Underlying error: ${err.message}`);
    process.exit(2);
  }
  return null;
}

const BROWSER = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
  'C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
].filter(Boolean);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const puppeteer = loadDeps();
  const executablePath = BROWSER.find((p) => { try { return fs.existsSync(p); } catch { return false; } });
  if (!executablePath) {
    console.error('NO BROWSER FOUND. Set CHROME_PATH to override.');
    process.exit(2);
  }

  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    defaultViewport: { width: 1280, height: 720 },
    args: ['--enable-unsafe-swiftshader', '--use-gl=angle', '--no-sandbox',
      '--disable-dev-shm-usage', '--mute-audio', '--force-prefers-reduced-motion'],
  });

  const results = { generatedAt: new Date().toISOString(), base: BASE, browser: executablePath, checks: [] };
  const errors = [];

  try {
    const page = await browser.newPage();
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // The media query must be observed as true in this browser session.
    const matched = await page.evaluate(() =>
      window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    results.checks.push({ name: 'prefers-reduced-motion media query is active', pass: matched });
    if (!matched) {
      throw new Error('Could not enable prefers-reduced-motion emulation — cannot verify');
    }

    // The canvas must still render: reduced motion lowers the tier, it must
    // not leave the visitor staring at a blank page.
    const started = Date.now();
    let canvasOk = false;
    while (Date.now() - started < 60000) {
      canvasOk = await page.evaluate(() => {
        const c = document.querySelector('canvas');
        return !!(c && c.width > 0 && c.height > 0);
      });
      if (canvasOk) break;
      await sleep(400);
    }
    results.checks.push({ name: 'canvas renders under reduced motion', pass: canvasOk });

    await sleep(3000);
    if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
    const file = path.join(OUT, 'reduced-motion.png');
    const buf = await page.screenshot({ type: 'png' });
    if (buf.length < 10 * 1024) throw new Error(`reduced-motion.png is only ${buf.length} bytes`);
    fs.writeFileSync(file, buf);
    results.screenshot = { name: 'reduced-motion.png', bytes: buf.length };
    results.pageErrors = errors;
  } finally {
    await browser.close();
  }

  const failed = results.checks.filter((c) => !c.pass);
  results.checks.forEach((c) => console.log(`${c.pass ? 'PASS' : 'FAIL'} ${c.name}`));
  if (errors.length) {
    console.error(`page errors: ${errors.length}`);
    errors.slice(0, 5).forEach((e) => console.error(`  ${e}`));
  }
  if (failed.length || errors.length) {
    console.error(`\nRESULT: FAIL — ${failed.length} failed check(s), ${errors.length} error(s).`);
    process.exit(1);
  }
  console.log('\nRESULT: PASS — reduced motion honoured, scene still renders.');
  process.exit(0);
}

main().catch((e) => {
  console.error(`\nRESULT: FAIL — ${e.message}`);
  process.exit(1);
});
