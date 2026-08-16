"use client";

import { useExperience } from "@/components/experience/ExperienceContext";
import { useEffect, useRef } from "react";
import { identity } from "@/lib/data";

/**
 * The "Hello." + identity reveal overlay (§8, §9).
 *
 * Deliberately DOM, not WebGL (§6): the glyphs are crisp, accessible, and
 * crawlable. The reveal is a GSAP-driven opacity/scale/light sequence gated
 * on `introComplete` — elegant, system-initialization in feel: subtle opacity,
 * slight scale, no bounce, no typewriter (§8).
 *
 * The whole overlay fades out as the visitor scrolls past `silicon` hub so the
 * transition into the world reads as seamless (§10).
 */
export default function IntroOverlay() {
  const { introComplete, tier } = useExperience();
  const rootRef = useRef<HTMLDivElement>(null);

  // Reveal animation once the First-Boot sequence completes.
  useEffect(() => {
    if (!introComplete || !rootRef.current) return;
    const root = rootRef.current;
    let raf = 0;

    // Lightweight manual timeline (no GSAP needed for a 3-element reveal):
    // staggered opacity + translateY + scale, all via requestAnimationFrame.
    const start = performance.now();
    const elems = Array.from(
      root.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    elems.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(14px) scale(0.985)";
    });

    const ease = (t: number) => 1 - Math.pow(1 - t, 3); // easeOutCubic

    const tick = (now: number) => {
      const t = (now - start) / 1000;
      elems.forEach((el, i) => {
        const delay = i * 0.22;
        const local = Math.min(1, Math.max(0, (t - delay) / 0.9));
        const e = ease(local);
        el.style.opacity = String(e);
        el.style.transform = `translateY(${14 * (1 - e)}px) scale(${0.985 + 0.015 * e})`;
      });
      if (t < elems.length * 0.22 + 1.0) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [introComplete]);

  // Scroll-fade the whole overlay out once the visitor enters the hub.
  useEffect(() => {
    if (tier === "2d") return; // keep visible in 2D fallback
    const root = rootRef.current;
    if (!root) return;
    const raf = 0;
    const onScroll = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      // Fade across the first ~0.6 vh of scroll.
      const fade = Math.min(1, y / (vh * 0.6));
      root.style.opacity = String(1 - fade);
      root.style.pointerEvents = fade > 0.9 ? "none" : "auto";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [tier]);

  // Hidden until the intro completes (avoids a flash before the boot sequence).
  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center UiLayer"
      style={{ opacity: introComplete ? 1 : 0, transition: "opacity 0.4s ease" }}
      aria-hidden={!introComplete}
    >
      <div className="px-6 text-center">
        <span className="tech-chip" data-reveal>
          First Boot
        </span>
        <h1
          data-reveal
          className="mt-6 font-[family-name:var(--font-display)] text-7xl font-light leading-[0.95] tracking-tight sm:text-8xl"
          style={{ color: "var(--text)" }}
        >
          Hello.
        </h1>
        <p
          data-reveal
          className="mt-8 text-2xl font-medium text-[var(--text)] sm:text-3xl"
        >
          {identity.name}
        </p>
        <p
          data-reveal
          className="mt-3 font-[family-name:var(--font-mono)] text-sm tracking-[0.2em] text-[var(--text-dim)]"
        >
          {identity.titleLine1} · {identity.titleLine2}
        </p>
        <p
          data-reveal
          className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-[var(--text-dim)]"
        >
          {identity.supportingLine}
        </p>
      </div>
    </div>
  );
}
