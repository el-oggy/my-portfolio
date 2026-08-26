/** Verifies scroll-lock scoping: /email scrolls, / (3D) locks. */
const puppeteer = require("puppeteer-core");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE = "http://localhost:3100";

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: "new",
    args: ["--no-sandbox", "--use-gl=angle", "--enable-unsafe-swiftshader", "--window-size=900,700"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 900, height: 700 });

  // --- /email should scroll ---
  await page.goto(BASE + "/email", { waitUntil: "networkidle2", timeout: 45000 });
  await new Promise((r) => setTimeout(r, 1500));
  const emailState = await page.evaluate(() => {
    window.scrollTo(0, 500);
    return {
      webglActive: document.documentElement.classList.contains("webgl-active"),
      scrollY: window.scrollY,
      bodyOverflow: getComputedStyle(document.body).overflow,
      docHeight: document.scrollingElement.scrollHeight,
    };
  });
  console.log("/email:", JSON.stringify(emailState));
  console.log(emailState.scrollY > 0 && !emailState.webglActive ? "✓ /email scrolls" : "✗ /email STILL LOCKED");

  // --- / (3D) should be locked ---
  await page.goto(BASE + "/", { waitUntil: "networkidle2", timeout: 45000 });
  await new Promise((r) => setTimeout(r, 6000));
  const homeState = await page.evaluate(() => ({
    webglActive: document.documentElement.classList.contains("webgl-active"),
    bodyOverflow: getComputedStyle(document.body).overflow,
    canvasPresent: !!document.querySelector(".canvas-wrapper canvas"),
  }));
  console.log("/:", JSON.stringify(homeState));
  console.log(homeState.webglActive && homeState.bodyOverflow === "hidden" && homeState.canvasPresent
    ? "✓ / locks scroll while 3D active"
    : "✗ unexpected state on /");

  await browser.close();
})().catch((e) => { console.error("HARNESS FAIL:", e.message); process.exit(1); });
