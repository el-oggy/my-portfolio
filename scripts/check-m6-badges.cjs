const fs = require('fs');
const b = fs.readFileSync('components/itom/src/components/canvas/rooms/Studio/ElectronicsBadges.jsx', 'utf8');
const s = fs.readFileSync('components/itom/src/components/canvas/rooms/Studio/StudioRoom.jsx', 'utf8');
const checks = [
  ['Flag off by default (=== true gate)', b.includes("NEXT_PUBLIC_ELECTRONICS_BADGES !== 'true'")],
  ['Stylized guard kept', b.includes('if (!isStylized) return null;')],
  ['Five badge types: RTL/MCU/CHIP/SENSOR/DRONE', ['RTL', 'MCU', 'CHIP', 'SENSOR', 'DRONE'].every((l) => b.includes(`'${l}'`))],
  ['Exact trio reused', b.includes('#8b5cff') && b.includes('#ff5d8f') && b.includes('#4dd8ff')],
  ['No Math.random call', !/Math\.random\s*\(/.test(b)],
  ['Hooks isolated behind flag', b.includes('ElectronicsBadgeSet')],
  ['Mounted read-only from StudioRoom', s.includes('<ElectronicsBadges isStylized={isStylized} />')],
  ['No new imports beyond react/r3f/drei', !/from '(?!react|@react-three)/.test(b)],
];
let fail = 0;
checks.forEach((c) => { console.log((c[1] ? 'PASS' : 'FAIL') + ' ' + c[0]); if (!c[1]) fail++; });
process.exit(fail ? 1 : 0);
