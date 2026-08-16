"use client";

import { useExperience } from "@/components/experience/ExperienceContext";
import { useEffect } from "react";

/**
 * Temporary foundation-era shim: marks the intro complete shortly after mount
 * so the scroll hint + scroll-to-camera pipeline activate without the real
 * First-Boot sequence (which lands in Phase 3 and calls markIntroComplete()
 * itself). Safe to remove once IntroScene drives this state.
 */
export default function IntroAutoComplete() {
  const { markIntroComplete, tier } = useExperience();

  useEffect(() => {
    if (tier === "2d") {
      markIntroComplete();
      return;
    }
    const t = window.setTimeout(markIntroComplete, 900);
    return () => window.clearTimeout(t);
  }, [markIntroComplete, tier]);

  return null;
}
