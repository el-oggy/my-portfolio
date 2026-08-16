"use client";

import { Line, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { SCENES } from "@/lib/sceneConfig";
import { sceneLocalProgress } from "@/lib/stage";
import { LazyLoadScene } from "./lazyScene";

/**
 * SystolicArrayScene — RTL · Systolic Array (2D mesh for matrix multiply).
 *
 * A physical, animated 2D systolic array computing C = A x B in INT8:
 *   - Matrix A streams DOWNWARD from the top, one element per row per cycle.
 *   - Matrix B streams RIGHTWARD from the left, one element per column per cycle.
 *   - PE[i,j] activates at cycle (i + j) — the classic skew/stagger wavefront.
 *   - The full computation completes in (3N - 1) cycles (load + compute + drain).
 *   - Each PE runs the IDLE -> LOAD -> COMPUTE -> DONE FSM.
 *
 * Architecture contract (§10/§50): read-only scroll sources, no own camera or
 * ScrollTrigger, memoized static geometry, frame-rate-independent damping, and
 * no per-frame setState / new Vector3 allocations in useFrame.
 */

const N = 8; // 8x8 INT8 array — large enough to read as a grid, light on GPU.
const CYCLES = 3 * N - 1; // total cycles for the full C = A x B pass.

const ORANGE = "#f97316"; // matches --accent-rtl (globals.css).
const CYAN = "#22d3ee";
const GREEN = "#34d399";
const AMBER = "#fbbf24";
const BASE = "#0a0c10";
const GRID_BG = "#07090d";

const CELL = 1.6; // PE pitch.
const HALF = ((N - 1) * CELL) / 2; // grid half-extent for centering.

const FSMS: ("IDLE" | "LOAD" | "COMPUTE" | "DONE")[] = [
  "IDLE",
  "LOAD",
  "COMPUTE",
  "DONE",
];

/** PE state derived purely from cycle and coordinates — no per-frame allocations. */
function peFsm(i: number, j: number, cycle: number) {
  // Activation cycle = i + j (skew/stagger wavefront).
  const start = i + j;
  const computeStart = start + N; // after N load cycles for this PE
  if (cycle < start) return 0; // IDLE
  if (cycle < computeStart) return 1; // LOAD
  if (cycle < computeStart + 1) return 2; // COMPUTE (one cycle accumulate)
  return 3; // DONE
}

/** One Processing Element: a tile whose emissive color encodes its FSM state. */
const ProcessingElement = ({
  i,
  j,
  matRef,
}: {
  i: number;
  j: number;
  matRef: React.RefObject<THREE.MeshStandardMaterial>;
}) => {
  const x = -HALF + j * CELL;
  const z = -HALF + i * CELL;
  return (
    <group position={[x, 0, z]}>
      <mesh>
        <boxGeometry args={[CELL * 0.82, 0.5, CELL * 0.82]} />
        <meshStandardMaterial
          ref={matRef}
          color={BASE}
          emissive={GRID_BG}
          emissiveIntensity={0.0}
          roughness={0.55}
          metalness={0.35}
        />
      </mesh>
      {/* Inner core — the MAC unit. */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[CELL * 0.4, 0.18, CELL * 0.4]} />
        <meshStandardMaterial
          color={BASE}
          emissive={ORANGE}
          emissiveIntensity={0.18}
          roughness={0.5}
        />
      </mesh>
    </group>
  );
};

export default function SystolicArrayScene() {
  const sceneDef = SCENES.find((s) => s.key === "rtl");
  const rootRef = useRef<THREE.Group>(null);

  // Stable refs into every PE material — mutated in place in useFrame (no setState).
  const peMats = useMemo(
    () =>
      Array.from({ length: N * N }, () =>
        ({ current: null }) as React.RefObject<THREE.MeshStandardMaterial>,
      ),
    [],
  );

  // A-matrix stream tokens (downward) and B-matrix stream tokens (rightward).
  // Memoized so the scene graph never reallocates.
  const aTokens = useMemo(
    () =>
      Array.from({ length: N }, (_, r) => ({
        downRef: { current: null as THREE.Mesh | null },
      })),
    [],
  );
  const bTokens = useMemo(
    () =>
      Array.from({ length: N }, (_, c) => ({
        rightRef: { current: null as THREE.Mesh | null },
      })),
    [],
  );

  // Plinth + accent frame.
  const platform = useMemo(
    () => (
      <mesh position={[0, -0.4, 0]} receiveShadow>
        <boxGeometry args={[N * CELL + 3.2, 0.4, N * CELL + 3.2]} />
        <meshStandardMaterial
          color="#0b0e14"
          roughness={0.7}
          metalness={0.25}
        />
      </mesh>
    ),
    [],
  );

  useFrame((state, delta) => {
    const root = rootRef.current;
    if (!root) return;

    // Frame-rate-independent time + scene-local scroll stage (read-only).
    const t = state.clock.elapsedTime;
    const lp = sceneLocalProgress("rtl");

    // Gentle ambient drift — same idiom as EmbeddedScene/FirmwareScene.
    // Damped by delta so motion is frame-rate-independent.
    const drift = Math.sin(t * 0.5) * 0.14;
    root.position.y += (drift - root.position.y) * Math.min(1, delta * 3.0);
    root.rotation.y = lp * 0.4 + Math.sin(t * 0.1) * 0.02;

    // Run the array: one full C=AxB pass every ~CYCLES*0.35s, auto-restarting.
    const speed = 0.35;
    const cycleF = (t / speed) % CYCLES;
    const cycle = Math.floor(cycleF);

    // Update each PE's emissive from its current FSM state — no allocations.
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const ref = peMats[i * N + j];
        const m = ref.current;
        if (!m) continue;
        const s = peFsm(i, j, cycle);
        // color + intensity by FSM state
        const color = s === 2 ? ORANGE : s === 1 ? CYAN : s === 3 ? GREEN : GRID_BG;
        const intensity = s === 2 ? 1.6 : s === 1 ? 0.9 : s === 3 ? 0.5 : 0.04;
        m.emissive.set(color);
        m.emissiveIntensity = intensity;
      }
    }

    // A streams DOWNWARD across rows: token for row r visible in cycle [r, r+N).
    // Vertical position interpolates from top edge into the grid across the window.
    const topEdgeZ = -HALF - CELL * 1.2;
    for (let r = 0; r < N; r++) {
      const tok = aTokens[r].downRef.current;
      if (!tok) continue;
      const startCycle = r;
      const endCycle = r + N;
      if (cycle < startCycle || cycle >= endCycle) {
        tok.visible = false;
        continue;
      }
      tok.visible = true;
      const localF = (cycleF - startCycle) / N; // 0..1 across its window
      const x = -HALF + r * CELL; // A[r,*] enters along row r's column lane
      const z = topEdgeZ + localF * (CELL * N);
      tok.position.set(x, 0.35, z);
    }

    // B streams RIGHTWARD across columns: token for col c visible in cycle [c, c+N).
    // Horizontal position interpolates from left edge into the grid.
    const leftEdgeX = -HALF - CELL * 1.2;
    for (let c = 0; c < N; c++) {
      const tok = bTokens[c].rightRef.current;
      if (!tok) continue;
      const startCycle = c;
      const endCycle = c + N;
      if (cycle < startCycle || cycle >= endCycle) {
        tok.visible = false;
        continue;
      }
      tok.visible = true;
      const localF = (cycleF - startCycle) / N;
      const z = -HALF + c * CELL; // B[*,c] enters along column c's row lane
      const x = leftEdgeX + localF * (CELL * N);
      tok.position.set(x, 0.35, z);
    }
  });

  if (!sceneDef) return null;

  return (
    <group position={sceneDef.worldCenter}>
      <LazyLoadScene sceneKey="rtl">
        <group ref={rootRef}>
          {/* Plinth. */}
          {platform}

          {/* Grid of PEs — i indexes rows (Z), j indexes columns (X). */}
          {Array.from({ length: N }, (_, i) =>
            Array.from({ length: N }, (_, j) => (
              <ProcessingElement
                key={`pe-${i}-${j}`}
                i={i}
                j={j}
                matRef={peMats[i * N + j]}
              />
            )),
          )}

          {/* A-matrix tokens — downward stream (one per row lane). */}
          {aTokens.map((tok, r) => {
            const x = -HALF + r * CELL;
            return (
              <mesh
                key={`a-${r}`}
                ref={(m) => {
                  tok.downRef.current = m;
                }}
                position={[x, 0.35, -HALF - CELL * 1.2]}
              >
                <boxGeometry args={[CELL * 0.42, 0.22, CELL * 0.42]} />
                <meshStandardMaterial
                  color={BASE}
                  emissive={CYAN}
                  emissiveIntensity={1.1}
                />
              </mesh>
            );
          })}

          {/* B-matrix tokens — rightward stream (one per column lane). */}
          {bTokens.map((tok, c) => {
            const z = -HALF + c * CELL;
            return (
              <mesh
                key={`b-${c}`}
                ref={(m) => {
                  tok.rightRef.current = m;
                }}
                position={[-HALF - CELL * 1.2, 0.35, z]}
              >
                <boxGeometry args={[CELL * 0.42, 0.22, CELL * 0.42]} />
                <meshStandardMaterial
                  color={BASE}
                  emissive={AMBER}
                  emissiveIntensity={1.1}
                />
              </mesh>
            );
          })}

          {/* Stream direction indicators */}
          {/* A downward arrows on the left margin */}
          {Array.from({ length: N }, (_, r) => {
            const x = -HALF + r * CELL;
            return (
              <Line
                key={`a-arrow-${r}`}
                points={[
                  [x, 0.35, -HALF - CELL * 2.0],
                  [x, 0.35, -HALF - CELL * 1.4],
                ]}
                color={CYAN}
                lineWidth={1.2}
                transparent
                opacity={0.6}
              />
            );
          })}
          {/* B rightward arrows on the top margin */}
          {Array.from({ length: N }, (_, c) => {
            const z = -HALF + c * CELL;
            return (
              <Line
                key={`b-arrow-${c}`}
                points={[
                  [-HALF - CELL * 2.0, 0.35, z],
                  [-HALF - CELL * 1.4, 0.35, z],
                ]}
                color={AMBER}
                lineWidth={1.2}
                transparent
                opacity={0.6}
              />
            );
          })}

          {/* Labels — accurate, honest. */}
          <Text
            position={[0, 4.4, 0]}
            fontSize={0.62}
            color={ORANGE}
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.12}
          >
            {`C = A x B   (INT8, N=${N}, 3N-1=${CYCLES} cycles)`}
          </Text>
          <Text
            position={[-HALF - CELL * 1.2, 0.35, -HALF - CELL * 0.4]}
            rotation={[0, 0, Math.PI / 2]}
            fontSize={0.32}
            color={CYAN}
            anchorX="center"
            anchorY="middle"
          >
            A ↓
          </Text>
          <Text
            position={[-HALF - CELL * 0.4, 0.35, -HALF - CELL * 1.2]}
            rotation={[0, 0, 0]}
            fontSize={0.32}
            color={AMBER}
            anchorX="center"
            anchorY="middle"
          >
            B →
          </Text>

          {/* FSM legend — the four PE states. */}
          {FSMS.map((label, k) => {
            const lx = -HALF + k * CELL * 1.6;
            const color =
              label === "COMPUTE"
                ? ORANGE
                : label === "LOAD"
                ? CYAN
                : label === "DONE"
                ? GREEN
                : "#3a4252";
            return (
              <group key={`fsm-${k}`} position={[lx, 4.0, HALF + CELL * 1.4]}>
                <mesh>
                  <boxGeometry args={[0.3, 0.3, 0.3]} />
                  <meshStandardMaterial
                    color={BASE}
                    emissive={color}
                    emissiveIntensity={1.2}
                  />
                </mesh>
                <Text
                  position={[0, -0.55, 0]}
                  fontSize={0.26}
                  color="#9aa7bb"
                  anchorX="center"
                  anchorY="middle"
                >
                  {label}
                </Text>
              </group>
            );
          })}

          {/* Honest scope note: matmul is what the RTL computes. */}
          <Text
            position={[0, -1.2, HALF + CELL * 1.9]}
            fontSize={0.26}
            color="#5f6b7e"
            anchorX="center"
            anchorY="middle"
            maxWidth={N * CELL}
          >
            RTL computes matrix multiplication. Convolution / DSP / MIMO are related areas sharing this architecture.
          </Text>
        </group>
      </LazyLoadScene>
    </group>
  );
}
