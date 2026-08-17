"use client";

import { useRef, useState, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { RoomId } from "@/context/SceneContext";

interface DoorProps {
  z: number;
  side: "left" | "right" | "center";
  label: string;
  sublabel: string;
  number: string;
  accentColor?: string;
  roomId: RoomId;
  onEnter: (roomId: RoomId) => void;
}

export default function Door({
  z,
  side,
  label,
  sublabel,
  number,
  accentColor = "#c2410c",
  roomId,
  onEnter,
}: DoorProps) {
  const { camera } = useThree();
  const pivotRef = useRef<THREE.Group>(null);
  const fillMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const glowMatRef = useRef<THREE.MeshBasicMaterial>(null);

  const [hovered, setHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const isAnimating = useRef(false);

  const doorWidth = 2.4;
  const doorHeight = 4.0;
  const corridorWidth = 7.0;

  let xPos = 0;
  let baseRotationY = 0;

  if (side === "left") {
    xPos = -corridorWidth / 2 + 0.1;
    baseRotationY = Math.PI / 2;
  } else if (side === "right") {
    xPos = corridorWidth / 2 - 0.1;
    baseRotationY = -Math.PI / 2;
  } else {
    xPos = 0;
    baseRotationY = 0;
  }

  // Hover & Proximity updates
  const fillAlpha = useRef(0);
  useFrame((_, delta) => {
    if (isAnimating.current) return;

    const d = THREE.MathUtils.clamp(delta, 0, 1 / 30);
    const targetAlpha = hovered ? 1 : 0;
    fillAlpha.current = THREE.MathUtils.damp(fillAlpha.current, targetAlpha, 8, d);

    if (fillMatRef.current) {
      fillMatRef.current.opacity = fillAlpha.current;
    }

    if (pivotRef.current && !isOpen) {
      // Gentle ajar angle on hover
      const ajarTarget = hovered ? (side === "left" ? -0.15 : 0.15) : 0;
      pivotRef.current.rotation.y = THREE.MathUtils.damp(
        pivotRef.current.rotation.y,
        ajarTarget,
        6,
        d
      );
    }
  });

  const handleClick = useCallback(() => {
    if (isAnimating.current || isOpen) return;
    isAnimating.current = true;

    // Open swing angle
    const openAngle = side === "left" ? -Math.PI * 0.55 : Math.PI * 0.55;

    const tl = gsap.timeline({
      onComplete: () => {
        setIsOpen(true);
        isAnimating.current = false;
        onEnter(roomId);
      },
    });

    // 1. Swing door open
    if (pivotRef.current) {
      tl.to(
        pivotRef.current.rotation,
        {
          y: openAngle,
          duration: 0.9,
          ease: "power2.out",
        },
        0
      );
    }

    // 2. Camera approach dolly
    const targetCamX = side === "left" ? -1.2 : side === "right" ? 1.2 : 0;
    tl.to(
      camera.position,
      {
        x: targetCamX,
        z: z + 2.0,
        duration: 1.1,
        ease: "power2.inOut",
      },
      0
    );
  }, [camera, side, z, isOpen, roomId, onEnter]);

  return (
    <group position={[xPos, 0, z]} rotation-y={baseRotationY}>
      {/* Wall Door Frame / Alcove */}
      <mesh position={[0, doorHeight / 2, -0.05]}>
        <boxGeometry args={[doorWidth + 0.3, doorHeight + 0.3, 0.1]} />
        <meshBasicMaterial color="#1a1917" />
      </mesh>

      {/* Door Leaf (Pivot around side edge) */}
      <group
        ref={pivotRef}
        position={[side === "left" ? -doorWidth / 2 : doorWidth / 2, 0, 0]}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
        }}
      >
        {/* Door Plane */}
        <mesh position={[side === "left" ? doorWidth / 2 : -doorWidth / 2, doorHeight / 2, 0]}>
          <planeGeometry args={[doorWidth, doorHeight]} />
          <meshStandardMaterial color="#fcfaf6" roughness={0.9} />
        </mesh>

        {/* Painted Accent Fill (Revealed on Hover) */}
        <mesh position={[side === "left" ? doorWidth / 2 : -doorWidth / 2, doorHeight / 2, 0.02]}>
          <planeGeometry args={[doorWidth - 0.1, doorHeight - 0.1]} />
          <meshStandardMaterial
            ref={fillMatRef}
            color={accentColor}
            transparent
            opacity={0}
            roughness={0.6}
          />
        </mesh>

        {/* Outer Wireframe Border */}
        <mesh position={[side === "left" ? doorWidth / 2 : -doorWidth / 2, doorHeight / 2, 0.04]}>
          <planeGeometry args={[doorWidth - 0.15, doorHeight - 0.15]} />
          <meshBasicMaterial color={hovered ? "#ffffff" : "#1a1917"} wireframe />
        </mesh>

        {/* Door Content Typography */}
        <group position={[side === "left" ? doorWidth / 2 : -doorWidth / 2, doorHeight / 2, 0.06]}>
          {/* Number Stamp */}
          <Text
            position={[0, 1.2, 0]}
            fontSize={0.24}
            color={hovered ? "#ffffff" : accentColor}
            anchorX="center"
            anchorY="middle"
          >
            {number}
          </Text>

          {/* Door Title */}
          <Text
            position={[0, 0.4, 0]}
            fontSize={0.28}
            maxWidth={doorWidth - 0.4}
            textAlign="center"
            color={hovered ? "#ffffff" : "#1a1917"}
            anchorX="center"
            anchorY="middle"
          >
            {label}
          </Text>

          {/* Subtitle / Tech Tags */}
          <Text
            position={[0, -0.4, 0]}
            fontSize={0.16}
            maxWidth={doorWidth - 0.4}
            textAlign="center"
            color={hovered ? "#fef08a" : "#6b655b"}
            anchorX="center"
            anchorY="middle"
          >
            {sublabel}
          </Text>

          {/* Prompt Indicator */}
          <Text
            position={[0, -1.2, 0]}
            fontSize={0.14}
            color={hovered ? "#ffffff" : "#9c9487"}
            anchorX="center"
            anchorY="middle"
          >
            {hovered ? "CLICK TO ENTER ➔" : "✦ TOUCH DOOR ✦"}
          </Text>
        </group>

        {/* Door Handle */}
        <mesh
          position={[
            side === "left" ? doorWidth - 0.25 : -doorWidth + 0.25,
            doorHeight / 2 - 0.2,
            0.12,
          ]}
        >
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#c28c46" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </group>
  );
}
