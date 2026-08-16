"use client";

import { useExperience } from "@/components/experience/ExperienceContext";
import { getScroll } from "@/lib/scrollStore";
import { useEffect, useState } from "react";

/**
 * "Scroll to explore" prompt — fades out once the visitor begins scrolling.
 * Hidden entirely in reduced-motion / 2D tier (we show it only as an aid to
 * the immersive 3D experience).
 */
export default function ScrollHint() {
  const { introComplete, tier } = useExperience();
  const [moved, setMoved] = useState(false);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      if (getScroll().progress > 0.015) setMoved(true);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (tier === "2d") return null;
  const visible = !moved && introComplete;

  return (
    <div
      aria-hidden="true"
      className={`fixed bottom-7 left-1/2 z-40 -translate-x-1/2 select-none text-center transition-opacity duration-700 UiLayer ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="tech-chip mb-2">Scroll to explore</div>
      <div className="mx-auto h-10 w-px animate-pulse bg-gradient-to-b from-white/50 to-transparent" />
    </div>
  );
}
