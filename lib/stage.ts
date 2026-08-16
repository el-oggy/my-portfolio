/**
 * Within-scene staging helpers.
 *
 * Scenes use these to turn global journey progress (0..1) into a local 0..1
 * "stage" value for their scroll-driven reveals — e.g. the ASIC scene's seven
 * physical-design stages. Reading from the non-reactive scrollStore keeps this
 * allocation-free and free of React re-renders.
 */

import { SCENES, clamp01 } from "./sceneConfig";
import { getScroll } from "./scrollStore";

/** Get this scene's local 0..1 progress (where 0 = just entered, 1 = leaving). */
export function sceneLocalProgress(sceneKey: string): number {
  const s = SCENES.find((x) => x.key === sceneKey);
  if (!s) return 0;
  const p = getScroll().progress;
  return clamp01((p - s.scroll[0]) / (s.scroll[1] - s.scroll[0]));
}

/**
 * Split a scene's local progress into `count` sequential stages, returning the
 * index of the active stage and the 0..1 progress *within* that stage.
 * Useful for "as you scroll, stage N activates" choreography (ASIC flow, etc.).
 */
export function activeStage(
  sceneKey: string,
  count: number,
): { index: number; local: number } {
  if (count <= 0) return { index: 0, local: 0 };
  const lp = sceneLocalProgress(sceneKey);
  const t = clamp01(lp) * count;
  const index = clampStageIndex(t, count);
  return { index, local: clamp01(t - index) };
}

function clampStageIndex(t: number, count: number): number {
  if (t >= count) return count - 1;
  return Math.floor(t);
}

/** Visibility envelope: how "present" a scene is as the camera passes (0→1→0). */
export function scenePresence(sceneKey: string): number {
  const lp = sceneLocalProgress(sceneKey);
  // Ramp up in first 15%, hold, ramp down in last 15%.
  const in_ = THREE_clamp01((lp - 0.0) / 0.15);
  const out = 1 - THREE_clamp01((lp - 0.85) / 0.15);
  return Math.min(in_, Math.max(0, out));
}

// tiny local clamp to avoid importing THREE here.
function THREE_clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
