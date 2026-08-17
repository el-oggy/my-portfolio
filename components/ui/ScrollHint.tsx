"use client";

import { useExperience } from "@/components/experience/ExperienceContext";
import { getScroll } from "@/lib/scrollStore";
import { useEffect, useState } from "react";

export default function ScrollHint() {
  const { introComplete, tier } = useExperience();
  const [moved, setMoved] = useState(false);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      if (getScroll().progress > 0.02) setMoved(true);
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
      className={`fixed bottom-6 left-1/2 z-40 -translate-x-1/2 select-none text-center transition-all duration-500 UiLayer ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <div className="sketch-btn py-1.5 px-4 text-xs font-hand bg-white">
        <span>scroll down</span>
        <span className="animate-bounce inline-block">↓</span>
      </div>
    </div>
  );
}
