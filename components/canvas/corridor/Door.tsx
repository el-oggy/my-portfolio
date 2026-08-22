"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { RoomId, useScene } from "@/context/SceneContext";
import { sfx } from "@/lib/soundEffects";
import { setCameraOverride } from "@/lib/cameraOverride";
import { createDoorTexture } from "@/lib/proceduralTextures";
import {
  CORRIDOR_HEIGHT,
  WALL_LENGTH,
  WALL_X_OUTER,
} from "./corridorConfig";

interface DoorProps {
  z: number;
  side: "left" | "right";
  label: string;
  sublabel: string;
  number: string;
  icon: string;
  accentColor: string;
  roomId: RoomId;
  onEnter: (roomId: RoomId) => void;
}

export default function Door({ z, side, label, sublabel, number, icon, accentColor, roomId, onEnter }: DoorProps) {
  const { camera } = useThree();
  const { currentRoom } = useScene();
  const tiltRef = useRef<THREE.Group>(null);
  const doorPivotRef = useRef<THREE.Group>(null);
  const paintedMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const currentTilt = useRef(0.02);
  const isAnimating = useRef(false);
  const isTiltLocked = useRef(false);
  const [hovered, setHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const sketchTexture = useMemo(() => createDoorTexture(accentColor, number, false), [accentColor, number]);
  const paintedTexture = useMemo(() => createDoorTexture(accentColor, number, true), [accentColor, number]);

  useEffect(
    () => () => {
      sketchTexture.dispose();
      paintedTexture.dispose();
      setCameraOverride(false);
    },
    [paintedTexture, sketchTexture],
  );

  useEffect(() => {
    if (currentRoom === null && isOpen) {
      setIsOpen(false);
      if (doorPivotRef.current) doorPivotRef.current.rotation.y = 0;
    }
  }, [currentRoom, isOpen]);

  useFrame((_, delta) => {
    if (!tiltRef.current || isTiltLocked.current) return;
    const distance = Math.abs(camera.position.z - z);
    let target = 0.02;

    if (distance < 15 && distance > 3) {
      const progress = (15 - distance) / 12;
      target = 0.02 + 0.24 * progress * (2 - progress);
    } else if (distance <= 3) {
      target = 0.26;
    }

    currentTilt.current = THREE.MathUtils.lerp(currentTilt.current, target, Math.min(0.12, delta * 4));
    const baseDirection = side === "left" ? 1 : -1;
    const tiltDirection = side === "left" ? -1 : 1;
    tiltRef.current.rotation.y = baseDirection * Math.PI / 2 + currentTilt.current * tiltDirection;

    if (paintedMaterialRef.current) {
      paintedMaterialRef.current.opacity = THREE.MathUtils.damp(
        paintedMaterialRef.current.opacity,
        hovered ? 1 : 0,
        9,
        Math.min(delta, 1 / 30),
      );
    }
  });

  const handlePointerOver = useCallback((event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (!isAnimating.current && !hovered) {
      setHovered(true);
      sfx.play("hoverDoor");
    }
  }, [hovered]);

  const handleClick = useCallback((event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (isAnimating.current || isOpen) return;
    isAnimating.current = true;
    isTiltLocked.current = true;
    setHovered(false);
    setCameraOverride(true);
    sfx.play("openDoor");

    const savedState = { x: 0, y: 0.2, z: z + 4, rotationY: side === "left" ? 0.15 : -0.15 };
    const alignX = side === "left" ? 1.2 : -1.2;
    const alignRotation = side === "left" ? Math.PI * 0.334 : -Math.PI * 0.334;
    const rotationProxy = { y: camera.rotation.y };

    gsap.to(camera.position, { x: alignX, y: 0.2, z, duration: 0.85, ease: "power2.inOut" });
    gsap.to(rotationProxy, {
      y: alignRotation,
      duration: 0.85,
      ease: "power2.inOut",
      onUpdate: () => {
        camera.rotation.set(0, rotationProxy.y, 0);
      },
      onComplete: () => {
        const openAngle = side === "left" ? Math.PI * 0.6 : -Math.PI * 0.6;
        if (doorPivotRef.current) {
          gsap.to(doorPivotRef.current.rotation, {
            y: openAngle,
            duration: 0.55,
            ease: "power2.out",
            onComplete: () => {
              const direction = new THREE.Vector3();
              camera.getWorldDirection(direction);
              const target = camera.position.clone().addScaledVector(direction, 6.5);
              gsap.to(camera.position, {
                x: target.x,
                y: 0.2,
                z: target.z,
                duration: 1.25,
                ease: "power2.inOut",
                onComplete: () => {
                  setIsOpen(true);
                  isAnimating.current = false;
                  setCameraOverride(false);
                  onEnter(roomId);
                },
              });
            },
          });
        }
      },
    });

    // Keep the pre-click state available for a future true reverse-exit animation.
    return savedState;
  }, [camera, isOpen, onEnter, roomId, side, z]);

  const pivotX = side === "left" ? -WALL_X_OUTER : WALL_X_OUTER;
  const wallOffsetX = side === "left" ? WALL_LENGTH / 2 : -WALL_LENGTH / 2;
  const doorHeight = 2.5;
  const doorWidth = 0.96;

  const wallGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const halfWidth = WALL_LENGTH / 2;
    const halfHeight = CORRIDOR_HEIGHT / 2;
    shape.moveTo(-halfWidth, -halfHeight);
    shape.lineTo(halfWidth, -halfHeight);
    shape.lineTo(halfWidth, halfHeight);
    shape.lineTo(-halfWidth, halfHeight);
    shape.closePath();

    const hole = new THREE.Path();
    hole.moveTo(-doorWidth / 2, -0.4 - doorHeight / 2 + 0.05);
    hole.lineTo(doorWidth / 2, -0.4 - doorHeight / 2 + 0.05);
    hole.lineTo(doorWidth / 2, -0.4 + doorHeight / 2 - 0.05);
    hole.lineTo(-doorWidth / 2, -0.4 + doorHeight / 2 - 0.05);
    hole.closePath();
    shape.holes.push(hole);
    return new THREE.ShapeGeometry(shape);
  }, [doorWidth]);

  useEffect(() => () => wallGeometry.dispose(), [wallGeometry]);

  return (
    <group position={[pivotX, 0, z]}>
      <group ref={tiltRef}>
        <mesh geometry={wallGeometry} position={[wallOffsetX, 0, 0]}>
          <meshBasicMaterial color="#f5efe6" side={THREE.DoubleSide} toneMapped={false} />
        </mesh>

        <mesh position={[wallOffsetX + (side === "left" ? -1.15 : 1.15), 0.35, 0.03]}>
          <planeGeometry args={[0.7, 0.34]} />
          <meshBasicMaterial color="#fffdf7" side={THREE.DoubleSide} />
        </mesh>

        <Text
          position={[wallOffsetX + (side === "left" ? -1.15 : 1.15), 0.35, 0.05]}
          fontSize={0.17}
          color={accentColor}
          anchorX="center"
          anchorY="middle"
        >
          {`${icon} ${number}`}
        </Text>

        <Text
          position={[wallOffsetX + (side === "left" ? -1.15 : 1.15), 0.12, 0.05]}
          fontSize={0.1}
          color="#44403c"
          anchorX="center"
          anchorY="middle"
          maxWidth={0.9}
          textAlign="center"
        >
          {label}
        </Text>

        <group position={[wallOffsetX, -0.4, 0.04]}>
          <mesh>
            <planeGeometry args={[doorWidth + 0.24, doorHeight + 0.16]} />
            <meshBasicMaterial color="#1a1917" side={THREE.DoubleSide} />
          </mesh>

          <group ref={doorPivotRef} position={[side === "left" ? -doorWidth / 2 : doorWidth / 2, 0, 0.01]}>
            <mesh
              position={[side === "left" ? doorWidth / 2 : -doorWidth / 2, 0, 0]}
              onClick={handleClick}
              onPointerOver={handlePointerOver}
              onPointerOut={() => setHovered(false)}
            >
              <planeGeometry args={[doorWidth, doorHeight]} />
              <meshBasicMaterial map={sketchTexture} toneMapped={false} />
            </mesh>
            <mesh position={[side === "left" ? doorWidth / 2 : -doorWidth / 2, 0, -0.002]}>
              <planeGeometry args={[doorWidth, doorHeight]} />
              <meshBasicMaterial ref={paintedMaterialRef} map={paintedTexture} transparent opacity={0} toneMapped={false} />
            </mesh>
          </group>
        </group>

        <Text
          position={[wallOffsetX, CORRIDOR_HEIGHT / 2 - 0.35, 0.05]}
          fontSize={0.13}
          color="#57534e"
          anchorX="center"
          anchorY="middle"
          maxWidth={WALL_LENGTH - 0.7}
          textAlign="center"
        >
          {sublabel.toUpperCase()}
        </Text>
      </group>
    </group>
  );
}
