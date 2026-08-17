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
   * Journey-role of this scene: corridor scenes fly past at touring altitude;
   * rooms get explicit entry/explore/exit keyframes and a larger scroll slice;
   * the finale is the landing endpoint. Defaults to "corridor".
   */
  role?: SceneRole;
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
 * Hybrid path + rooms layout (plan Step 2).
 *
 * The corridor scenes (pcb, embedded, iot, drone, firmware, rtl) fly past at
 * touring altitude along a meandering line down -Z with alternating X drift —
 * each gets a tight ~8% scroll slice. The two ROOMS — `projects` (the
 * aggregated gallery) and `journey` (the signal-path timeline) — sit below the
 * main path (negative Y) at their own Z, and get generous ~16% slices so the
 * camera can descend-in, explore, and ascend-out (the explicit entry/explore/
 * exit `keyframes` land in Step 3). `contact` returns to the main level as the
 * finale. Scroll ranges sum to exactly 1.0.
 *
 * The visitor travels:
 *   intro (First Boot) -> pcb -> embedded -> iot -> drone -> firmware -> rtl
 *   -> projects [room] -> journey [room] -> contact
 *
 * Roles are encoded on each SceneDef via the optional `role` field so the DOM
 * layer + future UI can treat corridor/room scenes differently.
 */
export type SceneRole = "corridor" | "room" | "finale";

export const SCENES: SceneDef[] = [
  {
    key: "intro",
    label: "First Boot",
    anchor: "#top",
    scroll: [0.0, 0.06],
    worldCenter: [0, 0, 0],
    accent: "--accent-intro",
    role: "corridor",
  },
  {
    key: "pcb",
    label: "Circuit Hub",
    anchor: "#pcb",
    scroll: [0.06, 0.14],
    worldCenter: [0, 0, -60],
    accent: "--accent-pcb",
    role: "corridor",
  },
  {
    key: "embedded",
    label: "Embedded · Microcontrollers",
    anchor: "#embedded",
    scroll: [0.14, 0.22],
    worldCenter: [-30, 0, -120],
    accent: "--accent-embedded",
    role: "corridor",
  },
  {
    key: "iot",
    label: "IoT · Sensors & Wireless",
    anchor: "#iot",
    scroll: [0.22, 0.3],
    worldCenter: [30, 0, -180],
    accent: "--accent-iot",
    role: "corridor",
  },
  {
    key: "drone",
    label: "Drone · Robotics",
    anchor: "#drone",
    scroll: [0.3, 0.38],
    worldCenter: [-30, 0, -240],
    accent: "--accent-drone",
    role: "corridor",
  },
  {
    key: "firmware",
    label: "Firmware & Software",
    anchor: "#firmware",
    scroll: [0.38, 0.46],
    worldCenter: [30, 0, -300],
    accent: "--accent-firmware",
    role: "corridor",
  },
  {
    key: "rtl",
    label: "RTL · Systolic Array",
    anchor: "#rtl",
    scroll: [0.46, 0.54],
    worldCenter: [-30, 0, -360],
    accent: "--accent-rtl",
    role: "corridor",
  },
  {
    key: "projects",
    label: "Projects · Gallery",
    anchor: "#projects",
    scroll: [0.54, 0.7],
    // Below the corridor path so the camera descends into a distinct room.
    worldCenter: [0, -45, -430],
    accent: "--accent-projects",
    role: "room",
    /**
     * Room camera choreography — Projects Gallery.
     *
     * The camera starts at corridor altitude (~45 units above worldCenter, since
     * worldCenter.y is already -45 and corridor is at y≈0), descends into the
     * room, performs a wide gentle orbit to showcase the project gallery, then
     * ascends back toward the corridor for the next scene.
     *
     * pos/lookAt are offsets from worldCenter [0, -45, -430]:
     *   y +45 = corridor altitude (world y ≈ 0)
     *   y  0  = room floor (world y = -45)
     */
    keyframes: [
      // 0 — Approach: still at corridor altitude, peering down toward the room
      { at: 0.0,  pos: [0, 48, 35],    lookAt: [0, 10, -5] },
      // 1 — Descend: diving toward the room entrance
      { at: 0.15, pos: [0, 28, 20],    lookAt: [0, 2, -10] },
      // 2 — Enter: arriving at room level, centered
      { at: 0.30, pos: [0, 12, 14],    lookAt: [0, 0, -8] },
      // 3 — Explore left: gentle orbit left across gallery
      { at: 0.45, pos: [-18, 8, 4],    lookAt: [5, -2, -12] },
      // 4 — Explore right: orbit to the right side
      { at: 0.65, pos: [18, 8, -4],    lookAt: [-5, -2, -12] },
      // 5 — Center: return to center, begin to look upward
      { at: 0.82, pos: [0, 14, 8],     lookAt: [0, 5, -15] },
      // 6 — Ascend: rising back toward corridor altitude
      //     at=0.98 (not 1.0) so this doesn't collide with the next scene's at=0.0
      { at: 0.98, pos: [0, 48, 30],    lookAt: [0, 20, -20] },
    ],
  },
  {
    key: "journey",
    label: "Journey · Signal Path",
    anchor: "#journey",
    scroll: [0.7, 0.86],
    // A second room, also below the path, at its own Z.
    worldCenter: [0, -45, -560],
    accent: "--accent-timeline",
    role: "room",
    /**
     * Room camera choreography — Journey / Signal Path Timeline.
     *
     * A more linear, forward-moving path that follows the timeline "signal
     * path" from past → present. The camera descends, travels along the
     * timeline with a slight lateral sway for visual interest, then ascends.
     *
     * pos/lookAt offsets from worldCenter [0, -45, -560].
     */
    keyframes: [
      // 0 — Approach: corridor altitude, looking down into the room
      //     at=0.02 (not 0.0) so this doesn't collide with the prev scene's at=1.0
      { at: 0.02, pos: [0, 48, 35],     lookAt: [0, 10, 0] },
      // 1 — Descend: angled dive toward the timeline entrance
      { at: 0.12, pos: [8, 30, 22],     lookAt: [-3, 4, -8] },
      // 2 — Enter: at room level, facing the start of the timeline
      { at: 0.25, pos: [10, 10, 16],    lookAt: [0, 0, -15] },
      // 3 — Pan along: travelling forward along the timeline, slight left sway
      { at: 0.45, pos: [-8, 8, 0],      lookAt: [4, -2, -20] },
      // 4 — Mid-timeline: centered, looking ahead
      { at: 0.60, pos: [0, 6, -10],     lookAt: [0, -2, -28] },
      // 5 — Far end: reaching the present, slight right drift
      { at: 0.75, pos: [8, 8, -18],     lookAt: [-4, 0, -8] },
      // 6 — Center + rise: pulling back, looking at the full path
      { at: 0.88, pos: [0, 20, -6],     lookAt: [0, 6, -14] },
      // 7 — Ascend: back to corridor altitude for the finale
      //     at=0.98 (not 1.0) so this doesn't collide with the contact scene's keyframe
      { at: 0.98, pos: [0, 48, 30],     lookAt: [0, 20, -20] },
    ],
  },
  {
    key: "contact",
    label: "Contact",
    anchor: "#contact",
    scroll: [0.86, 1.0],
    // Return to the main level for the finale endpoint.
    worldCenter: [0, 0, -660],
    accent: "--accent-contact",
    role: "finale",
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
