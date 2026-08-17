"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, useTexture, Float } from "@react-three/drei";
import * as THREE from "three";
import { experience, education } from "@/lib/data";

interface AboutRoomProps {
  onExit: () => void;
}

export default function AboutRoom({ onExit }: AboutRoomProps) {
  const balloonRef1 = useRef<THREE.Group>(null);
  const balloonRef2 = useRef<THREE.Group>(null);
  const balloonRef3 = useRef<THREE.Group>(null);

  const [
    balloonTex1,
    balloonTex2,
    balloonTex3,
    islandTex,
    awardTex,
  ] = useTexture([
    "/textures/about/JSSREDNIBALON.webp",
    "/textures/about/csssrednibalon.webp",
    "/textures/about/figmamalybalon.webp",
    "/textures/about/freelancewyspa.webp",
    "/textures/about/SOTD_painted.webp",
  ]);

  useEffect(() => {
    [balloonTex1, balloonTex2, balloonTex3, islandTex, awardTex].forEach((t) => {
      if (t) {
        t.colorSpace = THREE.SRGBColorSpace;
        t.needsUpdate = true;
      }
    });
  }, [balloonTex1, balloonTex2, balloonTex3, islandTex, awardTex]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (balloonRef1.current) {
      balloonRef1.current.position.y = 2.2 + Math.sin(t * 1.5) * 0.2;
    }
    if (balloonRef2.current) {
      balloonRef2.current.position.y = 1.8 + Math.sin(t * 1.2 + 1) * 0.25;
    }
    if (balloonRef3.current) {
      balloonRef3.current.position.y = 2.4 + Math.sin(t * 1.8 + 2) * 0.18;
    }
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
        ✦ ABOUT & ENGINEERING JOURNEY ✦
      </Text>
      <Text
        position={[0, 3.3, 0]}
        fontSize={0.2}
        color="#78716c"
        font="/fonts/CabinSketch-Regular.ttf"
        anchorX="center"
        anchorY="middle"
      >
        MILESTONES ALONG THE HARDWARE SIGNAL PATH
      </Text>

      {/* Floating Hot Air Balloons in Sky */}
      <group ref={balloonRef1} position={[-3.6, 2.2, -1]}>
        <mesh>
          <planeGeometry args={[1.6, 2.2]} />
          <meshBasicMaterial map={balloonTex1} transparent />
        </mesh>
      </group>

      <group ref={balloonRef2} position={[3.6, 1.8, -1]} scale={[-1, 1, 1]}>
        <mesh>
          <planeGeometry args={[1.5, 2.0]} />
          <meshBasicMaterial map={balloonTex2} transparent />
        </mesh>
      </group>

      <group ref={balloonRef3} position={[0, 2.4, -2]}>
        <mesh>
          <planeGeometry args={[1.2, 1.6]} />
          <meshBasicMaterial map={balloonTex3} transparent />
        </mesh>
      </group>

      {/* Center Floating Island */}
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
        <mesh position={[0, 0.6, -1]}>
          <planeGeometry args={[5.2, 2.8]} />
          <meshBasicMaterial map={islandTex} transparent />
        </mesh>
      </Float>

      {/* Milestone Story Post Cards */}
      <group position={[0, -0.6, 0]}>
        {/* Experience Post */}
        <mesh position={[-2.4, 0.4, 0]}>
          <planeGeometry args={[3.4, 2.2]} />
          <meshStandardMaterial color="#fef9c3" roughness={0.9} />
        </mesh>
        <Text
          position={[-2.4, 1.1, 0.05]}
          fontSize={0.2}
          color="#1a1917"
          font="/fonts/CabinSketch-Bold.ttf"
          anchorX="center"
          anchorY="middle"
        >
          {experience[0]?.title || "Embedded Systems"}
        </Text>
        <Text
          position={[-2.4, 0.75, 0.05]}
          fontSize={0.14}
          color="#c2410c"
          font="/fonts/CabinSketch-Bold.ttf"
          anchorX="center"
          anchorY="middle"
        >
          {experience[0]?.org} · {experience[0]?.period}
        </Text>
        <Text
          position={[-2.4, 0.2, 0.05]}
          fontSize={0.12}
          maxWidth={3.0}
          textAlign="center"
          color="#44403c"
          font="/fonts/CabinSketch-Regular.ttf"
          anchorX="center"
          anchorY="middle"
        >
          {experience[0]?.summary}
        </Text>

        {/* Education Post */}
        <mesh position={[2.4, 0.4, 0]}>
          <planeGeometry args={[3.4, 2.2]} />
          <meshStandardMaterial color="#e0f2fe" roughness={0.9} />
        </mesh>
        <Text
          position={[2.4, 1.1, 0.05]}
          fontSize={0.2}
          color="#1a1917"
          font="/fonts/CabinSketch-Bold.ttf"
          anchorX="center"
          anchorY="middle"
        >
          {education[0]?.degree || "B.Tech ETC"}
        </Text>
        <Text
          position={[2.4, 0.75, 0.05]}
          fontSize={0.14}
          color="#0284c7"
          font="/fonts/CabinSketch-Bold.ttf"
          anchorX="center"
          anchorY="middle"
        >
          {education[0]?.org} · {education[0]?.period}
        </Text>
        <Text
          position={[2.4, 0.2, 0.05]}
          fontSize={0.12}
          maxWidth={3.0}
          textAlign="center"
          color="#44403c"
          font="/fonts/CabinSketch-Regular.ttf"
          anchorX="center"
          anchorY="middle"
        >
          {`${education[0]?.degree} (${education[0]?.status} ${education[0]?.period})`}
        </Text>
      </group>
    </group>
  );
}
