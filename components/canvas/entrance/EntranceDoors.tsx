"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text, useTexture } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { sfx } from "@/lib/soundEffects";

interface EntranceDoorsProps {
  position?: [number, number, number];
  onComplete: () => void;
}

export default function EntranceDoors({
  position = [0, 0, 22],
  onComplete,
}: EntranceDoorsProps) {
  const { camera } = useThree();
  const leftDoorRef = useRef<THREE.Group>(null);
  const rightDoorRef = useRef<THREE.Group>(null);
  const signRef = useRef<THREE.Group>(null);
  const catRef = useRef<THREE.Mesh>(null);

  const [hovered, setHovered] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  // Load authentic hand-drawn textures
  const [
    doorLeftTex,
    doorRightTex,
    brickTex,
    signTex,
    treeTex,
    catBodyTex,
    catBlinkTex,
    floorTex,
  ] = useTexture([
    "/textures/corridor/doors/doorrleft.webp",
    "/textures/corridor/doors/dorright.webp",
    "/textures/entrance/bricks.webp",
    "/textures/entrance/sign.webp",
    "/textures/entrance/tree_sketch.webp",
    "/textures/entrance/cat_front_body.webp",
    "/textures/entrance/cat_blink.webp",
    "/textures/corridor/kawalekpodlogi.webp",
  ]);

  useEffect(() => {
    [doorLeftTex, doorRightTex, brickTex, signTex, treeTex, catBodyTex, catBlinkTex, floorTex].forEach(
      (t) => {
        if (t) {
          t.colorSpace = THREE.SRGBColorSpace;
          t.needsUpdate = true;
        }
      }
    );
    if (brickTex) {
      brickTex.wrapS = brickTex.wrapT = THREE.RepeatWrapping;
      brickTex.repeat.set(4, 2);
    }
    if (floorTex) {
      floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
      floorTex.repeat.set(4, 4);
    }
  }, [doorLeftTex, doorRightTex, brickTex, signTex, treeTex, catBodyTex, catBlinkTex, floorTex]);

  const doorWidth = 2.2;
  const doorHeight = 4.2;

  const handlePointerOver = useCallback(() => {
    if (!hovered && !isOpening) {
      setHovered(true);
      sfx.play("hoverDoor");
    }
  }, [hovered, isOpening]);

  const handleEnter = useCallback(() => {
    if (isOpening) return;
    setIsOpening(true);
    sfx.play("openDoor");

    const timeline = gsap.timeline({
      onComplete: () => {
        onComplete();
      },
    });

    // 1. Swing authentic hand-drawn doors open
    if (leftDoorRef.current && rightDoorRef.current) {
      timeline.to(
        leftDoorRef.current.rotation,
        {
          y: -Math.PI * 0.55,
          duration: 1.2,
          ease: "power2.inOut",
        },
        0
      );
      timeline.to(
        rightDoorRef.current.rotation,
        {
          y: Math.PI * 0.55,
          duration: 1.2,
          ease: "power2.inOut",
        },
        0
      );
    }

    // 2. Animate sign upwards
    if (signRef.current) {
      timeline.to(
        signRef.current.position,
        {
          y: 7,
          opacity: 0,
          duration: 0.8,
          ease: "power2.in",
        },
        0
      );
    }

    // 3. Fly camera straight through doorway into the corridor
    timeline.to(
      camera.position,
      {
        x: 0,
        y: 1.8,
        z: 8,
        duration: 1.8,
        ease: "power3.inOut",
      },
      0.2
    );
  }, [isOpening, camera, onComplete]);

  // Cat blinking & sign floating animation
  const blinkTimer = useRef(0);
  const [catBlinking, setCatBlinking] = useState(false);

  useFrame((state, delta) => {
    if (!isOpening && signRef.current) {
      const t = state.clock.elapsedTime;
      signRef.current.position.y = 3.6 + Math.sin(t * 2.2) * 0.08;
    }

    // Random cat blink
    blinkTimer.current += delta;
    if (blinkTimer.current > 3.0) {
      setCatBlinking(true);
      if (blinkTimer.current > 3.2) {
        setCatBlinking(false);
        blinkTimer.current = 0;
      }
    }
  });

  return (
    <group position={position}>
      {/* Full-width Entrance Ground Pavement */}
      <mesh position={[0, 0, 4]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[45, 15]} />
        <meshStandardMaterial map={floorTex} roughness={0.9} />
      </mesh>

      {/* Massive Full-Screen Brick Building Facade */}
      <mesh position={[-15, 3.5, -0.2]}>
        <planeGeometry args={[25, 10]} />
        <meshBasicMaterial map={brickTex} transparent />
      </mesh>
      <mesh position={[15, 3.5, -0.2]}>
        <planeGeometry args={[25, 10]} />
        <meshBasicMaterial map={brickTex} transparent />
      </mesh>
      <mesh position={[0, 6.5, -0.2]}>
        <planeGeometry args={[8, 4]} />
        <meshBasicMaterial map={brickTex} transparent />
      </mesh>

      {/* Hand-Drawn Trees on Left & Right */}
      <mesh position={[-7.5, 3.2, 0.1]}>
        <planeGeometry args={[4.5, 7.0]} />
        <meshBasicMaterial map={treeTex} transparent />
      </mesh>
      <mesh position={[7.5, 3.2, 0.1]} scale={[-1, 1, 1]}>
        <planeGeometry args={[4.5, 7.0]} />
        <meshBasicMaterial map={treeTex} transparent />
      </mesh>

      {/* Cute Hand-Drawn Cat on Right */}
      <mesh ref={catRef} position={[3.4, 0.9, 0.1]}>
        <planeGeometry args={[1.5, 1.8]} />
        <meshBasicMaterial
          map={catBlinking ? catBlinkTex : catBodyTex}
          transparent
        />
      </mesh>

      {/* Outer Door Wooden Frame */}
      <mesh position={[0, 2.1, -0.05]}>
        <planeGeometry args={[doorWidth * 2 + 0.3, doorHeight + 0.3]} />
        <meshBasicMaterial color="#1a1917" />
      </mesh>

      {/* Left Door (Authentic Hand-Drawn Texture) */}
      <group
        ref={leftDoorRef}
        position={[-doorWidth, 0, 0]}
        onClick={handleEnter}
        onPointerOver={handlePointerOver}
        onPointerOut={() => setHovered(false)}
      >
        <mesh position={[doorWidth / 2, 2.1, 0]}>
          <planeGeometry args={[doorWidth, doorHeight]} />
          <meshStandardMaterial
            map={doorLeftTex}
            transparent
            roughness={0.8}
            metalness={0.05}
          />
        </mesh>
      </group>

      {/* Right Door (Authentic Hand-Drawn Texture) */}
      <group
        ref={rightDoorRef}
        position={[doorWidth, 0, 0]}
        onClick={handleEnter}
        onPointerOver={handlePointerOver}
        onPointerOut={() => setHovered(false)}
      >
        <mesh position={[-doorWidth / 2, 2.1, 0]}>
          <planeGeometry args={[doorWidth, doorHeight]} />
          <meshStandardMaterial
            map={doorRightTex}
            transparent
            roughness={0.8}
            metalness={0.05}
          />
        </mesh>
      </group>

      {/* Hanging Hand-Drawn Wooden Sign */}
      <group
        ref={signRef}
        position={[0, 3.6, 0.4]}
        onClick={handleEnter}
        onPointerOver={handlePointerOver}
        onPointerOut={() => setHovered(false)}
      >
        <mesh>
          <planeGeometry args={[3.8, 1.6]} />
          <meshBasicMaterial map={signTex} transparent />
        </mesh>

        <Text
          position={[0, 0.25, 0.05]}
          fontSize={0.24}
          color="#1a1917"
          font="/fonts/CabinSketch-Bold.ttf"
          anchorX="center"
          anchorY="middle"
        >
          ADARSH MAHARANA
        </Text>
        <Text
          position={[0, -0.05, 0.05]}
          fontSize={0.15}
          color="#57534e"
          font="/fonts/CabinSketch-Regular.ttf"
          anchorX="center"
          anchorY="middle"
        >
          VLSI · EMBEDDED · HARDWARE
        </Text>
        <Text
          position={[0, -0.38, 0.05]}
          fontSize={0.2}
          color={hovered ? "#c2410c" : "#1c1917"}
          font="/fonts/CabinSketch-Bold.ttf"
          anchorX="center"
          anchorY="middle"
        >
          {hovered ? "✦ CLICK TO ENTER! ✦" : "CLICK DOORS TO OPEN ➔"}
        </Text>
      </group>
    </group>
  );
}
