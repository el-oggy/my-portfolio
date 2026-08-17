"use client";

import { useExperience } from "@/components/experience/ExperienceContext";
import { useEffect } from "react";

export default function IntroScene() {
  const { markIntroComplete } = useExperience();

  useEffect(() => {
    const bootMs = 1500; // Shorter boot for the minimal theme
    const t = window.setTimeout(markIntroComplete, bootMs);
    return () => window.clearTimeout(t);
  }, [markIntroComplete]);

  // Phase 3 will add the paper-tear GLSL shader here.
  // For now, it's just a transparent block that lets the light background show.
  return null;
}
