"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { sfx } from "@/lib/soundEffects";
import { projects } from "@/lib/data";
import { createSwatchTexture } from "@/lib/proceduralTextures";
import { useProgress } from "@/context/ProgressContext";

export default function StudioRoom() {
  const towerRef = useRef<THREE.Group>(null);
  const [selectedMonitor, setSelectedMonitor] = useState<number | null>(null);

  const monitorFrontTex = useMemo(() => createSwatchTexture("#0284c7"), []);
  const paintedMonitorTex = useMemo(() => createSwatchTexture("#0ea5e9", true), []);
  const tvFrontTex = useMemo(() => createSwatchTexture("#334155"), []);

  useEffect(
    () => () => [monitorFrontTex, paintedMonitorTex, tvFrontTex].forEach((texture) => texture.dispose()),
    [monitorFrontTex, paintedMonitorTex, tvFrontTex],
  );

  // Drag physics state
  const isDragging = useRef(false);
  const previousX = useRef(0);
  const dragDistance = useRef(0);
  const rotationVelocity = useRef(0.005);
  const currentRotation = useRef(0);
  const { unlock } = useProgress();

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (!(e.target instanceof HTMLCanvasElement)) return;

      isDragging.current = true;
      previousX.current = e.clientX;
      dragDistance.current = 0;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const deltaX = e.clientX - previousX.current;
      previousX.current = e.clientX;
      dragDistance.current += Math.abs(deltaX);
      rotationVelocity.current = deltaX * 0.004;
    };

    const handlePointerUp = () => {
      isDragging.current = false;
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
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

  const studioProjects = useMemo(
    () =>
      projects
        .filter((project) => STUDIO_SCENE_KEYS.has(project.scene))
        .slice(0, 6),
    []
  );

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
              onClick={(e: ThreeEvent<MouseEvent>) => {
                if (dragDistance.current > 8) return;

                e.stopPropagation();
                sfx.play("paper");
                unlock("inspect");
                setSelectedMonitor(isSelected ? null : idx);
              }}
            >
              {/* Monitor Screen Frame */}
              <mesh>
                <planeGeometry args={[1.8, 1.5]} />
                <meshBasicMaterial
                  map={
                    isSelected
                      ? paintedMonitorTex
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
              onClick={() =>
                window.open(
                  studioProjects[selectedMonitor]?.repo,
                  "_blank",
                  "noopener,noreferrer"
                )
              }
            >
              [ OPEN REPOSITORY ↗ ]
            </Text>
          )}
        </group>
      )}
    </group>
  );
}

const STUDIO_SCENE_KEYS = new Set([
  "pcb",
  "embedded",
  "firmware",
  "rtl",
  "drone",
]);
