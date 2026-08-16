"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

import { SCENES } from "@/lib/sceneConfig";
import { sceneLocalProgress } from "@/lib/stage";
import { LazyLoadScene } from "./lazyScene";

/**
 * ContactScene — the final endpoint (§B.8 re-theme).
 *
 * A single calm beacon: a pulsing signal node with slowly expanding rings and
 * two small satellites in orbit — "the signal is live, reach it."
 */

const CYAN = "#67e8f9";

function Ring({ phase, maxR = 8 }: { phase: number; maxR?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    const m = ref.current;
    const mat = matRef.current;
    if (!m || !mat) return;
    const t = state.clock.elapsedTime * 0.32 + phase;
    const f = t % 1;
    m.scale.setScalar(1 + f * (maxR - 1));
    mat.opacity = (1 - f) * 0.4;
  });

  return (
    <mesh ref={ref} rotation-x={-Math.PI / 2} position={[0, 0.1, 0]}>
      <ringGeometry args={[0.9, 1.0, 48]} />
      <meshBasicMaterial
        ref={matRef}
        color={CYAN}
        transparent
        opacity={0.35}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/** Small satellite orbiting the beacon. */
function Satellite({
  radius,
  speed,
  phase,
}: {
  radius: number;
  speed: number;
  phase: number;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const a = state.clock.elapsedTime * speed + phase;
    g.position.set(Math.sin(a) * radius, Math.cos(a) * radius * 0.35, Math.cos(a) * radius);
  });

  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[0.45, 0.45, 0.45]} />
        <meshStandardMaterial color="#0a0c10" emissive={CYAN} emissiveIntensity={1} />
      </mesh>
    </group>
  );
}

export default function ContactScene() {
  const sceneDef = SCENES.find((s) => s.key === "contact");
  const rootRef = useRef<THREE.Group>(null);
  const beaconRef = useRef<THREE.Mesh>(null);
  const beaconMatRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    const root = rootRef.current;
    if (!root) return;
    const t = state.clock.elapsedTime;
    const p = sceneLocalProgress("contact");

    // Beacon pulse.
    if (beaconRef.current && beaconMatRef.current) {
      const pulse = 0.7 + 0.5 * Math.sin(t * 2.1);
      beaconMatRef.current.emissiveIntensity = pulse;
      beaconRef.current.scale.setScalar(1 + 0.06 * Math.sin(t * 2.1));
    }

    root.position.y = Math.sin(t * 0.5) * 0.15;
    root.rotation.y = p * 0.3 + t * 0.03;
  });

  if (!sceneDef) return null;

  return (
    <group position={sceneDef.worldCenter}>
      <LazyLoadScene sceneKey="contact">
        <group ref={rootRef}>
          {/* Ground disc. */}
          <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
            <circleGeometry args={[3.4, 40]} />
            <meshStandardMaterial
              color="#0a0f16"
              emissive={CYAN}
              emissiveIntensity={0.06}
              roughness={0.5}
              metalness={0.4}
            />
          </mesh>

          {/* Beacon. */}
          <mesh ref={beaconRef} position={[0, 1.2, 0]}>
            <sphereGeometry args={[1.05, 28, 20]} />
            <meshStandardMaterial
              ref={beaconMatRef}
              color="#0a0c10"
              emissive={CYAN}
              emissiveIntensity={0.9}
              roughness={0.3}
              metalness={0.5}
            />
          </mesh>

          {/* Expanding rings. */}
          <Ring phase={0} />
          <Ring phase={0.45} maxR={7} />
          <Ring phase={0.8} maxR={5.5} />

          {/* Satellites. */}
          <Satellite radius={5.5} speed={0.5} phase={0} />
          <Satellite radius={4.6} speed={-0.4} phase={2.1} />
        </group>
      </LazyLoadScene>
    </group>
  );
}
