"use client";

import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { distortionVertexShader, distortionFragmentShader } from "./shaders/distortionShader";

export default function ProjectImageGL({ url, hovered }: { url: string; hovered: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const texture = useTexture(url);

  // We need lots of segments to allow the vertices to warp smoothly
  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1, 32, 32), []);

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uVelocity: { value: new THREE.Vector2(0, 0) },
      uHover: { value: 0.0 },
    }),
    [texture],
  );

  // Mouse tracking variables
  const targetMouse = useRef(new THREE.Vector2(0.5, 0.5));
  const currentMouse = useRef(new THREE.Vector2(0.5, 0.5));
  const velocity = useRef(new THREE.Vector2(0, 0));

  useFrame((state, delta) => {
    if (!matRef.current) return;
    const u = matRef.current.uniforms;

    // Smooth hover transition
    u.uHover.value = THREE.MathUtils.damp(u.uHover.value, hovered ? 1 : 0, 4, delta);

    if (hovered) {
      // state.pointer is normalized -1 to 1. Convert to 0 to 1 UV space for the shader.
      targetMouse.current.set(state.pointer.x * 0.5 + 0.5, state.pointer.y * 0.5 + 0.5);
    }

    // Calculate velocity (difference between current and target before damping)
    velocity.current.x = targetMouse.current.x - currentMouse.current.x;
    velocity.current.y = targetMouse.current.y - currentMouse.current.y;

    // Damp current mouse towards target
    currentMouse.current.x = THREE.MathUtils.damp(currentMouse.current.x, targetMouse.current.x, 8, delta);
    currentMouse.current.y = THREE.MathUtils.damp(currentMouse.current.y, targetMouse.current.y, 8, delta);

    u.uMouse.value.copy(currentMouse.current);
    u.uVelocity.value.copy(velocity.current);
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <shaderMaterial
        ref={matRef}
        vertexShader={distortionVertexShader}
        fragmentShader={distortionFragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}
