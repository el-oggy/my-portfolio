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
