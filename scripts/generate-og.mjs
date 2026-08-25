/**
 * Generates the static Open Graph / Twitter card image.
 *
 * Output: app/opengraph-image.png (1200×630) — Next.js picks this up via
 * the static file convention and injects `og:image` / `twitter:image`
 * automatically. A committed PNG is deliberately used instead of the
 * next/og ImageResponse route because @vercel/og fails to resolve its
 * default font on Windows builds (path.join + fileURLToPath bug).
 *
 * Usage: node scripts/generate-og.mjs
 */
import sharp from "sharp";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "app", "opengraph-image.png");

// Palette mirrors app/globals.css
const INK = "#161513";
const PAPER = "#fbf9f5";
const DIM = "#44403a";
const FAINT = "#8a8177";
const CHIPS = [
  { label: "KiCad PCB", color: "#059669" },
  { label: "STM32", color: "#0284c7" },
  { label: "IoT", color: "#d97706" },
  { label: "Drones", color: "#2563eb" },
  { label: "Firmware", color: "#7c3aed" },
  { label: "RTL", color: "#ea580c" },
];

const chipW = 218;
const chipsSvg = CHIPS.map((chip, i) => {
  const x = 72 + i * (chipW - 30);
  return `
    <g>
      <rect x="${x}" y="500" width="${chipW}" height="58" rx="29"
        fill="${chip.color}" stroke="${INK}" stroke-width="3"/>
      <text x="${x + chipW / 2}" y="539" text-anchor="middle"
        font-family="Segoe UI, Arial, sans-serif" font-size="26" font-weight="700"
        fill="#ffffff">${chip.label}</text>
    </g>`;
}).join("");

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="${PAPER}"/>
  <rect x="6" y="6" width="1188" height="618" fill="none" stroke="${INK}" stroke-width="6"/>

  <!-- Top row -->
  <rect x="72" y="64" width="60" height="60" rx="12" fill="#059669"/>
  <text x="102" y="106" text-anchor="middle"
    font-family="Segoe UI, Arial, sans-serif" font-size="36" font-weight="800" fill="#ffffff">A</text>
  <text x="152" y="105" font-family="Segoe UI, Arial, sans-serif" font-size="28" fill="${FAINT}">
    adarsh-vlsi.vercel.app
  </text>

  <!-- Middle -->
  <text x="72" y="270" font-family="Segoe UI, Arial, sans-serif" font-size="76"
    font-weight="800" fill="${INK}" letter-spacing="-1">Adarsh Swarup Maharana</text>
  <text x="72" y="345" font-family="Segoe UI, Arial, sans-serif" font-size="42"
    font-weight="600" fill="${DIM}">Embedded Systems · IoT · Electronics</text>
  <text x="72" y="405" font-family="Segoe UI, Arial, sans-serif" font-size="29" fill="${FAINT}">
    Microcontrollers · Sensors · Wireless · Drones · Firmware
  </text>

  <!-- Bottom chips -->
  ${chipsSvg}
</svg>`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
await sharp(Buffer.from(svg)).png().toFile(OUT);
console.log(`OG image written to ${OUT}`);
