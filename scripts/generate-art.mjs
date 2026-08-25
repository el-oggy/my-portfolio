/**
 * Sketch-art generator — draws ALL custom textures programmatically.
 *
 * Everything (text included) is rendered as vector paths: fonts are loaded
 * from public/fonts/*.ttf via opentype.js and converted to SVG <path> data,
 * so output is identical on any machine regardless of installed fonts.
 * sharp (librsvg) rasterizes to .webp.
 *
 * Generates:
 *   public/textures/gallery/ad_<project>.webp (+ _painted)   6 covers 768×1024
 *   public/textures/gallery/ad_portrait.webp (+ _painted)    workbench portrait 900×900
 *   public/textures/corridor/decorations/ad_cmos_inverter.webp (+ _painted)
 *   public/textures/corridor/decorations/ad_resistor_codes.webp (+ _painted)
 *   public/textures/about/balon_<skill>.webp (+ _painted)    10 balloons 640×1500
 *
 * Usage: node scripts/generate-art.mjs
 */
import sharp from "sharp";
import opentype from "opentype.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const FONTS = path.join(ROOT, "public", "fonts");

// ---------- fonts ----------
function loadFont(file) {
  const buf = fs.readFileSync(path.join(FONTS, file));
  return opentype.parse(
    buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  );
}
const cabinBold = loadFont("CabinSketch-Bold.ttf");
const cabinReg = loadFont("CabinSketch-Regular.ttf");
const scribble = loadFont("RubikScribble-Regular.ttf");

// ---------- palette ----------
const INK = "#2f2c28";
const PAPER = "#fbf9f5";
const CARD = "#fffdfa";
const FAINT = "#a89f93";

// project accents (mirror lib/data.ts accents)
const ACC = {
  green: "#059669",
  blue: "#0284c7",
  amber: "#d97706",
  royal: "#2563eb",
  violet: "#7c3aed",
  orange: "#ea580c",
};

// ---------- helpers ----------
/** Measure rendered text width via path bounding box (version-safe). */
function textW(font, text, size) {
  if (!text) return 0;
  let b;
  try {
    b = font.getPath(text, 0, 0, size).getBoundingBox();
  } catch {
    const stripped = text.replace(/[^A-Za-z0-9 \-+·×Ω]/g, "");
    b = font.getPath(stripped, 0, 0, size).getBoundingBox();
  }
  return b.x2 - b.x1;
}

/** Some fonts carry GSUB lookups opentype.js can't handle for rare
 *  characters — render through a sanitizer with a stripped-text fallback. */
function safePathData(font, text, size) {
  try {
    return font.getPath(text, 0, 0, size).toPathData(3);
  } catch {
    // RubikScribble-style fonts can carry unsupported GSUB lookups —
    // progressively strip until something renders.
    const attempts = [
      text.replace(/[^A-Za-z0-9 \-+·×Ω]/g, ""),
      text.replace(/[^A-Za-z0-9 ]/g, "").toUpperCase(),
      "",
    ];
    for (const attempt of attempts) {
      try {
        return font.getPath(attempt, 0, 0, size).toPathData(3);
      } catch {
        /* try next */
      }
    }
    return "";
  }
}

/** Convert text to an SVG path string (filled). */
function txt(font, text, x, y, size, fill = INK, anchor = "start") {
  const width = textW(font, text, size);
  const startX = anchor === "center" ? x - width / 2 : anchor === "end" ? x - width : x;
  return `<path transform="translate(${startX} ${y})" d="${safePathData(font, text, size)}" fill="${fill}"/>`;
}

/** Outlined-only text (stroke, no fill) for watermark-style labels. */
function txtStroke(font, text, x, y, size, stroke = INK, sw = 1.2, anchor = "start") {
  const width = textW(font, text, size);
  const startX = anchor === "center" ? x - width / 2 : anchor === "end" ? x - width : x;
  return `<path transform="translate(${startX} ${y})" d="${safePathData(font, text, size)}" fill="none" stroke="${stroke}" stroke-width="${sw}"/>`;
}

/** Paper background with hand-frame border. */
function paper(w, h, bg = PAPER, margin = 26) {
  return `
    <rect width="${w}" height="${h}" fill="${bg}"/>
    <rect x="${margin}" y="${margin}" width="${w - margin * 2}" height="${h - margin * 2}"
      fill="none" stroke="${INK}" stroke-width="3"/>
    <rect x="${margin + 7}" y="${margin + 7}" width="${w - margin * 2 - 14}" height="${h - margin * 2 - 14}"
      fill="none" stroke="${FAINT}" stroke-width="1.4" stroke-dasharray="10 7"/>`;
}

/** Duplicate markup slightly offset — cheap "sketchy double-pass" look. */
function sketch(markup) {
  return `<g opacity="0.28" transform="translate(2.2 2.6)">${markup}</g><g>${markup}</g>`;
}

