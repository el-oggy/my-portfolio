"use client";

import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

import { SCENES } from "@/lib/sceneConfig";
import { activeStage } from "@/lib/stage";
import { LazyLoadScene } from "./lazyScene";

/**
 * JourneyScene — career timeline as a signal path through time (§B.7 re-theme).
 *
 * A horizontal signal trace with nine milestone nodes. As the visitor scrolls
 * through the scene, the active milestone lights up (past = dim, present =
 * bright, future = dark), echoing a signal propagating along a bus.
 */

const ACCENT = "#a78bfa";
const PAST = "#5a6480";
const FUTURE = "#1c2333";

const MILESTONES = [
  { x: -18, label: "2023" },
  { x: -13.5, label: "2023–24" },
  { x: -9, label: "2024" },
  { x: -4.5, label: "Oct 2025" },
  { x: 0, label: "2025" },
  { x: 4.5, label: "2025–26" },
  { x: 9, label: "2026" },
  { x: 13.5, label: "2027" },
  { x: 18, label: "Base" },
];

/** One milestone: a vertical tick + sphere that lights up when active. */
function MilestoneNode({ x, index }: { x: number; index: number }) {
  const sphereRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    const sphere = sphereRef.current;
    const mat = matRef.current;
    if (!sphere || !mat) return;
    const { index: active } = activeStage("journey", MILESTONES.length);
    const t = state.clock.elapsedTime;

    let intensity = 0.08;
    let color = FUTURE;
    if (index < active) {
      intensity = 0.35;
      color = PAST;
    } else if (index === active) {
      // Active node pulses.
      intensity = 0.9 + 0.5 * Math.sin(t * 3);
      color = ACCENT;
    }
    mat.emissive.set(color);
    mat.emissiveIntensity = intensity;
    const s = index === active ? 1 + 0.12 * Math.sin(t * 3) : 1;
    sphere.scale.setScalar(s);
  });

  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 2.4, 8]} />
        <meshStandardMaterial color="#2a3348" roughness={0.5} metalness={0.5} />
      </mesh>
      <mesh ref={sphereRef} position={[0, 2.55, 0]}>
        <sphereGeometry args={[0.55, 20, 16]} />
        <meshStandardMaterial
          ref={matRef}
          color="#0a0c10"
          emissive={FUTURE}
          emissiveIntensity={0.08}
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>
    </group>
  );
}

export default function JourneyScene() {
  const sceneDef = SCENES.find((s) => s.key === "journey");
  const rootRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const root = rootRef.current;
    if (!root) return;
    const t = state.clock.elapsedTime;
    root.position.y = Math.sin(t * 0.4) * 0.12;
  });

  if (!sceneDef) return null;

  const pathPoints: [number, number, number][] = MILESTONES.map((m) => [m.x, 0.06, 0]);

  return (
    <group position={sceneDef.worldCenter}>
      <LazyLoadScene sceneKey="journey">
        <group ref={rootRef}>
          {/* The signal path. */}
          <Line points={pathPoints} color={ACCENT} lineWidth={1.2} transparent opacity={0.55} />
          <Line
            points={[[-18, 0.06, 0], [18, 0.06, 0]]}
            color="#2a3348"
            lineWidth={0.8}
            transparent
            opacity={0.5}
          />

          {/* Milestones. */}
          {MILESTONES.map((m, i) => (
            <MilestoneNode key={m.x} x={m.x} index={i} />
          ))}
        </group>
      </LazyLoadScene>
    </group>
  );
}
