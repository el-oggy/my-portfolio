/**
 * Centralized content data layer.
 *
 * Source of truth = the verified content inventory (plan §M), re-themed for an
 * Electronics / Embedded / IoT identity. Every field here is corroborated
 * against GitHub (el-oggy) or the local drone-project repo. No fabricated
 * experience, certs, or titles (enforced by §18 / §53).
 *
 * Scene logic imports ONLY from here — content is fully separated from presentation.
 */

export type SceneKey =
  | "intro"
  | "pcb"
  | "embedded"
  | "iot"
  | "drone"
  | "firmware"
  | "rtl"
  | "projects"
  | "journey"
  | "contact";

export interface LinkItem {
  label: string;
  href: string;
  aria: string;
}

export const identity = {
  name: "Adarsh Swarup Maharana",
  firstName: "Adarsh",
  titleLine1: "Embedded Systems · IoT · Robotics",
  titleLine2: "Electronics Engineer",
  supportingLine:
    "Designing connected hardware — microcontrollers, sensors, wireless systems, and the firmware that brings them to life. From breadboard to flying drone.",
  location: "Berhampur, Odisha, India",
} as const;

export const links = {
  email: "adarshswarupmaharana@gmail.com",
  github: "https://github.com/el-oggy",
  linkedin: "https://www.linkedin.com/in/adarsh-swarup-maharana-4839763b8/",
  portfolioURL: "https://adarsh-vlsi.vercel.app/",
  /** Configurable resume endpoint (§37). Drop the PDF at public/resume.pdf. */
  resume: "/resume.pdf",
  /** Placeholder CV until the final resume is placed at /resume.pdf. */
  currentCV:
    "https://drive.google.com/file/d/1XYQu1boH9sWpseAs0uv-9hWWglkdFMjl/view?usp=sharing",
} as const;

export const navLinks: LinkItem[] = [
  {
    label: "Embedded",
    href: "#embedded",
    aria: "Jump to the embedded systems section",
  },
  {
    label: "IoT",
    href: "#iot",
    aria: "Jump to the IoT and wireless section",
  },
  {
    label: "Drone",
    href: "#drone",
    aria: "Jump to the drone and robotics section",
  },
  {
    label: "Firmware",
    href: "#firmware",
    aria: "Jump to the firmware and software section",
  },
  {
    label: "RTL",
    href: "#rtl",
    aria: "Jump to the RTL and digital design section",
  },
  {
    label: "Projects",
    href: "#projects",
    aria: "Jump to the projects gallery",
  },
  {
    label: "Journey",
    href: "#journey",
    aria: "Jump to the professional journey timeline",
  },
  {
    label: "Contact",
    href: "#contact",
    aria: "Jump to the contact section",
  },
];

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

export interface Project {
  id: string;
  title: string;
  blurb: string;
  year: string;
  /** Scene this project lives in. */
  scene: SceneKey;
  hero?: boolean;
  /** Only set to a real URL when a GitHub repo is corroborated. */
  repo?: string;
  /** "Hands-on" | "Training / Exposure" — never invented. */
  proficiencyLabel?: string;
  stack: string[];
  /** Long-form bullet content for the detail view. */
  details: string[];
  /** URL for the project thumbnail image. */
  image?: string;
}

