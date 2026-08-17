"use client";

import { useState, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, useTexture, Float } from "@react-three/drei";
import * as THREE from "three";
import { experience, education } from "@/lib/data";

interface AboutRoomProps {
  onExit: () => void;
}

export default function AboutRoom({ onExit }: AboutRoomProps) {
  const airplaneRef = useRef<THREE.Group>(null);
  const [airplaneTex, cloudTex] = useTexture([
    "/textures/corridor/decorations/paper_airplane.webp",
    "/textures/corridor/drzewkowdoniczce.webp",
  ]);

  useEffect(() => {
    [airplaneTex, cloudTex].forEach((t) => {
      if (t) {
        t.colorSpace = THREE.SRGBColorSpace;
        t.needsUpdate = true;
      }
    });
  }, [airplaneTex, cloudTex]);

  useFrame((state) => {
    if (!airplaneRef.current) return;
    const t = state.clock.elapsedTime;
    airplaneRef.current.position.y = 2.0 + Math.sin(t * 1.8) * 0.25;
    airplaneRef.current.rotation.z = Math.sin(t * 1.2) * 0.08;
    airplaneRef.current.rotation.y = Math.cos(t * 1.2) * 0.12;
  });

  return (
    <group position={[0, 0, -4]}>
      {/* Header */}
      <Text
        position={[0, 3.8, 0]}
        fontSize={0.4}
        color="#1a1917"
        font="/fonts/CabinSketch-Bold.ttf"
        anchorX="center"
        anchorY="middle"
      >
        ✦ ENGINEERING FLIGHT & JOURNEY ✦
      </Text>
      <Text
        position={[0, 3.3, 0]}
        fontSize={0.2}
        color="#78716c"
        font="/fonts/CabinSketch-Regular.ttf"
        anchorX="center"
        anchorY="middle"
      >
        MILESTONES ALONG THE SIGNAL PATH
      </Text>

      {/* Soaring 3D Paper Airplane */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
        <group ref={airplaneRef} position={[0, 2.0, 0.5]}>
          <mesh>
            <planeGeometry args={[2.8, 2.2]} />
            <meshBasicMaterial map={airplaneTex} transparent />
          </mesh>
        </group>
      </Float>

      {/* Milestone Story Post: Experience & Education */}
      <group position={[0, -0.2, 0]}>
        <mesh position={[-2.4, 0.6, 0]}>
          <planeGeometry args={[3.6, 2.4]} />
          <meshStandardMaterial color="#fef9c3" roughness={0.9} />
        </mesh>
        <Text
          position={[-2.4, 1.4, 0.05]}
          fontSize={0.22}
          color="#1a1917"
          font="/fonts/CabinSketch-Bold.ttf"
          anchorX="center"
          anchorY="middle"
        >
          {experience[0]?.title || "Embedded Engineer"}
        </Text>
        <Text
          position={[-2.4, 1.0, 0.05]}
          fontSize={0.16}
          color="#c2410c"
          font="/fonts/CabinSketch-Bold.ttf"
          anchorX="center"
          anchorY="middle"
        >
          {experience[0]?.org} · {experience[0]?.period}
        </Text>
        <Text
          position={[-2.4, 0.4, 0.05]}
          fontSize={0.13}
          maxWidth={3.2}
          textAlign="center"
          color="#44403c"
          font="/fonts/CabinSketch-Regular.ttf"
          anchorX="center"
          anchorY="middle"
        >
          {experience[0]?.summary}
        </Text>

        {/* Education Story Post */}
        <mesh position={[2.4, 0.6, 0]}>
          <planeGeometry args={[3.6, 2.4]} />
          <meshStandardMaterial color="#e0f2fe" roughness={0.9} />
        </mesh>
        <Text
          position={[2.4, 1.4, 0.05]}
          fontSize={0.22}
          color="#1a1917"
          font="/fonts/CabinSketch-Bold.ttf"
          anchorX="center"
          anchorY="middle"
        >
          {education[0]?.degree || "B.Tech in ECE"}
        </Text>
        <Text
          position={[2.4, 1.0, 0.05]}
          fontSize={0.16}
          color="#0284c7"
          font="/fonts/CabinSketch-Bold.ttf"
          anchorX="center"
          anchorY="middle"
        >
          {education[0]?.org} · {education[0]?.period}
        </Text>
        <Text
          position={[2.4, 0.4, 0.05]}
          fontSize={0.13}
          maxWidth={3.2}
          textAlign="center"
          color="#44403c"
          font="/fonts/CabinSketch-Regular.ttf"
          anchorX="center"
          anchorY="middle"
        >
          {`${education[0]?.degree || "B.Tech in ETC"} (${education[0]?.status || "Expected"} ${education[0]?.period || "2027"})`}
        </Text>
      </group>
    </group>
  );
}
