"use client";

import { Text } from "@react-three/drei";
import { SCENES } from "@/lib/sceneConfig";

/**
 * The Silicon Hub scene — the central navigation world of the portfolio.
 *
 * This is a placeholder; the real scene will contain the stylized chip
 * floorplan with portals to other scenes. For now, it's just a label to
 * confirm the camera path from IntroScene lands here correctly.
 */
export default function SiliconScene() {
  const sceneDef = SCENES.find((s) => s.key === "silicon");
  if (!sceneDef) return null;

  return (
    <group position={sceneDef.worldCenter}>
      <Text
        fontSize={4}
        color="#a78bfa"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.04}
        outlineColor="#000"
      >
        [ Silicon Hub Scene ]
      </Text>
    </group>
  );
}
