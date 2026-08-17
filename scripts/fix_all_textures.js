const https = require('https');
const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}

const allTextureFiles = getAllFiles(path.join(__dirname, '../public/textures'));
const zeroByteFiles = allTextureFiles.filter(f => fs.statSync(f).size === 0 || f.endsWith('.tmp'));

console.log(`Found ${zeroByteFiles.length} zero-byte or corrupt files to fix.`);

async function downloadFile(filePath) {
  const relPath = path.relative(path.join(__dirname, '../public'), filePath).replace(/\\/g, '/');
  const url = `https://raw.githubusercontent.com/ITomPoland/portfolio-itom/main/public/${relPath}`;

  return new Promise((resolve) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const dest = fs.createWriteStream(filePath);
        res.pipe(dest);
        dest.on('finish', () => {
          dest.close();
          const size = fs.statSync(filePath).size;
          console.log(`✓ Fixed ${relPath} (${size} bytes)`);
          resolve(true);
        });
      } else {
        console.warn(`✗ Failed ${relPath}: HTTP ${res.statusCode}`);
        resolve(false);
      }
    }).on('error', (err) => {
      console.error(`Error downloading ${relPath}:`, err.message);
      resolve(false);
    });
  });
}

async function run() {
  for (const f of zeroByteFiles) {
    if (f.endsWith('.tmp')) {
      fs.unlinkSync(f);
      continue;
    }
    await downloadFile(f);
  }

  // Also verify specific critical textures
  const criticalTextures = [
    'public/textures/entrance/pot_with_duck.webp',
    'public/textures/entrance/pot_with_duck_painted.webp',
    'public/textures/entrance/mouse_hanging.webp',
    'public/textures/gallery/klamerka.webp',
    'public/textures/gallery/monetuneprzod.webp',
    'public/textures/gallery/monetuneprzod_painted.webp',
    'public/textures/gallery/tylkartki.webp',
    'public/textures/gallery/timberkittyprzod.webp',
    'public/textures/gallery/timberkittyprzod_painted.webp',
    'public/textures/gallery/bioprzod.webp',
    'public/textures/gallery/bioprzod_painted.webp',
    'public/textures/gallery/youngmultiprzod.webp',
    'public/textures/gallery/youngmultiprzod_painted.webp',
    'public/textures/studio/monitor_front.webp',
    'public/textures/studio/monitor_front_painted.webp',
    'public/textures/studio/tv_front.webp',
    'public/textures/studio/tv_front_painted.webp',
    'public/textures/studio/gorastolika.webp',
    'public/textures/corridor/gorastolika.webp',
    'public/textures/corridor/drzewkowdoniczce.webp',
    'public/textures/corridor/kratkawentylacyjna.webp',
  ];

  for (const crit of criticalTextures) {
    const full = path.join(__dirname, '..', crit);
    if (!fs.existsSync(full) || fs.statSync(full).size === 0) {
      fs.mkdirSync(path.dirname(full), { recursive: true });
      await downloadFile(full);
    }
  }

  console.log('All texture verification & repair completed!');
}

run();
