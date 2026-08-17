"use client";

import { useCapability } from "@/hooks/useCapability";
import { SceneProvider } from "@/context/SceneContext";
import Experience from "@/components/canvas/Experience";
import HUDOverlay from "@/components/ui/HUDOverlay";
import RoomOverlay from "@/components/ui/RoomOverlay";

export default function ExperienceRoot({
  children,
}: {
  children?: React.ReactNode;
}) {
  const cap = useCapability();
  const show3D = true;

  return (
    <SceneProvider>
      {/* 3D Immersive Universe */}
      {show3D && <Experience reducedParallax={cap.tier === "reduced"} />}

      {/* Corridor HUD (Top Bar & Interaction Prompts) */}
      <HUDOverlay />

      {/* Room Deep-Dive Showcases (Activated on Door Enter) */}
      <RoomOverlay />

      {/* Screen-reader Accessible Content */}
      <div className="sr-only">
        {children}
      </div>
    </SceneProvider>
  );
}
