"use client";

import { useRef, useEffect, useCallback, useLayoutEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { isCameraOverridden, setCameraOverride as setSharedCameraOverride } from "@/lib/cameraOverride";

export interface DoorRelativePosition {
  relZ: number;
  side: "left" | "right";
}

export const SEGMENT_DOORS: DoorRelativePosition[] = [
  { relZ: -18, side: "left" },   // Gallery (Left)
  { relZ: -32, side: "right" },  // Studio (Right)
  { relZ: -48, side: "left" },   // About (Left)
  { relZ: -62, side: "right" },  // Contact (Right)
];

export interface UseInfiniteCameraOptions {
  segmentLength?: number;
  scrollSpeed?: number;
  parallaxIntensity?: number;
  smoothing?: number;
  glanceIntensity?: number;
  scrollEnabled?: boolean;
  parallaxEnabled?: boolean;
}

export default function useInfiniteCamera({
  segmentLength = 80,
  scrollSpeed = 0.035,
  parallaxIntensity = 0.35,
  smoothing = 0.045,
  glanceIntensity = 0.18,
  scrollEnabled = true,
  parallaxEnabled = true,
}: UseInfiniteCameraOptions = {}) {
  const { camera } = useThree();

  // Camera tracking positions
  const targetZ = useRef(28);
  const currentZ = useRef(28);
  const parallax = useRef({ x: 0, y: 0 });
  const targetParallax = useRef({ x: 0, y: 0 });
  const glanceOffset = useRef(0);
  const targetGlance = useRef(0);

  // Mobile / Swipe tracking
  const touchStart = useRef({ x: 0, y: 0 });
  const swipeGlance = useRef(0);
  const targetSwipeGlance = useRef(0);

  const scrollEnabledRef = useRef(scrollEnabled);
  const parallaxEnabledRef = useRef(parallaxEnabled);
  const cameraOverride = useRef(false);
  const wrapBoundaryZ = 10 - segmentLength + 0.01;

  // Calculate glance based on approaching doors in the current repeating segment
  const calculateGlance = useCallback(
    (z: number) => {
      const segmentIndex = Math.floor((10 - z) / segmentLength);
      const segmentStartZ = 10 - segmentIndex * segmentLength;
      const relZ = z - segmentStartZ;

      let bestStrength = 0;
      let bestDir = 0;

      const START_DIST = 16;
      const PEAK_DIST = 7;
      const END_DIST = -2;

      for (const door of SEGMENT_DOORS) {
        const dist = relZ - door.relZ;

        let strength = 0;
        if (dist > PEAK_DIST && dist < START_DIST) {
          strength = (START_DIST - dist) / (START_DIST - PEAK_DIST);
        } else if (dist <= PEAK_DIST && dist > END_DIST) {
          strength = (dist - END_DIST) / (PEAK_DIST - END_DIST);
        }

        if (strength > 0) {
          const easedStrength = strength * (2 - strength);
          const dir = door.side === "left" ? -1 : 1;
          if (easedStrength > bestStrength) {
            bestStrength = easedStrength;
            bestDir = dir;
          }
        }
      }

      return bestDir * bestStrength * glanceIntensity * 3.5;
    },
    [glanceIntensity, segmentLength]
  );

  useLayoutEffect(() => {
    const wasScrollEnabled = scrollEnabledRef.current;
    scrollEnabledRef.current = scrollEnabled;
    parallaxEnabledRef.current = parallaxEnabled;

    if (scrollEnabled && !wasScrollEnabled) {
      targetZ.current = camera.position.z;
      currentZ.current = camera.position.z;
      parallax.current = { x: camera.position.x, y: camera.position.y - 1.8 };
      targetParallax.current = { x: camera.position.x, y: camera.position.y - 1.8 };
      glanceOffset.current = 0;
      targetGlance.current = 0;
    }
  }, [scrollEnabled, parallaxEnabled, camera]);

  // Wheel handling with UNBOUNDED infinite scrolling down negative Z
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!scrollEnabledRef.current) return;
      e.preventDefault();
      const delta = e.deltaY * scrollSpeed;
      // Scroll moves continuously forward down negative Z, bounded only at start (Z=12)
      targetZ.current = Math.min(12, targetZ.current - delta);
    },
    [scrollSpeed]
  );

  // Mouse parallax
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!parallaxEnabledRef.current) return;
      const normalizedX = (e.clientX / window.innerWidth) * 2 - 1;
      const normalizedY = (e.clientY / window.innerHeight) * 2 - 1;
      targetParallax.current.x = normalizedX * parallaxIntensity;
      targetParallax.current.y = -normalizedY * parallaxIntensity * 0.5;
    },
    [parallaxIntensity]
  );

  // Keyboard navigation with unbounded scrolling
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!scrollEnabledRef.current) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      const keyScrollMap: Record<string, number> = {
        ArrowDown: 80,
        ArrowUp: -80,
        PageDown: 240,
        PageUp: -240,
        " ": 120,
      };

      const delta = keyScrollMap[e.key];
      if (delta !== undefined) {
        e.preventDefault();
        targetZ.current = Math.min(12, targetZ.current - delta * scrollSpeed);
      }
    },
    [scrollSpeed]
  );

  // Touch handlers for mobile
  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStart.current.x = e.touches[0].clientX;
    touchStart.current.y = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;

      if (scrollEnabledRef.current) {
        const deltaY = (touchStart.current.y - currentY) * scrollSpeed * 1.6;
        targetZ.current = Math.min(12, targetZ.current - deltaY);
      }

      if (parallaxEnabledRef.current) {
        const deltaX = (touchStart.current.x - currentX) * 0.003;
        targetSwipeGlance.current = THREE.MathUtils.clamp(targetSwipeGlance.current + deltaX, -0.3, 0.3);
      }

      touchStart.current.x = currentX;
      touchStart.current.y = currentY;
    },
    [scrollSpeed]
  );

  useEffect(() => {
    const handleWheelPassive = (e: WheelEvent) => handleWheel(e);
    window.addEventListener("wheel", handleWheelPassive, { passive: false });
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheelPassive);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [handleWheel, handleMouseMove, handleKeyDown, handleTouchStart, handleTouchMove]);

  // Main camera update frame
  useFrame((_, delta) => {
    if (cameraOverride.current || isCameraOverridden()) return;

    const scrollActive = scrollEnabledRef.current;
    const parallaxActive = parallaxEnabledRef.current;

    if (!scrollActive && !parallaxActive) return;

    // Damp delta for tab stalls
    const d = THREE.MathUtils.clamp(delta, 0, 1 / 30);

    if (parallaxActive) {
      parallax.current.x = THREE.MathUtils.damp(parallax.current.x, targetParallax.current.x, 8, d);
      parallax.current.y = THREE.MathUtils.damp(parallax.current.y, targetParallax.current.y, 8, d);
      swipeGlance.current = THREE.MathUtils.damp(swipeGlance.current, targetSwipeGlance.current, 8, d);
    }

    if (scrollActive) {
      currentZ.current = THREE.MathUtils.damp(currentZ.current, targetZ.current, 7, d);

      if (currentZ.current <= wrapBoundaryZ) {
        currentZ.current += segmentLength;
        targetZ.current += segmentLength;
      }

      targetGlance.current = calculateGlance(currentZ.current);
      const isReleasing = Math.abs(targetGlance.current) < Math.abs(glanceOffset.current);
      const lerpSpeed = isReleasing ? 12 : 6;
      glanceOffset.current = THREE.MathUtils.damp(glanceOffset.current, targetGlance.current, lerpSpeed, d);

      camera.position.z = currentZ.current;
      camera.position.x = parallax.current.x;
      camera.position.y = 1.8 + parallax.current.y;

      const lookX = parallax.current.x * 0.3 + glanceOffset.current * 3 + swipeGlance.current * 4;
      camera.lookAt(lookX, 1.8 + parallax.current.y, currentZ.current - 10);
    } else if (parallaxActive) {
      camera.position.x = parallax.current.x;
      camera.position.y = 1.8 + parallax.current.y;
      const lookX = parallax.current.x * 0.3 + swipeGlance.current * 4;
      camera.lookAt(lookX, 1.8 + parallax.current.y, camera.position.z - 10);
    }
  });

  const setCameraOverride = useCallback((active: boolean) => {
    cameraOverride.current = active;
    setSharedCameraOverride(active);
    if (!active) {
      targetZ.current = camera.position.z;
      currentZ.current = camera.position.z;
    }
  }, [camera]);

  return {
    getCameraZ: () => currentZ.current,
    setCameraOverride,
    targetZ,
  };
}
