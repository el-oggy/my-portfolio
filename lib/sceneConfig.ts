/**
 * Scene configuration for the Hallway Architecture.
 *
 * The visitor travels straight down a literal 3D hallway along the negative
 * Z-axis; the immersive camera path lives in useInfiniteCamera (z-axis
 * corridor). SCENES drives the semantic fallback sections rendered in
 * app/page.tsx (section ids, labels) and documents each room's z-depth.
 *
 * Historical note: the scroll-progress helpers (sceneAtProgress,
 * FULL_CAMERA_PATH) belonged to the retired Lenis/ScrollTrigger pipeline and
 * were removed with it.
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