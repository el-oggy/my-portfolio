"use client";

import { useEffect, useState } from "react";

/**
 * Device-capability assessment (client-only). Drives the fallback branching:
 *  - prefers-reduced-motion  → force 2D mode (§32)
 *  - no WebGL                → force 2D mode (§30)
 *  - mobile / low cores      → reduced 3D (§28)
 *
 * Computed once on mount; never re-runs (a flip mid-session is too disruptive).
 * SSR-safe: returns optimistic defaults until the effect runs.
 */

export interface Capability {
  ready: boolean;
  webglAvailable: boolean;
  isMobile: boolean;
  isTouch: boolean;
  deviceMemoryGB?: number;
  hardwareCores?: number;
  reducedMotion: boolean;
  /** "3d" | "reduced" | "2d" — the experience tier actually mounted. */
  tier: ExperienceTier;
}

export type ExperienceTier = "3d" | "reduced" | "2d";

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    return !!gl && typeof gl !== "string";
  } catch {
    return false;
  }
}

interface PerformanceNavigator extends Navigator {
  deviceMemory?: number;
}

const MOBILE_RE =
  /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Windows Phone|Mobile/i;

export function useCapability(): Capability {
  const [cap, setCap] = useState<Capability>({
    ready: false,
    webglAvailable: true,
    isMobile: false,
    isTouch: false,
    reducedMotion: false,
    tier: "3d",
  });

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const webglAvailable = detectWebGL();
    const ua = navigator.userAgent || "";
    const isMobile = MOBILE_RE.test(ua) || Math.min(window.innerWidth, 768) <= 768;
    const isTouch =
      "ontouchstart" in window || (navigator.maxTouchPoints ?? 0) > 0;

    // Coarse hardware heuristic: few logical cores → reduced tier.
    const performanceNavigator = navigator as PerformanceNavigator;
    const cores = performanceNavigator.hardwareConcurrency;
    const deviceMemoryGB = performanceNavigator.deviceMemory;
    const lowCores = typeof cores === "number" && cores <= 4;
    const lowMemory =
      typeof deviceMemoryGB === "number" && deviceMemoryGB > 0 && deviceMemoryGB <= 4;

    let tier: ExperienceTier = "3d";
    if (reducedMotion || !webglAvailable) {
      tier = "2d";
    } else if (isMobile || lowCores || lowMemory) {
      tier = "reduced";
    }

    setCap({
      ready: true,
      webglAvailable,
      isMobile,
      isTouch,
      deviceMemoryGB,
      hardwareCores: cores,
      reducedMotion,
      tier,
    });
  }, []);

  return cap;
}
