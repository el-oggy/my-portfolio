"use client";

import { useExperience } from "@/components/experience/ExperienceContext";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

import { tearVertexShader, tearFragmentShader } from "../shaders/tearShader";

export default function IntroScene() {
  const { markIntroComplete } = useExperience();
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const [isComplete, setIsComplete] = useState(false);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: {
        value: new THREE.Vector2(
          typeof window !== "undefined" ? window.innerWidth : 1,
          typeof window !== "undefined" ? window.innerHeight : 1,
        ),
      },
    }),
    [],
  );

  useFrame((state, delta) => {
    if (isComplete) return;
    
    const mat = matRef.current;
    if (!mat) return;
    
    // Add an initial delay of ~0.5s before tearing
    const delay = 0.5;
    const t = state.clock.elapsedTime;
    
    if (t > delay) {
      // Tear lasts ~1.5s
      const tearProgress = (t - delay) / 1.5;
      mat.uniforms.uTime.value = THREE.MathUtils.clamp(tearProgress, 0, 1.2);
      
      // When the tear is wide open, complete intro and unmount
      if (tearProgress > 1.2) {
        setIsComplete(true);
        markIntroComplete();
      }
    }
  });

  if (isComplete) return null;

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        transparent
        depthWrite={false}
        depthTest={false}
        uniforms={uniforms}
        vertexShader={tearVertexShader}
        fragmentShader={tearFragmentShader}
      />
    </mesh>
  );
}
