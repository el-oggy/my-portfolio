"use client";

import { Text } from "@react-three/drei";
import { useMemo } from "react";

import { SCENES } from "@/lib/sceneConfig";
import { getScroll } from "@/lib/scrollStore";
import { useFrame } from "@react-three/fiber";

/**
 * Temporary world scaffold (will be replaced scene-by-scene).
 * Renders one glowing pillar + label at each scene's worldCenter so the
 * camera-walks-path architecture is visibly correct end-to-end. Doubles as a
 * visual debug aid (§51) — remove as real scenes land.
 */

const ACCENT_HEX: Record<string, string> = {
  "--accent-intro": "#8b9bbd",
  "--accent-asic": "#22D3EE",
  "--accent-rtl": "#7C5CFF",
  "--accent-timing": "#22D3EE",
  "--accent-fpga": "#3B82F6",
  "--accent-systems": "#34D399",
  "--accent-timeline": "#A78BFA",
  "--accent-contact": "#67E8F9",
};

export default function PlaceholderWorld() {
  const pillars = useMemo(
    () =>
      SCENES.map((s) => ({
        key: s.key,
        pos: s.worldCenter as [number, number, number],
        label: s.label,
        color: ACCENT_HEX[s.accent] ?? "#8b9bbd",
      })),
    [],
  );

  const activeRef = useActiveScene();

  return (
    <group>
      {/* Chip-substrate grid floor, stretches under the whole path. */}
      <gridHelper
        args={[1400, 140, "#1a2236", "#0e1420"]}
        position={[0, -4, -280]}
      />

      {/* Ambient + a soft moving key light following nothing for now. */}
      <ambientLight intensity={0.45} color="#6f86b8" />
      <pointLight position={[0, 30, -30]} intensity={40} color="#7DD3FC" distance={400} />

      {pillars.map((p, i) => (
        <group key={p.key} position={p.pos}>
          {/* Pillar — brightens on the active scene (read via frame-updated ref). */}
          <mesh>
            <boxGeometry args={[4, 12, 4]} />
            <meshStandardMaterial
              color={p.color}
              emissive={p.color}
              emissiveIntensity={activeRef.current === p.key ? 1.6 : 0.5}
              metalness={0.5}
              roughness={0.35}
              transparent
              opacity={0.92}
            />
          </mesh>
          {/* Label */}
          <Text
            position={[0, 9, 0]}
            fontSize={2.2}
            color={p.color}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
            outlineOpacity={0.6}
          >
            {p.label}
          </Text>
          {/* Path connector dot */}
          {i < pillars.length - 1 && (
            <mesh position={[0, -2, 0]}>
              <sphereGeometry args={[1.0, 16, 16]} />
              <meshStandardMaterial
                color={p.color}
                emissive={p.color}
                emissiveIntensity={0.7}
              />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

/**
 * Returns a ref whose `.current` is the active scene key, updated each frame
 * WITHOUT triggering a React re-render (cheap; pillar material already reads
 * it reactively because the next render replaces itself via store change —
 * see note). For now we just re-read in useFrame and store the string.
 */
function useActiveScene() {
  const ref = useMemo<{ current: string }>(() => ({ current: "intro" }), []);
  useFrame(() => {
    ref.current = getScroll().currentScene;
  });
  return ref;
}
