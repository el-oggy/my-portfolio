"use client";

import { useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";

import { SCENES, SceneDef } from "@/lib/sceneConfig";

function Door({ scene }: { scene: SceneDef }) {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Position logic
  const isLeft = scene.side === "left";
  const isRight = scene.side === "right";
  // Hallway dimensions
  const width = 40;
  
  let x = 0;
  let rotationY = 0;
  
  if (isLeft) {
    x = -width / 2 + 0.1;
    rotationY = Math.PI / 2;
  } else if (isRight) {
    x = width / 2 - 0.1;
    rotationY = -Math.PI / 2;
  }

  // Animation for hover effect
  const fillAlpha = useRef(0);
  useFrame((_, delta) => {
    // Smooth damp the fill alpha on hover
    const target = hovered ? 1 : 0;
    fillAlpha.current = THREE.MathUtils.damp(fillAlpha.current, target, 10, delta);
    
    if (group.current) {
      const fillMesh = group.current.getObjectByName("fillMesh") as THREE.Mesh;
      if (fillMesh && fillMesh.material instanceof THREE.MeshStandardMaterial) {
        fillMesh.material.opacity = fillAlpha.current;
      }
      const textMesh = group.current.getObjectByName("textMesh");
      if (textMesh) {
         // Optionally scale text on hover
         const scale = 1 + (fillAlpha.current * 0.1);
         textMesh.scale.setScalar(scale);
      }
    }
  });

  if (scene.key === "intro" || scene.key === "contact") return null; // No physical doors for these yet

  return (
    <group 
      position={[x, 10, scene.zDepth]} 
      rotation-y={rotationY}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <group ref={group}>
        {/* Frame background (Sketch wireframe) */}
        <mesh>
          <planeGeometry args={[16, 10]} />
          <meshStandardMaterial color="#fdfbf7" roughness={1} />
        </mesh>
        
        {/* Frame border/outline */}
        <mesh position={[0, 0, -0.1]}>
          <planeGeometry args={[16.5, 10.5]} />
          <meshStandardMaterial color="#000000" roughness={1} />
        </mesh>

        {/* Hover Fill Color */}
        <mesh name="fillMesh" position={[0, 0, 0.05]}>
          <planeGeometry args={[16, 10]} />
          <meshStandardMaterial 
            color="#2d2b27" 
            roughness={1} 
            transparent 
            opacity={0} 
          />
        </mesh>

        {/* Content Placeholder */}
        <Text
          name="textMesh"
          position={[0, 0, 0.1]}
          fontSize={1.2}
          color={hovered ? "#ffffff" : "#000000"}
          anchorX="center"
          anchorY="middle"
        >
          {scene.label.replace(" · ", "\n")}
        </Text>
      </group>
    </group>
  );
}

export default function HallwayScene() {
  const group = useRef<THREE.Group>(null);

  const length = 1000;
  const width = 40;
  const wallHeight = 24;

  const pillars = useMemo(() => {
    const arr: number[] = [];
    for (let z = 100; z >= -800; z -= 80) {
      arr.push(z);
    }
    return arr;
  }, []);

  return (
    <group ref={group} position={[0, -5, 0]}>
      {/* Floor with Grid for Optical Flow */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow position={[0, 0, -length/2 + 50]}>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color="#f6f3eb" roughness={0.9} metalness={0.05} />
      </mesh>
      <gridHelper 
        args={[width, width * 2, "#1a1917", "#1a1917"]} 
        position={[0, 0.01, -length/2 + 50]} 
        rotation-x={0}
        scale={[1, 1, length/width]} // Stretch grid along Z to make squares
      />

      {/* Left Wall with Grid */}
      <mesh position={[-width / 2, wallHeight / 2, -length/2 + 50]} rotation-y={Math.PI / 2} receiveShadow>
        <planeGeometry args={[length, wallHeight]} />
        <meshStandardMaterial color="#fdfbf7" roughness={0.9} metalness={0.05} />
      </mesh>
      <gridHelper 
        args={[wallHeight, wallHeight * 2, "#e5e5e5", "#e5e5e5"]} 
        position={[-width / 2 + 0.01, wallHeight / 2, -length/2 + 50]} 
        rotation-z={Math.PI / 2}
        rotation-x={Math.PI / 2}
        scale={[length/wallHeight, 1, 1]} 
      />

      {/* Right Wall with Grid */}
      <mesh position={[width / 2, wallHeight / 2, -length/2 + 50]} rotation-y={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[length, wallHeight]} />
        <meshStandardMaterial color="#fdfbf7" roughness={0.9} metalness={0.05} />
      </mesh>
      <gridHelper 
        args={[wallHeight, wallHeight * 2, "#e5e5e5", "#e5e5e5"]} 
        position={[width / 2 - 0.01, wallHeight / 2, -length/2 + 50]} 
        rotation-z={Math.PI / 2}
        rotation-x={Math.PI / 2}
        scale={[length/wallHeight, 1, 1]} 
      />

      {/* Render Doors for each Scene */}
      {SCENES.map((scene) => (
        <Door key={scene.key} scene={scene} />
      ))}

      {/* Vertical Pencil Seams / Pillars along hallway */}
      {pillars.map((z, i) => (
        <group key={`seam-${i}`} position={[0, 0, z]}>
          <mesh position={[-width / 2 + 0.1, wallHeight / 2, 0]}>
            <boxGeometry args={[0.08, wallHeight, 0.08]} />
            <meshBasicMaterial color="#1a1917" />
          </mesh>
          <mesh position={[width / 2 - 0.1, wallHeight / 2, 0]}>
            <boxGeometry args={[0.08, wallHeight, 0.08]} />
            <meshBasicMaterial color="#1a1917" />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[width, 0.02, 0.05]} />
            <meshBasicMaterial color="#1a1917" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
