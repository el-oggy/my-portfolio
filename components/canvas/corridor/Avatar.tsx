"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

export default function Avatar({
  position = [0, 0.9, 2],
}: {
  position?: [number, number, number];
}) {
  const [frameIndex, setFrameIndex] = useState(0);
  const timer = useRef(0);

  const textures = useTexture([
    "/textures/corridor/avatar_anim/1.webp",
    "/textures/corridor/avatar_anim/2.webp",
    "/textures/corridor/avatar_anim/3.webp",
    "/textures/corridor/avatar_anim/4.webp",
    "/textures/corridor/avatar_anim/5.webp",
    "/textures/corridor/avatar_anim/6.webp",
    "/textures/corridor/avatar_anim/7.webp",
    "/textures/corridor/avatar_anim/8.webp",
    "/textures/corridor/avatar_anim/9.webp",
  ]);

  useEffect(() => {
    textures.forEach((t) => {
      if (t) {
        t.colorSpace = THREE.SRGBColorSpace;
        t.needsUpdate = true;
      }
    });
  }, [textures]);

  // Animate walking doodle frames
  useFrame((_, delta) => {
    timer.current += delta;
    if (timer.current > 0.12) {
      setFrameIndex((prev) => (prev + 1) % textures.length);
      timer.current = 0;
    }
  });

  const currentTexture = textures[frameIndex];

  return (
    <group position={position}>
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[1.6, 2.2]} />
        <meshBasicMaterial map={currentTexture} transparent />
      </mesh>
    </group>
  );
}
