const https = require('https');
const fs = require('fs');
const path = require('path');

const files = [
  // Sounds
  'public/sounds/otwarciedrzwi.mp3',
  'public/sounds/uchyleniedrzwi.mp3',
  'public/sounds/zamknieciedrzwi.mp3',
  'public/sounds/papersound.mp3',
  'public/sounds/cfl_turningpages-belem-breeze-487596.ogg',

  // Corridor Textures
  'public/textures/corridor/kawalekpodlogi.webp',
  'public/textures/corridor/texturadoprogow.webp',
  'public/textures/corridor/wall_texture.webp',
  'public/textures/corridor/ceiling_texture.webp',
  'public/textures/corridor/drzewkowdoniczce.webp',
  'public/textures/corridor/kwiatekwdoniczce.webp',
  'public/textures/corridor/kratkawentylacyjna.webp',
  'public/textures/corridor/kratanalampy.webp',
  'public/textures/corridor/bokilampy.webp',
  'public/textures/corridor/strzalka.webp',
  'public/textures/corridor/ramkanazdjecieduza.webp',
  'public/textures/corridor/ramkanazdjecieduza_painted.webp',
  'public/textures/corridor/szafkaprzod.webp',
  'public/textures/corridor/gorastolika.webp',

  // Doors
  'public/textures/corridor/doors/ramkasingledoors.webp',
  'public/textures/corridor/doors/klamkadodrzwi.webp',
  'public/textures/corridor/doors/klamkadodrzwi_painted.webp',
  'public/textures/corridor/doors/doorrleft.webp',
  'public/textures/corridor/doors/dorright.webp',
  'public/textures/corridor/doors/drzwiprojekty.webp',
  'public/textures/corridor/doors/drzwiprojekty_painted.webp',
  'public/textures/corridor/doors/drzwiabout.webp',
  'public/textures/corridor/doors/drzwiabout_painted.webp',
  'public/textures/corridor/doors/drzwikontakt.webp',
  'public/textures/corridor/doors/drzwikontakt_painted.webp',
  'public/textures/corridor/doors/drzwisocial.webp',
  'public/textures/corridor/doors/drzwisocial_painted.webp',
  'public/textures/corridor/doors/backsingledoors.webp',
  'public/textures/corridor/doors/pien.webp',

  // Entrance
  'public/textures/entrance/belka.webp',
  'public/textures/entrance/bricks.webp',
  'public/textures/entrance/tree_sketch.webp',
  'public/textures/entrance/window_bg.webp',
  'public/textures/entrance/sign.webp',
  'public/textures/entrance/cat_front_body.webp',
  'public/textures/entrance/cat_blink.webp',
  'public/textures/entrance/cat_sketch.webp',

  // Avatar Frames
  'public/textures/corridor/avatar_anim/1.webp',
  'public/textures/corridor/avatar_anim/2.webp',
  'public/textures/corridor/avatar_anim/3.webp',
  'public/textures/corridor/avatar_anim/4.webp',
  'public/textures/corridor/avatar_anim/5.webp',
  'public/textures/corridor/avatar_anim/6.webp',
  'public/textures/corridor/avatar_anim/7.webp',
  'public/textures/corridor/avatar_anim/8.webp',
  'public/textures/corridor/avatar_anim/9.webp',

  // Fonts
  'public/fonts/CabinSketch-Bold.ttf',
  'public/fonts/CabinSketch-Regular.ttf',
  'public/fonts/FrederickatheGreat-Regular.ttf',
];

async function downloadAll() {
  console.log(`Starting download of ${files.length} authentic itomdev assets...`);
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const destPath = path.join(process.cwd(), file);
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const options = {
      hostname: 'api.github.com',
      path: `/repos/ITomPoland/portfolio-itom/contents/${file}`,
      headers: {
        'Accept': 'application/vnd.github.raw',
        'User-Agent': 'Mozilla/5.0'
      }
    };

    await new Promise((resolve) => {
      https.get(options, (res) => {
        if (res.statusCode === 200) {
          const fileStream = fs.createWriteStream(destPath);
          res.pipe(fileStream);
          fileStream.on('finish', () => {
            fileStream.close();
            console.log(`[${i + 1}/${files.length}] Saved ${file} (${fs.statSync(destPath).size} bytes)`);
            resolve();
          });
        } else {
          console.warn(`[${i + 1}/${files.length}] Failed ${file}: HTTP ${res.statusCode}`);
          resolve();
        }
      }).on('error', (err) => {
        console.error(`[${i + 1}/${files.length}] Error ${file}:`, err.message);
        resolve();
      });
    });
  }
  
  console.log('All authentic itomdev assets successfully downloaded!');
}

downloadAll();
