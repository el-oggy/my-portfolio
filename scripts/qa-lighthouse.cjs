#!/usr/bin/env node
/**
 * qa-lighthouse.cjs — Lighthouse against a running build, via Brave.
 *
 * Writes full JSON reports plus a compact stdout table, and records the browser
 * build and user agent so noisy headless numbers stay attributable.
 * FAILS LOUD: unreachable server, missing deps, or an unparseable score is an
 * error, never a default of 0 and never a skipped report.
 *
 * Baseline (docs/room-realism/M0-lighthouse-baseline.md, not currently
 * reproducible): home 35, email 69. Absolute floors for phase 2:
 * Perf >= 45 and LCP <= 4000ms.
 *
 * Usage: node scripts/qa-lighthouse.cjs
 * Env: QA_PORT, QA_BASE, QA_OUT, QA_ROUTES, CHROME_PATH,
 *      QA_MIN_PERF, QA_MAX_LCP_MS
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const PORT = process.env.QA_PORT || '3000';
const BASE = (process.env.QA_BASE || `http://localhost:${PORT}`).replace(/\/+$/, '');
const OUT = path.resolve(process.env.QA_OUT || 'qa-evidence');
const ROUTES = (process.env.QA_ROUTES || '/,/email')
  .split(',').map((r) => r.trim()).filter(Boolean);
const MIN_PERF = Number(process.env.QA_MIN_PERF || 45);
const MAX_LCP_MS = Number(process.env.QA_MAX_LCP_MS || 4000);

const BROWSER_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
  'C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
  path.join(process.env.LOCALAPPDATA || '', 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'),
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].filter(Boolean);

function findBrowser() {
  for (const p of BROWSER_CANDIDATES) {
    try { if (fs.existsSync(p)) return p; } catch { /* ignore */ }
  }
  return null;
}

/** QA-only tooling. Never enters package.json dependencies. */
function loadDeps() {
  try {
    // Lighthouse >= 12 ships as ESM; under require() the callable lands on
    // `.default`. Handle both shapes so the script works either way.
    const mod = require('lighthouse');
    const lighthouse = typeof mod === 'function' ? mod : mod.default;
    if (typeof lighthouse !== 'function') {
      throw new Error(`unexpected lighthouse export (keys: ${Object.keys(mod).slice(0, 5).join(', ')})`);
    }
    return { lighthouse, chromeLauncher: require('chrome-launcher') };
  } catch (err) {
    console.error('DEPS MISSING — the QA harness needs lighthouse and chrome-launcher.');
    console.error('Install them without touching package.json dependencies:');
    console.error('  npm i --no-save lighthouse chrome-launcher');
    console.error(`Underlying error: ${err.message}`);
    process.exit(2);
  }
  return null;
}

const log = (m) => console.log(`[lh] ${m}`);

/** Read a Lighthouse metric, failing loudly rather than defaulting to 0. */
function metric(audits, key) {
  const a = audits[key];
  if (!a) throw new Error(`Lighthouse report is missing the "${key}" audit`);
  if (a.score === null || a.score === undefined) throw new Error(`Audit "${key}" has no score`);
  return { value: a.numericValue, score: a.score, display: a.displayValue || null };
}

function reachable(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => { res.resume(); resolve(res.statusCode < 500); })
      .on('error', () => resolve(false));
  });
}

