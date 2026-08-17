"use client";

import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, AdaptiveEvents, Preload, View } from "@react-three/drei";
import { Suspense } from "react";

import CameraController from "./CameraController";
import IntroScene from "./scenes/IntroScene";
import HallwayScene from "./scenes/HallwayScene";
import MainLights from "./lights/MainLights";

/**
 * The persistent WebGL host. ONE canvas for the whole experience (§10):
 * the camera walks a continuous path through all scenes positioned in a
 * single world space — scenes crossfade in/out around the camera, nothing
 * remounts. Heavy scene assets lazy-load as the camera approaches (§50).
 *
 * mount === false means the 2D tier took over; this component is not rendered.
 */
export default function Experience({
  reducedParallax = false,
}: {
  reducedParallax?: boolean;
}) {
  return (
    <Canvas
      className="fixed inset-0 -z-10"
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      dpr={[1, reducedParallax ? 1.5 : 2]}
      camera={{ fov: 50, near: 0.1, far: 1200, position: [0, 14, 34] }}
      performance={{
        min: 0.35,
      }}
    >
      <fog attach="fog" args={["#fbf9f5", 120, 520]} />
      <color attach="background" args={["#fbf9f5"]} />

      <Suspense fallback={null}>
        <CameraController parallax={reducedParallax ? 0.35 : 1} />
        <MainLights />

        <HallwayScene />
        <IntroScene />

        <Preload all />
      </Suspense>

      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
      <View.Port />
    </Canvas>
  );
}
