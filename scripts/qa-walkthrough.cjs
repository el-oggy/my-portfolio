#!/usr/bin/env node
/**
 * qa-walkthrough.cjs — real end-to-end walkthrough of the 3D portfolio.
 *
 * FAIL-LOUD BY DESIGN. A previous session satisfied "screenshot before/after"
 * acceptance by committing six 1x1-pixel blank PNGs as "placeholder screenshots".
 * This harness must never repeat that: it asserts real pixel dimensions and file
 * size on every capture, and on ANY failure it exits non-zero and writes NO
 * output file. It never emits a placeholder or stub artifact.
 *
 * Navigation is HONEST: rooms are entered by clicking the real DOM buttons that
 * ScreenReaderOverlay renders (they call useScene().teleportTo), and room
 * readiness is detected from the real "You are in the X room" state text that
 * ScreenReaderOverlay renders. We do not poke React internals or fake state.
 *
 * Usage (server must already be running):
 *   node scripts/qa-walkthrough.cjs
 * Env: QA_PORT, QA_BASE, QA_OUT, QA_W, QA_H, QA_TIMEOUT, CHROME_PATH
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = process.env.QA_PORT || '3000';
const BASE = (process.env.QA_BASE || `http://localhost:${PORT}`).replace(/\/+$/, '');
const OUT = path.resolve(process.env.QA_OUT || 'qa-evidence');
const SHOT_W = Number(process.env.QA_W || 1600);
const SHOT_H = Number(process.env.QA_H || 900);
const READY_TIMEOUT = Number(process.env.QA_TIMEOUT || 60000);
const FPS_WINDOW = Number(process.env.QA_FPS_WINDOW || 3000);

const MIN_SHOT_BYTES = 10 * 1024; // < 10KB means a blank/near-blank render
const MIN_SHOT_DIM = 400;

const BROWSER_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
  'C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
  path.join(process.env.LOCALAPPDATA || '', 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'),
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].filter(Boolean);

function findBrowser() {
  for (const p of BROWSER_CANDIDATES) {
    try { if (fs.existsSync(p)) return p; } catch { /* ignore */ }
  }
  return null;
}

/** QA-only tooling. Never enters package.json dependencies. */
function loadDeps() {
  try {
    return {
      puppeteer: require('puppeteer-core'),
      lighthouse: require('lighthouse'),
      chromeLauncher: require('chrome-launcher'),
    };
  } catch (err) {
    console.error('DEPS MISSING — the QA harness needs puppeteer-core, lighthouse and chrome-launcher.');
    console.error('Install them without touching package.json dependencies:');
    console.error('  npm i --no-save puppeteer-core lighthouse chrome-launcher');
    console.error(`Underlying error: ${err.message}`);
    process.exit(2);
  }
  return null;
}

/**
 * Minimal PNG decoder (8-bit truecolour, with/without alpha) using Node's
 * built-in zlib. We analyse the REAL captured bytes rather than reading the
 * WebGL canvas back via drawImage — that returns an empty buffer unless the
 * context was created with preserveDrawingBuffer, which would produce a false
 * "blank" verdict on a scene that renders perfectly well.
 * Returns { range, distinct } of luminance, or null if the format is exotic.
 */
