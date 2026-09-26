const fs = require('fs');
const g = fs.readFileSync('components/itom/src/components/canvas/rooms/Gallery/GalleryRoom.jsx', 'utf8');

const checks = [
  ['Gallery Environment sunset', g.includes('<Environment preset="sunset" />')],
  ['Gallery warm spot key #fff0d9', g.includes('color="#fff0d9"') && g.includes('position={[5, 10, 5]}')],
  ['Gallery warm spot fill #ff8fb0', g.includes('color="#ff8fb0"') && g.includes('position={[-6, 8, 4]}')],
  ['Gallery ambient light #ff8fb0', g.includes('<ambientLight intensity={0.4} color="#ff8fb0" />')],
  ['Gallery ContactShadows kept', g.includes('<ContactShadows') && g.includes('opacity={0.6}')],
  ['Gallery low-tier fallback branch', g.includes('isStylized && isLowTierMode') && g.includes('directionalLight')],
  ['Gallery PBR floor MeshStandardMaterial in stylized', g.includes('floorMat = isStylized') && g.includes('new THREE.MeshStandardMaterial') && g.includes('roughness: 0.8') && g.includes('metalness: 0.1')],
  ['Gallery floor legacy MeshBasicMaterial fallback', g.includes('new THREE.MeshBasicMaterial') && g.includes('side: THREE.DoubleSide')],
  ['Gallery PBR rope MeshStandardMaterial in stylized', g.includes('ropeMat = isStylized') && g.includes("color: '#8a8a8a', roughness: 0.9, metalness: 0.0")],
  ['Gallery rope legacy MeshBasicMaterial fallback', g.includes("new THREE.MeshBasicMaterial({ color: '#666666' })")],
  ['Gallery PBR threshold MeshStandardMaterial in stylized', g.includes('thresholdMat = isStylized') && g.includes('roughness: 0.85') && g.includes('metalness: 0.0')],
  ['Gallery threshold clone from shared drei cache', g.includes('bbTexSrc.clone()')],
  ['Gallery clothesline system and rope geometry intact', g.includes('ropeGeometry') && g.includes('materials.rope')],
  ['Gallery flag legacy-compatible', g.includes("!== 'legacy'")],
];

let fail = 0;
checks.forEach((c) => {
  console.log((c[1] ? 'PASS' : 'FAIL') + ' ' + c[0]);
  if (!c[1]) fail++;
});

process.exit(fail ? 1 : 0);
