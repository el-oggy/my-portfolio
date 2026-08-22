export const SEGMENT_LENGTH = 80;
export const CORRIDOR_HEIGHT = 3.5;
export const WALL_X_OUTER = 3.5;
export const WALL_X_INNER = 1.7;
export const DOOR_Z_SPAN = 4;
export const WALL_LENGTH = Math.hypot(WALL_X_OUTER - WALL_X_INNER, DOOR_Z_SPAN);
export const DOOR_MID_X = (WALL_X_OUTER + WALL_X_INNER) / 2;

type RoomKey = Exclude<import("@/context/SceneContext").RoomId, null>;

export interface CorridorDoorDefinition {
  id: string;
  roomId: RoomKey;
  relativeZ: number;
  side: "left" | "right";
  label: string;
  icon: string;
  color: string;
}

export function createCorridorDoors(segmentIndex: number): CorridorDoorDefinition[] {
  return [
    {
      id: `gallery-${segmentIndex}`,
      roomId: "gallery",
      relativeZ: -18,
      side: "left",
      label: "THE GALLERY",
      icon: "◈",
      color: "#059669",
    },
    {
      id: `studio-${segmentIndex}`,
      roomId: "studio",
      relativeZ: -32,
      side: "right",
      label: "THE STUDIO",
      icon: "▶",
      color: "#0284c7",
    },
    {
      id: `about-${segmentIndex}`,
      roomId: "about",
      relativeZ: -48,
      side: "left",
      label: "ABOUT & JOURNEY",
      icon: "★",
      color: "#7c3aed",
    },
    {
      id: `contact-${segmentIndex}`,
      roomId: "contact",
      relativeZ: -62,
      side: "right",
      label: "LET'S CONNECT",
      icon: "✉",
      color: "#ea580c",
    },
  ];
}
