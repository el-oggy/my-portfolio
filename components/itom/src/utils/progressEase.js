/**
 * Boot-progress shaping for the preloader (M1).
 *
 * Pure math, no React/THREE/GSAP — so the acceptance harness in
 * scripts/test-progress-ease.cjs can replay a throttled asset feed through the
 * exact shipped functions instead of a copy.
 *
 * Why two rates: three's DefaultLoadingManager reports integer-ish steps as
 * each of ~130 textures lands. A single exponential rate either lags behind a
 * burst (counter reads "stuck") or snaps forward when a batch completes
 * (counter reads "jumpy"). Tracking fast while far from the target and damping
 * hard inside FAR_GAP points turns both cases into one continuous glide.
 *
 * Everything here is framerate-independent: `dt` is the gsap ticker delta in
 * ms, so 30fps and 144fps converge at the same wall-clock speed.
 */

export const FAR_GAP = 8;       // points from target where damping kicks in
export const FAST_RATE = 6.0;   // per-second exponential rate, far from target
export const SLOW_RATE = 3.0;   // per-second exponential rate, close to target
export const SNAP_EPS = 0.5;    // half a point: invisible at integer readout
                                // resolution, and can never move the readout by
                                // more than one whole step
export const HOLD_CEILING = 99; // readout ceiling while the scene compiles

/**
 * Exact exponential ease-out toward `target`.
 * Uses 1 - e^(-rate*dt) rather than min(1, rate*dt) so long frames (tab
 * regains, GC pauses) can still never overshoot or jump the target.
 */
export function easeProgress(current, target, deltaMs) {
  const dt = Math.min(deltaMs / 1000, 0.1);
  if (dt <= 0) return current;
  const gap = target - current;
  const rate = Math.abs(gap) > FAR_GAP ? FAST_RATE : SLOW_RATE;
  const factor = 1 - Math.exp(-rate * dt);
  let next = current + gap * factor;
  if (Math.abs(target - next) < SNAP_EPS) next = target;
  return next;
}

/**
 * Readout ceiling. Pinned at 99 until the scene reports ready, so the visitor
 * always sees a real hold at 99% — never a premature 100% jump-cut.
 *
 * Note the pin is applied to the *displayed* value only; the eased value keeps
 * advancing behind it, so releasing the pin on `ready` is instant and needs no
 * extra catch-up animation.
 */
export function progressCeiling(sceneReady) {
  return sceneReady ? 100 : HOLD_CEILING;
}
