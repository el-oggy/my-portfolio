"use client";

import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

import { SCENES } from "@/lib/sceneConfig";
import { sceneLocalProgress } from "@/lib/stage";
import { LazyLoadScene } from "./lazyScene";

/**
 * IoTScene — sensors & wireless (§B.5 re-theme).
 *
 * An ESP32 node broadcasting to the world: radio ripples, sensor pucks
 * (BME280 / BH1750 / DS18B20), a home-automation house, and a solar-powered
 * weather station — all wired back to the central node.
 */

const AMBER = "#fbbf24";
const CYAN = "#22d3ee";
const BLUE = "#3b82f6";
const GREEN = "#34d399";

/** Sensor puck: a cylinder with an emissive die on top. */
function Puck({
  position,
  die,
  size = 1.3,
}: {
  position: [number, number, number];
  die: string;
  size?: number;
}) {
  return (
    <group position={position}>
      <mesh position={[0, size * 0.35, 0]}>
        <cylinderGeometry args={[size, size * 0.9, size * 0.65, 24]} />
        <meshStandardMaterial color="#0e141d" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0, size * 0.78, 0]}>
        <boxGeometry args={[size * 0.55, 0.1, size * 0.55]} />
        <meshStandardMaterial color="#0a0c10" emissive={die} emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

/** Expanding, fading radio ripple on the ground. */
function Ripple({
  phase,
  color,
  speed = 0.5,
}: {
  phase: number;
  color: string;
  speed?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    const m = ref.current;
    const mat = matRef.current;
    if (!m || !mat) return;
    const t = state.clock.elapsedTime * speed + phase;
    const f = t % 1;
    const s = 1 + f * 9;
    m.scale.set(s, s, s);
    mat.opacity = (1 - f) * 0.5;
  });

  return (
    <mesh ref={ref} rotation-x={-Math.PI / 2} position={[0, 0.08, 0]}>
      <ringGeometry args={[0.9, 1.0, 48]} />
      <meshBasicMaterial
        ref={matRef}
        color={color}
        transparent
        opacity={0.4}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function IoTScene() {
  const sceneDef = SCENES.find((s) => s.key === "iot");
  const rootRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const root = rootRef.current;
    if (!root) return;
    const t = state.clock.elapsedTime;
    const p = sceneLocalProgress("iot");
    root.position.y = Math.sin(t * 0.55) * 0.18;
    root.rotation.y = p * 0.4 + Math.sin(t * 0.09) * 0.02;
  });

  if (!sceneDef) return null;

  return (
    <group position={sceneDef.worldCenter}>
      <LazyLoadScene sceneKey="iot">
        <group ref={rootRef}>
          {/* Central ESP32 node board. */}
          <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
            <planeGeometry args={[7, 7]} />
            <meshStandardMaterial color="#0b1018" roughness={0.7} metalness={0.3} />
          </mesh>
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[2.4, 0.8, 2.4]} />
            <meshStandardMaterial
              color="#0a0c10"
              emissive={AMBER}
              emissiveIntensity={0.5}
              roughness={0.3}
            />
          </mesh>
          {/* Antenna. */}
          <Line points={[[0, 1.1, 0], [0, 3.2, 0]]} color={AMBER} lineWidth={1.2} />

          {/* Radio ripples. */}
          <Ripple phase={0} color={AMBER} speed={0.55} />
          <Ripple phase={0.5} color={AMBER} speed={0.55} />

          {/* Sensor pucks. */}
          <Puck position={[-7.5, 0, -3]} die={AMBER} />   {/* BME280 — temp/humidity */}
          <Puck position={[-2.5, 0, 4.5]} die={CYAN} />   {/* BH1750 — light */}
          <Puck position={[6.5, 0, -4]} die={BLUE} />     {/* DS18B20 — soil temp */}

          {/* Home-automation house. */}
          <group position={[9.5, 0, 5.5]}>
            <mesh position={[0, 1.5, 0]}>
              <boxGeometry args={[4.5, 3, 4.5]} />
              <meshStandardMaterial color="#12161f" roughness={0.7} />
            </mesh>
            <mesh position={[0, 3.4, 0]} rotation-y={Math.PI / 4}>
              <coneGeometry args={[3.5, 1.7, 4]} />
              <meshStandardMaterial color="#0e141d" emissive={AMBER} emissiveIntensity={0.08} />
            </mesh>
            {/* Glowing window. */}
            <mesh position={[0, 2.2, 2.26]}>
              <planeGeometry args={[1.3, 1.3]} />
              <meshStandardMaterial color="#0a0c10" emissive={AMBER} emissiveIntensity={1.1} />
            </mesh>
          </group>

          {/* Solar weather station. */}
          <group position={[-10.5, 0, 7]}>
            <mesh position={[0, 2.6, 0]}>
              <cylinderGeometry args={[0.14, 0.2, 5.2, 10]} />
              <meshStandardMaterial color="#12161f" roughness={0.6} metalness={0.4} />
            </mesh>
            <mesh position={[0, 4.9, 0.4]} rotation-x={-0.55}>
              <planeGeometry args={[2.6, 1.5]} />
              <meshStandardMaterial color="#0b1220" emissive={CYAN} emissiveIntensity={0.35} roughness={0.4} />
            </mesh>
            <Puck position={[0, 4.35, 0]} die={GREEN} size={0.7} />
          </group>

          {/* Wires back to the node. */}
          <Line points={[[1.2, 0.9, 0.8], [-6.3, 0.9, -2.2]]} color={AMBER} lineWidth={1} transparent opacity={0.6} />
          <Line points={[[1.2, 0.9, -0.8], [-1.8, 0.9, 3.6]]} color={CYAN} lineWidth={1} transparent opacity={0.6} />
          <Line points={[[-1.2, 0.9, 0.5], [7.2, 0.9, 4.6]]} color={AMBER} lineWidth={1} transparent opacity={0.6} />
        </group>
      </LazyLoadScene>
    </group>
  );
}
