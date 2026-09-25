const fs = require('fs');
const c = fs.readFileSync('components/itom/src/components/canvas/rooms/Contact/ContactRoom.jsx', 'utf8');
const t = fs.readFileSync('components/itom/src/components/canvas/rooms/RoomThemeConfig.js', 'utf8');
const checks = [
  ['Contact beam consumes palette.beam', c.includes("getRoomTheme('contact').palette.beam")],
  ['Beam token value #ffd27a kept', t.includes("beam: '#ffd27a'")],
  ['Beam is drei volumetric SpotLight', c.includes('<SpotLight') && c.includes('volumetric={true}')],
  ['Beam still gated stylized + non-low-tier', c.includes('isStylized && !isLowTierMode') && c.includes('<LighthouseBeam />')],
  ['Contact dusk gradient #122036 -> #ff9a55 kept', t.includes("gradientTop: '#122036'") && t.includes("gradientBottom: '#ff9a55'")],
  ['Contact deep background #182740 kept', c.includes('color="#182740"') && t.includes("background: '#182740'")],
  ['Dock / ship / lighthouse intact', c.includes('moloTexture') && c.includes('statekRef') && c.includes('latarniaTexture')],
  ['MessagePaper + overlay intact', c.includes('MessagePaper') && c.includes('openEmail()')],
  ['No new fireflies (documented skip)', !/firefl/i.test(c)],
  ['Flag legacy-compatible', c.includes("!== 'legacy'")],
];
let fail = 0;
checks.forEach((k) => { console.log((k[1] ? 'PASS' : 'FAIL') + ' ' + k[0]); if (!k[1]) fail++; });
process.exit(fail ? 1 : 0);