export const projects: Project[] = [
  {
    id: "drone-hexcopter",
    title: "STM32 Hexacopter Flight Controller",
    blurb:
      "A custom six-rotor flight controller on an STM32 microcontroller with a custom KiCad PCB, MPU6500 IMU, and GPS — under active development. The hero build: hardware, firmware, and telemetry in one system.",
    year: "2024",
    scene: "drone",
    hero: true,
    repo: "https://github.com/el-oggy/Drone-hexcoptor-",
    proficiencyLabel: "Hands-on",
    stack: [
      "STM32",
      "KiCad (PCB)",
      "MPU6500 IMU",
      "GPS",
      "Embedded C++",
      "I2C & UART",
    ],
    details: [
      "Custom hexacopter (6-rotor) flight controller built around an STM32 MCU, with a PCB designed in KiCad.",
      "MPU6500 inertial measurement unit (I2C) and GPS provide attitude and position telemetry over UART.",
      "Firmware includes test sketches — gps_testing_stm32.ino, led_blink_stm32.ino, MPU6500_Visualizer_Code.ino — plus a browser-based Drone_IMU_GroundStation.html.",
      "Repo organized into docs/, hardware/, firmware/, images/. Educational / research, under active development.",
    ],
    image: "https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "weather-station",
    title: "IoT Weather Monitoring Station",
    blurb:
      "Solar-powered IoT weather station on an ESP32 with multiple environmental sensors, transmitting telemetry for remote monitoring.",
    year: "2023",
    scene: "iot",
    proficiencyLabel: "Hands-on",
    stack: ["ESP32", "C/C++", "BME280", "BH1750", "DS18B20", "PCB Design", "Solar"],
    details: [
      "ESP32-based weather station capturing temperature, humidity, light, and soil temperature.",
      "Solar-powered for remote placement, with a custom PCB design.",
      "Presented as completed project; no standalone public repo linked here.",
    ],
    image: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "home-automation",
    title: "Home Automation with Smart Staircase Lighting",
    blurb:
      "ESP-based home automation with relay modules and a smart staircase lighting controller, managed via Blynk IoT.",
    year: "2024",
    scene: "iot",
    proficiencyLabel: "Hands-on",
    stack: ["Arduino", "Blynk IoT", "Relay Modules", "ESP"],
    details: [
      "ESP-based relay control for home appliances via the Blynk IoT platform.",
      "Smart staircase lighting triggered by presence.",
      "Presented as completed project; no standalone public repo linked here.",
    ],
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "zmk-keyboard",
    title: "ZMK Custom Keyboard Firmware",
    blurb:
      "ZMK (Zephyr RTOS-based) firmware configuration for a custom mechanical keyboard, with a GitHub Actions continuous-integration build pipeline.",
    year: "2026",
    scene: "firmware",
    repo: "https://github.com/el-oggy/zmk-config",
    proficiencyLabel: "Hands-on",
    stack: ["ZMK Firmware", "Zephyr RTOS", "GitHub Actions CI", "YAML", "C"],
    details: [
      "ZMK firmware configuration for a custom mechanical keyboard, built on the Zephyr RTOS.",
      "GitHub Actions CI automatically builds firmware on every commit (build.yaml).",
      "Standard ZMK repo structure: workflow, board/shield definitions, config, and build slices.",
    ],
    image: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "flowos",
    title: "FlowOS — Offline-First Productivity Dashboard",
    blurb:
      "A fully responsive offline-first personal productivity dashboard: habit tracking, calendar, and state — built with vanilla ES6 JavaScript and IndexedDB local storage.",
    year: "2026",
    scene: "firmware",
    repo: "https://github.com/el-oggy/PersonalDashboard",
    proficiencyLabel: "Hands-on",
    stack: ["Vanilla JS (ES6)", "IndexedDB", "HTML5", "CSS3"],
    details: [
      "Offline-first design — all data lives in the browser via IndexedDB; no backend required.",
      "Modular JavaScript: database, UI, state, calendar, and habits modules.",
      "On GitHub the repo is now named 'Habit Tracker (formerly FlowOS)'; the portfolio retains the FlowOS branding.",
    ],
    image: "https://images.unsplash.com/photo-1618044733300-9472054094ee?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "systolic-array",
    title: "2D Systolic Array for Matrix Multiplication",
    blurb:
      "A 2D systolic array for INT8 matrix multiplication (C = A x B), a core accelerator architecture for deep learning and HPC workloads. Implemented in Verilog, this project explores high-throughput, low-latency parallel computation.",
    year: "2025",
    scene: "rtl",
    repo: "https://github.com/el-oggy/2D-systolic-array-",
    proficiencyLabel: "Hands-on",
    stack: ["Verilog", "RTL Design", "Digital Logic", "INT8", "Matrix Multiply"],
    details: [
      "Hardware implementation of a 2D systolic array for efficient INT8 matrix multiplication (C = A x B).",
      "Designed for high throughput in compute-intensive tasks like those in deep learning inference accelerators.",
      "The architecture uses a grid of processing elements (PEs) with local connectivity, minimizing data movement.",
      "Input matrices A and B are streamed into the array, and the result matrix C is accumulated in place.",
      "This project is an application of parallel computing principles in hardware. The RTL computes matrix multiplication; convolution, DSP, and MIMO processing are related application areas that share this architectural foundation.",
    ],
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
  },
];

/* ------------------------------------------------------------------ */
/* Experience (JourneyScene nodes) — honest labels (§20)               */
/* ------------------------------------------------------------------ */

export type ExperienceKind = "Hands-on" | "Training / Exposure" | "Education";

export interface ExperienceNode {
  id: string;
  title: string;
  org: string;
  period: string;
  kind: ExperienceKind;
  summary: string;
  topics?: string[];
}

