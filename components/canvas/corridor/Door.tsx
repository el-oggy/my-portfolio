"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text, useTexture } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { RoomId, useScene } from "@/context/SceneContext";
import { sfx } from "@/lib/soundEffects";

export type DoorTextureType = "projekty" | "about" | "kontakt" | "social";

interface DoorProps {
  z: number;
  side: "left" | "right" | "center";
  label: string;
  sublabel: string;
  number: string;
  doorType?: DoorTextureType;
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
  doorType = "projekty",
  accentColor = "#c2410c",
  roomId,
  onEnter,
}: DoorProps) {
  const { camera } = useThree();
  const pivotRef = useRef<THREE.Group>(null);
  const paintedMatRef = useRef<THREE.MeshBasicMaterial>(null);

  const [hovered, setHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const isAnimating = useRef(false);

  // Load authentic hand-drawn door textures
  const [
    doorSketchTex,
    doorPaintedTex,
    frameTex,
    handleTex,
    handlePaintedTex,
  ] = useTexture([
    `/textures/corridor/doors/drzwi${doorType}.webp`,
    `/textures/corridor/doors/drzwi${doorType}_painted.webp`,
    `/textures/corridor/doors/ramkasingledoors.webp`,
    `/textures/corridor/doors/klamkadodrzwi.webp`,
    `/textures/corridor/doors/klamkadodrzwi_painted.webp`,
  ]);

  useEffect(() => {
    [doorSketchTex, doorPaintedTex, frameTex, handleTex, handlePaintedTex].forEach((t) => {
      if (t) {
        t.colorSpace = THREE.SRGBColorSpace;
        t.needsUpdate = true;
      }
    });
  }, [doorSketchTex, doorPaintedTex, frameTex, handleTex, handlePaintedTex]);

  const doorWidth = 2.2;
  const doorHeight = 3.8;
  const corridorWidth = 7.0;

  let xPos = 0;
  let baseRotationY = 0;

  if (side === "left") {
    xPos = -corridorWidth / 2 + 0.15;
    baseRotationY = Math.PI / 2;
  } else if (side === "right") {
    xPos = corridorWidth / 2 - 0.15;
    baseRotationY = -Math.PI / 2;
  } else {
    xPos = 0;
    baseRotationY = 0;
  }

  const { currentRoom } = useScene();

  // Reset door to closed position when in corridor
  useEffect(() => {
    if (currentRoom === null && isOpen) {
      setIsOpen(false);
      if (pivotRef.current) {
        gsap.to(pivotRef.current.rotation, {
          y: 0,
          duration: 0.7,
          ease: "power2.out",
        });
      }
    }
  }, [currentRoom, isOpen]);

  // Hover paint transition & smooth door ajar angle
  const paintAlpha = useRef(0);
  useFrame((_, delta) => {
    if (isAnimating.current) return;

    const d = THREE.MathUtils.clamp(delta, 0, 1 / 30);
    const targetAlpha = hovered ? 1 : 0;
    paintAlpha.current = THREE.MathUtils.damp(paintAlpha.current, targetAlpha, 8, d);

    if (paintedMatRef.current) {
      paintedMatRef.current.opacity = paintAlpha.current;
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

  const handlePointerOver = useCallback(
    (e: any) => {
      e.stopPropagation();
      if (!hovered && !isAnimating.current) {
        setHovered(true);
        sfx.play("hoverDoor");
      }
    },
    [hovered]
  );

  const handleClick = useCallback(
    (e: any) => {
      e.stopPropagation();
      if (isAnimating.current || isOpen) return;
      isAnimating.current = true;
      sfx.play("openDoor");

      const openAngle = side === "left" ? -Math.PI * 0.55 : Math.PI * 0.55;

      const tl = gsap.timeline({
        onComplete: () => {
          setIsOpen(true);
          isAnimating.current = false;
          onEnter(roomId);
        },
      });

      // 1. Swing authentic door open
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

      // 2. Dolly camera into doorway
      const targetCamX = side === "left" ? -1.4 : side === "right" ? 1.4 : 0;
      tl.to(
        camera.position,
        {
          x: targetCamX,
          y: 1.8,
          z: z + 2.0,
          duration: 1.1,
          ease: "power2.inOut",
        },
        0
      );
    },
    [camera, side, z, isOpen, roomId, onEnter]
  );

  return (
    <group position={[xPos, 0, z]} rotation-y={baseRotationY}>
      {/* Authentic Hand-Drawn Door Frame */}
      <mesh position={[0, doorHeight / 2, -0.05]}>
        <planeGeometry args={[doorWidth + 0.6, doorHeight + 0.6]} />
        <meshBasicMaterial map={frameTex} transparent />
      </mesh>

      {/* Door Leaf (Pivot around side hinge) */}
      <group
        ref={pivotRef}
        position={[side === "left" ? -doorWidth / 2 : doorWidth / 2, 0, 0]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
        }}
      >
        {/* Base Sketch Door Texture */}
        <mesh position={[side === "left" ? doorWidth / 2 : -doorWidth / 2, doorHeight / 2, 0]}>
          <planeGeometry args={[doorWidth, doorHeight]} />
          <meshBasicMaterial map={doorSketchTex} transparent />
        </mesh>

        {/* Painted Accent Door Texture (Reveals on Hover) */}
        <mesh position={[side === "left" ? doorWidth / 2 : -doorWidth / 2, doorHeight / 2, 0.02]}>
          <planeGeometry args={[doorWidth, doorHeight]} />
          <meshBasicMaterial
            ref={paintedMatRef}
            map={doorPaintedTex}
            transparent
            opacity={0}
          />
        </mesh>

        {/* Door Handle */}
        <mesh
          position={[
            side === "left" ? doorWidth - 0.35 : -doorWidth + 0.35,
            doorHeight / 2 - 0.2,
            0.04,
          ]}
        >
          <planeGeometry args={[0.4, 0.6]} />
          <meshBasicMaterial
            map={hovered ? handlePaintedTex : handleTex}
            transparent
          />
        </mesh>

        {/* Custom Handwritten Typography Overlay */}
        <group position={[side === "left" ? doorWidth / 2 : -doorWidth / 2, doorHeight / 2, 0.05]}>
          {/* Number */}
          <Text
            position={[0, 1.2, 0]}
            fontSize={0.28}
            font="/fonts/CabinSketch-Bold.ttf"
            color={hovered ? "#ffffff" : accentColor}
            anchorX="center"
            anchorY="middle"
          >
            {number}
          </Text>

          {/* Title */}
          <Text
            position={[0, 0.35, 0]}
            fontSize={0.26}
            maxWidth={doorWidth - 0.4}
            textAlign="center"
            font="/fonts/CabinSketch-Bold.ttf"
            color={hovered ? "#ffffff" : "#1c1917"}
            anchorX="center"
            anchorY="middle"
          >
            {label}
          </Text>

          {/* Subtitle */}
          <Text
            position={[0, -0.45, 0]}
            fontSize={0.16}
            maxWidth={doorWidth - 0.4}
            textAlign="center"
            font="/fonts/CabinSketch-Regular.ttf"
            color={hovered ? "#fef08a" : "#44403c"}
            anchorX="center"
            anchorY="middle"
          >
            {sublabel}
          </Text>

          {/* Hint */}
          <Text
            position={[0, -1.2, 0]}
            fontSize={0.16}
            font="/fonts/CabinSketch-Bold.ttf"
            color={hovered ? "#ffffff" : "#78716c"}
            anchorX="center"
            anchorY="middle"
          >
            {hovered ? "✦ CLICK TO ENTER ➔" : "[ TOUCH DOOR ]"}
          </Text>
        </group>
      </group>
    </group>
  );
}
