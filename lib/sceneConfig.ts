/**
 * Scene + camera-path configuration.
 *
 * The entire journey is ONE continuous world space. The camera walks a single
 * path through scenes positioned in world coordinates, driven by a normalized
 * 0..1 scroll-progress value (see scrollStore + CameraController).
 *
 * Each scene owns a slice of the [0,1] progress range and a world center.
 * The camera keyframes are derived from the scene centers so the path is
 * always consistent with the scene layout.
 *
 * Theme: Electronics / Embedded / IoT — the journey is a hardware build:
 *   intro (First Boot) -> pcb (circuit hub) -> embedded (microcontrollers)
 *   -> iot (sensors & wireless) -> drone (robotics hero) -> firmware
 *   -> journey -> contact
 */

import type { SceneKey } from "./data";

export interface SceneDef {
  key: SceneKey;
  /** Human label used by navigation + scroll sections. */
  label: string;
  /** Accessible hash target (matches navLinks href). */
  anchor: string;
  /** Progress range [start, end) this scene occupies on the 0..1 journey. */
  scroll: [number, number];
  /** Center of the scene's content in world space. */
  worldCenter: [number, number, number];
  /** Accent color token id (maps to CSS vars — see globals.css). */
  accent: string;
  /**
   * Optional explicit camera keyframes for this scene (used by "rooms" — see
   * Step 1 of the hybrid path+rooms plan). Each `at` is a 0..1 progress value
   * *within this scene's scroll slice*; `pos`/`lookAt` are relative to the
   * scene's `worldCenter` and converted to absolute world coords on the path.
   *
   * Omitting `keyframes` falls back to the single derived keyframe that all
   * corridor scenes use today (rise + pull taper) — so this is fully
   * back-compatible.
   */
  keyframes?: CameraKeyframeDef[];
}

/**
 * One camera keyframe, expressed in scene-local terms before flattening.
 * `at` ∈ [0,1] is progress within the owning scene's scroll slice.
 * `pos` / `lookAt` are offsets from that scene's `worldCenter`.
 */
export interface CameraKeyframeDef {
  at: number;
  pos: [number, number, number];
  lookAt: [number, number, number];
}

/**
 * Scenes laid out along a gentle path down -Z with mild X drift so it reads
 * as a journeyed world, not a straight tube. The visitor travels:
 *   intro -> pcb (hub) -> embedded -> iot -> drone -> firmware
 *   -> journey -> contact
 */
export const SCENES: SceneDef[] = [
  {
    key: "intro",
    label: "First Boot",
    anchor: "#top",
    scroll: [0.0, 0.08],
    worldCenter: [0, 0, 0],
    accent: "--accent-intro",
  },
  {
    key: "pcb",
    label: "Circuit Hub",
    anchor: "#pcb",
    scroll: [0.08, 0.18],
    worldCenter: [0, 0, -50],
    accent: "--accent-pcb",
  },
  {
    key: "embedded",
    label: "Embedded · Microcontrollers",
    anchor: "#embedded",
    scroll: [0.18, 0.33],
    worldCenter: [-30, 0, -110],
    accent: "--accent-embedded",
  },
  {
    key: "iot",
    label: "IoT · Sensors & Wireless",
    anchor: "#iot",
    scroll: [0.33, 0.47],
    worldCenter: [30, 0, -180],
    accent: "--accent-iot",
  },
  {
    key: "drone",
    label: "Drone · Robotics",
    anchor: "#drone",
    scroll: [0.47, 0.62],
    worldCenter: [-30, 0, -250],
    accent: "--accent-drone",
  },
  {
    key: "firmware",
    label: "Firmware & Software",
    anchor: "#firmware",
    scroll: [0.62, 0.74],
    worldCenter: [30, 0, -320],
    accent: "--accent-firmware",
  },
  {
    key: "rtl",
    label: "RTL · Systolic Array",
    anchor: "#rtl",
    scroll: [0.74, 0.86],
    worldCenter: [-30, 0, -380],
    accent: "--accent-rtl",
  },
  {
    key: "journey",
    label: "Journey",
    anchor: "#journey",
    scroll: [0.86, 0.94],
    worldCenter: [0, 0, -440],
    accent: "--accent-timeline",
  },
  {
    key: "contact",
    label: "Contact",
    anchor: "#contact",
    scroll: [0.94, 1.0],
    worldCenter: [0, 0, -500],
    accent: "--accent-contact",
  },
];

