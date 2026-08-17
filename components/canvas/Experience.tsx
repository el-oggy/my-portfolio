"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import { AdaptiveEvents, Preload } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import gsap from "gsap";

import { useScene } from "@/context/SceneContext";
import useInfiniteCamera from "@/hooks/useInfiniteCamera";
import EntranceDoors from "./entrance/EntranceDoors";
import InfiniteCorridorManager from "./corridor/InfiniteCorridorManager";
import GalleryRoom from "./rooms/GalleryRoom";
import StudioRoom from "./rooms/StudioRoom";
import AboutRoom from "./rooms/AboutRoom";
import ContactRoom from "./rooms/ContactRoom";

function CameraRig({ reducedParallax = false }: { reducedParallax?: boolean }) {
  const { hasEntered, isInRoom, currentRoom } = useScene();
  const { camera } = useThree();

  useInfiniteCamera({
    scrollSpeed: 0.03,
    parallaxIntensity: reducedParallax ? 0.1 : 0.35,
    smoothing: 0.045,
    scrollEnabled: hasEntered && !isInRoom,
    parallaxEnabled: !isInRoom,
  });

  // When entering / exiting rooms, animate camera smoothly
  useEffect(() => {
    if (isInRoom) {
      gsap.to(camera.position, {
        x: 0,
        y: 1.8,
        z: 2.2,
        duration: 1.2,
        ease: "power2.inOut",
        onUpdate: () => {
          camera.lookAt(0, 1.8, -4);
        },
      });
    }
  }, [isInRoom, currentRoom, camera]);

  return null;
}

export default function Experience({
  reducedParallax = false,
}: {
  reducedParallax?: boolean;
}) {
  const { hasEntered, markEntered, currentRoom, exitRoom } = useScene();

  return (
    <Canvas
      className="fixed inset-0 z-0"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "auto",
      }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      dpr={[1, 2]}
      camera={{ fov: 50, near: 0.1, far: 500, position: [0, 1.8, 28] }}
    >
      <fog attach="fog" args={["#fbf9f5", 35, 160]} />
      <color attach="background" args={["#fbf9f5"]} />

      <Suspense fallback={null}>
        <CameraRig reducedParallax={reducedParallax} />

        {/* Warm Ambient & Directional Lighting */}
        <ambientLight intensity={1.8} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1.2}
          color="#ffffff"
          castShadow
        />
        <directionalLight position={[-5, 8, -10]} intensity={0.6} color="#ffe8d6" />

        {/* === 1. ENTRANCE DOUBLE DOORS (Before entering) === */}
        {!hasEntered && (
          <EntranceDoors
            position={[0, 0, 22]}
            onComplete={markEntered}
          />
        )}

        {/* === 2. INFINITE CORRIDOR (When exploring hallway) === */}
        {currentRoom === null && <InfiniteCorridorManager />}

        {/* === 3. THE 4 DEDICATED 3D ROOMS === */}
        {currentRoom === "gallery" && <GalleryRoom onExit={exitRoom} />}
        {currentRoom === "studio" && <StudioRoom onExit={exitRoom} />}
        {currentRoom === "about" && <AboutRoom onExit={exitRoom} />}
        {currentRoom === "contact" && <ContactRoom onExit={exitRoom} />}

        <Preload all />
      </Suspense>

      <AdaptiveEvents />
    </Canvas>
  );
}
