"use client";

import { useRef, useState, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

interface EntranceDoorsProps {
  position?: [number, number, number];
  onComplete: () => void;
}

export default function EntranceDoors({
  position = [0, 0, 22],
  onComplete,
}: EntranceDoorsProps) {
  const { camera } = useThree();
  const leftDoorRef = useRef<THREE.Group>(null);
  const rightDoorRef = useRef<THREE.Group>(null);
  const signRef = useRef<THREE.Group>(null);

  const [hovered, setHovered] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  const doorWidth = 2.4;
  const doorHeight = 4.2;

  const handleEnter = useCallback(() => {
    if (isOpening) return;
    setIsOpening(true);

    const timeline = gsap.timeline({
      onComplete: () => {
        onComplete();
      },
    });

    // 1. Swing double doors open
    if (leftDoorRef.current && rightDoorRef.current) {
      timeline.to(
        leftDoorRef.current.rotation,
        {
          y: -Math.PI * 0.6,
          duration: 1.2,
          ease: "power2.inOut",
        },
        0
      );
      timeline.to(
        rightDoorRef.current.rotation,
        {
          y: Math.PI * 0.6,
          duration: 1.2,
          ease: "power2.inOut",
        },
        0
      );
    }

    // 2. Fade out the sign
    if (signRef.current) {
      timeline.to(
        signRef.current.position,
        {
          y: 6,
          duration: 0.8,
          ease: "power2.in",
        },
        0
      );
    }

    // 3. Fly camera through the doorway into the corridor
    timeline.to(
      camera.position,
      {
        x: 0,
        y: 0.2,
        z: 8,
        duration: 1.8,
        ease: "power3.inOut",
      },
      0.2
    );
  }, [isOpening, camera, onComplete]);

  // Subtle floating animation for the sign & door breathing
  useFrame((state) => {
    if (!isOpening && signRef.current) {
      const t = state.clock.elapsedTime;
      signRef.current.position.y = 3.4 + Math.sin(t * 2) * 0.08;
    }
  });

  return (
    <group position={position}>
      {/* Outer Door Frame */}
      <mesh position={[0, 1.9, 0]}>
        <boxGeometry args={[doorWidth * 2 + 0.4, doorHeight + 0.4, 0.2]} />
        <meshBasicMaterial color="#1a1917" wireframe />
      </mesh>

      {/* Left Door (Pivot on left edge) */}
      <group
        ref={leftDoorRef}
        position={[-doorWidth, 0, 0]}
        onClick={handleEnter}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <mesh position={[doorWidth / 2, 1.9, 0]}>
          <planeGeometry args={[doorWidth, doorHeight]} />
          <meshStandardMaterial
            color={hovered ? "#faeedb" : "#fbf9f5"}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
        {/* Sketch panel borders */}
        <mesh position={[doorWidth / 2, 1.9, 0.02]}>
          <planeGeometry args={[doorWidth - 0.2, doorHeight - 0.2]} />
          <meshBasicMaterial color="#1a1917" wireframe />
        </mesh>
        {/* Door Knob */}
        <mesh position={[doorWidth - 0.3, 1.8, 0.1]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#c28c46" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Right Door (Pivot on right edge) */}
      <group
        ref={rightDoorRef}
        position={[doorWidth, 0, 0]}
        onClick={handleEnter}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <mesh position={[-doorWidth / 2, 1.9, 0]}>
          <planeGeometry args={[doorWidth, doorHeight]} />
          <meshStandardMaterial
            color={hovered ? "#faeedb" : "#fbf9f5"}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
        {/* Sketch panel borders */}
        <mesh position={[-doorWidth / 2, 1.9, 0.02]}>
          <planeGeometry args={[doorWidth - 0.2, doorHeight - 0.2]} />
          <meshBasicMaterial color="#1a1917" wireframe />
        </mesh>
        {/* Door Knob */}
        <mesh position={[-doorWidth + 0.3, 1.8, 0.1]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#c28c46" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Sign System hanging above doors */}
      <group
        ref={signRef}
        position={[0, 3.4, 0.3]}
        onClick={handleEnter}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Hanging chains */}
        <mesh position={[-1.2, 0.7, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 1.2]} />
          <meshBasicMaterial color="#1a1917" />
        </mesh>
        <mesh position={[1.2, 0.7, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 1.2]} />
          <meshBasicMaterial color="#1a1917" />
        </mesh>

        {/* Sign Board */}
        <mesh>
          <planeGeometry args={[3.2, 1.2]} />
          <meshStandardMaterial
            color={hovered ? "#ffe79a" : "#fdfbf7"}
            roughness={0.9}
          />
        </mesh>
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[3.3, 1.3]} />
          <meshBasicMaterial color="#1a1917" />
        </mesh>

        <Text
          position={[0, 0.2, 0.05]}
          fontSize={0.22}
          color="#1a1917"
          anchorX="center"
          anchorY="middle"
        >
          ADARSH MAHARANA
        </Text>
        <Text
          position={[0, -0.05, 0.05]}
          fontSize={0.14}
          color="#5c5850"
          anchorX="center"
          anchorY="middle"
        >
          VLSI · EMBEDDED · HARDWARE
        </Text>
        <Text
          position={[0, -0.32, 0.05]}
          fontSize={0.16}
          color={hovered ? "#c2410c" : "#1a1917"}
          anchorX="center"
          anchorY="middle"
        >
          [ CLICK DOORS TO ENTER ➔ ]
        </Text>
      </group>
    </group>
  );
}
