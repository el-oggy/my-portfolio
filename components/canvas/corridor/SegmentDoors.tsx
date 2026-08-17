"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

interface SegmentDoorsProps {
  position?: [number, number, number];
  corridorHeight?: number;
}

export default function SegmentDoors({
  position = [0, 0, -75],
  corridorHeight = 4.8,
}: SegmentDoorsProps) {
  const { camera } = useThree();
  const leftDoorRef = useRef<THREE.Group>(null);
  const rightDoorRef = useRef<THREE.Group>(null);

  const [
    doorLeftTex,
    doorRightTex,
    frameTex,
  ] = useTexture([
    "/textures/corridor/doors/doorrleft.webp",
    "/textures/corridor/doors/dorright.webp",
    "/textures/corridor/doors/ramkasingledoors.webp",
  ]);

  useEffect(() => {
    [doorLeftTex, doorRightTex, frameTex].forEach((t) => {
      if (t) {
        t.colorSpace = THREE.SRGBColorSpace;
        t.needsUpdate = true;
      }
    });
  }, [doorLeftTex, doorRightTex, frameTex]);

  const doorWidth = 2.2;
  const doorHeight = 4.0;
  const targetAngle = useRef(0);
  const currentAngle = useRef(0);

  // Proximity-based automatic door opening as camera glides through
  useFrame((_, delta) => {
    const doorZ = position[2];
    const distToCamera = camera.position.z - doorZ;

    // When camera is between 16 units before the door and 4 units past it, open wide
    if (distToCamera < 16 && distToCamera > -4) {
      targetAngle.current = Math.PI * 0.55;
    } else {
      targetAngle.current = 0;
    }

    const d = THREE.MathUtils.clamp(delta, 0, 1 / 30);
    currentAngle.current = THREE.MathUtils.damp(
      currentAngle.current,
      targetAngle.current,
      6,
      d
    );

    if (leftDoorRef.current) {
      leftDoorRef.current.rotation.y = -currentAngle.current;
    }
    if (rightDoorRef.current) {
      rightDoorRef.current.rotation.y = currentAngle.current;
    }
  });

  return (
    <group position={position}>
      {/* Outer Door Frame */}
      <mesh position={[0, doorHeight / 2, -0.05]}>
        <planeGeometry args={[doorWidth * 2 + 0.4, doorHeight + 0.4]} />
        <meshBasicMaterial map={frameTex} transparent />
      </mesh>

      {/* Left Door */}
      <group ref={leftDoorRef} position={[-doorWidth, 0, 0]}>
        <mesh position={[doorWidth / 2, doorHeight / 2, 0]}>
          <planeGeometry args={[doorWidth, doorHeight]} />
          <meshStandardMaterial
            map={doorLeftTex}
            transparent
            roughness={0.8}
          />
        </mesh>
      </group>

      {/* Right Door */}
      <group ref={rightDoorRef} position={[doorWidth, 0, 0]}>
        <mesh position={[-doorWidth / 2, doorHeight / 2, 0]}>
          <planeGeometry args={[doorWidth, doorHeight]} />
          <meshStandardMaterial
            map={doorRightTex}
            transparent
            roughness={0.8}
          />
        </mesh>
      </group>
    </group>
  );
}
