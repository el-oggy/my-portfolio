"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

import { SCENES } from "@/lib/sceneConfig";
import { sceneLocalProgress } from "@/lib/stage";
import { getScroll } from "@/lib/scrollStore";
import { clamp01 } from "@/lib/sceneConfig";
import { LazyLoadScene } from "./lazyScene";

/**
 * DroneScene — robotics hero (§B.4 re-theme).
 *
 * The hero build: a stylized STM32 hexacopter. Six arms with counter-rotating
 * rotors, an IMU on board, and telemetry arcs around the frame. The drone
 * flies in as the camera approaches, hovers with pointer tilt, and slowly
 * yaws — a live system, not a static model.
 */

const DRONE_BLUE = "#3b82f6";
const CYAN = "#67e8f9";
const BODY = "#10141d";

const ARM_ANGLES = [0, 60, 120, 180, 240, 300];

function Rotor({ angle, spin, y }: { angle: number; spin: number; y: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const rad = (angle * Math.PI) / 180;
  const x = Math.sin(rad) * 6.4;
  const z = Math.cos(rad) * 6.4;

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * spin;
  });

  return (
    <mesh ref={ref} position={[x, y, z]}>
      <cylinderGeometry args={[2.9, 2.9, 0.06, 28]} />
      <meshStandardMaterial
        color="#cfe0f5"
        emissive={DRONE_BLUE}
        emissiveIntensity={0.18}
        transparent
        opacity={0.4}
        roughness={0.5}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default function DroneScene() {
  const sceneDef = SCENES.find((s) => s.key === "drone");
  const rootRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const arcRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const root = rootRef.current;
    if (!root) return;
    const t = state.clock.elapsedTime;
    const p = sceneLocalProgress("drone");
    const s = getScroll();

    // Fly-in: rise + scale up during the first 15% of the scene.
    const entrance = clamp01((p - 0.02) / 0.15);
    const hover = Math.sin(t * 0.8) * 0.35;
    root.position.y = -5 * (1 - entrance) + hover;
    root.position.x = Math.sin(t * 0.2) * 0.4;
    root.scale.setScalar(0.72 + 0.28 * entrance);
    root.rotation.y = t * 0.12 + p * 1.6;

    // Pointer tilt — reads the non-reactive store directly.
    root.rotation.z = s.pointerX * 0.06;
    root.rotation.x = -s.pointerY * 0.05;

    // Telemetry arcs drift slowly around the frame.
    if (arcRef.current) {
      arcRef.current.rotation.y += delta * 0.6;
      arcRef.current.rotation.x = 0.4 + Math.sin(t * 0.5) * 0.06;
    }
  });

  if (!sceneDef) return null;

  return (
    <group position={sceneDef.worldCenter}>
      <LazyLoadScene sceneKey="drone">
        <group ref={rootRef}>
          {/* Body */}
          <group ref={bodyRef}>
            <mesh position={[0, 0.7, 0]}>
              <cylinderGeometry args={[2.1, 2.1, 1.0, 28]} />
              <meshStandardMaterial
                color={BODY}
                emissive={DRONE_BLUE}
                emissiveIntensity={0.12}
                roughness={0.4}
                metalness={0.5}
              />
            </mesh>
            {/* Dome canopy. */}
            <mesh position={[0, 1.42, 0]}>
              <sphereGeometry args={[1.5, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial
                color="#141b29"
                emissive={CYAN}
                emissiveIntensity={0.1}
                roughness={0.3}
                metalness={0.6}
              />
            </mesh>
            {/* Camera gimbal. */}
            <mesh position={[0, 0.1, 0.6]}>
              <sphereGeometry args={[0.45, 16, 12]} />
              <meshStandardMaterial color="#0a0d14" roughness={0.3} metalness={0.7} />
            </mesh>
            {/* IMU die marker. */}
            <mesh position={[0.9, 1.25, 0.7]} rotation-y={0.6}>
              <boxGeometry args={[0.8, 0.08, 0.8]} />
              <meshStandardMaterial color="#0a0c10" emissive={DRONE_BLUE} emissiveIntensity={0.9} />
            </mesh>
          </group>

          {/* Arms */}
          {ARM_ANGLES.map((a) => {
            const rad = (a * Math.PI) / 180;
            return (
              <mesh
                key={`arm-${a}`}
                position={[Math.sin(rad) * 3.2, 0.72, Math.cos(rad) * 3.2]}
                rotation-y={a * (Math.PI / 180)}
              >
                <boxGeometry args={[0.3, 0.14, 7.2]} />
                <meshStandardMaterial color="#141a26" roughness={0.5} metalness={0.4} />
              </mesh>
            );
          })}

          {/* Motors + rotors */}
          {ARM_ANGLES.map((a) => {
            const rad = (a * Math.PI) / 180;
            const x = Math.sin(rad) * 6.4;
            const z = Math.cos(rad) * 6.4;
            return (
              <group key={`motor-${a}`} position={[x, 0.9, z]}>
                <mesh>
                  <cylinderGeometry args={[0.5, 0.5, 0.42, 16]} />
                  <meshStandardMaterial color="#0d1119" roughness={0.4} metalness={0.7} />
                </mesh>
                {/* Motor glow ring */}
                <mesh position={[0, 0.24, 0]} rotation-x={Math.PI / 2}>
                  <torusGeometry args={[0.42, 0.05, 8, 24]} />
                  <meshStandardMaterial color="#0a0c10" emissive={CYAN} emissiveIntensity={1} />
                </mesh>
              </group>
            );
          })}
          {ARM_ANGLES.map((a, i) => (
            <Rotor key={`rotor-${a}`} angle={a} spin={i % 2 === 0 ? 22 : -22} y={1.16} />
          ))}

          {/* Landing gear */}
          {[-1.4, 1.4].map((x) => (
            <mesh key={`leg-${x}`} position={[x, 0.14, 0]}>
              <cylinderGeometry args={[0.09, 0.09, 0.3, 8]} />
              <meshStandardMaterial color="#0d1119" roughness={0.5} metalness={0.5} />
            </mesh>
          ))}

          {/* Telemetry arcs */}
          <group ref={arcRef}>
            <mesh rotation-x={Math.PI / 2}>
              <torusGeometry args={[4.6, 0.035, 8, 64, Math.PI * 1.4]} />
              <meshStandardMaterial color="#0a0c10" emissive={CYAN} emissiveIntensity={1.2} />
            </mesh>
            <mesh rotation-x={Math.PI / 2} rotation-z={Math.PI}>
              <torusGeometry args={[5.3, 0.03, 8, 64, Math.PI]} />
              <meshStandardMaterial color="#0a0c10" emissive={DRONE_BLUE} emissiveIntensity={1} />
            </mesh>
          </group>
        </group>
      </LazyLoadScene>
    </group>
  );
}
