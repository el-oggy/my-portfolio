"use client";

import { Text, useTexture } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";
import { identity, links } from "@/lib/data";

interface ContactRoomProps {
  onExit: () => void;
}

export default function ContactRoom({ onExit }: ContactRoomProps) {
  const [plantTex] = useTexture([
    "/textures/corridor/drzewkowdoniczce.webp",
  ]);

  useEffect(() => {
    if (plantTex) {
      plantTex.colorSpace = THREE.SRGBColorSpace;
      plantTex.needsUpdate = true;
    }
  }, [plantTex]);

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
        LET&apos;S BUILD HARDWARE TOGETHER
      </Text>

      {/* Main 3D Notice Board Letter */}
      <group position={[0, 1.2, 0]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[5.2, 3.6]} />
          <meshStandardMaterial color="#fef9c3" roughness={0.9} />
        </mesh>

        <Text
          position={[0, 1.2, 0.05]}
          fontSize={0.26}
          color="#1a1917"
          font="/fonts/CabinSketch-Bold.ttf"
          anchorX="center"
          anchorY="middle"
        >
          {identity.name}
        </Text>
        <Text
          position={[0, 0.8, 0.05]}
          fontSize={0.16}
          color="#c2410c"
          font="/fonts/CabinSketch-Bold.ttf"
          anchorX="center"
          anchorY="middle"
        >
          {identity.location} · {links.email}
        </Text>
        <Text
          position={[0, 0.2, 0.05]}
          fontSize={0.15}
          maxWidth={4.4}
          textAlign="center"
          color="#44403c"
          font="/fonts/CabinSketch-Regular.ttf"
          anchorX="center"
          anchorY="middle"
        >
          {identity.supportingLine}
        </Text>

        {/* Link Buttons rendered on the board */}
        <Text
          position={[-1.4, -0.6, 0.05]}
          fontSize={0.18}
          color="#0284c7"
          font="/fonts/CabinSketch-Bold.ttf"
          anchorX="center"
          anchorY="middle"
          onClick={() => window.open(links.github, "_blank")}
        >
          [ GITHUB ↗ ]
        </Text>
        <Text
          position={[0, -0.6, 0.05]}
          fontSize={0.18}
          color="#059669"
          font="/fonts/CabinSketch-Bold.ttf"
          anchorX="center"
          anchorY="middle"
          onClick={() => window.open(links.linkedin, "_blank")}
        >
          [ LINKEDIN ↗ ]
        </Text>
        <Text
          position={[1.4, -0.6, 0.05]}
          fontSize={0.18}
          color="#7c3aed"
          font="/fonts/CabinSketch-Bold.ttf"
          anchorX="center"
          anchorY="middle"
          onClick={() => window.open(links.resume, "_blank")}
        >
          [ RÉSUMÉ PDF ↗ ]
        </Text>

        <Text
          position={[0, -1.2, 0.05]}
          fontSize={0.18}
          color="#ea580c"
          font="/fonts/CabinSketch-Bold.ttf"
          anchorX="center"
          anchorY="middle"
          onClick={() => window.location.href = `mailto:${links.email}`}
        >
          ✉ CLICK TO SEND DIRECT EMAIL ➔
        </Text>
      </group>

      {/* Decorative Potted Tree beside Board */}
      <mesh position={[-3.6, 0.9, 0.2]}>
        <planeGeometry args={[1.6, 2.4]} />
        <meshBasicMaterial map={plantTex} transparent />
      </mesh>
    </group>
  );
}
