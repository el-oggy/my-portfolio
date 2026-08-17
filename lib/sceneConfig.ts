/**
 * Scene + camera-path configuration for the Hallway Architecture.
 *
 * The visitor travels straight down a literal 3D hallway along the negative Z-axis.
 * Camera stays centered at X=0, Y=0 and moves down Z based on scroll.
 */

import type { SceneKey } from "./data";

export interface SceneDef {
  key: SceneKey;
  label: string;
  anchor: string;
  scroll: [number, number]; // [start, end)
  zDepth: number; // The exact Z coordinate of this door/room
  side: "left" | "right" | "center"; // Which wall the door is on
  accent: string;
}

// Spacing between rooms
const Z_STEP = -80;
let currentZ = 0;

export const SCENES: SceneDef[] = [
  {
    key: "intro",
    label: "First Boot",
    anchor: "#top",
    scroll: [0.0, 0.08],
    zDepth: currentZ,
    side: "center",
    accent: "--accent-intro",
  },
  {
    key: "pcb",
    label: "Circuit Hub",
    anchor: "#pcb",
    scroll: [0.08, 0.16],
    zDepth: (currentZ += Z_STEP),
    side: "left",
    accent: "--accent-pcb",
  },
  {
    key: "embedded",
    label: "Embedded · Microcontrollers",
    anchor: "#embedded",
    scroll: [0.16, 0.24],
    zDepth: (currentZ += Z_STEP),
    side: "right",
    accent: "--accent-embedded",
  },
  {
    key: "iot",
    label: "IoT · Sensors & Wireless",
    anchor: "#iot",
    scroll: [0.24, 0.32],
    zDepth: (currentZ += Z_STEP),
    side: "left",
    accent: "--accent-iot",
  },
  {
    key: "drone",
    label: "Drone · Robotics",
    anchor: "#drone",
    scroll: [0.32, 0.40],
    zDepth: (currentZ += Z_STEP),
    side: "right",
    accent: "--accent-drone",
  },
  {
    key: "firmware",
    label: "Firmware & Software",
    anchor: "#firmware",
    scroll: [0.40, 0.48],
    zDepth: (currentZ += Z_STEP),
    side: "left",
    accent: "--accent-firmware",
  },
  {
    key: "rtl",
    label: "RTL · Systolic Array",
    anchor: "#rtl",
    scroll: [0.48, 0.56],
    zDepth: (currentZ += Z_STEP),
    side: "right",
    accent: "--accent-rtl",
  },
  {
    key: "projects",
    label: "Projects · Gallery",
    anchor: "#projects",
    scroll: [0.56, 0.72],
    zDepth: (currentZ += Z_STEP),
    side: "center", // Projects is a big gateway you go through
    accent: "--accent-projects",
  },
  {
    key: "journey",
    label: "Journey · Signal Path",
    anchor: "#journey",
    scroll: [0.72, 0.88],
    zDepth: (currentZ += Z_STEP),
    side: "center",
    accent: "--accent-timeline",
  },
  {
    key: "contact",
    label: "Contact",
    anchor: "#contact",
    scroll: [0.88, 1.0],
    zDepth: (currentZ += Z_STEP),
    side: "center",
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

export interface CameraKeyframe {
  progress: number;
  pos: [number, number, number];
  lookAt: [number, number, number];
}

export const FULL_CAMERA_PATH: CameraKeyframe[] = (() => {
  const out: CameraKeyframe[] = [];
  
  SCENES.forEach((s, i) => {
    // For the center of each scene's scroll slice, the camera should be exactly at the scene's Z-depth + a small offset so we can see the door
    const [start, end] = s.scroll;
    
    // First node at 0, last at 1, others at center
    let p: number;
    if (i === 0) p = 0;
    else if (i === SCENES.length - 1) p = 1;
    else p = start + (end - start) * 0.5;

    out.push({
      progress: p,
      // Camera stays strictly in the middle of the hallway (x=0, y=0)
      // and backs up 10 units from the door so it's in view
      pos: [0, 0, s.zDepth + 15], 
      lookAt: [0, 0, s.zDepth - 50], // Always looking straight down the hallway
    });
  });

  return out.sort((a, b) => a.progress - b.progress);
})();

export function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
