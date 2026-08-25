/**
 * Imports Adarsh's real photos + AI-generated project artwork from the
 * sibling `portfolio-main` project and crops them to the exact ratios the
 * 3D experience expects. Overwrites the procedural placeholders produced by
 * generate-art.mjs (same filenames → zero code changes needed).
 *
 *   portfolio-main/public/projects/*.png|jpg  (1024×1024 AI art)
 *     → public/textures/gallery/ad_<id>.webp          768×1024 (3:4 card)
 *     → public/textures/gallery/ad_<id>_painted.webp  accent-tinted duotone
 *   portfolio-main/public/assets/hero-photo.jpg (1627×2170 portrait)
 *     → public/textures/gallery/ad_portrait.webp      900×900 square
 *
 * Usage: node scripts/import-art.mjs
 */
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "..", "portfolio-main", "public");
const OUT_DIR = path.join(ROOT, "public", "textures", "gallery");

// project id → source file (ids match lib/data.ts projects)
const PROJECT_IMAGES = {
  hexacopter: "projects/drone_project_ai.png",
  weatherstation: "projects/iot_weather_station_ai.png",
  staircase: "projects/smart_stairs_ai.png",
  zmk: "projects/zmk_keyboard_ai.png",
  flowos: "projects/flowos_ui_ai.png",
  systolic: "projects/systolic_array_2d.jpg",
};

// hover-reveal tint per project (mirror data.ts accents)
const TINTS = {
  hexacopter: { r: 37, g: 99, b: 235 }, // drone blue
  weatherstation: { r: 217, g: 119, b: 6 }, // iot amber
  staircase: { r: 217, g: 119, b: 6 },
  zmk: { r: 124, g: 58, b: 237 }, // firmware violet
  flowos: { r: 124, g: 58, b: 237 },
  systolic: { r: 234, g: 88, b: 12 }, // rtl orange
};

async function importProject(id, relSrc) {
  const src = path.join(SRC, relSrc);
  if (!fs.existsSync(src)) {
    console.error("  ✗ missing source:", relSrc);
    return;
  }

  // Front: center-crop to 3:4 (768×1024) — matches the gallery card plane
  await sharp(src)
    .resize(768, 1024, { fit: "cover", position: "centre" })
    .webp({ quality: 88 })
    .toFile(path.join(OUT_DIR, `ad_${id}.webp`));

  // Painted twin: desaturated then tinted toward the project accent,
  // so hovering a photo card "paints" it in that project's color
  const t = TINTS[id];
  await sharp(src)
    .resize(768, 1024, { fit: "cover", position: "centre" })
    .modulate({ saturation: 0.25, brightness: 1.02 })
    .tint(t)
    .webp({ quality: 88 })
    .toFile(path.join(OUT_DIR, `ad_${id}_painted.webp`));

  console.log("  ✓", `ad_${id}.webp (+_painted)`);
}

async function importPortrait() {
  const src = path.join(SRC, "assets", "hero-photo.jpg");
  if (!fs.existsSync(src)) {
    console.error("  ✗ missing portrait source:", src);
    return;
  }
  // Square crop for corridor frame-1 (frame is 1.1×1.1 world units)
  await sharp(src)
    .resize(900, 900, { fit: "cover", position: "attention" }) // attention keeps the face
    .webp({ quality: 88 })
    .toFile(path.join(OUT_DIR, "ad_portrait.webp"));

  await sharp(src)
    .resize(900, 900, { fit: "cover", position: "attention" })
    .modulate({ saturation: 0.3 })
    .tint({ r: 5, g: 150, b: 105 }) // pcb green
    .webp({ quality: 88 })
    .toFile(path.join(OUT_DIR, "ad_portrait_painted.webp"));

  console.log("  ✓ ad_portrait.webp (+_painted)");
}

console.log("Importing real/AI imagery:");
for (const [id, rel] of Object.entries(PROJECT_IMAGES)) await importProject(id, rel);
await importPortrait();
console.log("\nImport complete.");
