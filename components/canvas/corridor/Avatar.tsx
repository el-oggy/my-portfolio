"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { createAvatarTexture } from "@/lib/proceduralTextures";

export default function Avatar({ position = [0, 0.9, 2] }: { position?: [number, number, number] }) {
  const [frameIndex, setFrameIndex] = useState(0);
  const timer = useRef(0);
  const textures = useMemo(
    () => Array.from({ length: 9 }, (_, frame) => createAvatarTexture(frame)),
    [],
  );

  useEffect(() => () => textures.forEach((texture) => texture.dispose()), [textures]);

  useFrame((_, delta) => {
    timer.current += delta;
    if (timer.current > 0.12) {
      timer.current = 0;
      setFrameIndex((previous) => (previous + 1) % textures.length);
    }
  });

  return (
    <group position={position}>
      <mesh>
        <planeGeometry args={[1.5, 2]} />
        <meshBasicMaterial map={textures[frameIndex]} transparent />
      </mesh>
    </group>
  );
}
