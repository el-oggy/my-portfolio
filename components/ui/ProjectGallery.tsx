"use client";

import { useState, useCallback } from "react";
import { motion, LayoutGroup } from "framer-motion";

import { projects, type Project } from "@/lib/data";
import ProjectLightbox from "./ProjectLightbox";

/**
 * Interactive project gallery grid for the Projects room.
 *
 * Renders all verified projects as glassmorphic cards in a responsive grid.
 * Each card carries a Framer Motion `layoutId` that the ProjectLightbox shares,
 * creating a smooth FLIP shared-element transition on open/close.
 *
 * Design: premium glassmorphism with hover glow, micro-animations, hero badge,
 * stack chips, and proficiency labels. Two columns on desktop, single on mobile.
 */

export default function ProjectGallery() {
  const [selected, setSelected] = useState<Project | null>(null);

  const handleOpen = useCallback((p: Project) => {
    setSelected(p);
  }, []);

  const handleClose = useCallback(() => {
    setSelected(null);
  }, []);

  return (
    <LayoutGroup>
      <div className="ProjectGallery">
        {projects.map((p) => (
          <ProjectCard
            key={p.id}
            project={p}
            onOpen={handleOpen}
            isSelected={selected?.id === p.id}
          />
        ))}
      </div>

      <ProjectLightbox project={selected} onClose={handleClose} />
    </LayoutGroup>
  );
}

/* ------------------------------------------------------------------ */

import { View } from "@react-three/drei";
import ProjectImageGL from "../canvas/ProjectImageGL";

interface ProjectCardProps {
  project: Project;
  onOpen: (p: Project) => void;
  isSelected: boolean;
}

function ProjectCard({ project, onOpen, isSelected }: ProjectCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      className={`ProjectCard ${isSelected ? "ProjectCard--selected" : ""}`}
      layoutId={`project-card-${project.id}`}
      onClick={() => onOpen(project)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${project.title}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(project);
        }
      }}
      transition={{ type: "spring", stiffness: 350, damping: 32 }}
    >
      {/* Thumbnail area (WebGL Portal) */}
      {project.image && (
        <div className="ProjectCard__image-container">
          <View className="w-full h-full">
            <ProjectImageGL url={project.image} hovered={hovered} />
          </View>
        </div>
      )}

      {/* Top row: year + badges */}
      <div className="ProjectCard__top">
        <span className="ProjectCard__year">{project.year}</span>
        <div className="ProjectCard__badges">
          {project.hero && (
            <span className="hero-badge">★ Hero</span>
          )}
          {project.proficiencyLabel && (
            <span className="proficiency-label">{project.proficiencyLabel}</span>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="ProjectCard__title">{project.title}</h3>

      {/* Blurb — truncated to 2 lines via CSS */}
      <p className="ProjectCard__blurb">{project.blurb}</p>

      {/* Stack chips */}
      <div className="ProjectCard__stack">
        {project.stack.slice(0, 4).map((s) => (
          <span key={s} className="stack-chip">{s}</span>
        ))}
        {project.stack.length > 4 && (
          <span className="stack-chip stack-chip--more">
            +{project.stack.length - 4}
          </span>
        )}
      </div>

      {/* Repo indicator */}
      {project.repo && (
        <div className="ProjectCard__repo-hint">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          <span>GitHub</span>
        </div>
      )}
    </motion.article>
  );
}