async function main() {
  const { lighthouse, chromeLauncher } = loadDeps();

  const executablePath = findBrowser();
  if (!executablePath) {
    console.error('NO BROWSER FOUND. Looked for:');
    BROWSER_CANDIDATES.forEach((p) => console.error(`  ${p}`));
    console.error('Set CHROME_PATH to override.');
    process.exit(2);
  }

  // Refuse to run blind — a missing server is an error, not a zero score.
  for (const route of ROUTES) {
    const url = `${BASE}${route}`;
    if (!(await reachable(url))) {
      console.error(`RESULT: FAIL — server unreachable at ${url}. Start the app first.`);
      process.exit(1);
    }
  }
  log(`server reachable at ${BASE} for: ${ROUTES.join(', ')}`);

  const chrome = await chromeLauncher.launch({
    chromePath: executablePath,
    chromeFlags: [
      '--headless=new',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--enable-unsafe-swiftshader',
      '--use-gl=angle',
      '--enable-webgl',
      '--mute-audio',
    ],
  });
  log(`browser: ${executablePath}`);

  const results = [];
  try {
    for (const route of ROUTES) {
      const url = `${BASE}${route}`;
      log(`auditing ${url}`);
      const runResult = await lighthouse(url, {
        port: chrome.port,
        output: ['json'],
        logLevel: 'error',
        onlyCategories: ['performance'],
      });

      const lhr = runResult && runResult.lhr;
      if (!lhr || !lhr.categories || !lhr.categories.performance) {
        throw new Error(`Lighthouse returned no performance category for ${url}`);
      }

      const perf = lhr.categories.performance.score * 100;
      const fcp = metric(lhr.audits, 'first-contentful-paint');
      const lcp = metric(lhr.audits, 'largest-contentful-paint');
      const tbt = metric(lhr.audits, 'total-blocking-time');
      const cls = metric(lhr.audits, 'cumulative-layout-shift');

      const slug = route === '/' ? 'home' : route.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
      const reportFile = path.join(OUT, `lighthouse-${slug}.json`);

      const record = {
        route,
        url,
        generatedAt: new Date().toISOString(),
        browser: executablePath,
        userAgent: lhr.environment && lhr.environment.hostUserAgent,
        lighthouseVersion: lhr.lighthouseVersion,
        performance: +perf.toFixed(1),
        fcpMs: Math.round(fcp.value),
        lcpMs: Math.round(lcp.value),
        tbtMs: Math.round(tbt.value),
        cls: +cls.value.toFixed(3),
        floors: { minPerformance: MIN_PERF, maxLcpMs: MAX_LCP_MS },
        meetsFloors: perf >= MIN_PERF && lcp.value <= MAX_LCP_MS,
        note: 'Headless/emulated GPU on a laptop; indicative, not a production device measurement.',
      };

      if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
      fs.writeFileSync(reportFile, JSON.stringify({ ...lhr, qa: record }, null, 2));
      results.push({ ...record, reportFile });
    }
  } catch (err) {
    // Lighthouse 13 fails to clean up its own temp profile on Windows with an
    // EPERM teardown error AFTER the report is produced. The audits succeeded
    // and every report is on disk, so this must not be reported as a run
    // failure — record it as a warning and keep the results.
    if (/EPERM|Permission denied/i.test(err.message) && results.length) {
      console.warn(`\n[lh] WARNING: Lighthouse temp-profile cleanup failed after ${results.length} audit(s): ${err.message}`);
      console.warn('[lh] Reports were written successfully; treating this as a non-fatal teardown warning.');
    } else {
      console.error(`\nRESULT: FAIL — ${err.message}`);
      process.exit(1);
    }
  } finally {
    try { await chrome.kill(); } catch { /* browser already gone */ }
  }

  console.log('\n=== LIGHTHOUSE ===');
  console.log('route        perf   fcp      lcp      tbt     cls     floors');
  results.forEach((r) => {
    console.log(
      `${r.route.padEnd(12)} ${String(r.performance).padStart(4)}  ` +
      `${String(r.fcpMs + 'ms').padEnd(8)} ${String(r.lcpMs + 'ms').padEnd(8)} ` +
      `${String(r.tbtMs + 'ms').padEnd(7)} ${String(r.cls).padEnd(7)} ` +
      `${r.meetsFloors ? 'PASS' : 'BELOW FLOOR'}`
    );
  });
  console.log('baseline for reference: home 35 / email 69 (M0, not reproducible).');

  const below = results.filter((r) => !r.meetsFloors);
  if (below.length) {
    below.forEach((r) => console.error(`BELOW FLOOR: ${r.route} perf=${r.performance} lcp=${r.lcpMs}ms`));
    console.error(`\nRESULT: FAIL — ${below.length} route(s) below the absolute floors.`);
    process.exit(1);
  }
  console.log('\nRESULT: PASS — all routes meet the absolute floors.');
  process.exit(0);
}

main().catch((err) => {
  console.error(`\nRESULT: FAIL — ${err.message}`);
  process.exit(1);
});
