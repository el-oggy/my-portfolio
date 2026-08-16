"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { SCENES } from "@/lib/sceneConfig";
import { sceneLocalProgress } from "@/lib/stage";

/**
 * PCBScene — the Circuit Hub (§B.2 re-theme).
 *
 * The central navigation world of the portfolio: a stylized printed circuit
 * board with a central MCU, conductive traces radiating to glowing pads, and
 * scattered vias. Slow scroll-driven rotation + gentle hover read as the hub
 * "powering up" as the visitor travels through it.
 */

const PCB_GREEN = "#0c1f17";
const TRACE_GREEN = "#34d399";
const PAD_CYAN = "#67e8f9";
const PAD_AMBER = "#fbbf24";

const TRACE_ANGLES = [0, 36, 72, 108, 144, 180, 216, 252, 288, 324];

/** A flat conductive trace ribbon lying flat on the board (Y-up world). */
function Trace({
  angle,
  fromR,
  toR,
}: {
  angle: number;
  fromR: number;
  toR: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    const rad = (angle * Math.PI) / 180;
    const a = new THREE.Vector3(Math.sin(rad) * fromR, 0.05, Math.cos(rad) * fromR);
    const b = new THREE.Vector3(Math.sin(rad) * toR, 0.05, Math.cos(rad) * toR);
    m.position.copy(a.clone().add(b).multiplyScalar(0.5));
    m.scale.set(1, a.distanceTo(b), 1);
    m.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      b.clone().sub(a).normalize(),
    );
  }, [angle, fromR, toR]);

  return (
    <mesh ref={ref}>
      <boxGeometry args={[0.16, 1, 0.05]} />
      <meshStandardMaterial
        color="#0d2018"
        emissive={TRACE_GREEN}
        emissiveIntensity={0.7}
        roughness={0.35}
        metalness={0.3}
      />
    </mesh>
  );
}

function Pad({ x, z, color }: { x: number; z: number; color: string }) {
  return (
    <mesh position={[x, 0.09, z]}>
      <cylinderGeometry args={[0.55, 0.55, 0.12, 20]} />
      <meshStandardMaterial
        color="#0b1a12"
        emissive={color}
        emissiveIntensity={0.9}
        roughness={0.3}
        metalness={0.5}
      />
    </mesh>
  );
}

export default function PCBScene() {
  const hub = SCENES.find((s) => s.key === "pcb");
  const rootRef = useRef<THREE.Group>(null);

  const pads = useMemo(
    () =>
      TRACE_ANGLES.map((a) => {
        const rad = (a * Math.PI) / 180;
        const r = 16.5 + (a % 3) * 1.6;
        return {
          x: Math.sin(rad) * r,
          z: Math.cos(rad) * r,
          color: a % 2 === 0 ? PAD_CYAN : PAD_AMBER,
        };
      }),
    [],
  );

  // Scattered dark vias — static grounding detail.
  const vias = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const rad = ((i * 137.5) % 360) * (Math.PI / 180); // golden-angle scatter
        const r = 7 + ((i * 53) % 80) / 8;
        return { x: Math.sin(rad) * r, z: Math.cos(rad) * r };
      }),
    [],
  );

  useFrame((state) => {
    const root = rootRef.current;
    if (!root) return;
    const t = state.clock.elapsedTime;
    const p = sceneLocalProgress("pcb");
    root.position.y = Math.sin(t * 0.6) * 0.25;
    root.rotation.y = p * 0.7 + Math.sin(t * 0.12) * 0.03;
  });

  if (!hub) return null;

  return (
    <group position={hub.worldCenter}>
      <group ref={rootRef}>
        {/* Board — two nested planes for a slight edge. */}
        <mesh rotation-x={-Math.PI / 2}>
          <planeGeometry args={[46, 46]} />
          <meshStandardMaterial color={PCB_GREEN} roughness={0.85} metalness={0.1} />
        </mesh>
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]}>
          <planeGeometry args={[41, 41]} />
          <meshStandardMaterial color="#081410" roughness={0.9} />
        </mesh>

        {/* Traces + end pads. */}
        {TRACE_ANGLES.map((a) => (
          <Trace key={`trace-${a}`} angle={a} fromR={4.2} toR={17 + (a % 3) * 1.6} />
        ))}
        {pads.map((p) => (
          <Pad key={`pad-${p.x}-${p.z}`} x={p.x} z={p.z} color={p.color} />
        ))}

        {/* Vias. */}
        {vias.map((v, i) => (
          <mesh key={`via-${i}`} position={[v.x, 0.06, v.z]}>
            <cylinderGeometry args={[0.28, 0.28, 0.1, 12]} />
            <meshStandardMaterial color="#0e1d15" roughness={0.6} metalness={0.5} />
          </mesh>
        ))}

        {/* Central MCU. */}
        <group position={[0, 0.5, 0]}>
          <mesh>
            <boxGeometry args={[5, 0.9, 5]} />
            <meshStandardMaterial
              color="#0b1220"
              emissive={TRACE_GREEN}
              emissiveIntensity={0.16}
              roughness={0.3}
              metalness={0.4}
            />
          </mesh>
          <mesh position={[0, 0.58, 0]}>
            <boxGeometry args={[3, 0.12, 3]} />
            <meshStandardMaterial
              color="#0a0c10"
              emissive="#22d3ee"
              emissiveIntensity={0.55}
              roughness={0.2}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}
