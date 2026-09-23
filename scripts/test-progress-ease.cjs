/**
 * M1 acceptance harness — preloader easing.
 *
 * Replays a throttled, bursty asset feed through the EXACT shipped easing math
 * in components/itom/src/utils/progressEase.js (loaded the way the bundler
 * would resolve it) plus the target-resolution rules from Preloader.jsx, and
 * asserts the M1 acceptance criteria:
 *
 *   1. counter is monotonic (never walks backwards)
 *   2. no per-frame jump-cut (per-frame delta stays under budget)
 *   3. readout never passes 99 while the scene is not ready
 *   4. the readout reaches exactly 99 and visibly HOLDS it until ready
 *   5. the exit threshold (>= 99.5) is only reachable AFTER ready
 *
 * Node CJS: the source file is ESM for the bundler, so `export` is stripped
 * and the body is evaluated — same bytes, no duplicated logic.
 *
 * Run: node scripts/test-progress-ease.cjs
 */
const fs = require("fs");
const path = require("path");

const SRC = path.join(
  __dirname,
  "..",
  "components",
  "itom",
  "src",
  "utils",
  "progressEase.js"
);

const src = fs
  .readFileSync(SRC, "utf8")
  .replace(/export\s+(const|function)\s+/g, "$1 ");
const { easeProgress, progressCeiling } = new Function(
  src + "\nreturn { easeProgress, progressCeiling };"
)();

const FRAME_MS = 1000 / 60; // 60fps ticker
const TOTAL_ASSETS = 130; // matches the documented Preloader boot traffic
const JUMP_BUDGET = 2.5; // max points the readout may move in one frame

/** Throttled network shape: 8-in-flight batches + a 1.2s stall mid-boot. */
function makeFeed() {
  const events = [];
  let t = 0;
  for (let i = 0; i < TOTAL_ASSETS; i++) {
    if (i === 40 || i === 41) t += 1200; // stall — nothing lands
    else if (i % 8 === 0) t += 180; // batch boundary
    else t += 12; // steady drip
    events.push({ t, real: ((i + 1) / TOTAL_ASSETS) * 100 });
  }
  return events;
}


function simulate(compileHoldMs, expect) {
  const events = makeFeed();
  const lastAssetAt = events[events.length - 1].t;
  const READY_AT = lastAssetAt + compileHoldMs;
  const minHoldMs = expect.minHoldMs;

  let time = 0;
  let ei = 0;
  let real = 0;
  let target = 0;
  let display = 0;
  let active = true;

  const failures = [];
  const samples = [];
  let maxJump = 0;
  let prevShown = 0;
  let holdStart = null;
  let holdEnd = null;
  let exitAt = null;
  let readyAt = null;
  let shownBeforeReady = 0;

  while (time < READY_AT + 3000) {
    // --- feed raw progress ------------------------------------------------
    while (ei < events.length && events[ei].t <= time) {
      real = events[ei].real;
      ei++;
    }
    if (ei >= events.length && active) {
      real = 100; // three's LoadingManager onLoad
      active = false;
    }
    const sceneReady = time >= READY_AT;

    // --- target resolution (mirrors Preloader.jsx tick) --------------------
    let nextTarget = real;
    if (!active && real >= 100) nextTarget = sceneReady ? 100 : 99;
    if (nextTarget > target) target = nextTarget;

    // --- shipped easing math ---------------------------------------------
    display = easeProgress(display, target, FRAME_MS);
    const shown = Math.min(100, Math.max(0, Math.min(progressCeiling(sceneReady), display)));

    if (shown < prevShown - 1e-9) {
      failures.push(`not monotonic at t=${Math.round(time)}ms`);
    }
    const jump = Math.abs(shown - prevShown);
    maxJump = Math.max(maxJump, jump);
    if (jump > JUMP_BUDGET) {
      failures.push(`jump-cut ${jump.toFixed(2)}pts in one frame at t=${Math.round(time)}ms`);
    }

    if (shown > 99 + 1e-9 && !sceneReady) {
      failures.push(`readout passed 99 (${shown.toFixed(2)}) before ready at t=${Math.round(time)}ms`);
    }

    if (shown >= 99 - 1e-9 && shown <= 99 + 1e-9) {
      if (holdStart === null) holdStart = time;
      holdEnd = time;
    }
    if (!sceneReady) shownBeforeReady = shown;

    if (readyAt === null && sceneReady) readyAt = time;
    if (exitAt === null && shown >= 99.5) exitAt = time;
    if (samples.length < 6 || time % 1000 < FRAME_MS) {
      samples.push({ t: Math.round(time), real, shown: +shown.toFixed(2) });
    }

    prevShown = shown;
    time += FRAME_MS;
  }

  const holdMs = holdStart === null ? 0 : Math.round(holdEnd - holdStart);
  if (expect.exactHoldRequired) {
    if (holdStart === null) failures.push("readout never held at exactly 99");
    if (holdMs < minHoldMs) {
      failures.push(`99% hold too short: ${holdMs}ms (expected >= ${minHoldMs}ms)`);
    }
  } else if (holdStart !== null && holdMs > 0 && holdMs < minHoldMs) {
    failures.push(`99% hold too short: ${holdMs}ms (expected >= ${minHoldMs}ms)`);
  }
  if (shownBeforeReady < expect.minPreReadyReadout - 1e-9) {
    failures.push(
      `last readout before ready was ${shownBeforeReady.toFixed(2)}, expected >= ${expect.minPreReadyReadout}`
    );
  }
  if (exitAt === null) failures.push("exit threshold (>=99.5) never reached");
  else if (readyAt === null || exitAt < readyAt) {
    failures.push("exit threshold reached before the scene reported ready");
  }
  const releaseMs = exitAt === null || readyAt === null ? null : Math.round(exitAt - readyAt);
  if (releaseMs !== null) {
    if (releaseMs > 1000) failures.push(`exit took ${releaseMs}ms after ready (should be < 1000ms)`);
    if (releaseMs < expect.minReleaseMs) {
      failures.push(`release was a ${releaseMs}ms cut (expected >= ${expect.minReleaseMs}ms of glide)`);
    }
  }

  return { failures, samples, maxJump, holdMs, exitAt, readyAt, lastAssetAt, releaseMs };
}

