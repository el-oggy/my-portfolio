/** preview-icons.mjs — renders candidate icon SVGs to PNGs for visual review. */
import sharp from "sharp";
import { mkdirSync } from "fs";

const OUT = "scratchpad/icon-previews";
mkdirSync(OUT, { recursive: true });

const CANDIDATES = [
  ["file-icons-tcl", "https://api.iconify.design/file-icons/tcl.svg"],
  ["material-tcl", "https://api.iconify.design/material-icon-theme/tcl.svg"],
  ["vscode-tcl", "https://api.iconify.design/vscode-icons/file-type-tcl.svg"],
  ["skill-icons-verilog", "https://api.iconify.design/skill-icons/verilog.svg"],
  ["file-icons-verilog", "https://api.iconify.design/file-icons/verilog.svg"],
  ["file-icons-systemverilog", "https://api.iconify.design/file-icons/systemverilog.svg"],
];

for (const [name, url] of CANDIDATES) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "preview" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    let svg = await res.text();
    svg = svg.replace(/<svg([^>]*)>/i, (_m, a) => {
      const cleaned = a.replace(/\s(width|height)="[^"]*"/gi, "");
      return `<svg${cleaned} width="260" height="260">`;
    });
    await sharp(Buffer.from(svg), { density: 300 })
      .flatten({ background: "#ffffff" })
      .png()
      .toFile(`${OUT}/${name}.png`);
    console.log("ok", name);
  } catch (e) {
    console.log("FAIL", name, e.message);
  }
}