function svgDoc(w, h, inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${inner}</svg>`;
}

async function writeWebp(dir, name, svg, quality = 90) {
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, name);
  try {
    await sharp(Buffer.from(svg)).webp({ quality }).toFile(out);
    console.log("  ✓", path.relative(ROOT, out));
  } catch (err) {
    const dbg = path.join(process.env.TEMP || "/tmp", name + ".svg");
    fs.writeFileSync(dbg, svg);
    console.error("  ✗ FAILED:", name, "— dumped to", dbg, "\n", err.message);
    throw err;
  }
}

/** Standard cover title block (gallery cards). */
function coverTitle(cabin, W, H, title, sub) {
  return (
    txt(cabinBold, title.toUpperCase(), W / 2, H - 118, 58, INK, "center") +
    txt(cabinReg, sub, W / 2, H - 66, 30, FAINT, "center")
  );
}

// ============================================================
// 1. GALLERY PROJECT COVERS — 768×1024 (3:4, matches card plane)
// ============================================================
const GW = 768, GH = 1024;

async function covers() {
  console.log("Gallery covers:");
  const dir = path.join(ROOT, "public", "textures", "gallery");

  // --- Hexacopter ---
  {
    const body = `
      <g stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round">
        ${[0, 60, 120, 180, 240, 300].map((a) => {
          const rad = (a * Math.PI) / 180;
          const ax = 384 + Math.cos(rad) * 175, ay = 430 + Math.sin(rad) * 175;
          return `<line x1="384" y1="430" x2="${ax}" y2="${ay}"/>
            <circle cx="${ax}" cy="${ay}" r="86" stroke-width="3"/>
            <ellipse cx="${ax}" cy="${ay}" rx="86" ry="14" stroke-width="2.4"/>`;
        }).join("")}
        <circle cx="384" cy="430" r="72"/>
        <circle cx="384" cy="430" r="46" stroke-dasharray="8 6"/>
        <rect x="330" y="560" width="108" height="64" rx="8"/>
        <path d="M338 624 l-16 44 M494 624 l-12 40" stroke-width="3"/>
      </g>
      ${txt(scribble, "V", 372, 448, 52)}
      ${txtStroke(cabinReg, "MPU6500", 384, 700, 22, FAINT, 1, "center")}`;
    const paint = `
      <g stroke="${ACC.royal}" stroke-width="4" fill="none" stroke-linecap="round">
        ${[0, 60, 120, 180, 240, 300].map((a) => {
          const rad = (a * Math.PI) / 180;
          const ax = 384 + Math.cos(rad) * 175, ay = 430 + Math.sin(rad) * 175;
          return `<ellipse cx="${ax}" cy="${ay}" rx="86" ry="14"/>`;
        }).join("")}
      </g>
      <circle cx="384" cy="430" r="46" fill="none" stroke="${ACC.royal}" stroke-width="4" stroke-dasharray="8 6"/>
      <rect x="330" y="560" width="108" height="64" rx="8" fill="none" stroke="${ACC.amber}" stroke-width="4"/>`;
    const common =
      paper(GW, GH, CARD) +
      `<g transform="translate(0 -30)">${body}</g>` +
      coverTitle(cabinBold, GW, GH, "STM32 Hexacopter", "six-rotor flight controller · custom PCB");
    await writeWebp(dir, "ad_hexacopter.webp", svgDoc(GW, GH, common));
    await writeWebp(dir, "ad_hexacopter_painted.webp", svgDoc(GW, GH, common + `<g transform="translate(0 -30)">${paint}</g>`));
  }

  // --- Weather station ---
  {
    const body = `
      <g stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round">
        <line x1="140" y1="800" x2="640" y2="800"/>
        <line x1="300" y1="800" x2="300" y2="360"/>
        <rect x="258" y="360" width="84" height="150" rx="10"/>
        <circle cx="300" cy="400" r="12"/><circle cx="300" cy="436" r="12"/><circle cx="300" cy="472" r="12"/>
        <g transform="rotate(-18 480 380)">
          <rect x="392" y="330" width="176" height="104"/>
          <path d="M436 330v104 M480 330v104 M524 330v104 M392 382h176"/>
        </g>
        <line x1="480" y1="434" x2="480" y2="800" stroke-width="3"/>
        <line x1="300" y1="360" x2="300" y2="290"/>
        <path d="M270 290 h60 M278 264 h44 M286 240 h28" stroke-width="3"/>
        <circle cx="580" cy="250" r="40" stroke-dasharray="9 8"/>
        <path d="M580 178 v-24 M580 346 v-20 M508 250 h-22 M652 250 h22 M531 201 l-16 -16 M629 299 l16 16 M629 201 l16 -16 M531 299 l-16 16" stroke-width="3"/>
      </g>
      ${txt(cabinReg, "BME280 · BH1750 · DS18B20", 384, 870, 26, FAINT, "center")}`;
    const paint = `
      <g transform="rotate(-18 480 380)">
        <rect x="392" y="330" width="176" height="104" fill="${ACC.amber}" opacity="0.18"/>
      </g>
      <circle cx="580" cy="250" r="40" fill="none" stroke="${ACC.amber}" stroke-width="4" stroke-dasharray="9 8"/>
      <rect x="258" y="360" width="84" height="150" rx="10" fill="${ACC.blue}" opacity="0.15"/>`;
    const common =
      paper(GW, GH, CARD) +
      `<g transform="translate(0 -40)">${body}</g>` +
      coverTitle(cabinBold, GW, GH, "IoT Weather Station", "solar-powered · wireless telemetry");
    await writeWebp(dir, "ad_weatherstation.webp", svgDoc(GW, GH, common));
    await writeWebp(dir, "ad_weatherstation_painted.webp", svgDoc(GW, GH, common + `<g transform="translate(0 -40)">${paint}</g>`));
  }

  // --- ZMK keyboard ---
  {
    const keys = (ox, oy, cols, rows) =>
      Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) =>
          `<rect x="${ox + c * 62}" y="${oy + r * 62}" width="52" height="52" rx="7"/>`
        ).join("")
      ).join("");
    const body = `
      <g stroke="${INK}" stroke-width="3.4" fill="none" stroke-linecap="round">
        <g transform="rotate(-7 230 520)"><rect x="96" y="380" width="268" height="256" rx="14"/>${keys(112, 396, 4, 4)}</g>
        <g transform="rotate(7 550 520)"><rect x="416" y="380" width="268" height="256" rx="14"/>${keys(432, 396, 4, 4)}</g>
        <path d="M340 500 C 370 460, 396 560, 436 512" stroke-dasharray="11 8"/>
        <path d="M120 720 q 30 -18 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0" stroke-width="3"/>
        <path d="M560 330 q 14 -26 -6 -44 M600 322 q 14 -26 -6 -44" stroke-width="3"/>
      </g>
      ${txt(cabinReg, "wireless · split · zephyr", 384, 790, 28, FAINT, "center")}`;
    const paint = `
      <rect x="112" y="396" width="52" height="52" rx="7" fill="${ACC.violet}" opacity="0.35"/>
      <rect x="236" y="458" width="52" height="52" rx="7" fill="${ACC.violet}" opacity="0.35"/>
      <rect x="548" y="396" width="52" height="52" rx="7" fill="${ACC.violet}" opacity="0.35"/>
      <rect x="432" y="520" width="52" height="52" rx="7" fill="${ACC.blue}" opacity="0.3"/>`;
    const common =
      paper(GW, GH, CARD) +
      `<g transform="translate(0 -60)">` + body + `</g>` +
      coverTitle(cabinBold, GW, GH, "ZMK Keyboard Firmware", "zephyr rtos · github actions ci");
    await writeWebp(dir, "ad_zmk.webp", svgDoc(GW, GH, common));
    await writeWebp(dir, "ad_zmk_painted.webp", svgDoc(GW, GH, common + paint));
  }

  // --- FlowOS dashboard ---
  {
    const body = `
      <g stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round">
        <rect x="120" y="220" width="528" height="440" rx="14"/>
        <line x1="120" y1="278" x2="648" y2="278"/>
        <circle cx="152" cy="249" r="7"/><circle cx="180" cy="249" r="7"/><circle cx="208" cy="249" r="7"/>
        <line x1="236" y1="278" x2="236" y2="660"/>
        <path d="M148 330 h56 M148 380 h56 M148 430 h56 M148 480 h56" stroke-width="3"/>
        <path d="M280 560 v-110 M350 560 v-170 M420 560 v-80 M490 560 v-210" stroke-width="10"/>
        <path d="M280 380 l30 30 l-30 30 M310 410 h44 M394 372 l-26 26 l26 26 M368 398 h-40" stroke-width="3.4"/>
      </g>
      ${txt(cabinReg, "offline-first · indexeddb · zero frameworks", 384, 762, 24, FAINT, "center")}`;
    const paint = `
      <path d="M280 560 v-110 M350 560 v-170 M420 560 v-80 M490 560 v-210" stroke="${ACC.green}" stroke-width="10" fill="none" stroke-linecap="round"/>`;
    const common =
      paper(GW, GH, CARD) +
      `<g transform="translate(0 -30)">${body}</g>` +
      coverTitle(cabinBold, GW, GH, "FlowOS Dashboard", "productivity that works offline");
    await writeWebp(dir, "ad_flowos.webp", svgDoc(GW, GH, common));
    await writeWebp(dir, "ad_flowos_painted.webp", svgDoc(GW, GH, common + `<g transform="translate(0 -30)">${paint}</g>`));
  }

  // --- Systolic array ---
  {
    const cell = (x, y) => `
      <rect x="${x}" y="${y}" width="92" height="92" rx="8"/>
      ${txt(cabinBold, "PE", x + 46, y + 60, 34, INK, "center")}`;
    let cells = "", arrowsH = "", arrowsV = "";
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
      const x = 210 + c * 130, y = 260 + r * 130;
      cells += cell(x, y);
      if (c < 2) arrowsH += `<path d="M${x + 96} ${y + 46} h26 m-9 -8 l9 8 l-9 8" stroke-width="3"/>`;
      if (r < 2) arrowsV += `<path d="M${x + 46} ${y + 96} v26 m-8 -9 l8 9 l8 -9" stroke-width="3"/>`;
    }
    const body = `
      <g stroke="${INK}" fill="none" stroke-linecap="round" stroke-width="3.6">
        ${cells}${arrowsH}${arrowsV}
        <path d="M150 306 h44 m-10 -9 l10 9 l-10 9" />
      </g>
      ${txt(cabinReg, "a[i][k] →", 148, 250, 24, FAINT)}
      ${txt(cabinReg, "weight ↓", 560, 245, 24, FAINT)}
      ${txt(cabinBold, "INT8 MAC", 384, 705, 34, INK, "center")}
      ${txt(cabinReg, "verilog · parallel multiply", 384, 752, 24, FAINT, "center")}`;
    const paint = cells
      .match(/<rect[^/]*\/>/g)
      .map((m, i) => (i % 2 === 0 ? m.replace("/>", ` fill="${ACC.orange}" opacity="0.2"/>`) : ""))
      .join("");
    const common =
      paper(GW, GH, CARD) +
      `<g transform="translate(0 -20)">${body}</g>` +
      coverTitle(cabinBold, GW, GH, "Systolic Array", "hardware accelerator in verilog");
    await writeWebp(dir, "ad_systolic.webp", svgDoc(GW, GH, common));
    await writeWebp(dir, "ad_systolic_painted.webp", svgDoc(GW, GH, common + `<g transform="translate(0 -20)">${paint}</g>`));
  }

  // --- Smart staircase ---
  {
    let stairs = "";
    for (let i = 0; i < 5; i++) {
      const x = 150 + i * 95, y = 640 - i * 88;
      stairs += `<path d="M${x} ${y} h95 v-88" />`;
      stairs += `<circle class="led" cx="${x + 78}" cy="${y - 6}" r="9"/>`;
    }
    const leds = [0, 1, 2, 3, 4].map((i) => {
      const x = 150 + i * 95 + 78, y = 640 - i * 88 - 6;
      return `<circle cx="${x}" cy="${y}" r="9" fill="${ACC.amber}"/><circle cx="${x}" cy="${y}" r="20" fill="${ACC.amber}" opacity="0.22"/>`;
    }).join("");
    const body = `
      <g stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round">
        ${stairs}
        <path d="M120 640 h520" stroke-width="3"/>
        <g>
          <rect x="560" y="200" width="70" height="34" rx="8"/>
          <path d="M552 217 a43 43 0 0 1 43 -43 M540 217 a55 55 0 0 1 55 -55 M638 217 a43 43 0 0 0 -35 -42" stroke-width="3"/>
          <circle cx="595" cy="217" r="6"/>
        </g>
        <path d="M595 234 v120 l-160 160" stroke-dasharray="10 9" stroke-width="3"/>
      </g>
      ${txt(cabinReg, "motion-aware · blynk · relays", 384, 780, 26, FAINT, "center")}`;
    const common =
      paper(GW, GH, CARD) +
      `<g transform="translate(0 30)">${body}</g>` +
      coverTitle(cabinBold, GW, GH, "Smart Staircase", "home automation · ambient light");
    await writeWebp(dir, "ad_staircase.webp", svgDoc(GW, GH, common));
    await writeWebp(
      dir,
      "ad_staircase_painted.webp",
      svgDoc(GW, GH, common + `<g transform="translate(0 30)">${leds}</g>`)
    );
  }
}

// ============================================================
// 2. PORTRAIT PLACEHOLDER — 900×900 square (corridor frame-1)
// ============================================================
async function portrait() {
  console.log("Portrait:");
  const dir = path.join(ROOT, "public", "textures", "gallery");
  const W = 900, H = 900;
  const body = `
    <g stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round">
      <!-- bench -->
      <line x1="90" y1="700" x2="810" y2="700"/>
      <!-- scope -->
      <rect x="120" y="520" width="220" height="180" rx="12"/>
      <rect x="146" y="546" width="168" height="106" rx="6"/>
      <path d="M154 600 q 21 -46 42 0 t 42 0 t 42 0 t 21 -20" stroke-width="3"/>
      <circle cx="180" cy="668" r="10"/><circle cx="216" cy="668" r="10"/>
      <!-- person (back view, faceless) -->
      <circle cx="560" cy="430" r="74"/>
      <path d="M448 700 c 0 -120 40 -196 112 -196 s 112 76 112 196"/>
      <path d="M470 560 q -46 40 -60 96 M650 560 q 46 40 60 96" stroke-width="3.4"/>
      <!-- soldering iron in right hand -->
      <path d="M676 618 l64 -54 M740 564 l26 -22 M752 598 l-14 -34" stroke-width="3.4"/>
      <circle cx="772" cy="536" r="7"/>
      <!-- breadboard on bench -->
      <rect x="330" y="640" width="180" height="60" rx="8"/>
      <path d="M342 662 h156 M342 678 h156" stroke-dasharray="6 6" stroke-width="2.4"/>
      <circle cx="366" cy="652" r="4"/><circle cx="392" cy="652" r="4"/><circle cx="418" cy="652" r="4"/>
      <circle cx="366" cy="668" r="4"/><circle cx="392" cy="668" r="4"/>
      <!-- mug -->
      <rect x="740" y="640" width="56" height="60" rx="8"/>
      <path d="M796 656 q 30 8 0 28"/>
      <!-- floating sparks -->
      <path d="M700 470 l14 -14 M716 496 l18 0 M690 500 l-12 10" stroke-width="3"/>
    </g>
    ${txt(cabinBold, "ADARSH SWARUP MAHARANA", W / 2, H - 116, 44, INK, "center")}
    ${txt(cabinReg, "embedded · vlsi · iot", W / 2, H - 64, 30, FAINT, "center")}`;
  const paint = `
    <path d="M154 600 q 21 -46 42 0 t 42 0 t 42 0 t 21 -20" stroke="${ACC.green}" stroke-width="3.4" fill="none"/>
    <circle cx="772" cy="536" r="7" fill="${ACC.orange}"/>
    <path d="M700 470 l14 -14 M716 496 l18 0 M690 500 l-12 10" stroke="${ACC.orange}" stroke-width="3" fill="none"/>`;
  const common = paper(W, H, CARD, 30) + sketch(body);
  await writeWebp(dir, "ad_portrait.webp", svgDoc(W, H, common));
  await writeWebp(dir, "ad_portrait_painted.webp", svgDoc(W, H, common + paint));
}

// ============================================================
// 3. CORRIDOR DIAGRAMS — landscape 1024×640
// ============================================================
const DW = 1024, DH = 640;

async function diagrams() {
  console.log("Diagrams:");
  const dir = path.join(ROOT, "public", "textures", "corridor", "decorations");

  // --- CMOS inverter ---
  {
    const body = `
      <g stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round">
        <line x1="330" y1="110" x2="694" y2="110"/>
        ${txt(cabinBold, "VDD", 300, 122, 34)}
        <!-- PMOS -->
        <line x1="470" y1="110" x2="470" y2="170"/>
        <circle cx="470" cy="186" r="12"/>
        <line x1="512" y1="212" x2="470" y2="212" /><line x1="470" y1="186" x2="470" y2="212"/>
        <rect x="512" y="182" width="14" height="60"/>
        <line x1="526" y1="197" x2="560" y2="197"/><line x1="526" y1="227" x2="560" y2="227"/>
        <line x1="560" y1="182" x2="560" y2="242"/>
        <line x1="560" y1="212" x2="640" y2="212"/><line x1="640" y1="212" x2="640" y2="300"/>
        ${txt(cabinReg, "PMOS", 590, 172, 24)}
        <!-- NMOS -->
        <rect x="512" y="356" width="14" height="60"/>
        <line x1="526" y1="371" x2="560" y2="371"/><line x1="526" y1="401" x2="560" y2="401"/>
        <line x1="560" y1="356" x2="560" y2="416"/>
        <line x1="470" y1="386" x2="512" y2="386"/><line x1="470" y1="386" x2="470" y2="412"/>
        <line x1="458" y1="412" x2="482" y2="412"/><line x1="464" y1="424" x2="476" y2="424"/><line x1="468" y1="436" x2="472" y2="436"/>
        <line x1="560" y1="386" x2="640" y2="386"/><line x1="640" y1="386" x2="640" y2="300"/>
        <line x1="470" y1="452" x2="470" y2="500"/><line x1="330" y1="500" x2="694" y2="500"/>
        ${txt(cabinBold, "GND", 300, 512, 34)}
        <!-- gate input -->
        <line x1="470" y1="212" x2="470" y2="386"/>
        <line x1="330" y1="299" x2="470" y2="299"/>
        <circle cx="470" cy="299" r="5" fill="${INK}"/>
        ${txt(cabinBold, "A", 300, 310, 36)}
        ${txt(cabinBold, "Y", 700, 310, 36)}
        <line x1="640" y1="299" x2="676" y2="299"/>
        <!-- truth table -->
        <g stroke-width="2.6">
          <rect x="760" y="150" width="200" height="128"/>
          <line x1="760" y1="192" x2="960" y2="192"/><line x1="860" y1="150" x2="860" y2="278"/>
        </g>
        ${txt(cabinBold, "A", 810, 182, 26, INK, "center")}${txt(cabinBold, "Y", 910, 182, 26, INK, "center")}
        ${txt(cabinReg, "0", 810, 228, 26, INK, "center")}${txt(cabinReg, "1", 910, 228, 26, INK, "center")}
        ${txt(cabinReg, "1", 810, 266, 26, INK, "center")}${txt(cabinReg, "0", 910, 266, 26, INK, "center")}
      </g>
      ${txt(cabinReg, "one bit flipped · almost zero static power", DW / 2, DH - 60, 28, FAINT, "center")}`;
    const paint = `
      <line x1="330" y1="110" x2="694" y2="110" stroke="${ACC.red ?? "#dc2626"}" stroke-width="5"/>
      <line x1="330" y1="500" x2="694" y2="500" stroke="${ACC.blue}" stroke-width="5"/>
      <rect x="512" y="182" width="14" height="60" fill="${ACC.royal}" opacity="0.3"/>
      <rect x="512" y="356" width="14" height="60" fill="${ACC.green}" opacity="0.3"/>`;
    const common = paper(DW, DH) + sketch(body);
    await writeWebp(dir, "ad_cmos_inverter.webp", svgDoc(DW, DH, common));
    await writeWebp(dir, "ad_cmos_inverter_painted.webp", svgDoc(DW, DH, common + paint));
  }

  // --- Resistor color code ---
  {
    const bandColors = ["#161513", "#7c3aed", "#ea580c", "#caa53d"];
    const body = `
      <g stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round">
        <line x1="90" y1="300" x2="240" y2="300"/>
        <rect x="240" y="240" width="420" height="120" rx="56"/>
        <line x1="660" y1="300" x2="830" y2="300"/>
        ${bandColors.map((c, i) => `<line x1="${310 + i * 70}" y1="246" x2="${310 + i * 70}" y2="354" stroke="${c}" stroke-width="22"/>`).join("")}
        <path d="M880 300 q 20 -18 40 0 t 40 0" stroke-width="3"/>
      </g>
      ${["digit", "digit", "×multiplier", "±tol"].map((t, i) =>
        txt(cabinReg, t, 310 + i * 70, 415, 24, FAINT, "center")
      ).join("")}
      <g stroke="${INK}" stroke-width="2.6" fill="none">
        <rect x="90" y="460" width="620" height="132"/>
        <line x1="90" y1="494" x2="710" y2="494"/>
        <line x1="90" y1="528" x2="710" y2="528"/><line x1="90" y1="560" x2="710" y2="560"/>
        <line x1="250" y1="460" x2="250" y2="592"/><line x1="410" y1="460" x2="410" y2="592"/><line x1="570" y1="460" x2="570" y2="592"/>
      </g>
      ${txt(cabinReg, "0", 170, 522, 24, INK, "center")}${txt(cabinReg, "1", 330, 522, 24, INK, "center")}
      ${txt(cabinReg, "2", 490, 522, 24, INK, "center")}${txt(cabinReg, "3", 650, 522, 24, INK, "center")}
      ${txt(cabinReg, "4", 170, 556, 24, INK, "center")}${txt(cabinReg, "5", 330, 556, 24, INK, "center")}
      ${txt(cabinReg, "6", 490, 556, 24, INK, "center")}${txt(cabinReg, "7", 650, 556, 24, INK, "center")}
      ${txt(cabinReg, "8", 170, 588, 24, INK, "center")}${txt(cabinReg, "9", 330, 588, 24, INK, "center")}
      ${txt(cabinReg, "…read toward", 490, 486, 20, FAINT, "center")}
      ${txt(cabinBold, "gold = tolerance", 490, 516, 24, INK, "center")}
      ${txt(cabinReg, "example:", 760, 500, 26, FAINT)}
      ${txt(cabinBold, "yellow violet red", 760, 540, 28, INK)}
      ${txt(cabinBold, "= 4.7 kΩ ±5%", 760, 578, 28, INK)}`;
    const paint = bandColors
      .map((c, i) => `<line x1="${310 + i * 70}" y1="246" x2="${310 + i * 70}" y2="354" stroke="${["#111111", "#8a4b08", "#d93025", "#caa53d"][i]}" stroke-width="22"/>`)
      .join("");
    const common = paper(DW, DH) + sketch(body);
    await writeWebp(dir, "ad_resistor_codes.webp", svgDoc(DW, DH, common));
    await writeWebp(dir, "ad_resistor_codes_painted.webp", svgDoc(DW, DH, common + paint));
  }
}

