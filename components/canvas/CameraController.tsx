"use client";

import { useThree, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

import { FULL_CAMERA_PATH } from "@/lib/sceneConfig";
import { getScroll } from "@/lib/scrollStore";

/**
 * Central camera authority (§44). Nothing else mutates camera position.
 *
 * The camera follows FULL_CAMERA_PATH — a globally-sorted list of absolute
 * keyframes (each carrying an absolute journey `progress` plus world-space
 * `pos`/`lookAt`). Each frame:
 *   1. Read scroll progress + velocity from the non-reactive scrollStore.
 *   2. Bracket the two path keyframes whose `progress` straddle the current
 *      scroll progress, and find the local fraction f between them.
 *   3. Smoothstep f, then lerp pos + lookAt toward the target.
 *   4. Damp the real camera toward that target for buttery motion.
 *   5. Add subtle pointer parallax (clamped) for depth — non-reactive.
 *
 * When scrollStore.paused is set (e.g. a modal lightbox is open), the camera
 * holds its current position/lookAt instead of chasing scroll, so the world
 * freezes cleanly until the modal closes.
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
    const k = FULL_CAMERA_PATH[0];
    camera.position.set(...k.pos);
    _currentLook.set(...k.lookAt);
    camera.lookAt(_currentLook);
    inited.current = true;
  }, [camera]);

  useFrame((_, delta) => {
    if (!inited.current) return;
    const s = getScroll();
    const path = FULL_CAMERA_PATH;

    // Hold still while a modal (lightbox) has paused the scroll driver.
    if (s.paused) {
      return;
    }

    const p = THREE.MathUtils.clamp(s.progress, 0, 1);

    // Bracket-search: find the two keyframes whose progress straddles `p`.
    // Path is sorted ascending and covers [0,1] (first keyframe progress 0,
    // last progress 1), so this always resolves to a valid segment.
    let i = 0;
    for (; i < path.length - 1; i++) {
      if (p < path[i + 1].progress) break;
    }
    // Clamp i into [0, len-2]; p beyond the last keyframe pinches to the end.
    if (i > path.length - 2) i = path.length - 2;
    if (i < 0) i = 0;

    const a = path[i];
    const b = path[i + 1];
    const span = b.progress - a.progress;
    const f = span > 0 ? THREE.MathUtils.clamp((p - a.progress) / span, 0, 1) : 0;

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
