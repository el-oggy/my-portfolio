"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useScene } from "@/context/SceneContext";
import { sfx } from "@/lib/soundEffects";

const LEFT_CLIP =
  "polygon(0 0, 100% 0, 98% 7%, 100% 15%, 97% 24%, 100% 33%, 98% 43%, 100% 52%, 97% 62%, 100% 71%, 98% 81%, 100% 90%, 97% 100%, 0 100%)";
const RIGHT_CLIP =
  "polygon(100% 0, 0 0, 3% 8%, 0 17%, 4% 27%, 0 37%, 2% 47%, 0 57%, 4% 67%, 0 77%, 2% 87%, 0 96%, 4% 100%, 100% 100%)";

export default function PaperTransition() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const { transitionPhase, commitTransition, completeTransition } = useScene();

  useEffect(() => {
    if (!containerRef.current || !leftRef.current || !rightRef.current) return;
    if (!transitionPhase) {
      gsap.set(containerRef.current, { autoAlpha: 0 });
      gsap.set([leftRef.current, rightRef.current], { xPercent: 0 });
      return;
    }

    if (transitionPhase === "closed") {
      sfx.play("paper");
      gsap.set(containerRef.current, { autoAlpha: 1 });
      gsap.fromTo(
        [leftRef.current, rightRef.current],
        { xPercent: (index: number) => (index === 0 ? -100 : 100) },
        {
          xPercent: 0,
          duration: 1,
          ease: "power3.inOut",
          overwrite: true,
          onComplete: commitTransition,
        },
      );
    }

    if (transitionPhase === "opening") {
      sfx.play("paper");
      gsap.set(containerRef.current, { autoAlpha: 1 });
      gsap.fromTo(
        leftRef.current,
        { xPercent: -100 },
        { xPercent: -200, duration: 0.85, ease: "power3.out" },
      );
      gsap.fromTo(
        rightRef.current,
        { xPercent: 0 },
        {
          xPercent: 100,
          duration: 0.85,
          ease: "power3.out",
          onComplete: completeTransition,
        },
      );
    }
  }, [transitionPhase, commitTransition, completeTransition]);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[70] invisible opacity-0"
    >
      <div
        ref={leftRef}
        className="absolute inset-0 bg-[#fbf9f5]"
        style={{ clipPath: LEFT_CLIP }}
      />
      <div
        ref={rightRef}
        className="absolute inset-0 border-l-4 border-[#1a1917] bg-[#fbf9f5]"
        style={{ clipPath: RIGHT_CLIP }}
      />
    </div>
  );
}