// ============================================================
// 4. SKILL BALLOONS — 640×1500 (ratio 0.4267)
// ============================================================
const BW = 640, BH = 1500;

const BALLOON_SKILLS = [
  { id: "verilog", label: "Verilog", tier: "large", accent: ACC.orange, icon: "wave" },
  { id: "systemverilog", label: "SystemVerilog", tier: "large", accent: ACC.royal, icon: "wave" },
  { id: "stm32", label: "STM32", tier: "large", accent: ACC.blue, icon: "chip" },
  { id: "ccpp", label: "C / C++", tier: "medium", accent: ACC.blue, icon: "braces" },
  { id: "esp32", label: "ESP32", tier: "medium", accent: ACC.blue, icon: "espboard" },
  { id: "arduino", label: "Arduino", tier: "medium", accent: ACC.green, icon: "board" },
  { id: "vivado", label: "Vivado", tier: "small", accent: ACC.orange, icon: "grid" },
  { id: "kicad", label: "KiCad", tier: "small", accent: ACC.green, icon: "traces" },
  { id: "git", label: "Git", tier: "small", accent: ACC.orange, icon: "branch" },
  { id: "python", label: "Python", tier: "small", accent: ACC.amber, icon: "py" },
];

function balloonIcon(kind, accent) {
  const s = `stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"`;
  switch (kind) {
    case "wave":
      return `<g ${s}><path d="M-110 0 h40 v-46 h36 v92 h36 v-46 h40"/></g>`;
    case "chip":
      return `<g ${s}><rect x="-78" y="-52" width="156" height="104" rx="8"/>
        ${[-39, -13, 13, 39].map((o) => `<line x1="${o}" y1="-52" x2="${o}" y2="-74"/><line x1="${o}" y1="52" x2="${o}" y2="74"/>`).join("")}
        <rect x="-30" y="-26" width="60" height="52" rx="4" stroke-width="5"/></g>`;
    case "braces":
      return `<g stroke="${INK}" fill="none" stroke-linecap="round" stroke-width="9"><path d="M-52 -64 q-34 0 -34 32 q0 32 -22 32 q22 0 22 32 q0 32 34 32"/>
        <path d="M52 -64 q34 0 34 32 q0 32 22 32 q-22 0 -22 32 q0 32 -34 32"/></g>`;
    case "traces":
      return `<g stroke="${INK}" fill="none" stroke-linecap="round" stroke-width="6"><circle cx="-84" cy="52" r="12"/><circle cx="0" cy="-56" r="12"/><circle cx="84" cy="52" r="12"/>
        <path d="M-84 40 v-28 l84 -60 l84 60 v28"/></g>`;
    case "espboard":
      // ESP32 dev board: shield can + zigzag antenna trace + USB stub
      return `<g stroke="${INK}" fill="none" stroke-linecap="round" stroke-width="6">
        <rect x="-96" y="-58" width="192" height="116" rx="8"/>
        <rect x="-64" y="-30" width="76" height="60" rx="4"/>
        <path d="M52 -34 l18 -14 l-18 -14 l18 -14 M52 6 h26 M52 26 h26 M52 46 h26" stroke-width="5"/>
        <rect x="66" y="-10" width="22" height="20" rx="3" stroke-width="5"/>
        <circle cx="-80" cy="40" r="7" stroke-width="5"/>
      </g>`;
    case "board":
      // Classic dev board: pin header rows + IC + USB stub
      return `<g stroke="${INK}" fill="none" stroke-linecap="round" stroke-width="6">
        <rect x="-96" y="-54" width="192" height="108" rx="6"/>
        ${[-72, -44, -16, 12, 40].map((x) => `<line x1="${x}" y1="-54" x2="${x}" y2="-74"/><line x1="${x}" y1="54" x2="${x}" y2="74"/>`).join("")}
        <rect x="-56" y="-22" width="112" height="44" rx="4"/>
        <circle cx="0" cy="0" r="6" stroke-width="4"/>
        <rect x="-96" y="24" width="26" height="18" rx="3" stroke-width="5"/>
      </g>`;
    case "feather":
      return `<g ${s}><path d="M70 -70 Q -60 -30 -84 84 Q 30 60 70 -70 Z" stroke-width="6"/>
        <path d="M-84 84 L 60 -60 M-52 40 l-26 6 M-24 8 l-30 2 M4 -26 l-28 -2" stroke-width="5"/></g>`;
    case "grid":
      return `<g stroke="${INK}" fill="none" stroke-width="5">${[-2, -1, 0, 1].map((r) => [-2, -1, 0, 1].map((c) =>
        `<rect x="${c * 44 - 18}" y="${r * 44 - 18}" width="36" height="36"/>`).join("")).join("")}</g>`;
    case "branch":
      return `<g stroke="${INK}" fill="none" stroke-linecap="round" stroke-width="6"><circle cx="-70" cy="-60" r="16"/><circle cx="70" cy="-60" r="16"/><circle cx="0" cy="70" r="16"/>
        <path d="M-58 -48 Q 0 10 0 54 M58 -48 Q 0 10 0 54"/></g>`;
    case "terminal":
      return `<g ${s}><rect x="-96" y="-64" width="192" height="128" rx="10"/>
        <path d="M-64 -18 l30 26 l-30 26 M-16 34 h60" stroke-width="8"/></g>`;
    case "py":
      return "";
    default:
      return "";
  }
}

