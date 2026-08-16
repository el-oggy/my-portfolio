"use client";

import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, AdaptiveEvents, Preload } from "@react-three/drei";
import { Suspense } from "react";

import CameraController from "./CameraController";
import PlaceholderWorld from "./PlaceholderWorld";

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
        // Ensure the page background (graphite) shows through where the scene
        // is transparent — we composite DOM UI on top via z-order.
      }}
      dpr={[1, reducedParallax ? 1.5 : 2]}
      camera={{ fov: 50, near: 0.1, far: 1200, position: [0, 14, 34] }}
      // Maintain crispness on retina without crushing low-end devices.
      performance={{
        min: 0.35, // R3F auto-scales detail (instancing/shadow) below this fps.
      }}
    >
      {/* Subtle fog so distant geometry fades into the graphite bg. */}
      <fog attach="fog" args={["#06070A", 120, 520]} />
      <color attach="background" args={["#06070A"]} />

      <Suspense fallback={null}>
        <CameraController parallax={reducedParallax ? 0.35 : 1} />
        <PlaceholderWorld />
        <Preload all />
      </Suspense>

      {/* Auto-tier degradation: drop DPR + collapse event batching on jank. */}
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
    </Canvas>
  );
}
