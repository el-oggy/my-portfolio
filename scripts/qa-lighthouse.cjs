/**
 * qa-lighthouse.cjs — Lighthouse runner against a locally-served production
 * build, using Brave as the Chromium host (no Chrome install needed).
 *
 * Usage: node scripts/qa-lighthouse.cjs <url> <outBase>
 *   e.g. node scripts/qa-lighthouse.cjs http://localhost:3133/ qa-screenshots/M0-lh-home
 *
 * Tooling note (rule 5): `lighthouse` + `puppeteer-core` are QA-only, installed
 * with `npm i --no-save` — NOT project dependencies, never shipped to prod.
 */
const fs = require("fs");
const lighthouseModule = require("lighthouse");
const chromeLauncherModule = require("chrome-launcher");
// ESM interop: recent lighthouse/chrome-launcher builds expose a default export
const lighthouse = lighthouseModule.default || lighthouseModule;
const chromeLauncher = chromeLauncherModule.default || chromeLauncherModule;

const BRAVE = "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe";
const TARGET_URL = process.argv[2] || "http://localhost:3133/";
const OUT_BASE = process.argv[3] || "qa-screenshots/M0-lh-home";
const FORM_FACTOR = process.argv[4] || "desktop"; // "desktop" | "mobile"

(async () => {
  const chrome = await chromeLauncher.launch({
    chromePath: BRAVE,
    chromeFlags: [
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu-sandbox",
      "--use-gl=angle",
      "--enable-unsafe-swiftshader",
    ],
  });
  const isMobile = FORM_FACTOR === "mobile";
  const opts = {
    port: chrome.port,
    output: "json",
    logLevel: "error",
    onlyCategories: ["performance"],
    formFactor: isMobile ? "mobile" : "desktop",
    screenEmulation: isMobile
      ? { mobile: true, width: 390, height: 844, deviceScaleFactor: 3, disabled: false }
      : { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false },
    // Simulated throttling (Lantern) keeps before/after runs comparable and
    // is how Lighthouse reports scores by default.
    maxWaitForLoad: 120000,
  };
  const run = await lighthouse(TARGET_URL, opts);
  if (!run || !run.lhr) {
    console.error("FAIL: lighthouse returned no report");
    await chrome.kill();
    process.exit(1);
  }
  const lhr = run.lhr;
  fs.mkdirSync(require("path").dirname(OUT_BASE), { recursive: true });
  fs.writeFileSync(OUT_BASE + ".json", JSON.stringify(lhr));

  const a = lhr.audits;
  const line = (name, audit) =>
    console.log(`${name}: ${audit && audit.displayValue ? audit.displayValue : "n/a"}`);
  console.log(`URL: ${TARGET_URL} [${FORM_FACTOR}]`);
  console.log(`PERFORMANCE SCORE: ${Math.round(lhr.categories.performance.score * 100)}`);
  line("FCP", a["first-contentful-paint"]);
  line("LCP", a["largest-contentful-paint"]);
  line("SpeedIndex", a["speed-index"]);
  line("TBT", a["total-blocking-time"]);
  console.log("report saved:", OUT_BASE + ".json");
  try { await chrome.kill(); } catch { /* Windows temp-profile cleanup EPERM is harmless */ }
  process.exit(0);
})().catch((e) => {
  console.error("FAIL:", e.message);
  process.exit(1);
});