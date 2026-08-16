"use client";

import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

import { SCENES } from "@/lib/sceneConfig";
import { sceneLocalProgress } from "@/lib/stage";
import { LazyLoadScene } from "./lazyScene";

/**
 * FirmwareScene — firmware & software (§B.6 re-theme).
 *
 * The code side of the hardware world: floating code panels, a terminal with
 * a blinking prompt, mechanical-keyboard keycaps (ZMK), and a small CI
 * pipeline feeding builds.
 */

const VIOLET = "#a78bfa";
const GREEN = "#34d399";
const CYAN = "#22d3ee";
const AMBER = "#fbbf24";

const LINE_COLORS = [VIOLET, CYAN, GREEN, AMBER];

/** One code panel: dark screen + a few glowing "code lines". */
function CodePanel({
  position,
  rotationY = 0,
  seed = 0,
}: {
  position: [number, number, number];
  rotationY?: number;
  seed?: number;
}) {
  const lines = Array.from({ length: 6 }, (_, i) => ({
    x: -2.3 + (i % 3) * 0.6 + seed * 0.12,
    y: 1.5 - i * 0.52,
    len: 1.6 + ((i * 7 + seed * 13) % 5) * 0.55,
    color: LINE_COLORS[(i + seed) % LINE_COLORS.length],
  }));

  return (
    <group position={position} rotation-y={rotationY}>
      <mesh>
        <planeGeometry args={[6, 4.4]} />
        <meshStandardMaterial color="#07090d" roughness={0.35} metalness={0.3} />
      </mesh>
      {lines.map((l, i) => (
        <mesh key={i} position={[l.x, l.y, 0.02]}>
          <boxGeometry args={[l.len, 0.13, 0.06]} />
          <meshStandardMaterial color="#0a0c10" emissive={l.color} emissiveIntensity={0.7} />
        </mesh>
      ))}
    </group>
  );
}

/** Blinking terminal prompt. */
function Terminal() {
  const dotRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!dotRef.current) return;
    const blink = 0.25 + 0.75 * Math.max(0, Math.sin(state.clock.elapsedTime * 2.4));
    (dotRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = blink;
  });

  return (
    <group position={[0, 1.0, -4.5]}>
      <mesh>
        <boxGeometry args={[5, 3, 0.5]} />
        <meshStandardMaterial color="#0a0e16" roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.5, 0.3]}>
        <boxGeometry args={[4, 1.6, 0.08]} />
        <meshStandardMaterial color="#06080c" roughness={0.3} />
      </mesh>
      <mesh ref={dotRef} position={[-1.7, 0.5, 0.38]}>
        <sphereGeometry args={[0.12, 10, 8]} />
        <meshStandardMaterial color="#0a0c10" emissive={GREEN} emissiveIntensity={1} />
      </mesh>
    </group>
  );
}

/** A mechanical keycap. */
function Keycap({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation-y={rotationY}>
      <mesh>
        <boxGeometry args={[2.1, 1.2, 2.1]} />
        <meshStandardMaterial
          color="#141a28"
          emissive={VIOLET}
          emissiveIntensity={0.12}
          roughness={0.5}
          metalness={0.3}
        />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <boxGeometry args={[1.5, 0.3, 1.5]} />
        <meshStandardMaterial color="#1b2334" roughness={0.4} />
      </mesh>
    </group>
  );
}

export default function FirmwareScene() {
  const sceneDef = SCENES.find((s) => s.key === "firmware");
  const rootRef = useRef<THREE.Group>(null);
  const stageRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const root = rootRef.current;
    if (!root) return;
    const t = state.clock.elapsedTime;
    const p = sceneLocalProgress("firmware");
    root.position.y = Math.sin(t * 0.5) * 0.2;
    root.rotation.y = p * 0.4 + Math.sin(t * 0.08) * 0.02;

    // CI stage pulse.
    if (stageRef.current) {
      const pulse = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 2.2));
      (stageRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse;
    }
  });

  if (!sceneDef) return null;

  return (
    <group position={sceneDef.worldCenter}>
      <LazyLoadScene sceneKey="firmware">
        <group ref={rootRef}>
          {/* Code panels. */}
          <CodePanel position={[-9, 2.8, 0]} rotationY={0.22} seed={0} />
          <CodePanel position={[0, 3.3, 0]} rotationY={0} seed={2} />
          <CodePanel position={[9, 2.8, 0]} rotationY={-0.22} seed={4} />

          {/* Terminal. */}
          <Terminal />

          {/* Keycaps. */}
          <Keycap position={[-4, 0.7, 5.5]} rotationY={0.15} />
          <Keycap position={[0.2, 0.7, 6]} rotationY={-0.1} />
          <Keycap position={[4.5, 0.7, 5.5]} rotationY={0.2} />

          {/* CI pipeline: build stages. */}
          {[-5, 0, 5].map((x, i) => (
            <mesh key={`stage-${i}`} position={[x, 0.7, -6]}>
              <boxGeometry args={[1.7, 1.7, 1.7]} />
              <meshStandardMaterial
                color="#0d1320"
                emissive={i === 1 ? GREEN : CYAN}
                emissiveIntensity={i === 1 ? 0.5 : 0.2}
                roughness={0.4}
              />
            </mesh>
          ))}
          <Line points={[[-4.1, 0.7, -6], [-0.85, 0.7, -6]]} color={GREEN} lineWidth={1.4} transparent opacity={0.8} />
          <Line points={[[0.85, 0.7, -6], [4.1, 0.7, -6]]} color={GREEN} lineWidth={1.4} transparent opacity={0.8} />
        </group>
      </LazyLoadScene>
    </group>
  );
}
