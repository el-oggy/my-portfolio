"use client";

import { Text } from "@react-three/drei";

export default function HeroText({ position = [0, 0.1, 0] }: { position?: [number, number, number] }) {
  return (
    <group position={position}>
      <Text fontSize={0.82} color="#1a1917" anchorX="center" anchorY="middle">
        ADARSH
      </Text>
      <Text position={[0, -0.62, 0]} fontSize={0.18} color="#78716c" anchorX="center" anchorY="middle">
        HARDWARE · FIRMWARE · CONNECTED SYSTEMS
      </Text>
    </group>
  );
}
