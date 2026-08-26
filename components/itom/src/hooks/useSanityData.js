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
    painted: project.imagePainted || project.image || "/images/ink-splash.webp",
    techStackLabels: project.stack || [],
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

const AWARD_IMG = "/textures/about/SOTD.webp";

// Two real internships (also surfaced on the Journey islands)
const INTERNSHIPS = [
  { label: "Research & Technical Intern", date: "NIT Rourkela", image: AWARD_IMG, url: null },
  { label: "VLSI Design using EDA Tools (Internship)", date: "PMEC", image: AWARD_IMG, url: null },
];

// Certifications excluding the PMEC internship entry (no duplicates across groups)
const CERTIFICATES = certifications
  .filter((c) => !/internship/i.test(c.title))
  .map((certification) => ({
    label: certification.title,
    date: certification.issuer,
    image: AWARD_IMG,
    url: certification.href || null,
  }));

export function useAwards() {
  return {
    featured: {
      id: "award-featured",
      layout: "certificate_grid",
      title: "Achievements",
      items: [...INTERNSHIPS, ...CERTIFICATES],
      platformConfig: { label: "WORK", color: "#1a1a1a", icon: "⭐" },
    },
    sotm: {
      id: "award-sotm",
      layout: "certificate_grid",
      title: "Internships",
      items: INTERNSHIPS,
      platformConfig: { label: "INTERNSHIP", color: "#1a1a1a", icon: "📅" },
    },
    other: {
      id: "award-other",
      layout: "certificate_grid",
      title: "Certificates",
      items: CERTIFICATES,
      platformConfig: { label: "CERTIFICATE", color: "#1a1a1a", icon: "👑" },
    },
  };
}
