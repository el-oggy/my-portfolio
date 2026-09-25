const fs = require('fs');
const s = fs.readFileSync('components/itom/src/components/canvas/rooms/Studio/StudioRoom.jsx', 'utf8');
const p = fs.readFileSync('components/itom/src/components/canvas/rooms/Studio/FloatingCodeParticles.jsx', 'utf8');
const t = fs.readFileSync('components/itom/src/components/canvas/rooms/RoomThemeConfig.js', 'utf8');
const checks = [
  ['Studio point light violet #8b5cff', s.includes('color="#8b5cff"')],
  ['Studio point light pink #ff5d8f', s.includes('color="#ff5d8f"')],
  ['Studio point light cyan #4dd8ff', s.includes('color="#4dd8ff"')],
  ['Studio night fog #140a2b kept', t.includes("fog: '#140a2b'")],
  ['Studio night bg #0d0620 kept', t.includes("background: '#0d0620'")],
  ['Particles COLORS exact trio', p.includes("['#8b5cff', '#ff5d8f', '#4dd8ff']")],
  ['Particles legacy monochrome', p.includes('isStylized ? particle.color : "#1a1a1a"')],
  ['Particles low-tier clamp', p.includes('lowTier ? 24 : PARTICLE_COUNT')],
  ['Particles reduced-motion freeze', p.includes('motionScale') && p.includes('prefers-reduced-motion')],
  ['Particles seeded (no Math.random call)', !/Math\.random\s*\(/.test(p)],
  ['Studio low-tier baked fallback', s.includes('isStylized && isLowTierMode')],
  ['Studio flag legacy-compatible', s.includes("!== 'legacy'")],
  ['Tower + monitors intact', s.includes('towerRef') && s.includes('MonitorBlock')],
];
let fail = 0;
checks.forEach((c) => { console.log((c[1] ? 'PASS' : 'FAIL') + ' ' + c[0]); if (!c[1]) fail++; });
process.exit(fail ? 1 : 0);
