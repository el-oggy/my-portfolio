"use client";

import { useExperience } from "@/components/experience/ExperienceContext";
import { useEffect, useRef } from "react";
import { identity } from "@/lib/data";

/**
 * Hand-Drawn Sketchbook Hero Overlay (itomdev.com style)
 *
 * Features:
 * - Hand-drawn greeting with doodle star
 * - Sticky note with engineer badge
 * - Handwritten annotations with scribble arrows
 * - Tactile sketched card
 */
export default function IntroOverlay() {
  const { introComplete, tier } = useExperience();
  const rootRef = useRef<HTMLDivElement>(null);

  // Scroll-fade out as the user walks down the corridor
  useEffect(() => {
    if (tier === "2d") return;
    const root = rootRef.current;
    if (!root) return;
    const onScroll = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      const fade = Math.min(1, y / (vh * 0.5));
      root.style.opacity = String(1 - fade);
      root.style.pointerEvents = fade > 0.8 ? "none" : "auto";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [tier]);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center UiLayer px-4"
      style={{
        opacity: introComplete ? 1 : 0,
        transition: "opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      aria-hidden={!introComplete}
    >
      <div className="relative max-w-2xl w-full">
        {/* Yellow sticky note top right */}
        <div className="absolute -top-12 -right-4 sm:-right-8 sticky-note hidden sm:block z-10">
          <span>⚡ Embedded & IoT</span>
          <div className="text-xs text-[var(--ink-faint)] font-mono mt-0.5">2024–2026 Builds</div>
        </div>

        {/* Main Sketch Hero Card */}
        <div className="sketch-card p-8 sm:p-12 text-center pointer-events-auto">
          {/* Top Tape */}
          <div className="sketch-tape" />

          {/* Small hand-drawn header note */}
          <div className="font-hand text-sm text-[var(--ink-dim)] flex items-center justify-center gap-2 mb-3">
            <span>✦</span>
            <span>interactive hardware sketchbook</span>
            <span>✦</span>
          </div>

          {/* Big Handcrafted Title */}
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-[var(--ink)] leading-none">
            {identity.firstName}{" "}
            <span className="font-hand font-normal text-4xl sm:text-6xl text-[var(--accent-drone)] underline decoration-wavy decoration-2">
              Swarup
            </span>
          </h1>

          {/* Handwritten Arrow & Role Annotation */}
          <div className="mt-4 flex items-center justify-center gap-2 font-caveat text-2xl text-[var(--ink-dim)]">
            <span>Electronics Engineer</span>
            <span className="text-3xl text-[var(--accent-pcb)]">↳</span>
            <span className="font-mono text-xs uppercase tracking-wider bg-[var(--bg-paper-warm)] px-2 py-1 border border-[var(--pencil-line)] rounded">
              Embedded · IoT · Robotics
            </span>
          </div>

          {/* Supporting line */}
          <p className="mt-6 text-base sm:text-lg text-[var(--ink-dim)] max-w-lg mx-auto leading-relaxed">
            {identity.supportingLine}
          </p>

          {/* Quick interactive tags */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <span className="sketch-tag">STM32 Hexacopter</span>
            <span className="sketch-tag">KiCad PCBs</span>
            <span className="sketch-tag">ESP32 IoT</span>
            <span className="sketch-tag">Custom Firmware</span>
          </div>

          {/* Bottom hand-drawn scroll invitation */}
          <div className="mt-8 pt-4 border-t-2 border-dashed border-[var(--pencil-line)]/20 flex items-center justify-center gap-3 font-hand text-sm text-[var(--ink-dim)]">
            <span>Scroll down to walk the corridor</span>
            <span className="text-xl animate-bounce">↴</span>
          </div>
        </div>
      </div>
    </div>
  );
}
