"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { sfx } from "@/lib/soundEffects";

interface EasterEggsProps {
  zOffset: number;
}

export default function EasterEggs({ zOffset }: EasterEggsProps) {
  const mouseRef = useRef<THREE.Group>(null);
  const [duckHovered, setDuckHovered] = useState(false);

  const [duckTex, duckPaintedTex, mouseTex] = useTexture([
    "/textures/entrance/pot_with_duck.webp",
    "/textures/entrance/pot_with_duck_painted.webp",
    "/textures/entrance/mouse_hanging.webp",
  ]);

  useEffect(() => {
    [duckTex, duckPaintedTex, mouseTex].forEach((t) => {
      if (t) {
        t.colorSpace = THREE.SRGBColorSpace;
        t.needsUpdate = true;
      }
    });
  }, [duckTex, duckPaintedTex, mouseTex]);

  // Hanging mouse gentle swinging physics
  useFrame((state) => {
    if (!mouseRef.current) return;
    const t = state.clock.elapsedTime;
    mouseRef.current.rotation.z = Math.sin(t * 2.5 + zOffset) * 0.15;
    mouseRef.current.rotation.x = Math.cos(t * 1.8 + zOffset) * 0.08;
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Hanging Mouse Toy from Ceiling */}
      <group
        ref={mouseRef}
        position={[1.8, 3.8, zOffset - 24]}
        onClick={() => sfx.play("paper")}
      >
        {/* String */}
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.005, 0.005, 1.0, 4]} />
          <meshBasicMaterial color="#1a1917" />
        </mesh>
        {/* Mouse Figure */}
        <mesh position={[0, -0.2, 0]}>
          <planeGeometry args={[0.5, 0.8]} />
          <meshBasicMaterial map={mouseTex} transparent />
        </mesh>
      </group>

      {/* 2. Interactive Duck in a Pot on Wall Shelf */}
      <group
        position={[-2.3, 1.8, zOffset - 54]}
        onPointerOver={() => {
          setDuckHovered(true);
          sfx.play("paper");
        }}
        onPointerOut={() => setDuckHovered(false)}
        onClick={() => sfx.play("hoverDoor")}
      >
        <mesh>
          <planeGeometry args={[0.9, 1.1]} />
          <meshBasicMaterial
            map={duckHovered ? duckPaintedTex : duckTex}
            transparent
          />
        </mesh>
      </group>
    </group>
  );
}
