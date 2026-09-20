/**
 * audit.cjs — Brave + puppeteer-core verification harness.
 *
 * Visits every route, captures console errors / pageerrors / failed requests,
 * samples FPS, and screenshots each room. Prints a JSON summary at the end so
 * the fix loop can diff runs.
 *
 * Usage:  node scripts/audit.cjs [baseUrl]
 * Requires the dev server to be running (default http://localhost:3000).
 */
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");

const BRAVE = "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe";
const BASE = process.argv[2] || "http://localhost:3000";
const ROOMS = ["", "/gallery", "/studio", "/about", "/contact", "/email"];
const SHOTS = path.join(__dirname, "..", "scratchpad", "audit-shots");

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: BRAVE,
    headless: "new",
    args: [
      "--no-sandbox",
      "--use-gl=angle",
      "--enable-unsafe-swiftshader",
      "--window-size=1440,900",
    ],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  let current = "boot";
  const errors = [];
  const report = { base: BASE, rooms: {}, errors };

  page.on("response", (res) => {
    if (res.status() >= 400) {
      errors.push({ room: current, type: "HTTP " + res.status(), msg: res.url() });
    }
  });
  page.on("pageerror", (err) => {
    errors.push({
      room: current,
      type: "pageerror",
      msg: err.message,
      stack: (err.stack || "").split("\n").slice(0, 10).join("\n"),
    });
  });
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const t = msg.text();
    if (t.includes("favicon")) return;
    errors.push({ room: current, type: "console.error", msg: t.slice(0, 400) });
  });

  const sampleFps = async (ms) =>
    page.evaluate(
      (dur) =>
        new Promise((resolve) => {
          let frames = 0;
          const start = performance.now();
          const tick = () => {
            frames++;
            if (performance.now() - start < dur) requestAnimationFrame(tick);
            else resolve(Math.round((frames * 1000) / (performance.now() - start)));
          };
          requestAnimationFrame(tick);
        }),
      ms
    );

  for (const room of ROOMS) {
    current = room || "/(corridor)";
    const t0 = Date.now();
    try {
      await page.goto(BASE + room, { waitUntil: "networkidle2", timeout: 45000 });
    } catch { /* slow assets — keep going */ }

    const is3D = room !== "/email";
    if (is3D) {
      await new Promise((r) => setTimeout(r, 8000)); // preloader + scene boot
      const shotName = (room || "corridor").replace(/\//g, "") || "corridor";
      await page.screenshot({ path: path.join(SHOTS, `${shotName}-1-entrance.png`) });
      await page.mouse.click(720, 480); // entrance doors
      await new Promise((r) => setTimeout(r, 4000)); // fly-through (+ teleport)
      await page.screenshot({ path: path.join(SHOTS, `${shotName}-2-inside.png`) });
      for (let i = 0; i < 12; i++) {
        await page.mouse.wheel({ deltaY: 260 });
        await new Promise((r) => setTimeout(r, 300));
      }
      for (const [x, y] of [[400, 400], [1040, 400], [720, 620], [720, 300]]) {
        await page.mouse.move(x, y);
        await new Promise((r) => setTimeout(r, 220));
      }
      await new Promise((r) => setTimeout(r, 1500));
      await page.screenshot({ path: path.join(SHOTS, `${shotName}-3-scrolled.png`) });
    } else {
      await new Promise((r) => setTimeout(r, 1500));
    }

    const fps = is3D ? await sampleFps(2000) : null;
    report.rooms[current] = { fps, bootMs: Date.now() - t0 };
    console.log(`[${current}] fps=${fps ?? "n/a"}`);
  }

  const summaryPath = path.join(SHOTS, "report.json");
  fs.writeFileSync(summaryPath, JSON.stringify(report, null, 2));

  console.log("\n===== TOTAL ERRORS:", errors.length, "=====");
  for (const e of errors.slice(0, 20)) {
    console.log(`\n[${e.room}][${e.type}] ${e.msg}`);
    if (e.stack) console.log(e.stack);
  }
  if (!errors.length) console.log("none 🎉");
  console.log("\nReport: " + summaryPath);

  await browser.close();
  process.exit(errors.length ? 2 : 0);
})().catch((e) => {
  console.error("HARNESS FAIL:", e.message);
  process.exit(1);
});
