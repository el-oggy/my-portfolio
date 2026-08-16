"use client";

import { useCapability } from "@/hooks/useCapability";
import { ExperienceProvider } from "./ExperienceContext";
import Experience from "@/components/canvas/Experience";
import SoundToggle from "@/components/ui/SoundToggle";
import ScrollHint from "@/components/ui/ScrollHint";
import IntroOverlay from "@/components/ui/IntroOverlay";
import { useEffect } from "react";
import { initScroll, teardownScroll } from "@/lib/gsap";

/**
 * Top-level orchestration:
 *   capability (SSR-safe) → tier → ExperienceProvider(tier) → mount the right
 *   visual experience (3D canvas vs. 2D fallback) above semantic DOM content.
 *
 * Children = the page's semantic DOM scroll skeleton (always rendered, for
 * SEO/accessibility). The canvas is enhancement layered *behind* it at -z-10.
 */
export default function ExperienceRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  const cap = useCapability();

  // Initialize scroll driver once capability is resolved + we're mounted client.
  useEffect(() => {
    if (!cap.ready) return;
    initScroll();
    return () => teardownScroll();
  }, [cap.ready]);

  const show3D = cap.ready && cap.tier !== "2d";

  return (
    <ExperienceProvider tier={cap.ready ? cap.tier : "3d"}>
      {/* 3D world (enhancement) — sits behind DOM at -z-10. */}
      {show3D && (
        <Experience reducedParallax={cap.tier === "reduced"} />
      )}

      {/* Semantic DOM content: always present (SEO/a11y/2D fallback). */}
      <div className="UiLayer">
        {children}
      </div>

      {/* Intro reveal overlay — layered above content for the 3D tier only. */}
      {show3D && <IntroOverlay />}

      {/* Persistent UI (non-decorative controls always reachable). */}
      <ScrollHint />
      <SoundToggle />
    </ExperienceProvider>
  );
}