async function balloons() {
  console.log("Balloons:");
  const dir = path.join(ROOT, "public", "textures", "about");
  const CX = BW / 2, CY = 620, RX = 268, RY = 470;

  for (const sk of BALLOON_SKILLS) {
    const labelSize = sk.label.length > 9 ? 74 : sk.label.length > 6 ? 88 : 104;

    // vertical reading direction (bottom-to-top like real balloon print)
    const textWidth = textW(cabinBold, sk.label.toUpperCase(), labelSize);

    const knotAndString = `
      <path d="M${CX - 34} ${CY + RY - 6} L${CX} ${CY + RY + 64} L${CX + 34} ${CY + RY - 6}" fill="none"/>
      <path d="M${CX} ${CY + RY + 64} C ${CX - 60} ${CY + RY + 190}, ${CX + 70} ${CY + RY + 300}, ${CX - 24} ${BH - 60}" stroke-dasharray="16 14" stroke-width="4"/>`;

    const balloonOutline = `
      <ellipse cx="${CX}" cy="${CY}" rx="${RX}" ry="${RY}"/>
      <ellipse cx="${CX - RX * 0.45}" cy="${CY - RY * 0.5}" rx="${RX * 0.28}" ry="${RY * 0.16}" transform="rotate(-32 ${CX - RX * 0.45} ${CY - RY * 0.5})" stroke-width="3" opacity="0.5"/>`;

    const body = `
      <g stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round">
        ${balloonOutline}${knotAndString}
      </g>
      ${iconGroup(sk.icon, CX, CY - 150, INK, 1)}
      <g transform="rotate(-90 ${CX} ${CY + 130})">
        ${txt(cabinBold, sk.label.toUpperCase(), CX, CY + 130 + labelSize * 0.35, labelSize, INK, "center")}
      </g>`;

    const paint = `
      <ellipse cx="${CX}" cy="${CY}" rx="${RX - 10}" ry="${RY - 10}" fill="${sk.accent}" opacity="0.14"/>
      ${iconGroup(sk.icon, CX, CY - 150, sk.accent, 1)}
      <g transform="rotate(-90 ${CX} ${CY + 130})">
        ${txtStroke(cabinBold, sk.label.toUpperCase(), CX, CY + 130 + labelSize * 0.35, labelSize, sk.accent, 2.4, "center")}
      </g>`;

    const common = `<rect width="${BW}" height="${BH}" fill="transparent"/>` + sketch(body);
    await writeWebp(dir, `balon_${sk.id}.webp`, svgDoc(BW, BH, common), 92);
    await writeWebp(dir, `balon_${sk.id}_painted.webp`, svgDoc(BW, BH, common + paint), 92);
  }
}

