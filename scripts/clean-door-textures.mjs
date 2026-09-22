/**
 * clean-door-textures.mjs — removes the baked-in doodles (chip/braces on the
 * left door, molecule on the right) from the entrance door textures so the new
 * language logo medallions sit on clean panels. Dashed panels, handle plate
 * and frame are left untouched.
 *
 * The doodle band is replaced with the door's own background colour (sampled
 * from a clean spot), applied to both the sketch and painted variants so the
 * hover state stays consistent.
 *
 * Run:  node scripts/clean-door-textures.mjs
 */
import sharp from "sharp";
import fs from "fs";

const DIR = "public/textures/doors";

// Regions to wipe, as fractions of width/height (kept clear of the handle
// plate at ~82-92% x and of the dashed top/bottom panels).
const REGIONS = {
  ad_door_left: [{ x: 0.14, y: 0.315, w: 0.66, h: 0.43 }],
  ad_door_right: [{ x: 0.2, y: 0.3, w: 0.6, h: 0.45 }],
};

const FILES = [
  "ad_door_left.webp",
  "ad_door_right.webp",
  "ad_door_left_painted.webp",
  "ad_door_right_painted.webp",
];

// Clean door-body sample points (brightest = the flat background; borders and
// doodles are darker, so a per-channel max is robust against stray lines).
const SAMPLE_POINTS = [
  [0.3, 0.28],
  [0.5, 0.28],
  [0.7, 0.27],
  [0.1, 0.5],
  [0.3, 0.77],
];

async function sampleBg(file, width, height) {
  const rgb = { r: 0, g: 0, b: 0 };
  for (const [fx, fy] of SAMPLE_POINTS) {
    const { data, info } = await sharp(file)
      .extract({
        left: Math.round(width * fx),
        top: Math.round(height * fy),
        width: 4,
        height: 4,
      })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const n = info.width * info.height;
    let r = 0, g = 0, b = 0;
    for (let i = 0; i < n; i++) {
      r += data[i * 3];
      g += data[i * 3 + 1];
      b += data[i * 3 + 2];
    }
    rgb.r = Math.max(rgb.r, r / n);
    rgb.g = Math.max(rgb.g, g / n);
    rgb.b = Math.max(rgb.b, b / n);
  }
  return `rgb(${Math.round(rgb.r)},${Math.round(rgb.g)},${Math.round(rgb.b)})`;
}

for (const name of FILES) {
  const file = `${DIR}/${name}`;
  const meta = await sharp(file).metadata();
  const { width, height } = meta;

  const bg = await sampleBg(file, width, height);

  const key = name.replace("_painted", "").replace(".webp", "");
  const overlays = REGIONS[key].map((rg) => {
    const rx = Math.round(width * rg.x);
    const ry = Math.round(height * rg.y);
    const rw = Math.round(width * rg.w);
    const rh = Math.round(height * rg.h);
    return {
      input: Buffer.from(
        `<svg width="${width}" height="${height}"><rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" rx="${Math.round(width * 0.05)}" fill="${bg}"/></svg>`
      ),
      top: 0,
      left: 0,
    };
  });

  // NOTE: Windows/OneDrive blocks in-place overwrites of these files, but
  // writing a NEW filename works — so emit "<name>.new.webp" and let the
  // caller swap it in (see scripts/swap-door-textures.ps1).
  const out = `${file}.new.webp`;
  const buf = await sharp(file).composite(overlays).webp({ quality: 92 }).toBuffer();
  fs.writeFileSync(out, buf);
  console.log("wrote", out, "bg =", bg);
}
console.log("done");
