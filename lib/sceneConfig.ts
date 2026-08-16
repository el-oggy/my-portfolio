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
}

/**
 * Scenes laid out along a gentle path down -Z with mild X drift so it reads
 * as a journeyed world, not a straight tube. The visitor travels:
 *   intro -> silicon (hub) -> rtl -> asic -> timing -> fpga -> systems
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
    key: "silicon",
    label: "Silicon Hub",
    anchor: "#silicon",
    scroll: [0.08, 0.16],
    worldCenter: [0, 0, -50],
    accent: "--accent-asic",
  },
  {
    key: "rtl",
    label: "RTL",
    anchor: "#rtl",
    scroll: [0.16, 0.31],
    worldCenter: [-30, 0, -110],
    accent: "--accent-rtl",
  },
  {
    key: "asic",
    label: "ASIC · Physical Design",
    anchor: "#asic",
    scroll: [0.31, 0.46],
    worldCenter: [30, 0, -180],
    accent: "--accent-asic",
  },
  {
    key: "timing",
    label: "Timing · STA",
    anchor: "#timing",
    scroll: [0.46, 0.55],
    worldCenter: [-30, 0, -250],
    accent: "--accent-timing",
  },
  {
    key: "fpga",
    label: "FPGA",
    anchor: "#fpga",
    scroll: [0.55, 0.64],
    worldCenter: [30, 0, -320],
    accent: "--accent-fpga",
  },
  {
    key: "systems",
    label: "Systems · Embedded",
    anchor: "#systems",
    scroll: [0.64, 0.76],
    worldCenter: [-30, 0, -400],
    accent: "--accent-systems",
  },
  {
    key: "journey",
    label: "Journey",
    anchor: "#journey",
    scroll: [0.76, 0.9],
    worldCenter: [0, 0, -480],
    accent: "--accent-timeline",
  },
  {
    key: "contact",
    label: "Contact",
    anchor: "#contact",
    scroll: [0.9, 1.0],
    worldCenter: [0, 0, -560],
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

/** A point a little above and behind each scene center, looking down at it. */
export interface CameraKeyframe {
  pos: [number, number, number];
  lookAt: [number, number, number];
}

/** Camera pulls back / rises slightly as the journey progresses for scale. */
function keyframeFor(center: [number, number, number], rise: number, pull: number): CameraKeyframe {
  return {
    pos: [center[0], center[1] + rise, center[2] + pull],
    lookAt: center,
  };
}

export const CAMERA_PATH: CameraKeyframe[] = SCENES.map((s, i) =>
  keyframeFor(s.worldCenter, 14 - i * 0.4, 34 - i * 0.6),
);

export function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
