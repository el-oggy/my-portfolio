/**
 * qa-walkthrough.cjs — production-mode full-journey QA harness.
 *
 * Drives a real browser (Brave/Chromium headless) through:
 *   preloader → entrance doors → corridor → each room (via the accessible
 *   sr-overlay teleporter, which mirrors the canvas state machine) → back.
 *
 * Records per-milestone evidence: screenshots, console errors, page errors,
 * HTTP>=400s, per-room FPS, and the "System Fault" WebGL-crash fallback.
 *
 * Usage:
 *   node scripts/qa-walkthrough.cjs <baseUrl> <tag> [desktop|mobile3g]
 *   node scripts/qa-walkthrough.cjs http://localhost:3133/ M0-walkthrough
 *
 * Tooling note (rule 5): puppeteer-core is QA-only (installed --no-save),
 * never shipped to production.
 */
const fs = require("fs");
const path = require("path");
const puppeteerModule = require("puppeteer-core");
const puppeteer = puppeteerModule.default || puppeteerModule;

const BRAVE = "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe";
const BASE = process.argv[2] || "http://localhost:3133/";
const TAG = process.argv[3] || "M0-walkthrough";
const PROFILE = process.argv[4] || "desktop"; // "desktop" | "mobile3g"
const SHOTS = path.join(__dirname, "..", "qa-screenshots");

// mobile3g = throttled mid-tier profile: 390x844 @ 3x DPR, 4x CPU throttle,
// Slow 3G network — matches rule 13's "throttled mid-tier mobile" requirement.
const IS_MOBILE = PROFILE === "mobile3g";
const VIEWPORT = IS_MOBILE
  ? { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true }
  : { width: 1440, height: 900 };

