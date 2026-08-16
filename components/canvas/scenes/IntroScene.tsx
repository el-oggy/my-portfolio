"use client";

import { useExperience } from "@/components/experience/ExperienceContext";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { traceVertexShader, traceFragmentShader } from "../shaders/traceShader";

/**
 * "First Boot" cinematic opening (§7).
 *
 * A fullscreen quad renders the procedural circuit-trace shader: dormant →
 * a seed light pulses → traces energize in an expanding wave → a stylized
 * chip-platform begins to resolve. The quad fades out as the camera flies
 * forward into the Silicon hub, so the transition is seamless (§10).
 *
 * The crisp "Hello." + identity glyphs are DOM (IntroOverlay) — this scene
 * only handles the shader environment behind them.
 *
 * Reduced/2D tier: the full Canvas is not mounted, so this never renders.
 */
export default function IntroScene() {
  const { markIntroComplete } = useExperience();
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: {
        value: new THREE.Vector2(
          (typeof window !== "undefined" ? window.innerWidth : 1) *
            (typeof window !== "undefined" ? window.devicePixelRatio : 1),
          (typeof window !== "undefined" ? window.innerHeight : 1) *
            (typeof window !== "undefined" ? window.devicePixelRatio : 1),
        ),
      },
      uAlpha: { value: 0.0 },
      uIntensity: { value: 0.0 },
    }),
    [],
  );

  // Gate intro completion on the boot sequence (~2.6s). Real asset-loading
  // wiring lands once heavy scenes exist; for now this is the timeline.
  useEffect(() => {
    const bootMs = 2600;
    const t = window.setTimeout(markIntroComplete, bootMs);

    const onResize = () => {
      if (!matRef.current) return;
      const dpr = window.devicePixelRatio || 1;
      matRef.current.uniforms.uResolution.value.set(
        window.innerWidth * dpr,
        window.innerHeight * dpr,
      );
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, [markIntroComplete]);

  useFrame((state, delta) => {
    const mat = matRef.current;
    if (!mat) return;
    const u = mat.uniforms;

    // Advance animation clock (capped so the wave holds after it fills).
    const d = Math.min(delta, 1 / 30);
    u.uTime.value += d * 0.9;

    // Crescendo: fade the whole overlay in over ~0.4s, hold, then let the
    // camera-driven fade-out take over.
    const fadeIn = THREE.MathUtils.damp(u.uAlpha.value, 1.0, 4.0, d);
    u.uAlpha.value = fadeIn;

    // Brightness crescendo across the boot, then gentle recede by ~3s.
    const targetIntensity = u.uTime.value < 3.0 ? 1.0 : 0.7;
    u.uIntensity.value = THREE.MathUtils.damp(
      u.uIntensity.value,
      targetIntensity,
      2.5,
      d,
    );

    // Fade out as the camera travels forward into the hub: sky distance is
    // ~0 at intro (cam z≈34 hub at z=-50); fade across camera z from 34 → 14.
    const z = state.camera.position.z;
    const fadeOut = THREE.MathUtils.clamp((34 - z) / 20, 0, 1); // 0 → 1 as cam moves in
    u.uAlpha.value = Math.max(0, 1 - fadeOut);
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        transparent
        depthWrite={false}
        depthTest={false}
        uniforms={uniforms}
        vertexShader={traceVertexShader}
        fragmentShader={traceFragmentShader}
      />
    </mesh>
  );
}
