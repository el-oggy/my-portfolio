"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sfx } from "@/lib/soundEffects";
import { useProgress } from "@/context/ProgressContext";

interface EasterEggsProps {
  zOffset: number;
}

export default function EasterEggs({ zOffset }: EasterEggsProps) {
  const mouseRef = useRef<THREE.Group>(null);
  const [duckHovered, setDuckHovered] = useState(false);
  const [eggFound, setEggFound] = useState(false);
  const { unlock } = useProgress();

  const findEgg = () => {
    if (!eggFound) {
      setEggFound(true);
      unlock("egg");
    }
    sfx.play("paper");
  };

  useFrame((state) => {
    if (!mouseRef.current) return;
    const time = state.clock.elapsedTime;
    mouseRef.current.rotation.z = Math.sin(time * 2.5 + zOffset) * 0.15;
    mouseRef.current.rotation.x = Math.cos(time * 1.8 + zOffset) * 0.08;
  });

  return (
    <group>
      <group ref={mouseRef} position={[1.8, 3.7, zOffset - 24]} onClick={findEgg}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.006, 0.006, 1, 5]} />
          <meshBasicMaterial color="#1a1917" />
        </mesh>
        <mesh position={[0, -0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.14, 0.28, 4, 8]} />
          <meshStandardMaterial color="#a8a29e" roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.42, 0]}>
          <sphereGeometry args={[0.11, 12, 12]} />
          <meshStandardMaterial color="#78716c" />
        </mesh>
      </group>

      <group
        position={[-2.3, 1.8, zOffset - 54]}
        onPointerOver={() => {
          setDuckHovered(true);
          sfx.play("hoverDoor");
        }}
        onPointerOut={() => setDuckHovered(false)}
        onClick={findEgg}
      >
        <mesh>
          <cylinderGeometry args={[0.44, 0.34, 0.62, 18]} />
          <meshStandardMaterial color="#d97706" roughness={0.75} />
        </mesh>
        <mesh position={[0, 0.48, 0]}>
          <torusGeometry args={[0.36, 0.05, 8, 24]} />
          <meshStandardMaterial color="#1a1917" />
        </mesh>
        <group position={[0, duckHovered ? 0.72 : 0.64, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.16, 0.16, 4, 10]} />
            <meshStandardMaterial color="#fbbf24" roughness={0.65} />
          </mesh>
          <mesh position={[0, 0.08, 0.17]} rotation={[Math.PI / 2, 0, 0]}>
            <sphereGeometry args={[0.13, 12, 12]} />
            <meshStandardMaterial color="#fbbf24" />
          </mesh>
          <mesh position={[0, 0.2, 0.22]} rotation={[Math.PI / 2, 0, -0.2]}>
            <coneGeometry args={[0.06, 0.16, 8]} />
            <meshStandardMaterial color="#f97316" />
          </mesh>
        </group>
      </group>
    </group>
  );
}