function iconGroup(kind, cx, cy, color, scale) {
  if (kind === "py") {
    // "Py" monogram instead of complex snake logo
    return txt(cabinBold, "Py", cx, cy + 34, 110, color, "center");
  }
  return `<g transform="translate(${cx} ${cy}) scale(${scale})">${balloonIcon(kind, color)}</g>`;
}

// ============================================================
// 5. ENTRANCE SIGN — 1024×512 (plane is 2×1 world units)
// ============================================================
async function entranceSign() {
  console.log("Entrance sign:");
  const dir = path.join(ROOT, "public", "textures", "entrance");
  const W = 1024, H = 512;

  const body = `
    <rect x="18" y="18" width="${W - 36}" height="${H - 36}" rx="26"
      fill="${CARD}" stroke="${INK}" stroke-width="8"/>
    <rect x="40" y="40" width="${W - 80}" height="${H - 80}" rx="16"
      fill="none" stroke="${FAINT}" stroke-width="2.5" stroke-dasharray="14 10"/>
    ${txt(cabinBold, "HI, I'M ADARSH", W / 2, H / 2 - 20, 128, INK, "center")}
    <path d="M180 ${H / 2 + 26} H ${W - 180}" stroke="${FAINT}" stroke-width="3" stroke-dasharray="12 9"/>
    ${txt(cabinReg, "embedded · vlsi · iot", W / 2, H / 2 + 92, 46, "#6b6257", "center")}
    ${txt(cabinReg, "- scroll to walk -", W / 2, H - 74, 36, FAINT, "center")}`;

  const paint = `
    <rect x="18" y="18" width="${W - 36}" height="${H - 36}" rx="26"
      fill="none" stroke="${ACC.green}" stroke-width="8"/>
    ${txt(cabinBold, "HI, I'M ADARSH", W / 2, H / 2 - 20, 128, ACC.green, "center")}`;

  await writeWebp(dir, "ad_sign.webp", svgDoc(W, H, body));
  await writeWebp(dir, "ad_sign_painted.webp", svgDoc(W, H, body + paint));
}

