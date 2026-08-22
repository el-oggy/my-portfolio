"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { sfx } from "@/lib/soundEffects";

export type ProgressId =
  | "enter"
  | "explore"
  | "gallery"
  | "studio"
  | "about"
  | "contact"
  | "inspect"
  | "egg"
  | "map";

export const PROGRESS_ITEMS: Record<Exclude<ProgressId, "explore"> | ProgressId, { title: string; description: string }> = {
  enter: { title: "Threshold Crossed", description: "Enter the sketch corridor." },
  explore: { title: "Corridor Walker", description: "Scroll to walk the infinite hallway." },
  gallery: { title: "Curator", description: "Visit The Gallery." },
  studio: { title: "Signal Chaser", description: "Visit The Studio." },
  about: { title: "Flight Log", description: "Visit About & Journey." },
  contact: { title: "Open Channel", description: "Visit Transmission & Contact." },
  inspect: { title: "Detail Reader", description: "Inspect a project card or monitor." },
  egg: { title: "Sharp Eyes", description: "Find a corridor secret." },
  map: { title: "Navigator", description: "Use the blueprint map." },
};

interface ProgressContextType {
  completed: ProgressId[];
  active: ProgressId | null;
  unlock: (id: ProgressId) => void;
  dismiss: () => void;
}

const ProgressContext = createContext<ProgressContextType | null>(null);

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error("useProgress must be used within ProgressProvider");
  return context;
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const completedRef = useRef<ProgressId[]>([]);
  const [completed, setCompleted] = useState<ProgressId[]>([]);
  const [active, setActive] = useState<ProgressId | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("adarsh_portfolio_progress");
      if (!saved) return;
      const parsed = JSON.parse(saved) as ProgressId[];
      const valid = parsed.filter((id) => id in PROGRESS_ITEMS);
      completedRef.current = valid;
      setCompleted(valid);
    } catch {
      // Ignore private-mode storage failures.
    }
  }, []);

  const unlock = useCallback((id: ProgressId) => {
    if (completedRef.current.includes(id)) return;
    completedRef.current = [...completedRef.current, id];
    setCompleted(completedRef.current);
    setActive(id);
    sfx.play("achievement");
    try {
      window.localStorage.setItem("adarsh_portfolio_progress", JSON.stringify(completedRef.current));
    } catch {
      // Ignore private-mode storage failures.
    }
  }, []);

  const dismiss = useCallback(() => setActive(null), []);

  const value = useMemo(() => ({ completed, active, unlock, dismiss }), [completed, active, unlock, dismiss]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}