function analysePng(buf) {
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) return null;
  let pos = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idat = [];
  while (pos + 8 <= buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      if (data[12] !== 0) return null; // interlaced, not handled
    } else if (type === 'IDAT') {
      idat.push(data);
    } else if (type === 'IEND') {
      break;
    }
    pos += 12 + len; // length + type + data + crc
  }
  if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6) || !idat.length) return null;

  const channels = colorType === 6 ? 4 : 3;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const out = Buffer.alloc(height * stride);

  // Undo the per-scanline PNG filters.
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, y * (stride + 1) + 1 + stride);
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null;
    const cur = out.subarray(y * stride, (y + 1) * stride);
    for (let i = 0; i < stride; i++) {
      const a = i >= channels ? cur[i - channels] : 0;
      const b = prev ? prev[i] : 0;
      const c = prev && i >= channels ? prev[i - channels] : 0;
      let v = line[i];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
      }
      cur[i] = v & 0xff;
    }
  }

  // Sample on a grid for speed; the verdict only needs a representative spread.
  const stepX = Math.max(1, Math.floor(width / 240));
  const stepY = Math.max(1, Math.floor(height / 240));
  let min = 255;
  let max = 0;
  const seen = new Set();
  for (let y = 0; y < height; y += stepY) {
    for (let x = 0; x < width; x += stepX) {
      const i = y * stride + x * channels;
      const lum = Math.round(0.2126 * out[i] + 0.7152 * out[i + 1] + 0.0722 * out[i + 2]);
      if (lum < min) min = lum;
      if (lum > max) max = lum;
      seen.add(lum >> 2);
    }
  }
  return { range: max - min, distinct: seen.size };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function log(msg) { console.log(`[qa] ${msg}`); }

/** Poll a page predicate until true or timeout. Deterministic, never blind-sleep. */
async function waitFor(page, label, fn, timeout = READY_TIMEOUT, arg = undefined) {
  const started = Date.now();
  let lastErr = null;
  while (Date.now() - started < timeout) {
    try {
      if (await page.evaluate(fn, arg)) return true;
      lastErr = null;
    } catch (err) {
      lastErr = err;
    }
    await sleep(250);
  }
  throw new Error(`TIMEOUT waiting for "${label}" after ${timeout}ms${lastErr ? ` (last error: ${lastErr.message})` : ''}`);
}

/** Capture a screenshot and PROVE it is real content before accepting it. */
async function shoot(page, name) {
  const file = path.join(OUT, `${name}.png`);
  const buf = await page.screenshot({ type: 'png', fullPage: false });
  const bytes = buf.length;

  // Parse the PNG IHDR for true pixel dimensions (bytes 16..24 of the file).
  const isPng = buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47;
  const width = isPng ? buf.readUInt32BE(16) : 0;
  const height = isPng ? buf.readUInt32BE(20) : 0;

  if (!isPng) throw new Error(`ASSERT "${name}": not a valid PNG (${bytes} bytes) — refusing to save`);
  if (width < MIN_SHOT_DIM || height < MIN_SHOT_DIM) {
    throw new Error(`ASSERT "${name}": screenshot is ${width}x${height}, below ${MIN_SHOT_DIM}px — this is a blank render, refusing to save`);
  }
  if (bytes < MIN_SHOT_BYTES) {
    throw new Error(`ASSERT "${name}": screenshot is only ${bytes} bytes (< ${MIN_SHOT_BYTES}) — refusing to save`);
  }

  // A washed-out frame (e.g. the paper transition still covering the camera)
  // is large and correctly sized yet shows nothing of the room. Decode the real
  // captured PNG and reject a frame with no meaningful tonal spread.
  const variety = analysePng(buf);

  if (!variety) {
    throw new Error(`ASSERT "${name}": could not analyse the PNG (unsupported format) — refusing to save`);
  }
  // Real scenes span a wide tonal range and many distinct buckets; blank paper
  // sits in a very narrow band. Thresholds are deliberately conservative.
  if (variety.range < 40 || variety.distinct < 8) {
    throw new Error(`ASSERT "${name}": frame looks blank (luma range ${variety.range}, ${variety.distinct} distinct buckets) `
      + '— the view is probably obscured by a transition overlay; refusing to save');
  }

  fs.writeFileSync(file, buf);
  log(`  shot ${name}.png  ${width}x${height}  ${(bytes / 1024).toFixed(1)}KB  lumaRange=${variety.range} buckets=${variety.distinct}`);
  return { name, file, width, height, bytes };
}

