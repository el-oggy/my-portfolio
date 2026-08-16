/**
 * GSAP + ScrollTrigger + Lenis wiring.
 *
 * One Lenis instance drives smooth scrolling. One master ScrollTrigger
 * captures total journey progress → writes into the non-reactive scrollStore
 * every frame (no React renders). Section-level ScrollTriggers toggle the
 * discrete currentScene via setCurrentScene (fires only on change).
 *
 * Reduced-motion / 2D tier: Lenis is still used for buttery in-page scrolling,
 * but the progress driver is bypassed (the 2D view doesn't pilot a camera).
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

import { clamp01, sceneAtProgress } from "./sceneConfig";
import { setCurrentScene, scrollState } from "./scrollStore";

gsap.registerPlugin(ScrollTrigger);

let lenisInstance: Lenis | null = null;
let masterST: ScrollTrigger | null = null;

// Module-scoped so teardown can remove the exact function reference.
let tickerTick: ((time: number) => void) | null = null;
let pointerHandler: ((e: PointerEvent) => void) | null = null;

export function initScroll(): void {
  if (typeof window === "undefined") return;
  teardownScroll();

  lenisInstance = new Lenis({
    duration: 1.15,
    smoothWheel: true,
    touchMultiplier: 1.6,
    wheelMultiplier: 1.0,
  });

  // Lenis -> GSAP ScrollTrigger sync (Lenis drives it; rAF handled by gsap.ticker).
  lenisInstance.on("scroll", ScrollTrigger.update);

  tickerTick = (time: number) => {
    lenisInstance?.raf(time * 1000);
  };
  gsap.ticker.add(tickerTick);
  gsap.ticker.lagSmoothing(0);

  // Master progress driver: document scroll → 0..1 → scrollStore.
  masterST = ScrollTrigger.create({
    trigger: document.documentElement,
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => {
      const p = clamp01(self.progress);
      scrollState.progress = p;
      scrollState.velocity = self.getVelocity();
      scrollState.scrollTop = window.scrollY || 0;
      setCurrentScene(sceneAtProgress(p).key);
    },
  });

  // Pointer parallax (non-reactive; R3F reads this in useFrame).
  pointerHandler = (e: PointerEvent) => {
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;
    scrollState.pointerX = (e.clientX / w) * 2 - 1;
    scrollState.pointerY = -((e.clientY / h) * 2 - 1);
  };
  window.addEventListener("pointermove", pointerHandler, { passive: true });
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}

/** Smoothly scroll to a selector/named anchor — used by nav links. */
export function scrollToSection(selector: string): void {
  const target = document.querySelector(selector) as HTMLElement | null;
  if (target) lenisInstance?.scrollTo(target, { offset: 0, duration: 1.4 });
}

export function teardownScroll(): void {
  if (tickerTick) {
    gsap.ticker.remove(tickerTick);
    tickerTick = null;
  }
  lenisInstance?.destroy();
  lenisInstance = null;
  masterST?.kill();
  masterST = null;
  if (pointerHandler) {
    window.removeEventListener("pointermove", pointerHandler);
    pointerHandler = null;
  }
}

export { gsap, ScrollTrigger };
