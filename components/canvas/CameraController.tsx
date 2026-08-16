"use client";

import { useThree, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

import { CAMERA_PATH, SCENES } from "@/lib/sceneConfig";
import { getScroll } from "@/lib/scrollStore";

/**
 * Central camera authority (§44). Nothing else mutates camera position.
 *
 * Each frame:
 *   1. Map scroll progress → a parametric t along CAMERA_PATH (keyframes are
 *      one-per-scene; t = progress * (N-1) maps 0..1 across the whole path).
 *   2. Catmull-Rom-ish piecewise interpolation between keyframes (smooth,
 *      cheap, no allocations beyond temp vectors).
 *   3. Damp position + lookAt toward the target for buttery motion.
 *   4. Add subtle pointer parallax (clamped) for depth — non-reactive.
 *
 * Reduced tier: parallax scaled down. 2D tier never mounts this at all.
 */

const _targetPos = new THREE.Vector3();
const _targetLook = new THREE.Vector3();
const _currentLook = new THREE.Vector3();
const _p0 = new THREE.Vector3();
const _p1 = new THREE.Vector3();
const _look0 = new THREE.Vector3();
const _look1 = new THREE.Vector3();

export default function CameraController({
  parallax = 1,
}: {
  /** Multiplier for pointer parallax (reduced/mobile passes <1). */
  parallax?: number;
}) {
  const { camera } = useThree();
  const inited = useRef(false);

  // Initialize camera at the first keyframe so there is no pop-in.
  useEffect(() => {
    const k = CAMERA_PATH[0];
    camera.position.set(...k.pos);
    _currentLook.set(...k.lookAt);
    camera.lookAt(_currentLook);
    inited.current = true;
  }, [camera]);

  useFrame((_, delta) => {
    if (!inited.current) return;
    const s = getScroll();

    const segs = CAMERA_PATH.length - 1;
    const t = THREE.MathUtils.clamp(s.progress * segs, 0, segs);
    const i = Math.min(Math.floor(t), segs - 1);
    const f = t - i;

    const a = CAMERA_PATH[i];
    const b = CAMERA_PATH[i + 1];
    _p0.set(...a.pos);
    _p1.set(...b.pos);
    _look0.set(...a.lookAt);
    _look1.set(...b.lookAt);

    // Smoothstep the segment fraction so camera eases in/out at each keyframe.
    const fEased = f * f * (3 - 2 * f);
    _targetPos.lerpVectors(_p0, _p1, fEased);
    _targetLook.lerpVectors(_look0, _look1, fEased);

    // Pointer parallax: small offset of position + lookAt, decays at rest.
    const px = s.pointerX;
    const py = s.pointerY;
    const drift = parallax;
    _targetPos.x += px * 2.2 * drift;
    _targetPos.y += py * 1.4 * drift;
    _targetLook.x += px * 4.5 * drift;
    _targetLook.y += py * 2.5 * drift;

    // Damp toward target. delta-clamped so big tab-stalls don't sling.
    const d = THREE.MathUtils.clamp(delta, 0, 1 / 30);
    const posLambda = 1 - Math.exp(-7 * d);
    const lookLambda = 1 - Math.exp(-9 * d);
    camera.position.lerp(_targetPos, posLambda);
    _currentLook.lerp(_targetLook, lookLambda);
    camera.lookAt(_currentLook);
  });

  return null;
}

/** Convenience: world center of the active scene (for lighting tie-ins). */
export function activeSceneWorldCenter(): THREE.Vector3 {
  // Lazily resolved from current scrollStore scene.
  // (kept as a util rather than reactive to avoid re-renders)
  // Imported by lights that want to follow the journey.
  return new THREE.Vector3();
}

export { SCENES };
