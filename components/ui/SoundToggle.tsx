"use client";

import { useExperience } from "@/components/experience/ExperienceContext";

/**
 * Sound ON/OFF (§24/§25). Visible at all times; muted by default; preference
 * persisted via ExperienceContext → localStorage. The audio engine itself
 * lands in Phase 7 — until then this persists the preference and shows state.
 */
export default function SoundToggle() {
  const { soundEnabled, toggleSound } = useExperience();

  return (
    <button
      type="button"
      onClick={toggleSound}
      aria-pressed={soundEnabled}
      aria-label={soundEnabled ? "Mute ambient sound" : "Enable ambient sound"}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-[var(--text-dim)] backdrop-blur-md transition-colors hover:text-[var(--text)] hover:border-white/25 UiLayer"
    >
      <span
        className={`inline-block h-2 w-2 rounded-full transition-colors ${
          soundEnabled ? "bg-[var(--accent-systems)] shadow-[0_0_8px_var(--accent-systems)]" : "bg-white/30"
        }`}
        aria-hidden="true"
      />
      Sound {soundEnabled ? "On" : "Off"}
    </button>
  );
}
