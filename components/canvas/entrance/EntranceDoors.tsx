"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { sfx } from "@/lib/soundEffects";
import { createTransistorDoorTexture, createResCapDoorTexture, createWoodTexture } from "@/lib/proceduralTextures";

interface EntranceDoorsProps {
  position?: [number, number, number];
  onComplete: () => void;
}

export default function EntranceDoors({ position = [0, 0, 22], onComplete }: EntranceDoorsProps) {
  const { camera } = useThree();
  const leftDoorRef = useRef<THREE.Group>(null);
  const rightDoorRef = useRef<THREE.Group>(null);
  const signRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  const leftTexture = useMemo(() => createTransistorDoorTexture("#c2410c"), []);
  const rightTexture = useMemo(() => createResCapDoorTexture("#0284c7"), []);
  const floorTexture = useMemo(() => createWoodTexture(8, 3), []);

  useEffect(
    () => () => [leftTexture, rightTexture, floorTexture].forEach((texture) => texture.dispose()),
    [leftTexture, rightTexture, floorTexture],
  );

  const handlePointerOver = useCallback(() => {
    if (!hovered && !isOpening) {
      setHovered(true);
      sfx.play("hoverDoor");
    }
  }, [hovered, isOpening]);

  const handleEnter = useCallback(() => {
    if (isOpening) return;
    setIsOpening(true);
    sfx.play("openDoor");

    const timeline = gsap.timeline({ onComplete });
    if (leftDoorRef.current && rightDoorRef.current) {
      timeline.to(leftDoorRef.current.rotation, { y: -Math.PI * 0.55, duration: 1.1, ease: "power2.inOut" }, 0);
      timeline.to(rightDoorRef.current.rotation, { y: Math.PI * 0.55, duration: 1.1, ease: "power2.inOut" }, 0);
    }
    if (signRef.current) timeline.to(signRef.current.position, { y: 7, duration: 0.8, ease: "power2.in" }, 0);
    timeline.to(camera.position, { x: 0, y: 1.8, z: 8, duration: 1.7, ease: "power3.inOut" }, 0.15);
  }, [camera, isOpening, onComplete]);

  useFrame((state) => {
    if (!isOpening && signRef.current) {
      signRef.current.position.y = 3.6 + Math.sin(state.clock.elapsedTime * 2.2) * 0.08;
    }
  });

  const doorWidth = 2.2;
  const doorHeight = 4.1;

  return (
    <group position={position}>
      <mesh position={[0, 0, 4]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[45, 16]} />
        <meshStandardMaterial map={floorTexture} roughness={0.9} />
      </mesh>

      <mesh position={[0, 5, -0.25]}>
        <planeGeometry args={[48, 14]} />
        <meshStandardMaterial color="#f3ead9" roughness={0.9} />
      </mesh>

      {[-7.5, 7.5].map((x) => (
        <group key={x} position={[x, 2.6, 0]} scale={[-Math.sign(x), 1, 1]}>
          <mesh position={[0, 1.4, 0]}>
            <cylinderGeometry args={[0.18, 0.24, 2.8, 10]} />
            <meshStandardMaterial color="#78350f" roughness={0.85} />
          </mesh>
          <mesh position={[0, 3.4, 0]}>
            <icosahedronGeometry args={[1.35, 1]} />
            <meshStandardMaterial color="#4d7c0f" flatShading roughness={0.75} />
          </mesh>
        </group>
      ))}

      {/* Decorative 3D electronics components near doorway */}
      <group position={[-5.2, 1.2, 1.2]} rotation={[0, 0.3, Math.PI / 2]}>
        <mesh>
          <cylinderGeometry args={[0.12, 0.12, 0.7, 10]} />
          <meshStandardMaterial color="#d4a574" roughness={0.8} />
        </mesh>
        {[-0.42, 0.42].map((y) => (
          <mesh key={y} position={[0, y, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.28, 6]} />
            <meshStandardMaterial color="#9ca3af" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
        {[0.14, -0.14].map((y) => (
          <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.125, 0.02, 6, 18]} />
            <meshStandardMaterial color="#b45309" />
          </mesh>
        ))}
      </group>

      <group position={[5.2, 1.4, 1.2]}>
        <mesh>
          <cylinderGeometry args={[0.16, 0.16, 0.35, 12]} />
          <meshStandardMaterial color="#2563eb" roughness={0.65} />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.12, 8]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.5} roughness={0.4} />
        </mesh>
        {[-0.09, 0.09].map((x) => (
          <mesh key={x} position={[x, -0.24, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.2, 6]} />
            <meshStandardMaterial color="#9ca3af" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
      </group>

      <group position={[0, 4.8, 0.8]}>
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <cylinderGeometry args={[0.11, 0.11, 0.28, 3]} />
          <meshStandardMaterial color="#1a1917" roughness={0.85} flatShading />
        </mesh>
        {[-0.08, 0, 0.08].map((x, i) => (
          <mesh key={i} position={[x * 1.2, -0.2, x > 0 ? 0.06 : x < 0 ? -0.06 : 0]} rotation={[x !== 0 ? (x > 0 ? 0.15 : -0.15) : 0, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.25, 6]} />
            <meshStandardMaterial color="#9ca3af" metalness={0.5} roughness={0.4} />
          </mesh>
        ))}
      </group>

      <group position={[3.5, 0.85, 0.1]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.32, 0.42, 4, 12]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.65} />
        </mesh>
        <mesh position={[0, 0.38, 0.22]}>
          <sphereGeometry args={[0.24, 14, 14]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
        <mesh position={[-0.13, 0.62, 0.26]} rotation={[0, 0, -0.4]}>
          <coneGeometry args={[0.08, 0.22, 8]} />
          <meshStandardMaterial color="#f97316" />
        </mesh>
      </group>

      <mesh position={[0, (doorHeight + 0.4) / 2, -0.05]}>
        <planeGeometry args={[doorWidth * 2 + 0.45, doorHeight + 0.4]} />
        <meshBasicMaterial color="#1a1917" />
      </mesh>

      {[
        { ref: leftDoorRef, x: -doorWidth, texture: leftTexture },
        { ref: rightDoorRef, x: doorWidth, texture: rightTexture },
      ].map(({ ref, x, texture }, index) => (
        <group
          key={index}
          ref={ref}
          position={[x, 0, 0]}
          onClick={handleEnter}
          onPointerOver={handlePointerOver}
          onPointerOut={() => setHovered(false)}
        >
          <mesh position={[index === 0 ? doorWidth / 2 : -doorWidth / 2, doorHeight / 2, 0]}>
            <planeGeometry args={[doorWidth, doorHeight]} />
            <meshBasicMaterial map={texture} transparent />
          </mesh>
        </group>
      ))}

      <group ref={signRef} position={[0, 3.6, 0.45]} onClick={handleEnter} onPointerOver={handlePointerOver} onPointerOut={() => setHovered(false)}>
        <mesh>
          <boxGeometry args={[4, 1.7, 0.06]} />
          <meshStandardMaterial color="#fffdf7" roughness={0.85} />
        </mesh>
        <Text position={[0, 0.28, 0.05]} fontSize={0.26} color={hovered ? "#c2410c" : "#1a1917"} anchorX="center" anchorY="middle">
          ADARSH MAHARANA
        </Text>
        <Text position={[0, -0.12, 0.05]} fontSize={0.15} color="#44403c" anchorX="center" anchorY="middle">
          EMBEDDED · IoT · HARDWARE
        </Text>
        <Text position={[0, -0.52, 0.05]} fontSize={0.17} color={hovered ? "#059669" : "#57534e"} anchorX="center" anchorY="middle">
          {hovered ? "✦ CLICK TO ENTER ✦" : "CLICK DOORS TO OPEN"}
        </Text>
      </group>
    </group>
  );
}
