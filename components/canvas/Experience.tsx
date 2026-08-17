"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { AdaptiveDpr, AdaptiveEvents, Preload } from "@react-three/drei";

import { useScene } from "@/context/SceneContext";
import useInfiniteCamera from "@/hooks/useInfiniteCamera";
import EntranceDoors from "./entrance/EntranceDoors";
import InfiniteCorridorManager from "./corridor/InfiniteCorridorManager";

function CameraRig({ reducedParallax = false }: { reducedParallax?: boolean }) {
  const { hasEntered, isInRoom } = useScene();

  useInfiniteCamera({
    scrollSpeed: 0.03,
    parallaxIntensity: reducedParallax ? 0.1 : 0.35,
    smoothing: 0.045,
    scrollEnabled: hasEntered && !isInRoom,
    parallaxEnabled: !isInRoom,
  });

  return null;
}

export default function Experience({
  reducedParallax = false,
}: {
  reducedParallax?: boolean;
}) {
  const { hasEntered, markEntered } = useScene();

  return (
    <Canvas
      className="fixed inset-0 -z-10"
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      dpr={[1, reducedParallax ? 1.5 : 2]}
      camera={{ fov: 50, near: 0.1, far: 500, position: [0, 0.2, 28] }}
    >
      <fog attach="fog" args={["#fbf9f5", 40, 180]} />
      <color attach="background" args={["#fbf9f5"]} />

      <Suspense fallback={null}>
        <CameraRig reducedParallax={reducedParallax} />

        {/* Global Warm Lighting */}
        <ambientLight intensity={1.8} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1.2}
          color="#ffffff"
          castShadow
        />
        <directionalLight position={[-5, 8, -10]} intensity={0.6} color="#ffe8d6" />

        {/* === 1. ENTRANCE STAGE (3D Double Doors) === */}
        {!hasEntered && (
          <EntranceDoors
            position={[0, 0, 22]}
            onComplete={markEntered}
          />
        )}

        {/* === 2. INFINITE CORRIDOR & DOORS === */}
        <InfiniteCorridorManager />

        <Preload all />
      </Suspense>

      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
    </Canvas>
  );
}