// ============================================================
// 6. HALLWAY JOKE POSTERS — 1024×640 landscape (wall frames)
// ============================================================
const JW = 1024, JH = 640;

async function jokePosters() {
  console.log("Joke posters:");
  const dir = path.join(ROOT, "public", "textures", "corridor", "decorations");

  // --- Poster A: breadboard excuse ---
  {
    const body = `
      ${txt(cabinBold, "IT WORKS ON MY", 512, 120, 64, INK, "center")}
      ${txt(cabinBold, "BREADBOARD", 512, 196, 88, INK, "center")}
      <g stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round">
        <rect x="312" y="280" width="400" height="180" rx="10"/>
        <path d="M332 310 h360 M332 340 h360 M332 430 h360 M332 400 h360" stroke-dasharray="7 7" stroke-width="2"/>
        ${Array.from({ length: 12 }, (_, i) => `<circle cx="${356 + i * 28}" cy="385" r="4"/>`).join("")}
        <path d="M370 320 q 30 60 -20 60 M420 330 q -20 50 30 60" stroke-width="3"/>
        <rect x="520" y="300" width="90" height="46" rx="6"/>
        <circle cx="430" cy="300" r="12"/><path d="M442 300 h60" stroke-width="3"/>
      </g>
      ${txt(cabinReg, "the production version is a mystery", 512, 545, 34, FAINT, "center")}`;
    const paint = `
      <rect x="520" y="300" width="90" height="46" rx="6" fill="${ACC.green}" opacity="0.25"/>
      <circle cx="430" cy="300" r="12" fill="${ACC.amber}"/>`;
    const common = paper(JW, JH) + sketch(body);
    await writeWebp(dir, "ad_joke_breadboard.webp", svgDoc(JW, JH, common));
    await writeWebp(dir, "ad_joke_breadboard_painted.webp", svgDoc(JW, JH, common + paint));
  }

  // --- Poster B: magic smoke ---
  {
    const smoke = `
      <path d="M470 250 q -26 -40 8 -70 q 30 -26 6 -58" stroke-width="3.4"/>
      <path d="M540 244 q 30 -36 -2 -66 q -28 -28 -2 -56" stroke-width="3.4"/>
      <path d="M506 236 q -4 -30 22 -48" stroke-width="3"/>`;
    const body = `
      ${txt(cabinBold, "MAGIC SMOKE", 512, 110, 84, INK, "center")}
      <g stroke="${INK}" stroke-width="4.4" fill="none" stroke-linecap="round">
        <rect x="392" y="270" width="240" height="170" rx="10"/>
        <circle cx="432" cy="300" r="9"/><circle cx="592" cy="300" r="9"/>
        <circle cx="432" cy="410" r="9"/><circle cx="592" cy="410" r="9"/>
        <circle cx="512" cy="355" r="42" stroke-dasharray="10 8" stroke-width="3.4"/>
        ${smoke}
        <line x1="352" y1="300" x2="392" y2="300"/><line x1="352" y1="380" x2="392" y2="380"/>
        <line x1="632" y1="300" x2="672" y2="300"/><line x1="632" y1="380" x2="672" y2="380"/>
      </g>
      ${txt(cabinReg, "every chip runs on it.", 512, 500, 36, INK, "center")}
      ${txt(cabinReg, "let it out — and it never works again.", 512, 552, 32, FAINT, "center")}`;
    const paint = `${smoke.replace(/stroke-width/g, `stroke="${ACC.orange}" stroke-width`)}`;
    const common = paper(JW, JH) + sketch(body);
    await writeWebp(dir, "ad_joke_smoke.webp", svgDoc(JW, JH, common));
    await writeWebp(dir, "ad_joke_smoke_painted.webp", svgDoc(JW, JH, common + `<g fill="none" stroke-linecap="round">${paint}</g>`));
  }
}

