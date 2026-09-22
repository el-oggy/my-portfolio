/** entrance-shot.cjs — captures the hero entrance doors (with logo medallions). */
const path = require("path");
const puppeteer = require("puppeteer-core");
const BRAVE = "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe";
const BASE = process.argv[2] || "http://localhost:3000";
const SHOTS = path.join(__dirname, "..", "scratchpad", "audit-shots");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const b = await puppeteer.launch({
    executablePath: BRAVE,
    headless: "new",
    args: ["--no-sandbox", "--use-gl=angle", "--enable-unsafe-swiftshader", "--window-size=1440,900"],
  });
  const p = await b.newPage();
  await p.setViewport({ width: 1440, height: 900 });
  await p.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 60000 });

  const navText = () => p.evaluate(() => document.querySelector(".sr-overlay nav")?.textContent || "");
  for (let i = 0; i < 90; i++) {
    if ((await navText()).includes("Click or press Enter")) break;
    await sleep(500);
  }
  await sleep(2500); // let the entrance settle
  await p.screenshot({ path: path.join(SHOTS, "entrance-logos.png") });
  console.log("entrance shot saved");
  await b.close();
})().catch((e) => { console.error("FAIL:", e.message); process.exit(1); });
