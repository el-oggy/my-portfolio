"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { sfx } from "@/lib/soundEffects";
import { projects, Project } from "@/lib/data";
import { useProgress } from "@/context/ProgressContext";
import { createCloudTexture, createSwatchTexture } from "@/lib/proceduralTextures";

export default function GalleryRoom() {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const targetScrollX = useRef(0);
  const currentScrollX = useRef(0);
  const clotheslineRef = useRef<THREE.Group>(null);
  const { unlock } = useProgress();

  const pinTex = useMemo(() => createSwatchTexture("#a16207"), []);
  const cardFrontTex = useMemo(() => createSwatchTexture("#f8fafc"), []);
  const cardPaintedTex = useMemo(() => createSwatchTexture("#22c55e", true), []);
  const cardBackTex = useMemo(() => createSwatchTexture("#fef3c7"), []);
  const cloudTexture = useMemo(() => createCloudTexture(), []);

  useEffect(
    () => () => [pinTex, cardFrontTex, cardPaintedTex, cardBackTex, cloudTexture].forEach((texture) => texture.dispose()),
    [pinTex, cardFrontTex, cardPaintedTex, cardBackTex, cloudTexture],
  );

  // Horizontal wheel / swipe to slide clothesline
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      targetScrollX.current = THREE.MathUtils.clamp(
        targetScrollX.current - e.deltaY * 0.008,
        -((projects.length - 1) * 3.2),
        0
      );
    };
    window.addEventListener("wheel", handleWheel);
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  useFrame((_, delta) => {
    const d = THREE.MathUtils.clamp(delta, 0, 1 / 30);
    currentScrollX.current = THREE.MathUtils.damp(
      currentScrollX.current,
      targetScrollX.current,
      8,
      d
    );

    if (clotheslineRef.current) {
      clotheslineRef.current.position.x = currentScrollX.current;
    }
  });

  return (
    <group position={[0, 0, -5]}>
      {/* Background Floating Clouds */}
      <mesh position={[-6, 4, -4]}>
        <planeGeometry args={[7, 4]} />
        <meshBasicMaterial map={cloudTexture} transparent opacity={0.6} />
      </mesh>
      <mesh position={[6, 3.5, -4]} scale={[-1, 1, 1]}>
        <planeGeometry args={[7, 4]} />
        <meshBasicMaterial map={cloudTexture} transparent opacity={0.6} />
      </mesh>

      {/* Background Balcony Railing */}
      <mesh position={[0, -0.6, -2]}>
        <planeGeometry args={[20, 2.2]} />
        <meshBasicMaterial color="#d6d3d1" transparent opacity={0.9} />
      </mesh>

      {/* Room Header Banner */}
      <Text
        position={[0, 3.8, 0]}
        fontSize={0.4}
        color="#1a1917"
        font="/fonts/CabinSketch-Bold.ttf"
        anchorX="center"
        anchorY="middle"
      >
        ✦ THE HARDWARE GALLERY ✦
      </Text>
      <Text
        position={[0, 3.3, 0]}
        fontSize={0.2}
        color="#78716c"
        font="/fonts/CabinSketch-Regular.ttf"
        anchorX="center"
        anchorY="middle"
      >
        SCROLL TO SLIDE CLOTHESLINE · CLICK CARD TO INSPECT SCHEMATICS
      </Text>

      {/* 3D Clothesline / Hanging Wire */}
      <mesh position={[0, 2.5, -0.1]}>
        <cylinderGeometry args={[0.015, 0.015, 30, 8]} />
        <meshBasicMaterial color="#3f3f46" />
      </mesh>

      {/* Hanging Project & Certificate Cards */}
      <group ref={clotheslineRef}>
        {projects.map((proj, idx) => {
          const x = idx * 3.4 - 3.4;
          const isSelected = selectedIdx === idx;

          return (
            <HangingCard
              key={proj.id}
              project={proj}
              position={[x, 1.1, 0]}
              pinTex={pinTex}
              frontTex={cardFrontTex}
              paintedTex={cardPaintedTex}
              backTex={cardBackTex}
              isSelected={isSelected}
              onToggle={() => {
                sfx.play("paper");
                unlock("inspect");
                setSelectedIdx(isSelected ? null : idx);
              }}
            />
          );
        })}
      </group>
    </group>
  );
}

