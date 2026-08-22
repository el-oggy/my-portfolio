"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Float } from "@react-three/drei";
import * as THREE from "three";
import { experience, education } from "@/lib/data";

function Balloon({ color, scale = 1 }: { color: string; scale?: number }) {
  return (
    <group scale={scale}>
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.62, 20, 24]} />
        <meshStandardMaterial color={color} roughness={0.65} />
      </mesh>
      <mesh position={[0, -0.12, 0]}>
        <coneGeometry args={[0.16, 0.22, 12]} />
        <meshStandardMaterial color="#1a1917" />
      </mesh>
      {[-0.14, 0.14].map((x) => (
        <mesh key={x} position={[x, -0.38, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.42, 5]} />
          <meshBasicMaterial color="#44403c" />
        </mesh>
      ))}
      <mesh position={[0, -0.64, 0]}>
        <boxGeometry args={[0.4, 0.28, 0.32]} />
        <meshStandardMaterial color="#a16207" roughness={0.8} />
      </mesh>
    </group>
  );
}

export default function AboutRoom() {
  const balloonRef1 = useRef<THREE.Group>(null);
  const balloonRef2 = useRef<THREE.Group>(null);
  const balloonRef3 = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (balloonRef1.current) balloonRef1.current.position.y = 2.2 + Math.sin(time * 1.5) * 0.2;
    if (balloonRef2.current) balloonRef2.current.position.y = 1.8 + Math.sin(time * 1.2 + 1) * 0.25;
    if (balloonRef3.current) balloonRef3.current.position.y = 2.5 + Math.sin(time * 1.8 + 2) * 0.18;
  });

  return (
    <group position={[0, 0, -4]}>
      <Text position={[0, 3.8, 0]} fontSize={0.4} color="#1a1917" anchorX="center" anchorY="middle">
        ✦ ABOUT & ENGINEERING JOURNEY ✦
      </Text>
      <Text position={[0, 3.3, 0]} fontSize={0.2} color="#78716c" anchorX="center" anchorY="middle">
        MILESTONES ALONG THE HARDWARE SIGNAL PATH
      </Text>

      <group ref={balloonRef1} position={[-3.6, 2.2, -1]}>
        <Balloon color="#7c3aed" />
      </group>
      <group ref={balloonRef2} position={[3.6, 1.8, -1]}>
        <Balloon color="#059669" scale={0.9} />
      </group>
      <group ref={balloonRef3} position={[0, 2.5, -2]}>
        <Balloon color="#f97316" scale={0.75} />
      </group>

      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
        <group position={[0, 0.35, -1]}>
          <mesh rotation-x={-Math.PI / 2}>
            <cylinderGeometry args={[2.4, 1.7, 0.65, 24]} />
            <meshStandardMaterial color="#a16207" roughness={0.85} flatShading />
          </mesh>
          <mesh position={[0, 0.45, 0]} rotation-x={-Math.PI / 2}>
            <circleGeometry args={[2.35, 24]} />
            <meshStandardMaterial color="#4d7c0f" roughness={0.75} />
          </mesh>
          {[
            [-1.2, 0.25],
            [0.4, -0.9],
            [1.4, 0.7],
          ].map(([x, z], index) => (
            <mesh key={`${x}-${z}`} position={[x, 0.68, z]}>
              <icosahedronGeometry args={[index === 1 ? 0.34 : 0.24, 1]} />
              <meshStandardMaterial color="#166534" flatShading />
            </mesh>
          ))}
        </group>
      </Float>

      <group position={[0, -0.6, 0]}>
        <mesh position={[-2.4, 0.4, 0]}>
          <planeGeometry args={[3.4, 2.2]} />
          <meshStandardMaterial color="#fef9c3" roughness={0.9} />
        </mesh>
        <Text position={[-2.4, 1.1, 0.05]} fontSize={0.2} color="#1a1917" anchorX="center" anchorY="middle">
          {experience[0]?.title || "Embedded Systems"}
        </Text>
        <Text position={[-2.4, 0.72, 0.05]} fontSize={0.13} color="#c2410c" maxWidth={3} textAlign="center" anchorX="center" anchorY="middle">
          {`${experience[0]?.org || ""} · ${experience[0]?.period || ""}`}
        </Text>
        <Text position={[-2.4, 0.15, 0.05]} fontSize={0.12} maxWidth={3} textAlign="center" color="#44403c" anchorX="center" anchorY="middle">
          {experience[0]?.summary}
        </Text>

        <mesh position={[2.4, 0.4, 0]}>
          <planeGeometry args={[3.4, 2.2]} />
          <meshStandardMaterial color="#e0f2fe" roughness={0.9} />
        </mesh>
        <Text position={[2.4, 1.1, 0.05]} fontSize={0.2} color="#1a1917" anchorX="center" anchorY="middle">
          {education[0]?.degree || "B.Tech ETC"}
        </Text>
        <Text position={[2.4, 0.72, 0.05]} fontSize={0.13} color="#0284c7" maxWidth={3} textAlign="center" anchorX="center" anchorY="middle">
          {`${education[0]?.org || ""} · ${education[0]?.period || ""}`}
        </Text>
        <Text position={[2.4, 0.15, 0.05]} fontSize={0.12} maxWidth={3} textAlign="center" color="#44403c" anchorX="center" anchorY="middle">
          {`${education[0]?.degree || ""} (${education[0]?.status || ""} ${education[0]?.period || ""})`}
        </Text>
      </group>
    </group>
  );
}
