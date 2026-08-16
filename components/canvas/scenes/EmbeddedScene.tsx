"use client";

import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

import { SCENES } from "@/lib/sceneConfig";
import { sceneLocalProgress } from "@/lib/stage";
import { LazyLoadScene } from "./lazyScene";

/**
 * EmbeddedScene — microcontrollers & buses (§B.3 re-theme).
 *
 * A stylized breadboard workbench: an MCU chip wired over I2C/UART to an IMU
 * module, a display, and a relay block. The signal lines are the story — the
 * same buses that connect every embedded build.
 */

const CYAN = "#22d3ee";
const AMBER = "#fbbf24";
const GREEN = "#34d399";
const BLUE = "#3b82f6";

function Socket({ x, z }: { x: number; z: number }) {
  return (
    <mesh position={[x, 1.12, z]}>
      <cylinderGeometry args={[0.13, 0.13, 0.16, 10]} />
      <meshStandardMaterial
        color="#0b0f16"
        emissive={CYAN}
        emissiveIntensity={0.35}
        roughness={0.4}
        metalness={0.6}
      />
    </mesh>
  );
}

/** Sockets along the breadboard's two rails. */
function SocketRails() {
  const sockets: { x: number; z: number }[] = [];
  for (let i = 0; i < 13; i++) {
    const x = -11 + i * 1.83;
    sockets.push({ x, z: -2.6 }, { x, z: 2.6 });
  }
  return (
    <>
      {sockets.map((s, i) => (
        <Socket key={i} x={s.x} z={s.z} />
      ))}
    </>
  );
}

export default function EmbeddedScene() {
  const sceneDef = SCENES.find((s) => s.key === "embedded");
  const rootRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const root = rootRef.current;
    if (!root) return;
    const t = state.clock.elapsedTime;
    const p = sceneLocalProgress("embedded");
    root.position.y = Math.sin(t * 0.5) * 0.18;
    root.rotation.y = p * 0.4 + Math.sin(t * 0.1) * 0.02;
  });

  if (!sceneDef) return null;

  return (
    <group position={sceneDef.worldCenter}>
      <LazyLoadScene sceneKey="embedded">
        <group ref={rootRef}>
          {/* Breadboard body. */}
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[26, 1, 9]} />
            <meshStandardMaterial color="#161c26" roughness={0.6} metalness={0.3} />
          </mesh>
          <SocketRails />

          {/* MCU chip. */}
          <mesh position={[0, 1.35, 0]}>
            <boxGeometry args={[6, 0.7, 6]} />
            <meshStandardMaterial
              color="#0b1220"
              emissive={CYAN}
              emissiveIntensity={0.22}
              roughness={0.3}
              metalness={0.4}
            />
          </mesh>
          <mesh position={[0, 1.78, 0]}>
            <boxGeometry args={[2.6, 0.1, 2.6]} />
            <meshStandardMaterial color="#e6edf6" emissive={CYAN} emissiveIntensity={0.4} />
          </mesh>

          {/* IMU module (MPU6500). */}
          <mesh position={[-8, 1.3, -2]}>
            <boxGeometry args={[2.6, 0.6, 2.6]} />
            <meshStandardMaterial color="#0e141d" roughness={0.5} metalness={0.3} />
          </mesh>
          <mesh position={[-8, 1.68, -2]}>
            <boxGeometry args={[1.4, 0.1, 1.4]} />
            <meshStandardMaterial color="#0a0c10" emissive={AMBER} emissiveIntensity={0.7} />
          </mesh>

          {/* Display panel. */}
          <mesh position={[8.6, 2.7, 1.6]}>
            <planeGeometry args={[5.2, 3.2]} />
            <meshStandardMaterial color="#07090d" roughness={0.4} metalness={0.2} />
          </mesh>
          <mesh position={[8.6, 2.85, 1.62]}>
            <planeGeometry args={[4.2, 0.5]} />
            <meshStandardMaterial color="#0a0c10" emissive={CYAN} emissiveIntensity={0.9} />
          </mesh>

          {/* Relay / actuator block. */}
          <mesh position={[7, 1.25, -3]}>
            <boxGeometry args={[3, 0.7, 2]} />
            <meshStandardMaterial color="#0d1a13" emissive={GREEN} emissiveIntensity={0.2} />
          </mesh>

          {/* Signal lines (I2C/UART story). */}
          <Line
            points={[[-3, 1.75, -3], [-6.7, 1.75, -2.1]]}
            color={AMBER}
            lineWidth={1.4}
            transparent
            opacity={0.9}
          />
          <Line
            points={[[3, 1.75, 2.8], [6.3, 1.75, 2.2]]}
            color={CYAN}
            lineWidth={1.4}
            transparent
            opacity={0.9}
          />
          <Line
            points={[[3, 1.7, -3], [5.5, 1.7, -3]]}
            color={GREEN}
            lineWidth={1.4}
            transparent
            opacity={0.9}
          />

          {/* Floating hint blocks for bus labels. */}
          <mesh position={[-5.2, 3.4, -2]}>
            <boxGeometry args={[0.9, 0.35, 0.9]} />
            <meshStandardMaterial
              color="#0b0f16"
              emissive={AMBER}
              emissiveIntensity={0.5}
            />
          </mesh>
          <mesh position={[5.2, 3.4, 2.4]}>
            <boxGeometry args={[0.9, 0.35, 0.9]} />
            <meshStandardMaterial color="#0b0f16" emissive={CYAN} emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[4.4, 3.4, -3]}>
            <boxGeometry args={[0.9, 0.35, 0.9]} />
            <meshStandardMaterial color="#0b0f16" emissive={BLUE} emissiveIntensity={0.5} />
          </mesh>
        </group>
      </LazyLoadScene>
    </group>
  );
}