// ============================================================
// 7. ENTRANCE DOOR LEAVES — 664×1696 (legacy leaf 332×848 @2x)
// ============================================================
async function entranceDoors() {
  console.log("Entrance doors:");
  const dir = path.join(ROOT, "public", "textures", "doors");
  const DW2 = 664, DH2 = 1696;

  function leaf(letters) {
    const n = letters.length;
    const size = 210;
    const startY = 330;
    const gap = 200;
    const letterPaths = letters
      .split("")
      .map((ch, i) =>
        txt(cabinBold, ch, DW2 / 2, startY + i * gap, size, INK, "center")
      )
      .join("");
    return `
      <rect x="16" y="16" width="${DW2 - 32}" height="${DH2 - 32}" rx="14"
        fill="${CARD}" stroke="${INK}" stroke-width="9"/>
      <!-- inset panels -->
      <g stroke="${INK}" stroke-width="4.5" fill="none">
        <rect x="72" y="80" width="${DW2 - 144}" height="260" rx="10"/>
        <rect x="72" y="${DH2 - 340}" width="${DW2 - 144}" height="260" rx="10"/>
      </g>
      <g stroke="${FAINT}" stroke-width="2.4" fill="none" stroke-dasharray="12 9">
        <rect x="86" y="94" width="${DW2 - 172}" height="232" rx="8"/>
        <rect x="86" y="${DH2 - 326}" width="${DW2 - 172}" height="232" rx="8"/>
      </g>
      <!-- circuit doodles in lower panel -->
      <g stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round">
        <path d="M140 ${DH2 - 220} h120 v-60 h90"/>
        <circle cx="350" cy="${DH2 - 280}" r="14"/>
        <path d="M140 ${DH2 - 160} h80 l50 50 h120" stroke-dasharray="14 10"/>
        <circle cx="176" cy="${DH2 - 220}" r="8" />
      </g>
      <!-- name letters -->
      ${letterPaths}
      <!-- handle plate hint near inner edge -->
      <rect x="${DW2 - 118}" y="${DH2 * 0.52}" width="54" height="190" rx="10"
        fill="none" stroke="${INK}" stroke-width="4"/>
    `;
  }

  await writeWebp(dir, "ad_door_left.webp", svgDoc(DW2, DH2, leaf("ADARSH")), 90);
  await writeWebp(dir, "ad_door_right.webp", svgDoc(DW2, DH2, leaf("SWARUP")), 90);

  // Painted variants: accent-colored letters + warm tinted panels
  async function paintedLeaf(file, letters, accent) {
    const src = svgDoc(DW2, DH2, leaf(letters));
    // overlay: re-render letters in accent on top of the base art
    const n = letters.length;
    const size = 210;
    const startY = 330;
    const gap = 200;
    const accentLetters = letters
      .split("")
      .map((ch, i) =>
        txt(cabinBold, ch, DW2 / 2, startY + i * gap, size, accent, "center")
      )
      .join("");
    const overlay = `
      <rect x="72" y="80" width="${DW2 - 144}" height="260" rx="10" fill="${accent}" opacity="0.08"/>
      <rect x="72" y="${DH2 - 340}" width="${DW2 - 144}" height="260" rx="10" fill="${accent}" opacity="0.08"/>
      ${accentLetters}`;
    await writeWebp(dir, file, svgDoc(DW2, DH2, src.slice(0, src.length - 6) /* strip </svg> */ + overlay + "</svg>"), 90);
  }
  await paintedLeaf("ad_door_left_painted.webp", "ADARSH", ACC.green);
  await paintedLeaf("ad_door_right_painted.webp", "SWARUP", ACC.green);
}

// ---------- run ----------
await covers();
await portrait();
await diagrams();
await balloons();
await entranceSign();
await jokePosters();
await entranceDoors();
console.log("\nAll artwork generated.");
