/**
 * Room-by-room console-error hunter.
 * Visits each deep-link room, clicks through the entrance, walks the room
 * content, and captures pageerror/console.error with stacks — tagged by room.
 */
const puppeteer = require("puppeteer-core");

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE = process.argv[2] || "http://localhost:3100";
const ROOMS = ["", "/gallery", "/studio", "/about", "/contact"];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: "new",
    args: ["--no-sandbox", "--use-gl=angle", "--enable-unsafe-swiftshader", "--window-size=1440,900"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  let current = "boot";
  const errors = [];
  page.on("response", (res) => {
    if (res.status() >= 400) {
      errors.push({ room: current, type: "HTTP " + res.status(), msg: res.url(), stack: "" });
    }
  });
  page.on("pageerror", (err) => {
    errors.push({ room: current, type: "pageerror", msg: err.message, stack: (err.stack || "").split("\n").slice(0, 10).join("\n") });
  });
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const t = msg.text();
    if (t.includes("favicon")) return;
    errors.push({ room: current, type: "console.error", msg: t.slice(0, 300), stack: "" });
  });

  for (const room of ROOMS) {
    current = room || "/(corridor)";
    console.log("\n=== ROOM:", current, "===");
    try {
      await page.goto(BASE + room, { waitUntil: "networkidle2", timeout: 45000 });
    } catch { /* slow assets — keep going */ }
    await new Promise((r) => setTimeout(r, 8000));          // preloader + scene boot
    await page.mouse.click(720, 480);                        // entrance doors
    await new Promise((r) => setTimeout(r, 4000));           // fly-through (+ possible teleport)
    for (let i = 0; i < 14; i++) {                           // walk the room/sky
      await page.mouse.wheel({ deltaY: 260 });
      await new Promise((r) => setTimeout(r, 320));
    }
    // hover sweep to trigger reveal materials / balloons
    for (const [x, y] of [[400, 400], [1040, 400], [720, 620], [720, 300]]) {
      await page.mouse.move(x, y);
      await new Promise((r) => setTimeout(r, 250));
    }
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log("\n===== TOTAL ERRORS:", errors.length, "=====");
  for (const e of errors.slice(0, 15)) {
    console.log("\n[" + e.room + "][" + e.type + "] " + e.msg);
    if (e.stack) console.log(e.stack);
  }
  if (!errors.length) console.log("none 🎉");

  await browser.close();
})().catch((e) => { console.error("HARNESS FAIL:", e.message); process.exit(1); });