function HangingCard({
  project,
  position,
  pinTex,
  frontTex,
  paintedTex,
  backTex,
  isSelected,
  onToggle,
}: HangingCardProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const currentRotY = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const d = THREE.MathUtils.clamp(delta, 0, 1 / 30);

    // Subtle natural swinging on the clothesline
    const t = state.clock.elapsedTime;
    const swing = Math.sin(t * 1.5 + position[0]) * 0.05;

    const targetRotY = isSelected ? Math.PI : swing;
    currentRotY.current = THREE.MathUtils.damp(
      currentRotY.current,
      targetRotY,
      7,
      d
    );
    groupRef.current.rotation.y = currentRotY.current;

    // Lift card slightly on hover/select
    const targetY = isSelected ? position[1] + 0.3 : hovered ? position[1] + 0.15 : position[1];
    groupRef.current.position.y = THREE.MathUtils.damp(
      groupRef.current.position.y,
      targetY,
      8,
      d
    );
  });

  const categoryLabel = project.proficiencyLabel ?? project.scene;

  return (
    <group position={position} ref={groupRef}>
      {/* Wooden Clothespin Clamping Card to Wire */}
      <mesh position={[0, 1.35, 0.04]}>
        <planeGeometry args={[0.3, 0.6]} />
        <meshBasicMaterial map={pinTex} transparent />
      </mesh>

      {/* Interactive Card Body */}
      <group
        onClick={onToggle}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Front Face: Sketch & Painted Card */}
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[2.5, 3.4]} />
          <meshBasicMaterial
            map={hovered || isSelected ? paintedTex : frontTex}
            transparent
          />
        </mesh>

        {/* Front Text Overlay */}
        <group position={[0, 0, 0.03]}>
          <Text
            position={[0, 0.9, 0]}
            fontSize={0.22}
            color="#1a1917"
            font="/fonts/CabinSketch-Bold.ttf"
            anchorX="center"
            anchorY="middle"
          >
            {project.title}
          </Text>
          <Text
            position={[0, 0.45, 0]}
            fontSize={0.16}
            color="#c2410c"
            font="/fonts/CabinSketch-Bold.ttf"
            anchorX="center"
            anchorY="middle"
          >
            {categoryLabel.toUpperCase()}
          </Text>
          <Text
            position={[0, -0.4, 0]}
            fontSize={0.13}
            maxWidth={2.1}
            textAlign="center"
            color="#57534e"
            font="/fonts/CabinSketch-Regular.ttf"
            anchorX="center"
            anchorY="middle"
          >
            {project.blurb}
          </Text>
          <Text
            position={[0, -1.2, 0]}
            fontSize={0.13}
            color={hovered ? "#c2410c" : "#a8a29e"}
            font="/fonts/CabinSketch-Bold.ttf"
            anchorX="center"
            anchorY="middle"
          >
            {hovered ? "✦ CLICK TO FLIP & INSPECT ✦" : "[ CLICK TO FLIP ]"}
          </Text>
        </group>

        {/* Back Face: Schematics & Technical Specs */}
        <mesh position={[0, 0, -0.01]} rotation-y={Math.PI}>
          <planeGeometry args={[2.5, 3.4]} />
          <meshBasicMaterial map={backTex} transparent />
        </mesh>

        <group position={[0, 0, -0.03]} rotation-y={Math.PI}>
          <Text
            position={[0, 1.1, 0]}
            fontSize={0.22}
            color="#1a1917"
            font="/fonts/CabinSketch-Bold.ttf"
            anchorX="center"
            anchorY="middle"
          >
            TECHNICAL SPECS
          </Text>
          <Text
            position={[0, 0.2, 0]}
            fontSize={0.12}
            maxWidth={2.2}
            textAlign="center"
            color="#292524"
            font="/fonts/CabinSketch-Regular.ttf"
            anchorX="center"
            anchorY="middle"
          >
            {project.details[0]}
          </Text>

          {project.repo && (
            <Text
              position={[0, -0.7, 0]}
              fontSize={0.15}
              color="#0284c7"
              font="/fonts/CabinSketch-Bold.ttf"
              anchorX="center"
              anchorY="middle"
              onClick={(e) => {
                e.stopPropagation();
                window.open(project.repo, "_blank", "noopener,noreferrer");
              }}
            >
              [ VIEW GITHUB REPO ↗ ]
            </Text>
          )}

          <Text
            position={[0, -1.2, 0]}
            fontSize={0.13}
            color="#dc2626"
            font="/fonts/CabinSketch-Bold.ttf"
            anchorX="center"
            anchorY="middle"
          >
            [ CLICK TO FLIP BACK ]
          </Text>
        </group>
      </group>
    </group>
  );
}

interface HangingCardProps {
  project: Project;
  position: [number, number, number];
  pinTex: THREE.Texture;
  frontTex: THREE.Texture;
  paintedTex: THREE.Texture;
  backTex: THREE.Texture;
  isSelected: boolean;
  onToggle: () => void;
}