export function sceneAtProgress(progress: number): SceneDef {
  const p = clamp01(progress);
  for (const s of SCENES) {
    if (p >= s.scroll[0] && p < s.scroll[1]) return s;
  }
  return p >= 1 ? SCENES[SCENES.length - 1] : SCENES[0];
}

export function sceneIndex(key: SceneKey): number {
  return SCENES.findIndex((s) => s.key === key);
}

/**
 * A flattened, globally-sorted camera keyframe. `progress` ∈ [0,1] is the
 * ABSOLUTE journey progress at which this keyframe sits; `pos`/`lookAt` are
 * absolute world coordinates. CameraController brackets the current scroll
 * progress between two consecutive entries and interpolates.
 */
export interface CameraKeyframe {
  progress: number;
  pos: [number, number, number];
  lookAt: [number, number, number];
}

/** Rise/pull taper for the default (corridor) keyframe derivation. */
const DEFAULT_RISE = 14;
const DEFAULT_RISE_STEP = 0.4;
const DEFAULT_PULL = 34;
const DEFAULT_PULL_STEP = 0.6;

/**
 * Default single keyframe for a corridor scene, placed a little above + behind
 * the scene center — exactly the geometry the journey used before the
 * keyframe refactor, so corridor scenes stay visually identical.
 */
function defaultKeyframe(
  center: [number, number, number],
  rise: number,
  pull: number,
  progress: number,
): CameraKeyframe {
  return {
    progress,
    pos: [center[0], center[1] + rise, center[2] + pull],
    lookAt: center,
  };
}

/** Add two 3-tuples. */
function add3(a: [number, number, number], b: [number, number, number]): [number, number, number] {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

/**
 * The flattened, globally-sorted camera path the controller walks.
 *
 * For each scene:
 *   - if `scene.keyframes` is provided, each entry's local `at` is mapped to an
 *     absolute progress within the scene's scroll slice, and its relative
 *     pos/lookAt are offset by the scene's worldCenter → absolute coords.
 *   - otherwise, a single default corridor keyframe is emitted at the scene's
 *     scroll midpoint (matching the pre-refactor rise/pull taper), EXCEPT the
 *     first scene emits its keyframe at progress 0 and the last at progress 1
 *     so the path spans the full [0,1] range end-to-end.
 *
 * Result is sorted by ascending progress with no duplicate-collapse — the
 * controller brackets between consecutive entries.
 */
export const FULL_CAMERA_PATH: CameraKeyframe[] = (() => {
  const out: CameraKeyframe[] = [];
  SCENES.forEach((s, i) => {
    const [start, end] = s.scroll;
    const span = end - start;
    if (s.keyframes && s.keyframes.length > 0) {
      for (const k of s.keyframes) {
        out.push({
          progress: start + clamp01(k.at) * span,
          pos: add3(s.worldCenter, k.pos),
          lookAt: add3(s.worldCenter, k.lookAt),
        });
      }
    } else {
      const rise = DEFAULT_RISE - i * DEFAULT_RISE_STEP;
      const pull = DEFAULT_PULL - i * DEFAULT_PULL_STEP;
      // Pin the first scene's keyframe to progress 0 and the last's to 1 so the
      // path covers the whole journey; interior scenes sit at their midpoint
      // (equivalent to the old index-based spacing for evenly-sized slices).
      let p: number;
      if (i === 0) p = 0;
      else if (i === SCENES.length - 1) p = 1;
      else p = start + span * 0.5;
      out.push(defaultKeyframe(s.worldCenter, rise, pull, p));
    }
  });
  return out.sort((a, b) => a.progress - b.progress);
})();

export function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
