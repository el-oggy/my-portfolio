import { certifications, identity, links, projects } from "@/lib/data";

export const isSanityConfigured = true;

export function loadSanityData() {
  return Promise.resolve({ loaded: true });
}

export function isSanityDataLoaded() {
  return true;
}

export function useGalleryProjects() {
  return projects.map((project) => ({
    id: project.id,
    title: project.title,
    url: project.repo || links.github,
    description: project.blurb,
    front: project.image || "/images/ink-splash.webp",
    painted: project.image || "/images/ink-splash.webp",
    techStack: [],
  }));
}

export function useStudioContent() {
  return projects.slice(0, 8).map((project, index) => ({
    id: `studio-${project.id}`,
    platform: "blog",
    title: project.title,
    description: project.blurb,
    url: project.repo || links.github,
    frontTexture: `/textures/studio/monitor_front${index % 2 === 0 ? "" : "_painted"}.webp`,
    paintedFrontTexture: "/textures/studio/monitor_front_painted.webp",
    date: project.year,
  }));
}

export function useAwards() {
  const items = certifications.map((certification) => ({
    label: certification.title,
    date: certification.issuer,
    image: "/textures/about/SOTD.webp",
    url: certification.href || null,
  }));

  return {
    featured: { id: "award-featured", layout: "certificate_grid", title: "Selected Work", items: [], platformConfig: { label: "WORK", color: "#1a1a1a", icon: "⭐" } },
    sotd: { id: "award-sotd", layout: "certificate_grid", title: "Certifications & Training", items, platformConfig: { label: "CREDENTIAL", color: "#1a1a1a", icon: "🏆" } },
    sotm: { id: "award-sotm", layout: "certificate_grid", title: "Programs", items: [], platformConfig: { label: "PROGRAM", color: "#1a1a1a", icon: "📅" } },
    other: { id: "award-other", layout: "certificate_grid", title: "Other", items: [], platformConfig: { label: "OTHER", color: "#1a1a1a", icon: "👑" } },
  };
}
