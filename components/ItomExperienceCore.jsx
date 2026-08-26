"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { PerformanceMonitor, Preload } from "@react-three/drei";
import * as THREE from "three";

import Experience from "./itom/src/components/canvas/Experience";
import GlobalOverlay from "./itom/src/components/ui/GlobalOverlay";
import NavigationUI from "./itom/src/components/ui/NavigationUI";
import PaperTransition from "./itom/src/components/dom/PaperTransition";
import Preloader from "./itom/src/components/dom/Preloader";
import ScreenReaderOverlay from "./itom/src/components/ui/ScreenReaderOverlay";
import { AchievementsProvider } from "./itom/src/context/AchievementsContext";
import { AudioProvider, useAudio } from "./itom/src/context/AudioManager";
import { PerformanceProvider, usePerformance } from "./itom/src/context/PerformanceContext";
import { SceneProvider, useScene } from "./itom/src/context/SceneContext";
import { initAudio } from "./itom/src/utils/audioManager";

// Room-specific atmosphere: while inside a room, melt the global paper fog
// into that room's ambience (About = sky blue so clouds read as white).
const ROOM_ATMOSPHERE = {
  about: "#bfe0ff",
};

function RoomAtmosphere() {
  const { currentRoom } = useScene();
  const { scene } = useThree();

  useEffect(() => {
    if (!scene) return;
    const target = ROOM_ATMOSPHERE[currentRoom] || "#fafafa";
    scene.background = new THREE.Color(target);
    if (scene.fog) scene.fog.color.set(target);
  }, [currentRoom, scene]);

  return null;
}

function GlobalAudioEnabler() {
  const { enableAudio } = useAudio();

  useEffect(() => {
    const enable = () => enableAudio();
    window.addEventListener("click", enable, { once: true });
    window.addEventListener("touchstart", enable, { once: true });
    window.addEventListener("keydown", enable, { once: true });

    return () => {
      window.removeEventListener("click", enable);
      window.removeEventListener("touchstart", enable);
      window.removeEventListener("keydown", enable);
    };
  }, [enableAudio]);

  return null;
}

function ItomCanvas({ fallback }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const { settings, downgradeTier, tier } = usePerformance();

  useEffect(() => {
    initAudio();
  }, []);

  const handleSceneReady = useCallback(() => {
    requestAnimationFrame(() => setSceneReady(true));
  }, []);

  return (
    <AudioProvider>
      <SceneProvider>
        <div className="app">
          <div className="canvas-wrapper">
            <Canvas
              camera={{ position: [0, 0.2, 28], fov: 60, near: 0.1, far: 150 }}
              gl={{
                antialias: settings.antialias,
                alpha: false,
                powerPreference: settings.powerPreference,
                localClippingEnabled: true,
                failIfMajorPerformanceCaveat: true,
              }}
              dpr={settings.dpr}
              shadows={settings.shadows}
            >
              <color attach="background" args={["#fafafa"]} />
              <fog attach="fog" args={["#fafafa", 15, 50]} />
              <RoomAtmosphere />
              <PerformanceMonitor
                onDecline={() => downgradeTier()}
                flipflops={3}
                onFallback={() => downgradeTier()}
              />
              <Suspense fallback={null}>
                <Experience
                  isLoaded={isLoaded}
                  onSceneReady={handleSceneReady}
                  performanceTier={tier}
                />
                <Preload all />
              </Suspense>
            </Canvas>
        </div>

          {isLoaded && (
            <>
              <NavigationUI />
              <GlobalOverlay />
              <PaperTransition />
              <ScreenReaderOverlay />
            </>
          )}

          <div className="sr-only">{fallback}</div>

          <Preloader ready={sceneReady} onComplete={() => setIsLoaded(true)} />
        </div>
      </SceneProvider>
      <GlobalAudioEnabler />
    </AudioProvider>
  );
}

export default function ItomExperienceCore({ fallback }) {
  return (
    <PerformanceProvider>
      <AchievementsProvider>
        <ItomCanvas fallback={fallback} />
      </AchievementsProvider>
    </PerformanceProvider>
  );
}
