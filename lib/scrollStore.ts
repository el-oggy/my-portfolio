/**
 * Non-reactive scroll / pointer store.
 *
 * Critical performance invariant: scrolling at 60fps MUST NOT trigger React
 * re-renders. Lenis writes into this module-level object every frame; the R3F
 * useFrame loop and GSAP read it directly. Only *discrete* state (which scene
 * we're in, sound on/off) lives in React context (ExperienceContext).
 *
 * This is read on every animation frame, so the fields are plain mutable
 * numbers — never wrapped in React state.
 */

import type { SceneKey } from "./data";

export interface ScrollState {
  /** Total journey progress, 0..1. */
  progress: number;
  /** Smoothed scroll velocity for motion-based effects. */
  velocity: number;
  /** Normalized pointer,-1..1 each axis (0,0 = center, dormant). */
  pointerX: number;
  pointerY: number;
  /** Raw scroll position in px for any DOM utilities that need it. */
  scrollTop: number;
  /** Discrete current scene; updated only when it changes (see setCurrentScene). */
  currentScene: SceneKey;
  /**
   * When true, the camera holds its current position instead of chasing scroll
   * (used by modal overlays like the project lightbox to freeze the world).
   * Set/cleared by the modal via setScrollPaused(); read every frame by the
   * camera controller — never triggers React re-renders.
   */
  paused: boolean;
}

export const scrollState: ScrollState = {
  progress: 0,
  velocity: 0,
  pointerX: 0,
  pointerY: 0,
  scrollTop: 0,
  currentScene: "intro",
  paused: false,
};

/** Read-only-ish accessor for useFrame (avoids import churn). */
export function getScroll(): ScrollState {
  return scrollState;
}

/**
 * Subscribers that fire ONLY when the discrete scene changes — safe to wire
 * to React setState from here (fires a handful of times per session, not 60/s).
 */
type SceneListener = (scene: SceneKey) => void;
const sceneListeners = new Set<SceneListener>();

export function onSceneChange(fn: SceneListener): () => void {
  sceneListeners.add(fn);
  return () => sceneListeners.delete(fn);
}

export function setCurrentScene(scene: SceneKey): void {
  if (scrollState.currentScene !== scene) {
    scrollState.currentScene = scene;
    sceneListeners.forEach((l) => l(scene));
  }
}

/** Reset on navigation/unmount. */
export function resetScrollState(): void {
  scrollState.progress = 0;
  scrollState.velocity = 0;
  scrollState.pointerX = 0;
  scrollState.pointerY = 0;
  scrollState.scrollTop = 0;
  scrollState.paused = false;
}

/**
 * Pause/resume the scroll-driven camera. While paused the camera holds its
 * current position (the scrollStore's `progress` field is NOT touched, so the
 * master ScrollTrigger keeps writing real scroll position — the camera simply
 * stops reacting). Pair with Lenis `stop()`/`start()` from the modal.
 */
export function setScrollPaused(paused: boolean): void {
  scrollState.paused = paused;
}
