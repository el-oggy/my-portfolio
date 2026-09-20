/** dbg3.cjs — reproduces the room-entry crash and dumps the real exception. */
const puppeteer = require("puppeteer-core");
const BRAVE = "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe";
const BASE = process.argv[2] || "http://localhost:3000";
const ROOM = process.argv[3] || "The Gallery";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const b = await puppeteer.launch({
    executablePath: BRAVE,
    headless: "new",
    args: ["--no-sandbox", "--use-gl=angle", "--enable-unsafe-swiftshader", "--window-size=1280,800"],
  });
  const p = await b.newPage();
  await p.setViewport({ width: 1280, height: 800 });

  const log = [];
  p.on("pageerror", (e) => log.push(`[pageerror] ${e.message}\n${(e.stack || "").split("\n").slice(0, 12).join("\n")}`));
  p.on("console", (m) => {
    if (m.type() === "error") log.push(`[console.error] ${m.text().slice(0, 800)}`);
  });

  await p.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 60000 });
  const navText = () => p.evaluate(() => document.querySelector(".sr-overlay nav")?.textContent || "");

  // wait ready
  for (let i = 0; i < 60; i++) { if ((await navText()).includes("Click or press Enter")) break; await sleep(500); }
  await sleep(1200);

  // open doors
  for (let i = 0; i < 8; i++) {
    await p.mouse.click(720, 560);
    await sleep(1800);
    if ((await navText()).includes("You are in the corridor")) break;
  }
  console.log("entered:", (await navText()).includes("You are in the corridor"));
  await sleep(1500);

  // teleport into the room
  await p.evaluate((label) => {
    const btn = [...document.querySelectorAll(".sr-overlay nav button")].find((x) => x.textContent.includes(label));
    if (btn) btn.click();
  }, ROOM);

  await sleep(12000);

  // dump the Next.js dev overlay text (shadow DOM) if present
  const overlay = await p.evaluate(() => {
    const portal = document.querySelector("nextjs-portal");
    const txt = portal && portal.shadowRoot ? portal.shadowRoot.textContent : "";
    return {
      hasPortal: !!portal,
      text: txt.replace(/\s+/g, " ").slice(0, 900),
      nav: (document.querySelector(".sr-overlay nav")?.textContent || "").replace(/\s+/g, " ").slice(0, 120),
    };
  });

  console.log("\n=== OVERLAY ===");
  console.log(JSON.stringify(overlay, null, 2));
  console.log("\n=== LOG (" + log.length + ") ===");
  log.slice(0, 10).forEach((l) => console.log("\n" + l));

  await b.close();
})().catch((e) => { console.error("DBG3 FAIL:", e.message); process.exit(1); });
