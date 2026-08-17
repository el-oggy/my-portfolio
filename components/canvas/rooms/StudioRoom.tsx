"use client";

import { useState, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { sfx } from "@/lib/soundEffects";
import { projects } from "@/lib/data";

interface StudioRoomProps {
  onExit: () => void;
}

export default function StudioRoom({ onExit }: StudioRoomProps) {
  const towerRef = useRef<THREE.Group>(null);
  const [selectedMonitor, setSelectedMonitor] = useState<number | null>(null);

  const [
    monitorFrontTex,
    monitorFrontPaintedTex,
    tvFrontTex,
    tvFrontPaintedTex,
    deskTex,
    phoneTex,
  ] = useTexture([
    "/textures/studio/monitor_front.webp",
    "/textures/studio/monitor_front_painted.webp",
    "/textures/studio/tv_front.webp",
    "/textures/studio/tv_front_painted.webp",
    "/textures/corridor/gorastolika.webp",
    "/textures/studio/phonefront_followmeontiktok.webp",
  ]);

  useEffect(() => {
    [monitorFrontTex, monitorFrontPaintedTex, tvFrontTex, tvFrontPaintedTex, deskTex, phoneTex].forEach(
      (t) => {
        if (t) {
          t.colorSpace = THREE.SRGBColorSpace;
          t.needsUpdate = true;
        }
      }
    );
  }, [monitorFrontTex, monitorFrontPaintedTex, tvFrontTex, tvFrontPaintedTex, deskTex, phoneTex]);

  // Drag physics state
  const isDragging = useRef(false);
  const previousX = useRef(0);
  const rotationVelocity = useRef(0.005);
  const currentRotation = useRef(0);

  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      isDragging.current = true;
      previousX.current = e.clientX;
    };
    const handlePointerMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const deltaX = e.clientX - previousX.current;
      previousX.current = e.clientX;
      rotationVelocity.current = deltaX * 0.004;
    };
    const handlePointerUp = () => {
      isDragging.current = false;
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
    };
  }, []);

  useFrame((_, delta) => {
    if (!towerRef.current) return;
    const d = THREE.MathUtils.clamp(delta, 0, 1 / 30);

    if (!isDragging.current) {
      rotationVelocity.current = THREE.MathUtils.damp(
        rotationVelocity.current,
        0.003,
        2,
        d
      );
    }

    currentRotation.current += rotationVelocity.current;
    towerRef.current.rotation.y = currentRotation.current;
  });

  const studioProjects = projects.slice(0, 6);

  return (
    <group position={[0, 0, -4]}>
      {/* Studio Header */}
      <Text
        position={[0, 3.8, 0]}
        fontSize={0.4}
        color="#1a1917"
        font="/fonts/CabinSketch-Bold.ttf"
        anchorX="center"
        anchorY="middle"
      >
        ✦ THE STUDIO ✦
      </Text>
      <Text
        position={[0, 3.3, 0]}
        fontSize={0.2}
        color="#78716c"
        font="/fonts/CabinSketch-Regular.ttf"
        anchorX="center"
        anchorY="middle"
      >
        DRAG TO ROTATE 3D MONITOR TOWER · CLICK SCREEN TO INSPECT CODE
      </Text>

      {/* 3D Rotating Helix Monitor Tower */}
      <group ref={towerRef} position={[0, 0.8, 0]}>
        {studioProjects.map((item, idx) => {
          const angle = (idx / studioProjects.length) * Math.PI * 2;
          const radius = 2.4;
          const x = Math.sin(angle) * radius;
          const z = Math.cos(angle) * radius;
          const y = (idx % 2 === 0 ? 0.6 : -0.4);
          const isSelected = selectedMonitor === idx;

          return (
            <group
              key={item.id}
              position={[x, y, z]}
              rotation-y={angle}
              onClick={(e) => {
                e.stopPropagation();
                sfx.play("paper");
                setSelectedMonitor(isSelected ? null : idx);
              }}
            >
              {/* Monitor Screen Frame */}
              <mesh>
                <planeGeometry args={[1.8, 1.5]} />
                <meshBasicMaterial
                  map={
                    isSelected
                      ? tvFrontPaintedTex
                      : idx % 2 === 0
                      ? monitorFrontTex
                      : tvFrontTex
                  }
                  transparent
                />
              </mesh>

              {/* Monitor Title Overlay */}
              <Text
                position={[0, 0.2, 0.04]}
                fontSize={0.14}
                color="#1a1917"
                font="/fonts/CabinSketch-Bold.ttf"
                anchorX="center"
                anchorY="middle"
              >
                {item.title}
              </Text>
              <Text
                position={[0, -0.15, 0.04]}
                fontSize={0.11}
                color="#0284c7"
                font="/fonts/CabinSketch-Regular.ttf"
                anchorX="center"
                anchorY="middle"
              >
                {item.stack[0]} · {item.stack[1] || "Hardware"}
              </Text>
              <Text
                position={[0, -0.45, 0.04]}
                fontSize={0.09}
                color={isSelected ? "#16a34a" : "#78716c"}
                font="/fonts/CabinSketch-Bold.ttf"
                anchorX="center"
                anchorY="middle"
              >
                {isSelected ? "● ACTIVE CODE SIGNAL" : "TOUCH TO INSPECT"}
              </Text>
            </group>
          );
        })}
      </group>

      {/* Selected Item Detail Card if clicked */}
      {selectedMonitor !== null && (
        <group position={[0, -1.2, 1]}>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[5, 1.4]} />
            <meshStandardMaterial color="#fef9c3" roughness={0.9} />
          </mesh>
          <Text
            position={[0, 0.4, 0.05]}
            fontSize={0.18}
            color="#1a1917"
            font="/fonts/CabinSketch-Bold.ttf"
            anchorX="center"
            anchorY="middle"
          >
            {studioProjects[selectedMonitor]?.title}
          </Text>
          <Text
            position={[0, 0.05, 0.05]}
            fontSize={0.12}
            maxWidth={4.4}
            textAlign="center"
            color="#44403c"
            font="/fonts/CabinSketch-Regular.ttf"
            anchorX="center"
            anchorY="middle"
          >
            {studioProjects[selectedMonitor]?.blurb || studioProjects[selectedMonitor]?.details[0]}
          </Text>
          {studioProjects[selectedMonitor]?.repo && (
            <Text
              position={[0, -0.35, 0.05]}
              fontSize={0.13}
              color="#0284c7"
              font="/fonts/CabinSketch-Bold.ttf"
              anchorX="center"
              anchorY="middle"
              onClick={() => window.open(studioProjects[selectedMonitor]?.repo, "_blank")}
            >
              [ OPEN REPOSITORY ↗ ]
            </Text>
          )}
        </group>
      )}
    </group>
  );
}
