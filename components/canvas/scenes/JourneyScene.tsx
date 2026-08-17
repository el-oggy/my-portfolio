"use client";

import { useRef } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";

import { SCENES } from "@/lib/sceneConfig";

export default function JourneyScene() {
  const hub = SCENES.find((s) => s.key === "journey");
  const group = useRef<THREE.Group>(null);

  if (!hub) return null;

  return (
    <group position={hub.worldCenter}>
      <group ref={group} position={[0, 4, 0]}>
        <mesh>
          <planeGeometry args={[16, 10]} />
          <meshStandardMaterial color="#ffffff" roughness={1} />
        </mesh>
        
        <mesh position={[0, 0, -0.1]}>
          <planeGeometry args={[16.5, 10.5]} />
          <meshStandardMaterial color="#000000" roughness={1} />
        </mesh>

        <Text
          position={[0, 0, 0.1]}
          fontSize={1.2}
          color="#000000"
          anchorX="center"
          anchorY="middle"
        >
          Journey
        </Text>
      </group>
    </group>
  );
}
