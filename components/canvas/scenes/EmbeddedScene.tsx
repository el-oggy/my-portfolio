"use client";

import { useRef } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";

import { SCENES } from "@/lib/sceneConfig";

export default function EmbeddedScene() {
  const hub = SCENES.find((s) => s.key === "embedded");
  const group = useRef<THREE.Group>(null);

  if (!hub) return null;

  const isLeft = hub.worldCenter[0] < 0;

  return (
    <group position={hub.worldCenter} rotation-y={isLeft ? Math.PI / 2 : -Math.PI / 2}>
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
          Embedded \n Microcontrollers
        </Text>
      </group>
    </group>
  );
}