const ROOMS = [
  { id: "gallery", label: "The Gallery", state: "Gallery" },
  { id: "studio", label: "The Studio", state: "Studio" },
  { id: "about", label: "About", state: "About" },
  { id: "contact", label: "Contact", state: "Contact" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: BRAVE,
    headless: "new",
    args: ["--no-sandbox", "--use-gl=angle", "--enable-unsafe-swiftshader"],
    defaultViewport: VIEWPORT,
  });
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  if (IS_MOBILE) {
    const client = await page.createCDPSession();
    await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await client.send("Network.enable");
    await client.send("Network.emulateNetworkConditions", {
      offline: false, latency: 400,
      downloadThroughput: 400 * 1024, uploadThroughput: 400 * 1024, // Slow 3G
    });
  }

  const errors = [];
  const failedReqs = [];
  page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error" && !m.text().includes("favicon")) {
      errors.push(`[console.error] ${m.text().slice(0, 300)}`);
    }
  });
  page.on("response", (r) => {
    if (r.status() >= 400 && !r.url().includes("favicon")) {
      failedReqs.push(`[HTTP ${r.status()}] ${r.url()}`);
    }
  });

  const navText = () =>
    page.evaluate(() => {
      const nav = document.querySelector(".sr-overlay nav");
      return nav ? nav.textContent : "";
    });

  const waitFor = async (predicate, timeoutMs, label) => {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      if (await predicate()) { console.log(`  ok: ${label}`); return true; }
      await sleep(400);
    }
    console.log(`  !! TIMEOUT: ${label}`);
    errors.push(`[harness] timeout: ${label}`);
    return false;
  };

  const sampleFps = (ms) =>
    page.evaluate(
      (dur) =>
        new Promise((resolve) => {
          let frames = 0;
          const deltas = [];
          let last = performance.now();
          const start = last;
          const tick = (now) => {
            deltas.push(now - last);
            last = now;
            frames++;
            if (now - start < dur) requestAnimationFrame(tick);
            else {
              deltas.sort((x, y) => x - y);
              const p95 = deltas[Math.floor(deltas.length * 0.95)] || 0;
              resolve({ fps: Math.round((frames * 1000) / (now - start)), p95ms: Math.round(p95 * 10) / 10 });
            }
          };
          requestAnimationFrame(tick);
        }),
      ms
    );

  const crashed = () => page.evaluate(() => document.body.innerText.includes("System Fault"));

  console.log(`walkthrough: ${BASE} tag=${TAG} profile=${PROFILE}`);

  // 1) Preloader → entrance
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.screenshot({ path: path.join(SHOTS, `${TAG}-0-preloader.png`) });
  await waitFor(
    async () => (await navText()).includes("Click or press Enter on the doors"),
    IS_MOBILE ? 150000 : 90000,
    "preloader finished / app ready"
  );
  await sleep(IS_MOBILE ? 3000 : 1800);
  await page.screenshot({ path: path.join(SHOTS, `${TAG}-1-entrance.png`) });

  // 2) Open hallway entrance doors (real pointer clicks on the canvas)
  const [vx, vy] = [VIEWPORT.width / 2, VIEWPORT.height * 0.62];
  for (let attempt = 0; attempt < 8; attempt++) {
    const off = [0, -60, 60, -100, 100, 0][attempt % 6];
    await page.mouse.click(vx + off, vy);
    await sleep(2000);
    const t = await navText();
    if (t.includes("You are in the corridor") || t.includes("room.")) break;
  }
  await waitFor(async () => (await navText()).includes("You are in the corridor"), 30000, "entered corridor");
  await sleep(2500);
  await page.screenshot({ path: path.join(SHOTS, `${TAG}-2-corridor.png`) });
  const hallFps = await sampleFps(2000);
  console.log(`  corridor fps=${hallFps.fps} p95=${hallFps.p95ms}ms`);

  const roomFps = {};
  // 3) Each room: teleport via accessible nav, settle, screenshot, FPS
  for (const room of ROOMS) {
    const clicked = await page.evaluate((label) => {
      const b = [...document.querySelectorAll(".sr-overlay nav button")].find((x) => x.textContent.includes(label));
      if (!b) return false;
      b.click();
      return true;
    }, room.label);
    if (!clicked) { errors.push(`[harness] no nav button: ${room.label}`); continue; }

    await waitFor(
      async () => (await navText()).includes(`You are in the ${room.state} room`),
      45000,
      `${room.id} room state`
    );
    await sleep(IS_MOBILE ? 9000 : 7000); // teleport + paint-in settle
    for (let i = 0; i < 3; i++) {
      if (IS_MOBILE) {
        await page.touchscreen.touchStart(vx, 600);
        await page.touchscreen.touchMove(vx, 200);
        await page.touchscreen.touchEnd();
      } else {
        await page.mouse.wheel({ deltaY: 200 });
      }
      await sleep(250);
    }
    await sleep(1500);
    await page.screenshot({ path: path.join(SHOTS, `${TAG}-3-${room.id}.png`) });
    if (await crashed()) errors.push(`[crash] WebGL System Fault in ${room.id}`);
    roomFps[room.id] = await sampleFps(2000);
    console.log(`  ${room.id} fps=${roomFps[room.id].fps} p95=${roomFps[room.id].p95ms}ms`);

    await page.evaluate(() => {
      const b = [...document.querySelectorAll(".sr-overlay nav button")].find((x) => x.textContent.includes("Go back to corridor"));
      if (b) b.click();
    });
    await waitFor(async () => (await navText()).includes("You are in the corridor"), 30000, `back from ${room.id}`);
    await sleep(2000);
  }

  const report = {
    tag: TAG, base: BASE, profile: PROFILE,
    fps: { corridor: hallFps, ...roomFps },
    errors, failedReqs,
    pass: errors.length === 0 && failedReqs.length === 0,
  };
  fs.writeFileSync(path.join(SHOTS, `${TAG}.json`), JSON.stringify(report, null, 2));

  console.log(`\n===== ${TAG} — console/page errors: ${errors.length}, failed requests: ${failedReqs.length} =====`);
  errors.slice(0, 15).forEach((e) => console.log(e));
  failedReqs.slice(0, 10).forEach((e) => console.log(e));
  if (!errors.length && !failedReqs.length) console.log("clean");
  try { await browser.close(); } catch { /* EPERM temp cleanup is harmless */ }
  process.exit(errors.length || failedReqs.length ? 2 : 0);
})().catch((e) => {
  console.error("HARNESS FAIL:", e.message);
  process.exit(1);
});