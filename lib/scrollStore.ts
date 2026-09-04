/**
 * Non-reactive camera-pause store.
 *
 * Critical performance invariant: modal overlays (project lightbox) must be
 * able to freeze the 3D world without triggering React re-renders. The flag
 * is plain mutable state — read every frame by the camera controller
 * (useInfiniteCamera), never wrapped in React state.
 *
 * Historical note: this module used to drive a full Lenis + GSAP ScrollTrigger
 * "section progress" pipeline. That architecture was superseded by the z-axis
 * infinite corridor (useInfiniteCamera); the unused progress/scene fields and
 * listeners were removed. The scene list that generates the semantic fallback
 * sections still lives in lib/sceneConfig.ts.
 */

export interface ScrollState {
  /**
   * When true, the camera holds its current position instead of chasing input
   * (used by modal overlays like the project lightbox to freeze the world).
   * Set/cleared by the modal via setScrollPaused().
   */
  paused: boolean;
}

export const scrollState: ScrollState = {
  paused: false,
};

/** Read-only-ish accessor for useFrame (avoids import churn). */
export function getScroll(): ScrollState {
  return scrollState;
}

/**
 * Pause/resume the scroll-driven camera. While paused the camera holds its
 * current position (the overlay also locks CSS overflow, so the DOM page
 * cannot scroll either).
 */
export function setScrollPaused(paused: boolean): void {
  scrollState.paused = paused;
}