const SCENARIOS = [
  {
    // RoomWarmup + gl.compileAsync on the real app: a long enough compile that
    // the readout must come to rest and visibly sit on 99%.
    label: "slow compile (1500ms shader hold)",
    compileHoldMs: 1500,
    expect: {
      exactHoldRequired: true,
      minHoldMs: 700,
      minPreReadyReadout: 99,
      minReleaseMs: 0,
    },
  },
  {
    // Compile nearly instant: no artificial hold may be invented, but the
    // release still has to glide (no jump-cut) and must not linger.
    label: "fast compile (600ms shader hold)",
    compileHoldMs: 600,
    expect: {
      exactHoldRequired: false,
      minHoldMs: 0,
      minPreReadyReadout: 97,
      minReleaseMs: 150,
    },
  },
];

let failed = false;

console.log("preloader easing harness (M1)");
console.log("  ticker 60fps | feed = 8-in-flight batches + 1.2s stall | 130 assets\n");

for (const s of SCENARIOS) {
  const r = simulate(s.compileHoldMs, s.expect);
  console.log(`scenario: ${s.label}`);
  console.log(`  assets finished at   : ${Math.round(r.lastAssetAt)}ms`);
  console.log(`  held at exactly 99%  : ${r.holdMs}ms (min ${s.expect.minHoldMs}ms)`);
  console.log(`  exit gate reached at : ${r.exitAt === null ? "never" : Math.round(r.exitAt) + "ms"} (ready + ${r.releaseMs}ms)`);
  console.log(`  max per-frame delta  : ${r.maxJump.toFixed(3)}pts (budget ${JUMP_BUDGET})`);
  for (const x of r.samples) {
    console.log(
      `    t=${String(x.t).padStart(5)}ms  real=${x.real.toFixed(1).padStart(5)}%  shown=${String(x.shown).padStart(6)}%`
    );
  }
  if (r.failures.length) {
    failed = true;
    console.log("  FAILED:");
    for (const f of r.failures) console.log("    -", f);
  } else {
    console.log("  pass ✓");
  }
  console.log("");
}

if (failed) process.exit(1);
console.log("all M1 acceptance checks pass ✓");
