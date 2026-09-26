"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";

import Experience from "./itom/src/components/canvas/Experience";
import GlobalOverlay from "./itom/src/components/ui/GlobalOverlay";
import NavigationUI from "./itom/src/components/ui/NavigationUI";
import PaperTransition from "./itom/src/components/dom/PaperTransition";
import Preloader from "./itom/src/components/dom/Preloader";
import ScreenReaderOverlay from "./itom/src/components/ui/ScreenReaderOverlay";
import EmailOverlay from "./ui/EmailOverlay";
import { AchievementsProvider } from "./itom/src/context/AchievementsContext";
import { AudioProvider, useAudio } from "./itom/src/context/AudioManager";
import { PerformanceProvider, usePerformance } from "./itom/src/context/PerformanceContext";
import { SceneProvider, useScene } from "./itom/src/context/SceneContext";
import { initAudio } from "./itom/src/utils/audioManager";
import { useDocumentMeta } from "./itom/src/hooks/useDocumentMeta";

import { getRoomTheme } from "./itom/src/components/canvas/rooms/RoomThemeConfig";

// Hoisted scratch color — avoids allocating a new THREE.Color every frame
// (GC churn at 60fps). Mutated in place via .set() below.
const TARGET_COLOR = new THREE.Color();

/**
 * ResponsiveFov — keeps wide-enough framing on portrait phones.
 *
 * The scene is authored at fov 60 for desktop landscape. On a portrait phone
 * (aspect ~0.46) the horizontal FOV collapses to ~30°, so the entrance doors,
 * signs and room layouts are cropped left/right — the site feels zoomed-in
 * and "doesn't fit". We widen the vertical FOV as aspect shrinks (desktop
 * untouched: max(60, 85) => 60), capped at 85° to avoid strong distortion.
 * Runs in useFrame so orientation changes / address-bar expansion are picked
 * up the frame they happen; camera pose tweens (EntranceDoors, DoorSection)
 * are untouched — only the projection changes.
 */
const MIN_ASPECT = 0.4; // floor so extreme foldables don't explode the fov
function ResponsiveFov() {
  const { camera, size } = useThree();
  const lastFov = useRef(0);

  useFrame(() => {
    if (!camera.isPerspectiveCamera || size.height <= 0) return;
    const aspect = size.width / size.height;
    const clamped = Math.max(aspect, MIN_ASPECT);
    const targetFov =
      aspect >= 1 ? 60 : Math.min(85, 60 + (1 - clamped) * 40);
    if (Math.abs(targetFov - lastFov.current) < 0.05) return;
    lastFov.current = targetFov;
    camera.fov = targetFov;
    camera.updateProjectionMatrix();
  });

  return null;
}

function RoomAtmosphere() {
  const { currentRoom } = useScene();
  const { scene } = useThree();

  useFrame((state, delta) => {
    if (!scene) return;
    
    const theme = getRoomTheme(currentRoom);
    TARGET_COLOR.set(theme.palette.fog);
    
    // Smoothly lerp background and fog
    if (scene.background) {
      scene.background.lerp(TARGET_COLOR, delta * 2);
    } else {
      scene.background = TARGET_COLOR.clone();
    }
    
    if (scene.fog) {
      scene.fog.color.lerp(TARGET_COLOR, delta * 2);
    }
  });

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

/**
 * VirtualRouter — mounts the URL / title / history bridge for the 3D rooms.
 * Entering/leaving rooms pushState's /gallery, /studio, /about, /contact,
 * browser back/forward teleports between rooms, and a deep link (e.g. someone
 * opening /gallery straight from the sitemap) auto-teleports the visitor into
 * that room once they pass the entrance doors.
 */
function VirtualRouter() {
  useDocumentMeta();
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
      {/* Achievements sits inside AudioProvider so the unlock chime can
          respect the user's mute / volume preferences */}
      <AchievementsProvider>
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
              <ResponsiveFov />
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
                {/* NOTE: drei's <Preload all /> was removed. It force-loaded
                    EVERY texture in the scene graph before first paint
                    (~130 requests, 3.3MB of images) and, because it walks the
                    whole graph, it also pulled the corridor back in — undoing
                    the deferred mount in Experience.jsx. Texture loading is
                    already driven by the LoadingManager in Preloader.jsx,
                    which is what the progress readout reflects. */}
              </Suspense>
            </Canvas>
        </div>

          {isLoaded && (
            <>
              <NavigationUI />
              <GlobalOverlay />
              <PaperTransition />
              <ScreenReaderOverlay />
              <EmailOverlay />
            </>
          )}

          {/* Semantic fallback for SEO / no-WebGL visitors. While the WebGL
              experience is live this is visually hidden AND inert: focusable
              children would otherwise be tab-reachable while invisible.
              Assistive tech is served by ScreenReaderOverlay instead. */}
          <div className="sr-only" aria-hidden="true" {...{ inert: "" }}>
            {fallback}
          </div>

          <Preloader ready={sceneReady} onComplete={() => setIsLoaded(true)} />

          {/* Virtual room routes: URL, title and history sync (needs SceneContext) */}
          <VirtualRouter />
        </div>
      </SceneProvider>
      </AchievementsProvider>
      <GlobalAudioEnabler />
    </AudioProvider>
  );
}

export default function ItomExperienceCore({ fallback }) {
    // Scroll-lock opt-in: while the immersive canvas is alive, lock page
    // scrolling (html.webgl-active). DOM routes like /email never mount this
    // component, so they keep normal scrolling.
    useEffect(() => {
        document.documentElement.classList.add("webgl-active");
        return () => {
            document.documentElement.classList.remove("webgl-active");
        };
    }, []);

    return (
        <PerformanceProvider>
            <ItomCanvas fallback={fallback} />
        </PerformanceProvider>
    );
}
