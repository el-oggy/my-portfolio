"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { sfx } from "@/lib/soundEffects";

interface PreloaderProps {
  onComplete: () => void;
  ready?: boolean;
}

export default function Preloader({ onComplete, ready = true }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Interpolate progress smoothly to 100%
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        const increment = Math.floor(Math.random() * 8) + 4;
        return Math.min(100, prev + increment);
      });
    }, 60);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress === 100 && ready) {
      const tl = gsap.timeline({
        onComplete: () => {
          setIsFinished(true);
          onComplete();
        },
      });

      // Play authentic paper sound
      sfx.play("paper");

      // Smooth fade & scale out the preloader
      if (containerRef.current) {
        tl.to(containerRef.current, {
          opacity: 0,
          scale: 1.05,
          duration: 0.9,
          ease: "power2.inOut",
        });
      }
    }
  }, [progress, ready, onComplete]);

  if (isFinished) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#fbf9f5] select-none"
    >
      {/* Hand-Drawn Spinning SVG Ring Loader */}
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg
          className="absolute inset-0 w-full h-full animate-[spin_10s_linear_infinite]"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="#1a1917"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="12 16"
            opacity="0.85"
          />
        </svg>

        <svg
          className="absolute inset-0 w-full h-full animate-[spin_5s_linear_infinite_reverse]"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="36"
            fill="none"
            stroke="#1a1917"
            strokeWidth="1"
            strokeLinecap="round"
            strokeDasharray="6 10"
            opacity="0.5"
          />
        </svg>

        {/* Live Percentage Number in Hand-Drawn Font */}
        <div className="font-mono text-2xl font-extrabold text-[#1a1917]">
          {progress}%
        </div>
      </div>

      {/* Hand-Drawn Subtext */}
      <div
        className="mt-6 text-sm font-bold tracking-widest text-[#78716c] uppercase"
        style={{ fontFamily: "'CabinSketch', cursive, sans-serif" }}
      >
        ✦ Loading Engineering Sketches ✦
      </div>
    </div>
  );
}
