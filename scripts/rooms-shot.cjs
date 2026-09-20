/**
 * rooms-shot.cjs — deterministic room capture via the accessible nav overlay.
 *
 * Instead of relying on flaky 3D pointer clicks + fixed timings, this drives
 * the ScreenReaderOverlay (`.sr-overlay`), which mirrors the canvas state
 * machine:
 *   "Click or press Enter on the doors to enter." → hasEntered === false
 *   "You are in the corridor."                    → entered, not in a room
 *   "You are in the <Room> room."                 → inside a room
 * and exposes teleportTo(room) buttons.
 *
 * Console errors / pageerrors are recorded for the whole journey (G1).
 */
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");

const BRAVE = "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe";
const BASE = process.argv[2] || "http://localhost:3000";
const SHOTS = path.join(__dirname, "..", "scratchpad", "audit-shots");

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
    args: ["--no-sandbox", "--use-gl=angle", "--enable-unsafe-swiftshader", "--window-size=1440,900"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const errors = [];
  page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error" && !m.text().includes("favicon")) {
      errors.push(`[console.error] ${m.text().slice(0, 200)}`);
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
      if (await predicate()) return true;
      await sleep(400);
    }
    console.log(`  !! timeout waiting for ${label}`);
    return false;
  };

  console.log("booting corridor...");
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 60000 });

  // 1. Wait for the accessible nav to report the pre-entrance state. This is a
  //    reliable readiness signal: the overlay only mounts after the preloader
  //    finishes (isLoaded). (A hidden, empty .preloader node lingers in the DOM,
  //    so its absence is NOT a valid check.)
  const readyOk = await waitFor(
    async () => (await navText()).includes("Click or press Enter on the doors"),
    90000,
    "app ready (preloader finished)"
  );
  console.log("app ready:", readyOk);
  await sleep(1500);

  // 2. Open the entrance doors. Try a few points on the door leaves: clicking a
  //    decorative overlay would otherwise be a no-op.
  const DOOR_POINTS = [[720, 560], [640, 620], [800, 620], [720, 500]];
  for (let attempt = 0; attempt < 8; attempt++) {
    const [x, y] = DOOR_POINTS[attempt % DOOR_POINTS.length];
    await page.mouse.click(x, y);
    await sleep(2000);
    const t = await navText();
    if (t.includes("You are in the corridor") || t.includes("room.")) break;
  }

  const enteredOk = await waitFor(
    async () => (await navText()).includes("You are in the corridor"),
    30000,
    "corridor state (entered)"
  );
  console.log("entered corridor:", enteredOk);
  await sleep(2500);
  await page.screenshot({ path: path.join(SHOTS, "corridor-after-entry.png") });

  // 3. Teleport into each room via the accessible buttons
  for (const room of ROOMS) {
    const clicked = await page.evaluate((label) => {
      const btns = [...document.querySelectorAll(".sr-overlay nav button")];
      const b = btns.find((x) => x.textContent.includes(label));
      if (!b) return false;
      b.click();
      return true;
    }, room.label);

    if (!clicked) { console.log(`  !! no nav button for ${room.label}`); continue; }

    const arrived = await waitFor(
      async () => (await navText()).includes(`You are in the ${room.state} room`),
      40000,
      `${room.label} room state`
    );
    await sleep(7000); // teleport + brush-stroke paint-in settle

    // small in-room nudge so we see more than the doorway
    for (let i = 0; i < 3; i++) { await page.mouse.wheel({ deltaY: 200 }); await sleep(250); }
    await sleep(1500);

    await page.screenshot({ path: path.join(SHOTS, `room-${room.id}.png`) });
    // A crash renders the immersive fallback ("System Fault") — never let that pass silently.
    const crashed = await page.evaluate(() =>
      document.body.innerText.includes("System Fault")
    );
    console.log(`shot ${room.id} arrived=${arrived} crashed=${crashed}`);

    // back to corridor for the next one
    await page.evaluate(() => {
      const b = [...document.querySelectorAll(".sr-overlay nav button")]
        .find((x) => x.textContent.includes("Go back to corridor"));
      if (b) b.click();
    });
    await waitFor(async () => (await navText()).includes("You are in the corridor"), 30000, "back to corridor");
    await sleep(2000);
  }

  console.log("\n===== ERRORS DURING ROOM JOURNEY:", errors.length, "=====");
  errors.slice(0, 15).forEach((e) => console.log(e));
  if (!errors.length) console.log("none");

  await browser.close();
})().catch((e) => { console.error("FAIL:", e.message); process.exit(1); });
