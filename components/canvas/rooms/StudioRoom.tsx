"use client";

import { useState, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { sfx } from "@/lib/soundEffects";

interface StudioRoomProps {
  onExit: () => void;
}

export default function StudioRoom({ onExit }: StudioRoomProps) {
  const [activeScreen, setActiveScreen] = useState<"rtl" | "firmware" | "drone">("rtl");

  const [
    monitorFrontTex,
    monitorFrontPaintedTex,
    tvFrontTex,
    tvFrontPaintedTex,
    deskTex,
  ] = useTexture([
    "/textures/studio/monitor_front.webp",
    "/textures/studio/monitor_front_painted.webp",
    "/textures/studio/tv_front.webp",
    "/textures/studio/tv_front_painted.webp",
    "/textures/corridor/gorastolika.webp",
  ]);

  useEffect(() => {
    [monitorFrontTex, monitorFrontPaintedTex, tvFrontTex, tvFrontPaintedTex, deskTex].forEach((t) => {
      if (t) {
        t.colorSpace = THREE.SRGBColorSpace;
        t.needsUpdate = true;
      }
    });
  }, [monitorFrontTex, monitorFrontPaintedTex, tvFrontTex, tvFrontPaintedTex, deskTex]);

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
        ✦ THE HARDWARE STUDIO & LAB ✦
      </Text>
      <Text
        position={[0, 3.3, 0]}
        fontSize={0.2}
        color="#78716c"
        font="/fonts/CabinSketch-Regular.ttf"
        anchorX="center"
        anchorY="middle"
      >
        CLICK MONITORS TO SWITCH HARDWARE TELEMETRY
      </Text>

      {/* 3D Workbench Desk */}
      <mesh position={[0, -0.4, 0]}>
        <planeGeometry args={[10, 2.5]} />
        <meshBasicMaterial map={deskTex} transparent />
      </mesh>

      {/* Left CRT Monitor: RTL Systolic Array */}
      <MonitorScreen
        position={[-2.6, 1.4, 0]}
        title="RTL SYSTOLIC ARRAY"
        subtitle="INT8 Matrix Compute"
        tex={activeScreen === "rtl" ? monitorFrontPaintedTex : monitorFrontTex}
        isActive={activeScreen === "rtl"}
        onClick={() => {
          sfx.play("paper");
          setActiveScreen("rtl");
        }}
      />

      {/* Center Oscilloscope / TV Screen: Hexacopter Telemetry */}
      <MonitorScreen
        position={[0, 1.6, 0.2]}
        title="STM32 HEXACOPTER"
        subtitle="6-Axis IMU Sensor Fusion"
        tex={activeScreen === "drone" ? tvFrontPaintedTex : tvFrontTex}
        isActive={activeScreen === "drone"}
        scale={1.2}
        onClick={() => {
          sfx.play("paper");
          setActiveScreen("drone");
        }}
      />

      {/* Right Monitor: Firmware & RTOS */}
      <MonitorScreen
        position={[2.6, 1.4, 0]}
        title="ZEPHYR RTOS"
        subtitle="DMA & NVIC Registers"
        tex={activeScreen === "firmware" ? monitorFrontPaintedTex : monitorFrontTex}
        isActive={activeScreen === "firmware"}
        onClick={() => {
          sfx.play("paper");
          setActiveScreen("firmware");
        }}
      />
    </group>
  );
}

function MonitorScreen({
  position,
  title,
  subtitle,
  tex,
  isActive,
  scale = 1,
  onClick,
}: any) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const d = THREE.MathUtils.clamp(delta, 0, 1 / 30);
    const targetScale = (hovered || isActive) ? scale * 1.05 : scale;
    meshRef.current.scale.setScalar(
      THREE.MathUtils.damp(meshRef.current.scale.x, targetScale, 8, d)
    );
  });

  return (
    <group
      position={position}
      ref={meshRef}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh>
        <planeGeometry args={[2.4, 2.2]} />
        <meshBasicMaterial map={tex} transparent />
      </mesh>

      <Text
        position={[0, 0.3, 0.05]}
        fontSize={0.18}
        color="#1a1917"
        font="/fonts/CabinSketch-Bold.ttf"
        anchorX="center"
        anchorY="middle"
      >
        {title}
      </Text>
      <Text
        position={[0, -0.1, 0.05]}
        fontSize={0.13}
        color="#0284c7"
        font="/fonts/CabinSketch-Regular.ttf"
        anchorX="center"
        anchorY="middle"
      >
        {subtitle}
      </Text>
      <Text
        position={[0, -0.6, 0.05]}
        fontSize={0.12}
        color={isActive ? "#16a34a" : "#78716c"}
        font="/fonts/CabinSketch-Bold.ttf"
        anchorX="center"
        anchorY="middle"
      >
        {isActive ? "● ACTIVE SIGNAL" : "TOUCH TO ACTIVATE"}
      </Text>
    </group>
  );
}
