/** dbg2.cjs — identifies the persistent ".preloader" element + app state. */
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
  await p.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 16000));

  const info = await p.evaluate(() => {
    const els = [...document.querySelectorAll(".preloader")];
    return {
      matches: els.length,
      detail: els.map((el) => ({
        tag: el.tagName,
        cls: el.className,
        kids: el.children.length,
        parentCls: el.parentElement ? el.parentElement.className : null,
        display: getComputedStyle(el).display,
        html: el.outerHTML.slice(0, 200),
      })),
      srNav: (document.querySelector(".sr-overlay nav")?.textContent || "").replace(/\s+/g, " ").slice(0, 80),
      canvases: document.querySelectorAll("canvas").length,
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await b.close();
})().catch((e) => { console.error("DBG FAIL:", e.message); process.exit(1); });
