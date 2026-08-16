"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { SceneKey } from "@/lib/data";
import { onSceneChange } from "@/lib/scrollStore";
import type { ExperienceTier } from "@/hooks/useCapability";

export interface ExperienceState {
  /** Discrete current scene (mirror of scrollStore; updates only on change). */
  currentScene: SceneKey;
  /** True after the First-Boot intro sequence completes. */
  introComplete: boolean;
  /** Sound enabled? Defaults OFF. Persisted to localStorage. */
  soundEnabled: boolean;
  /** The experience tier actually rendered ("3d" | "reduced" | "2d"). */
  tier: ExperienceTier;
  toggleSound: () => void;
  setSoundEnabled: (v: boolean) => void;
  markIntroComplete: () => void;
}

const ExperienceContext = createContext<ExperienceState | null>(null);

const SOUND_KEY = "avlsi:sound";

export function ExperienceProvider({
  children,
  tier,
}: {
  children: React.ReactNode;
  tier: ExperienceTier;
}) {
  const [currentScene, setCurrentScene] = useState<SceneKey>("intro");
  const [introComplete, setIntroComplete] = useState(false);
  const [soundEnabled, setSoundEnabledState] = useState(false);

  // Hydrate sound preference once on mount (SSR-safe: starts false).
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SOUND_KEY);
      if (stored === "1") setSoundEnabledState(true);
    } catch {
      /* localStorage unavailable — keep default off. */
    }
  }, []);

  // Mirror the non-reactive scrollStore's discrete scene into React state.
  useEffect(() => onSceneChange(setCurrentScene), []);

  const setSoundEnabled = useCallback((v: boolean) => {
    setSoundEnabledState(v);
    try {
      localStorage.setItem(SOUND_KEY, v ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabledState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SOUND_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo<ExperienceState>(
    () => ({
      currentScene,
      introComplete,
      soundEnabled,
      tier,
      toggleSound,
      setSoundEnabled,
      markIntroComplete: () => setIntroComplete(true),
    }),
    [currentScene, introComplete, soundEnabled, tier, toggleSound, setSoundEnabled],
  );

  return (
    <ExperienceContext.Provider value={value}>
      {children}
    </ExperienceContext.Provider>
  );
}

export function useExperience(): ExperienceState {
  const ctx = useContext(ExperienceContext);
  if (!ctx)
    throw new Error("useExperience must be used within an ExperienceProvider");
  return ctx;
}
