const fs = require('fs');
const s = fs.readFileSync('components/itom/src/components/canvas/rooms/About/AboutRoom.jsx', 'utf8');
const p = fs.readFileSync('components/itom/src/components/canvas/rooms/About/PaperAirplane.jsx', 'utf8');
const i = fs.readFileSync('components/itom/src/components/canvas/rooms/About/InfiniteSkyManager.jsx', 'utf8');
const checks = [
  ['About Environment sunset', s.includes('Environment preset')],
  ['About warm key ffd5a3', s.includes('#ffd5a3')],
  ['About cool fill 7ebcff', s.includes('#7ebcff')],
  ['About volumetric Clouds kept', s.includes('Clouds') && s.includes('Cloud seed')],
  ['About low-tier fallback branch', s.includes('isLowTierMode') && s.includes('baked warm')],
  ['About god-rays omitted w/ reason', s.includes('No god-rays')],
  ['Glider standard in stylized', p.includes('meshStandardMaterial')],
  ['Glider paint wipe kept', p.includes('about-glider-paint')],
  ['Airplane flight anim intact', s.includes('airplaneGroupRef') && s.includes('currentBank') && s.includes('currentPitch')],
  ['Milestones anim intact', i.includes('revealFactor') && i.includes('spreadFactor')],
];
let fail = 0;
checks.forEach((c) => { console.log((c[1] ? 'PASS' : 'FAIL') + ' ' + c[0]); if (!c[1]) fail++; });
process.exit(fail ? 1 : 0);