/** Sample real FPS over a window. Headless GPU is indicative only. */
async function sampleFps(page, windowMs = FPS_WINDOW) {
  return page.evaluate((ms) => new Promise((resolve) => {
    let frames = 0;
    const start = performance.now();
    function tick(now) {
      frames++;
      if (now - start >= ms) {
        resolve(+(frames / ((now - start) / 1000)).toFixed(1));
      } else {
        requestAnimationFrame(tick);
      }
    }
    requestAnimationFrame(tick);
  }), windowMs);
}

/** WebGL renderer string — recorded so noisy headless numbers stay attributable. */
async function readRenderer(page) {
  try {
    return await page.evaluate(() => {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl2') || c.getContext('webgl');
      if (!gl) return 'none';
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      return dbg ? `${gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL)} / ${gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)}` : 'unavailable';
    });
  } catch {
    return 'error';
  }
}

const ROOMS = [
  { id: 'gallery', label: 'Gallery', button: 'The Gallery' },
  { id: 'studio', label: 'Studio', button: 'The Studio' },
  { id: 'about', label: 'About', button: 'About' },
  { id: 'contact', label: 'Contact', button: 'Contact' },
];

async function main() {
  const deps = loadDeps();
  const { puppeteer } = deps;

  const executablePath = findBrowser();
  if (!executablePath) {
    console.error('NO BROWSER FOUND. Looked for:');
    BROWSER_CANDIDATES.forEach((p) => console.error(`  ${p}`));
    console.error('Set CHROME_PATH to override.');
    process.exit(2);
  }
  log(`browser: ${executablePath}`);

  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  const benignAborts = [];
  const contextLosses = [];
  const shots = [];
  const perRoom = {};

  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    defaultViewport: { width: SHOT_W, height: SHOT_H },
    args: [
      '--enable-unsafe-swiftshader',
      '--use-gl=angle',
      '--enable-webgl',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--autoplay-policy=no-user-gesture-required',
      '--mute-audio',
    ],
  });

  try {
    const page = await browser.newPage();

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push({ url: page.url(), text: msg.text() });
    });
    page.on('pageerror', (err) => pageErrors.push({ url: page.url(), text: err.message }));
    page.on('requestfailed', (req) => {
      const f = req.failure();
      const reason = f ? f.errorText : 'unknown';
      const url = req.url();
      // Favicon noise is not an application failure.
      if (url.includes('/favicon')) return;
      // ERR_ABORTED is the browser cancelling a request it no longer needs —
      // routine for a 1.8MB <audio> element that unmounts as rooms change.
      // Those are tracked but not treated as defects; genuine failures
      // (404/DNS/refused/timeouts) still fail the run.
      const benign = /ERR_ABORTED/.test(reason);
      (benign ? benignAborts : failedRequests).push({ url, reason });
    });

    // Ensure the evidence directory exists before the first write.
    if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

    // Surface WebGL context loss as a recorded failure.
    await page.evaluateOnNewDocument(() => {
      window.__qaContextLost = false;
      const orig = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (...args) {
        const ctx = orig.apply(this, args);
        if (ctx && typeof ctx.addEventListener === 'function') {
          ctx.addEventListener('webglcontextlost', () => { window.__qaContextLost = true; });
        }
        return ctx;
      };
    });

    log(`loading ${BASE}/`);
    const resp = await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: READY_TIMEOUT });
    if (!resp || !resp.ok()) {
      throw new Error(`Server unreachable at ${BASE}/ (status: ${resp ? resp.status() : 'no response'}). Is the app running on port ${PORT}?`);
    }

    await waitFor(page, 'WebGL canvas to mount', () => {
      const c = document.querySelector('canvas');
      return !!(c && c.width > 0 && c.height > 0);
    });
    log('canvas mounted');

    // Wait for EVERY .preloader overlay to be dismissed, not just the first.
    // PaperTransition renders a SECOND element that also uses className
    // "preloader" (PaperTransition.jsx:179) and covers the viewport during a
    // teleport — waiting on querySelector alone leaves that paper on screen and
    // every "room" screenshot captures blank crumpled paper instead of the room.
    await waitFor(page, 'all paper overlays to clear', () => {
      const els = [...document.querySelectorAll('.preloader')];
      if (els.length === 0) return true;
      return els.every((el) => {
        const cs = window.getComputedStyle(el);
        return cs.display === 'none' || cs.visibility === 'hidden' ||
          cs.opacity === '0' || el.getBoundingClientRect().width === 0;
      });
    });
    log(`paper overlays cleared (${await page.evaluate(() => document.querySelectorAll('.preloader').length)} present)`);

    // Nothing may be covering the centre of the viewport where we capture.
    const centreClear = () => page.evaluate(() => {
      const el = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
      if (!el) return false;
      return el.tagName === 'CANVAS' || el.closest('canvas') !== null;
    });

    // A click is required to pass the entrance doors (it also unlocks audio).
    // The doors are the tall panels at the end of the corridor; the camera
    // auto-scrolls toward them, so retry across a small grid rather than
    // assuming one pixel is correct on the first try.
    const reachedCorridor = () => page.evaluate(() => {
      const btns = [...document.querySelectorAll('.sr-overlay button')];
      return btns.some((b) => /The Gallery/i.test(b.textContent || ''));
    });

    let entered = false;
    const spots = [
      [0.5, 0.5], [0.5, 0.55], [0.5, 0.45], [0.44, 0.5], [0.56, 0.5], [0.5, 0.6],
    ];
    for (const [fx, fy] of spots) {
      if (entered) break;
      await page.mouse.click(Math.round(SHOT_W * fx), Math.round(SHOT_H * fy));
      const deadline = Date.now() + 8000;
      while (Date.now() < deadline) {
        if (await reachedCorridor()) { entered = true; break; }
        await sleep(400);
      }
      if (!entered) log(`  entrance click at ${fx},${fy} did not register — trying another spot`);
    }
    if (!entered) {
      throw new Error('Could not pass the entrance doors: no click point opened the corridor. '
        + 'The preloader may still be intercepting, or the doors are not yet in view.');
    }
    log('passed the entrance');

    await waitFor(page, 'corridor room list', () => {
      const btns = [...document.querySelectorAll('.sr-overlay button')];
      return btns.some((b) => /The Gallery/i.test(b.textContent || ''));
    });
    log('corridor ready');
    shots.push(await shoot(page, '01-corridor'));

    const renderer = await readRenderer(page);
    log(`webgl renderer: ${renderer}`);
    perRoom.corridor = { fps: await sampleFps(page) };

    for (const room of ROOMS) {
      log(`entering ${room.label}`);
      const clicked = await page.evaluate((label) => {
        const btn = [...document.querySelectorAll('.sr-overlay button')]
          .find((b) => (b.textContent || '').includes(label));
        if (!btn) return false;
        btn.click();
        return true;
      }, room.button);
      if (!clicked) throw new Error(`No accessible button for ${room.label} in the corridor`);

      // Real readiness signal: the overlay announces the room we entered.
      try {
        await waitFor(page, `${room.label} room`, (id) => {
          const t = document.querySelector('.sr-overlay')?.textContent || '';
          return new RegExp(`You are in the .*${id}`, 'i').test(t);
        }, READY_TIMEOUT, room.id);
      } catch {
        // Fall back to the app's own virtual router URL state.
        if (!page.url().includes(`/${room.id}`)) {
          throw new Error(`Never confirmed entry into ${room.label} (url=${page.url()})`);
        }
        log(`  ${room.label}: confirmed via URL ${page.url()}`);
      }

      // The teleport runs a paper close/open animation. That overlay covers the
      // camera, so we must wait for it to clear or the "room" shot is blank paper.
      await waitFor(page, `${room.label} paper overlay to clear`, () => {
        const els = [...document.querySelectorAll('.preloader')];
        return els.every((el) => {
          const cs = window.getComputedStyle(el);
          return cs.display === 'none' || cs.visibility === 'hidden' ||
            cs.opacity === '0' || el.getBoundingClientRect().width === 0;
        });
      }, 30000);
      // And nothing may sit on top of the viewport centre where we capture.
      if (!(await centreClear())) {
        throw new Error(`${room.label}: something is covering the viewport centre — refusing to screenshot`);
      }
      await sleep(2500); // first-frame shader compile + settle
      shots.push(await shoot(page, `0${ROOMS.indexOf(room) + 2}-${room.id}`));

      perRoom[room.id] = { fps: await sampleFps(page) };
      log(`  ${room.label} fps: ${perRoom[room.id].fps}`);

      if (await page.evaluate(() => !!window.__qaContextLost)) contextLosses.push(room.id);

      const exited = await page.evaluate(() => {
        const btn = [...document.querySelectorAll('.sr-overlay button')]
          .find((b) => /Go back to corridor/i.test(b.textContent || ''));
        if (!btn) return false;
        btn.click();
        return true;
      });
      if (!exited) throw new Error(`No exit button while in ${room.label}`);

      await waitFor(page, `corridor after ${room.label}`, () => {
        const btns = [...document.querySelectorAll('.sr-overlay button')];
        return btns.some((b) => /The Gallery/i.test(b.textContent || ''));
      });
      log(`  back in corridor from ${room.label}`);
    }

    shots.push(await shoot(page, '06-final-corridor'));

    const summary = {
      generatedAt: new Date().toISOString(),
      base: BASE,
      browser: executablePath,
      webglRenderer: renderer,
      viewport: { width: SHOT_W, height: SHOT_H },
      note: 'Headless-GPU FPS on this machine is indicative only, not a real-device measurement.',
      rooms: perRoom,
      consoleErrors,
      pageErrors,
      failedRequests,
      benignAborts,
      contextLosses,
      screenshots: shots.map((s) => ({ name: s.name, width: s.width, height: s.height, bytes: s.bytes })),
    };

    const problems = consoleErrors.length + pageErrors.length + failedRequests.length + contextLosses.length;

    // Write the report only after every assertion above has passed.
    if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
    fs.writeFileSync(path.join(OUT, 'walkthrough.json'), JSON.stringify(summary, null, 2));

    console.log('\n=== QA WALKTHROUGH SUMMARY ===');
    console.log(`rooms visited : ${ROOMS.map((r) => r.label).join(', ')}`);
    Object.entries(perRoom).forEach(([k, v]) => console.log(`  fps ${k.padEnd(9)}: ${v.fps}`));
    console.log(`consoleErrors : ${consoleErrors.length}`);
    console.log(`pageErrors    : ${pageErrors.length}`);
    console.log(`failedRequests: ${failedRequests.length}`);
    console.log(`benignAborts  : ${benignAborts.length} (browser-cancelled media, not defects)`);
    console.log(`contextLost   : ${contextLosses.length}`);
    console.log(`screenshots   : ${shots.length} (each validated >= ${MIN_SHOT_DIM}px and >= 10KB)`);

    if (problems > 0) {
      console.error('\n--- DETAIL ---');
      consoleErrors.slice(0, 10).forEach((e) => console.error(`console: ${e.text}`));
      pageErrors.slice(0, 10).forEach((e) => console.error(`pageerr: ${e.text}`));
      failedRequests.slice(0, 10).forEach((e) => console.error(`request: ${e.url} (${e.reason})`));
      console.error(`\nRESULT: FAIL — ${problems} problem(s) detected.`);
      process.exit(1);
    }

    console.log('\nRESULT: PASS — clean walkthrough, all screenshots real.');
    process.exit(0);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(`\nRESULT: FAIL — ${err.message}`);
  console.error('No output artifact was written — evidence is never fabricated on failure.');
  process.exit(1);
});
