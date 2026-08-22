"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { identity, links } from "@/lib/data";

export default function ContactRoom() {
  const barrelRef = useRef<THREE.Group>(null);
  const waveRef1 = useRef<THREE.Group>(null);
  const waveRef2 = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (barrelRef.current) {
      barrelRef.current.position.y = 0.8 + Math.sin(t * 2) * 0.1;
      barrelRef.current.rotation.z = Math.sin(t * 1.5) * 0.05;
    }
    if (waveRef1.current) {
      waveRef1.current.position.x = Math.sin(t * 1.2) * 0.3;
    }
    if (waveRef2.current) {
      waveRef2.current.position.x = -Math.sin(t * 1.0) * 0.4;
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
        ✦ TRANSMISSION & CONTACT ✦
      </Text>
      <Text
        position={[0, 3.3, 0]}
        fontSize={0.2}
        color="#78716c"
        font="/fonts/CabinSketch-Regular.ttf"
        anchorX="center"
        anchorY="middle"
      >
        MESSAGE IN A BOTTLE · LET&apos;S BUILD HARDWARE TOGETHER
      </Text>

      {/* 3D Barrel in Ocean Waves on Left */}
      <group position={[-2.8, 0.4, 0]}>
        <group ref={barrelRef}>
          <mesh>
            <cylinderGeometry args={[0.62, 0.62, 1.5, 20]} />
            <meshStandardMaterial color="#7f1d1d" roughness={0.72} />
          </mesh>
          {[-0.38, 0, 0.38].map((y) => (
            <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.63, 0.04, 8, 28]} />
              <meshStandardMaterial color="#57534e" metalness={0.3} roughness={0.6} />
            </mesh>
          ))}
        </group>

        {/* Animated Water Waves */}
        <group ref={waveRef1} position={[0, -0.55, 0.1]}>
          <mesh>
            <torusGeometry args={[1.35, 0.12, 8, 48]} />
            <meshStandardMaterial color="#0ea5e9" transparent opacity={0.82} />
          </mesh>
        </group>
        <group ref={waveRef2} position={[0, -0.85, 0.2]}>
          <mesh rotation-x={Math.PI / 2}>
            <torusGeometry args={[1.45, 0.09, 8, 48]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.65} />
          </mesh>
        </group>
      </group>

      {/* Main 3D Torn Paper Transmission Letter on Right */}
      <group position={[1.8, 1.1, 0]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[4.4, 3.4]} />
          <meshStandardMaterial color="#fef9c3" roughness={0.9} />
        </mesh>

        <Text
          position={[0, 1.1, 0.05]}
          fontSize={0.24}
          color="#1a1917"
          font="/fonts/CabinSketch-Bold.ttf"
          anchorX="center"
          anchorY="middle"
        >
          {identity.name}
        </Text>
        <Text
          position={[0, 0.75, 0.05]}
          fontSize={0.15}
          color="#c2410c"
          font="/fonts/CabinSketch-Bold.ttf"
          anchorX="center"
          anchorY="middle"
        >
          {identity.location} · {links.email}
        </Text>
        <Text
          position={[0, 0.2, 0.05]}
          fontSize={0.13}
          maxWidth={3.8}
          textAlign="center"
          color="#44403c"
          font="/fonts/CabinSketch-Regular.ttf"
          anchorX="center"
          anchorY="middle"
        >
          {identity.supportingLine}
        </Text>

        {/* Transmission Buttons */}
        <Text
          position={[-1.2, -0.5, 0.05]}
          fontSize={0.16}
          color="#0284c7"
          font="/fonts/CabinSketch-Bold.ttf"
          anchorX="center"
          anchorY="middle"
          onClick={() => window.open(links.github, "_blank", "noopener,noreferrer")}
        >
          [ GITHUB ↗ ]
        </Text>
        <Text
          position={[0, -0.5, 0.05]}
          fontSize={0.16}
          color="#059669"
          font="/fonts/CabinSketch-Bold.ttf"
          anchorX="center"
          anchorY="middle"
          onClick={() => window.open(links.linkedin, "_blank", "noopener,noreferrer")}
        >
          [ LINKEDIN ↗ ]
        </Text>
        <Text
          position={[1.2, -0.5, 0.05]}
          fontSize={0.16}
          color="#7c3aed"
          font="/fonts/CabinSketch-Bold.ttf"
          anchorX="center"
          anchorY="middle"
          onClick={() => window.open(links.resume, "_blank", "noopener,noreferrer")}
        >
          [ RÉSUMÉ PDF ↗ ]
        </Text>

        <Text
          position={[0, -1.1, 0.05]}
          fontSize={0.16}
          color="#ea580c"
          font="/fonts/CabinSketch-Bold.ttf"
          anchorX="center"
          anchorY="middle"
          onClick={() => (window.location.href = `mailto:${links.email}`)}
        >
          ✉ SEND DIRECT TRANSMISSION ➔
        </Text>
      </group>
    </group>
  );
}
