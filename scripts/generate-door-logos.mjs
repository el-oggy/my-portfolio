/**
 * generate-door-logos.mjs — builds the entrance-door language logo medallions.
 *
 * Downloads official/community language marks, composites each onto a white
 * sketch card (double border, paper tone) and writes tiny webp textures that
 * EntranceDoors.jsx renders as decorative planes.
 *
 * Sources:
 *   C / C++ / Python / Tcl  → devicon (MIT)
 *   Verilog / SystemVerilog → vscode-icons via Iconify (CC-BY-4.0 / GPL) — no
 *                             official marks exist (Accellera restricts theirs).
 *
 * Run:  node scripts/generate-door-logos.mjs
 */
import sharp from "sharp";
import { mkdirSync } from "fs";
import path from "path";

const OUT = path.resolve("public/textures/doors/logos");
const SIZE = 512;      // output card (px)
const LOGO = 320;      // logo inside card (px)
const MARGIN = (SIZE - LOGO) / 2;

const LOGOS = [
  {
    id: "c",
    urls: [
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg",
      "https://raw.githubusercontent.com/devicons/devicon/master/icons/c/c-original.svg",
    ],
  },
  {
    id: "cpp",
    urls: [
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg",
      "https://raw.githubusercontent.com/devicons/devicon/master/icons/cplusplus/cplusplus-original.svg",
    ],
  },
  {
    id: "python",
    urls: [
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
      "https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg",
    ],
  },
  {
    id: "tcl",
    urls: [
      "https://api.iconify.design/vscode-icons/file-type-tcl.svg",
      "https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/file_type_tcl.svg",
    ],
  },
  {
    id: "verilog",
    urls: [
      "https://api.iconify.design/vscode-icons/file-type-verilog.svg",
      "https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/file_type_verilog.svg",
    ],
  },
  {
    id: "systemverilog",
    urls: [
      "https://api.iconify.design/vscode-icons/file-type-systemverilog.svg",
      "https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/file_type_systemverilog.svg",
    ],
  },
];

// White paper card with a sketchy double border — reads on both the plain and
// painted door textures.
const CARD_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <rect x="12" y="12" width="${SIZE - 24}" height="${SIZE - 24}" rx="48" fill="#fffdf8" stroke="#2b2b2b" stroke-width="14"/>
  <rect x="34" y="34" width="${SIZE - 68}" height="${SIZE - 68}" rx="30" fill="none" stroke="#bdb5a6" stroke-width="4"/>
</svg>`;

// Force an explicit pixel size — Iconify ships width="1em", which librsvg
// renders at 16px unless overridden.
function normalizeSvg(svg, size) {
  return svg.replace(/<svg([^>]*)>/i, (_m, attrs) => {
    const cleaned = attrs.replace(/\s(width|height)="[^"]*"/gi, "");
    return `<svg${cleaned} width="${size}" height="${size}">`;
  });
}

async function fetchFirst(urls) {
  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "portfolio-asset-script" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      if (!text.trim().startsWith("<svg")) throw new Error("not an svg");
      return text;
    } catch (e) {
      console.warn(`  ! ${url} -> ${e.message}`);
    }
  }
  throw new Error("all sources failed");
}

mkdirSync(OUT, { recursive: true });
for (const logo of LOGOS) {
  const svg = await fetchFirst(logo.urls);
  const logoPng = await sharp(Buffer.from(normalizeSvg(svg, LOGO)), { density: 300 })
    .resize(LOGO, LOGO, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const out = path.join(OUT, `${logo.id}.webp`);
  await sharp(Buffer.from(CARD_SVG))
    .composite([{ input: logoPng, top: MARGIN, left: MARGIN }])
    .webp({ quality: 92 })
    .toFile(out);
  console.log("ok", out);

  // Ink variant: pencil-duotone version of the mark for the sketch (rest)
  // state. A plain silhouette would erase marks that rely on internal colour
  // contrast (the white "C" in the C badge), so we remap luminance onto an
  // ink→pencil-gray ramp that never reaches paper white — light brand colours
  // (Python yellow) stay readable against the card.
  const { data, info } = await sharp(logoPng)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const ink = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const lum = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
    const v = Math.round(24 + lum * 120); // #181818 ink → #909090 pencil gray
    ink[i] = ink[i + 1] = ink[i + 2] = v;
    ink[i + 3] = data[i + 3];
  }
  const inkPng = await sharp(ink, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();

  const inkOut = path.join(OUT, `${logo.id}-ink.webp`);
  await sharp(Buffer.from(CARD_SVG))
    .composite([{ input: inkPng, top: MARGIN, left: MARGIN }])
    .webp({ quality: 92 })
    .toFile(inkOut);
  console.log("ok", inkOut);
}
console.log("done");
