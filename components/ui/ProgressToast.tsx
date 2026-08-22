"use client";

import { useEffect } from "react";
import { PROGRESS_ITEMS, useProgress } from "@/context/ProgressContext";

export default function ProgressToast() {
  const { active, dismiss } = useProgress();

  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(dismiss, 5200);
    return () => window.clearTimeout(timer);
  }, [active, dismiss]);

  if (!active) return null;
  const item = PROGRESS_ITEMS[active];

  return (
    <div className="fixed bottom-6 left-6 z-[60] w-[min(92vw,22rem)] animate-in fade-in slide-in-from-bottom-4">
      <div className="sketch-card flex items-start gap-3 p-4">
        <div className="mt-1 h-3 w-3 rounded-full bg-emerald-500 shadow-inner" />
        <div className="min-w-0">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-emerald-600">
            Unlocked
          </p>
          <p className="font-hand text-lg font-bold text-[#1a1917]">{item.title}</p>
          <p className="text-sm text-[#57534e]">{item.description}</p>
        </div>
        <button onClick={dismiss} aria-label="Dismiss achievement" className="ml-auto text-lg leading-none text-[#78716c] hover:text-[#1a1917]">
          ×
        </button>
      </div>
    </div>
  );
}
