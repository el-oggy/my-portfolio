"use client";

import { useState } from "react";
import { SceneProvider } from "@/context/SceneContext";
import Experience from "@/components/canvas/Experience";
import NavigationUI from "@/components/ui/NavigationUI";
import Preloader from "@/components/dom/Preloader";

export default function ExperienceRoot({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <SceneProvider>
      {/* 3D WebGL World */}
      <Experience />

      {/* Minimalistic Navigation & Audio Overlay */}
      {isLoaded && <NavigationUI />}

      {/* Authentic Hand-Drawn Sketch Preloader */}
      <Preloader onComplete={() => setIsLoaded(true)} />

      {/* Screen-reader Accessible Skeleton */}
      <div className="sr-only">{children}</div>
    </SceneProvider>
  );
}