export const experience: ExperienceNode[] = [
  {
    id: "nit-rourkela",
    title: "Research & Technical Intern",
    org: "NIT Rourkela",
    period: "2025",
    kind: "Hands-on",
    summary:
      "Hardware systems engineering, digital design, and embedded systems in collaboration with academic researchers and faculty.",
    topics: ["Digital Design", "Embedded Systems", "Hardware Systems"],
  },
  {
    id: "pmec",
    title: "Technical Intern — VLSI Design using EDA Tools",
    org: "PMEC, Berhampur",
    period: "Oct 2025",
    kind: "Hands-on",
    summary:
      "Two-week intensive. Designed Verilog/VHDL circuits (adders, muxes, flip-flops, counters) and implemented a 4-bit up/down counter on an Artix-7 Basys-3 FPGA. Studied the full hardware flow through DRC/LVS/ERC signoff.",
    topics: [
      "LTSpice",
      "Xilinx Vivado",
      "Cadence",
      "Verilog/VHDL",
      "Artix-7 Basys-3",
      "DRC / LVS / ERC Signoff",
      "NMOS / CMOS Fabrication",
    ],
  },
  {
    id: "nielit",
    title: "VLSI Design Flow — RTL → GDS-II",
    org: "NIELIT, Noida",
    period: "2025 – 2026",
    kind: "Training / Exposure",
    summary:
      "Currently developing expertise in the full RTL-to-GDSII and Physical Design flow. Training / exposure — not hands-on production physical design.",
    topics: [
      "RTL",
      "Synthesis",
      "STA",
      "Linux",
      "TCL",
      "Floorplanning",
      "CTS",
      "Routing",
      "Constraints",
    ],
  },
  {
    id: "tds",
    title: "Consultancy Agent",
    org: "TDS Consultancy, Berhampur",
    period: "Dec 2023 – Jun 2024",
    kind: "Hands-on",
    summary:
      "Client-facing technical research, requirement identification, and project planning.",
    topics: ["Technical Research", "Requirements", "Project Planning"],
  },
];

/* ------------------------------------------------------------------ */
/* Education                                                           */
/* ------------------------------------------------------------------ */

export interface EducationNode {
  id: string;
  degree: string;
  org: string;
  period: string;
  status: "Completed" | "Expected";
  regNo?: string;
}

export const education: EducationNode[] = [
  {
    id: "btech",
    degree: "B.Tech — Electronics & Telecommunication Engineering",
    org: "Parala Maharaja Engineering College, Sitalapali",
    period: "— 2027",
    status: "Expected",
    regNo: "2421109136",
  },
  {
    id: "diploma",
    degree: "Diploma — Electronics & Telecommunication Engineering",
    org: "Uma Charan Patnaik Engineering School, Berhampur",
    period: "Completed 2023",
    status: "Completed",
  },
  {
    id: "highschool",
    degree: "High School",
    org: "St. Xavier High School, Ambapua, Berhampur",
    period: "Completed",
    status: "Completed",
  },
];

/* ------------------------------------------------------------------ */
/* Skills (self-reported proficiency — honest badges)                  */
/* ------------------------------------------------------------------ */

export type Proficiency = "Proficient" | "Intermediate" | "Basic";

export interface Skill {
  name: string;
  level: Proficiency;
}

export interface SkillGroup {
  group: string;
  items: Skill[];
}

export const skills: SkillGroup[] = [
  {
    group: "Microcontrollers & Embedded",
    items: [
      { name: "STM32", level: "Intermediate" },
      { name: "ESP32", level: "Intermediate" },
      { name: "Arduino", level: "Proficient" },
      { name: "Raspberry Pi", level: "Basic" },
      { name: "Embedded C/C++", level: "Intermediate" },
    ],
  },
  {
    group: "Interfaces & Sensing",
    items: [
      { name: "UART / I2C / SPI", level: "Intermediate" },
      { name: "Sensor Integration", level: "Intermediate" },
      { name: "GPIO / ADC / PWM", level: "Proficient" },
      { name: "MPU6500 IMU", level: "Intermediate" },
    ],
  },
  {
    group: "Electronics & Design",
    items: [
      { name: "KiCad PCB Design", level: "Intermediate" },
      { name: "LTSpice", level: "Intermediate" },
      { name: "Xilinx Vivado", level: "Intermediate" },
      { name: "Digital Logic Design", level: "Proficient" },
    ],
  },
  {
    group: "IoT & Software",
    items: [
      { name: "Blynk IoT", level: "Intermediate" },
      { name: "Verilog HDL", level: "Intermediate" },
      { name: "JavaScript (ES6)", level: "Intermediate" },
      { name: "Python", level: "Basic" },
      { name: "Git & GitHub", level: "Intermediate" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Certifications (assets required — see plan §M.6)                    */
/* ------------------------------------------------------------------ */

export interface Cert {
  title: string;
  issuer: string;
  /** Visual is deliberately absent until asset files are provided (§M.6). */
  href?: string;
}

export const certifications: Cert[] = [
  {
    title: "Young IoT Prodigy",
    issuer: "Infosys Spring Board",
  },
  {
    title: "VLSI Design using EDA Tools (Internship)",
    issuer: "PMEC",
  },
  {
    title: "Python Programming for Everybody",
    issuer: "Coursera",
  },
  {
    title: "VLSI Innovation, Embedded Systems & Cutting-Edge Hardware Solutions",
    issuer: "Certification Program",
  },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export const heroProject =
  projects.find((p) => p.hero) ?? projects[0];

export function projectsForScene(scene: SceneKey): Project[] {
  return projects.filter((p) => p.scene === scene);
}
