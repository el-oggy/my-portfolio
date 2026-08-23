"use client";

import { useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";

import { SCENES, SceneDef } from "@/lib/sceneConfig";
import { createFrameQuoteTexture, createFrameVlsiTexture } from "@/lib/proceduralTextures";

const QUOTES = [
  { title: "Daily Thought", body: "The best way to predict the future is to invent it." },
  { title: "Engineering", body: "Simplicity is the ultimate sophistication. Keep your circuits clean." },
  { title: "Innovation", body: "Any sufficiently advanced technology is indistinguishable from magic." },
  { title: "Perseverance", body: "It's not that I'm so smart, it's just that I stay with problems longer." },
  { title: "Design", body: "Good design is obvious. Great design is transparent." },
  { title: "Learning", body: "The important thing is not to stop questioning. Curiosity has its own reason." },
  { title: "Craftsmanship", body: "First, solve the problem. Then, write the code. Then, tape out the silicon." },
  { title: "Vision", body: "The chip does not care about your deadline. It cares about your timing closure." },
  { title: "Discipline", body: "Premature optimization is the root of all evil — but premature tapeout is worse." },
  { title: "Passion", body: "Engineers like to solve problems. If there are no problems available, they will create their own." },
];

const VLSI_DIAGRAMS = ["nand", "xor", "dff", "adder", "mosfet", "clock", "fsm"];

function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

interface FrameDef {
  side: "left" | "right";
  z: number;
  type: "quote" | "vlsi";
  index: number;
}

function PhotoFrame({ def }: { def: FrameDef }) {
  const x = def.side === "left" ? -20 : 20;
  const rotationY = def.side === "left" ? Math.PI / 2 : -Math.PI / 2;
  const dayOfYear = getDayOfYear();
  const quoteIndex = (dayOfYear + def.index) % QUOTES.length;
  const diagramIndex = def.index % VLSI_DIAGRAMS.length;

  const texture = useMemo(
    () =>
      def.type === "quote"
        ? createFrameQuoteTexture(QUOTES[quoteIndex].title, QUOTES[quoteIndex].body)
        : createFrameVlsiTexture(VLSI_DIAGRAMS[diagramIndex]),
    [def.type, quoteIndex, diagramIndex],
  );

  return (
    <group position={[x, 10, def.z]} rotation-y={rotationY}>
      {/* Dark wooden frame */}
      <mesh position={[0, 0, -0.06]}>
        <planeGeometry args={[7.6, 5.8]} />
        <meshStandardMaterial color="#292524" roughness={0.85} />
      </mesh>
      {/* Inner gold trim */}
      <mesh position={[0, 0, -0.03]}>
        <planeGeometry args={[7.1, 5.3]} />
        <meshStandardMaterial color="#b45309" roughness={0.7} />
      </mesh>
      {/* Content texture */}
      <mesh>
        <planeGeometry args={[6.8, 5]} />
        <meshStandardMaterial map={texture} roughness={0.9} />
      </mesh>
    </group>
  );
}

const DOOR_ICONS: Record<string, string> = {
  pcb: "\u25A3",
  embedded: "\u2699",
  iot: "\u2609",
  drone: "\u2708",
  firmware: "{ }",
  rtl: "\u2295",
  projects: "\u25A6",
  journey: "\u27A4",
};

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
          name="iconMesh"
          position={[0, 3.4, 0.15]}
          fontSize={1.8}
          color={scene.accent || "#c2410c"}
          anchorX="center"
          anchorY="middle"
        >
          {DOOR_ICONS[scene.key] ?? "\u2699"}
        </Text>
        <Text
          name="textMesh"
          position={[0, -1.2, 0.1]}
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

      {/* Photo Frames along hallway walls */}
      {[...Array(10)].map((_, i) => {
        const side = i % 2 === 0 ? "left" : "right" as const;
        const type = i % 2 === 0 ? "quote" as const : "vlsi" as const;
        const z = -30 - i * 70;
        return <PhotoFrame key={`frame-${i}`} def={{ side, z, type, index: i }} />;
      })}

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
