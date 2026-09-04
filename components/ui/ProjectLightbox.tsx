"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

import type { Project } from "@/lib/data";
import { setScrollPaused } from "@/lib/scrollStore";

/**
 * Project detail lightbox with FLIP shared-element transitions.
 *
 * Uses Framer Motion's `layoutId` to animate from the gallery card into the
 * fullscreen detail panel and back. While open:
 *   - scroll is frozen (overflow lock + scrollStore.paused)
 *   - the 3D camera holds position (useInfiniteCamera reads the paused flag)
 *   - focus is trapped inside the overlay for accessibility (§31)
 *
 * Close via: × button, Escape key, or clicking the backdrop.
 */

interface ProjectLightboxProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectLightbox({ project, onClose }: ProjectLightboxProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const previousOverflow = useRef({ html: "", body: "" });

  // Freeze/unfreeze scroll + camera when lightbox opens/closes.
  useEffect(() => {
    if (!project) return;

    // Save the element that had focus before opening.
    previousFocus.current = document.activeElement as HTMLElement | null;

    // Preserve the page's own scroll policy when locking the background.
    previousOverflow.current = {
      html: document.documentElement.style.overflow,
      body: document.body.style.overflow,
    };
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    // Freeze scroll + camera.
    setScrollPaused(true);

    // Focus the panel for keyboard nav.
    requestAnimationFrame(() => {
      panelRef.current?.focus();
    });

    return () => {
      // Unfreeze.
      document.documentElement.style.overflow = previousOverflow.current.html;
      document.body.style.overflow = previousOverflow.current.body;
      setScrollPaused(false);

      // Restore focus to the card that opened the lightbox.
      previousFocus.current?.focus();
    };
  }, [project]);

  // Escape key closes the lightbox.
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
      // Basic focus trap: Tab wraps within the panel.
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose],
  );

  return (
    <AnimatePresence>
      {project && (
        <div
          className="ProjectLightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Project detail: ${project.title}`}
          onKeyDown={handleKeyDown}
        >
          {/* Backdrop — click to close. */}
          <motion.div
            className="ProjectLightbox__backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {/* Panel — shared layoutId drives the FLIP animation. */}
          <motion.div
            className="ProjectLightbox__modal"
            layoutId={`project-card-${project.id}`}
            ref={panelRef}
            tabIndex={-1}
            style={{ outline: "none" }}
            transition={{ type: "spring", stiffness: 350, damping: 32 }}
          >
            {/* Close button */}
            <button
              className="ProjectLightbox__close"
              onClick={onClose}
              aria-label="Close project detail"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            {/* Header */}
            <div className="ProjectLightbox__header">
              <div className="ProjectLightbox__meta">
                <span className="tech-chip" style={{ color: "var(--accent-projects)" }}>
                  {project.year}
                </span>
                {project.hero && (
                  <span className="hero-badge">★ Hero Build</span>
                )}
                {project.proficiencyLabel && (
                  <span className="proficiency-label">{project.proficiencyLabel}</span>
                )}
              </div>
              <h3 className="ProjectLightbox__title">{project.title}</h3>
              <p className="ProjectLightbox__blurb">{project.blurb}</p>
            </div>

            {/* Details */}
            <div className="ProjectLightbox__details">
              <h4 className="ProjectLightbox__subhead">Details</h4>
              <ul className="ProjectLightbox__detail-list">
                {project.details.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>

            {/* Stack */}
            <div className="ProjectLightbox__stack">
              <h4 className="ProjectLightbox__subhead">Stack</h4>
              <div className="ProjectLightbox__stack-chips">
                {project.stack.map((s) => (
                  <span key={s} className="stack-chip">{s}</span>
                ))}
              </div>
            </div>

            {/* Repo link */}
            {project.repo && (
              <a
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="ProjectLightbox__repo"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                View on GitHub
              </a>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
