/** dbg-boot.cjs — reports exactly where the boot stalls (preloader % + failures). */
const puppeteer = require("puppeteer-core");
const BRAVE = "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe";
const BASE = process.argv[2] || "http://localhost:3000";

(async () => {
  const b = await puppeteer.launch({
    executablePath: BRAVE,
    headless: "new",
    args: ["--no-sandbox", "--use-gl=angle", "--enable-unsafe-swiftshader", "--window-size=1280,800"],
  });
  const p = await b.newPage();
  await p.setViewport({ width: 1280, height: 800 });

  const bad = [];
  p.on("response", (r) => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`); });
  p.on("pageerror", (e) => bad.push(`pageerror: ${e.message.slice(0, 300)}`));
  p.on("console", (m) => { if (m.type() === "error") bad.push(`console: ${m.text().slice(0, 200)}`); });

  await p.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 60000 });

  for (let i = 0; i < 6; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const st = await p.evaluate(() => {
      const pre = document.querySelector(".preloader");
      const canvas = document.querySelector("canvas");
      return {
        sec: (performance.now() / 1000).toFixed(1),
        preloader: pre ? pre.textContent.replace(/\s+/g, " ").trim().slice(0, 60) : null,
        canvas: canvas ? `${canvas.width}x${canvas.height}` : null,
        srNav: (document.querySelector(".sr-overlay nav")?.textContent || "").replace(/\s+/g, " ").slice(0, 50),
        navUI: !!document.querySelector(".nav-ui, .navigation-ui"),
      };
    });
    console.log(JSON.stringify(st));
  }

  console.log("\nFAILURES:", bad.length);
  bad.slice(0, 12).forEach((x) => console.log("  " + x));
  await b.close();
})().catch((e) => { console.error("DBG FAIL:", e.message); process.exit(1); });
