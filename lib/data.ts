/**
 * Centralized content data layer.
 *
 * Source of truth = the verified content inventory (plan §M). Every field here is
 * corroborated against the live portfolio (adarsh-vlsi.vercel.app) or GitHub (el-oggy).
 * No fabricated experience, tapeouts, certs, or titles (enforced by §18 / §53).
 *
 * Scene logic imports ONLY from here — content is fully separated from presentation.
 */

export type SceneKey =
  | "intro"
  | "silicon"
  | "rtl"
  | "asic"
  | "timing"
  | "fpga"
  | "systems"
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
  titleLine1: "Physical Design · RTL · FPGA",
  titleLine2: "Embedded Systems",
  /** Honest framing — current learning, NOT professional tapeout experience (§M.1, §53). */
  supportingLine:
    "Building efficient digital hardware from RTL toward silicon — currently developing expertise in RTL-to-GDSII and Physical Design.",
  location: "Berhampur, Odisha, India",
} as const;

export const links = {
  email: "adarshswarupmaharana@gmail.com",
  github: "https://github.com/el-oggy",
  linkedin: "https://www.linkedin.com/in/adarsh-swarup-maharana-4839763b8/",
  portfolioURL: "https://adarsh-vlsi.vercel.app/",
  /** Configurable resume endpoint (§37). Drop the Intel-targeted PDF at public/resume.pdf. */
  resume: "/resume.pdf",
  /** Placeholder CV until the final Intel-targeted resume is placed at /resume.pdf. */
  currentCV:
    "https://drive.google.com/file/d/1XYQu1boH9sWpseAs0uv-9hWWglkdFMjl/view?usp=sharing",
} as const;

export const navLinks: LinkItem[] = [
  {
    label: "RTL",
    href: "#rtl",
    aria: "Jump to the RTL design section",
  },
  {
    label: "ASIC",
    href: "#asic",
    aria: "Jump to the ASIC and physical design section",
  },
  {
    label: "Timing",
    href: "#timing",
    aria: "Jump to the static timing analysis section",
  },
  {
    label: "FPGA",
    href: "#fpga",
    aria: "Jump to the FPGA section",
  },
  {
    label: "Systems",
    href: "#systems",
    aria: "Jump to the embedded systems section",
  },
  {
    label: "Journey",
    href: "#journey",
    aria: "Jump to the professional journey timeline",
  },
  {
    label: "About",
    href: "#about",
    aria: "Jump to the about section",
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
}

export const projects: Project[] = [
  {
    id: "systolic-array",
    title: "2D Systolic Array for Matrix Multiplication",
    blurb:
      "A fully pipelined N×N systolic array accelerator for INT8 matrix multiplication (C = A×B), built for Edge AI inference. Parameterized N and DATA_WIDTH; completes in 3N−1 clock cycles. 5 RTL modules + 3 passing testbenches.",
    year: "2026 · Edge AI Hackathon 2026",
    scene: "rtl",
    hero: true,
    repo: "https://github.com/el-oggy/2D-systolic-array-",
    proficiencyLabel: "Hands-on",
    stack: [
      "Verilog HDL",
      "FSM Controller",
      "Skew Buffers",
      "Icarus Verilog",
      "GTKWave",
      "Vivado (optional)",
    ],
    details: [
      "Top-level systolic_top wraps skew buffers A/B, an N×N processing-element grid, and a controller FSM (IDLE → LOAD → COMPUTE → DONE).",
      "Each PE performs acc += a_in × b_in and forwards inputs to its neighbors, achieving optimal data reuse — each input read once and reused N times (N× bandwidth reduction).",
      "B-matrix transposition prior to skewing reuses a single shift-register buffer for both data streams.",
      "Three testbenches pass: 1×1 PE unit test, 2×2 identity multiply, and 4×4 known-answer + negative-number tests.",
      "Documented with an innovation roadmap (workload-adaptive arrays, resource- and power-aware design) and code-explanation PDFs.",
      "References: Kung & Leiserson 1978 (systolic arrays); Jouppi et al. 2017 (TPU); Eyeriss 2016.",
    ],
  },
  {
    id: "sequence-detector",
    title: "FPGA Sequence Detector — Mealy & Moore",
    blurb:
      "A sequence detector for the 4-bit sequence '1011' implemented as both Mealy and Moore finite state machines, synthesised and verified on FPGA.",
    year: "2024",
    scene: "rtl",
    proficiencyLabel: "Hands-on",
    stack: ["Verilog HDL", "Xilinx Vivado", "FPGA", "FSM (Mealy/Moore)"],
    details: [
      "Detects the fixed 4-bit sequence '1011' using two distinct FSM styles for comparison.",
      "Implemented in Verilog, synthesised and verified via Xilinx Vivado for FPGA.",
      "State nodes S0 → S1 → S2 → S3 with signal transitions driven by the input stream.",
      "No standalone public repository is linked — presented as completed coursework. (No fabricated repo link.)",
    ],
  },
  {
    id: "drone-hexcopter",
    title: "STM32 Hexacopter Flight Controller",
    blurb:
      "A custom six-rotor flight controller on an STM32 microcontroller with a custom KiCad PCB, MPU6500 IMU, and GPS — under active development.",
    year: "2024",
    scene: "systems",
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
      "Custom hexacopter (6-rotor) flight controller built around an STM32 MCU.",
      "PCB designed in KiCad; MPU6500 inertial measurement unit and GPS for telemetry.",
      "Includes test sketches (gps_testing_stm32.ino, MPU6500_Visualizer_Code.ino).",
      "Organized into docs/, hardware/, firmware/, images/. Educational / research, under active development.",
    ],
  },
  {
    id: "zmk-keyboard",
    title: "ZMK Custom Keyboard Firmware",
    blurb:
      "ZMK (Zephyr RTOS-based) firmware configuration for a custom mechanical keyboard, with a GitHub Actions continuous-integration build pipeline.",
    year: "2026",
    scene: "systems",
    repo: "https://github.com/el-oggy/zmk-config",
    proficiencyLabel: "Hands-on",
    stack: ["ZMK Firmware", "Zephyr RTOS", "GitHub Actions CI", "YAML", "C"],
    details: [
      "ZMK firmware configuration for a custom mechanical keyboard, built on the Zephyr RTOS.",
      "GitHub Actions CI automatically builds firmware on every commit (build.yaml).",
      "Standard ZMK repo structure: workflow, board/shield definitions, config, and build slices.",
    ],
  },
  {
    id: "flowos",
    title: "FlowOS — Offline-First Productivity Dashboard",
    blurb:
      "A fully responsive offline-first personal productivity dashboard: habit tracking, calendar, and state — built with vanilla ES6 JavaScript and IndexedDB local storage.",
    year: "2026",
    scene: "systems",
    repo: "https://github.com/el-oggy/PersonalDashboard",
    proficiencyLabel: "Hands-on",
    stack: ["Vanilla JS (ES6)", "IndexedDB", "HTML5", "CSS3"],
    details: [
      "Offline-first design — all data lives in the browser via IndexedDB; no backend required.",
      "Modular JavaScript: database, UI, state, calendar, and habits modules.",
      "On GitHub the repo is now named 'Habit Tracker (formerly FlowOS)'; the portfolio retains the FlowOS branding.",
    ],
  },
  {
    id: "weather-station",
    title: "IoT Weather Monitoring Station",
    blurb:
      "Solar-powered IoT weather station on an ESP32 with multiple environmental sensors, transmitting telemetry for remote monitoring.",
    year: "2023",
    scene: "systems",
    proficiencyLabel: "Hands-on",
    stack: ["ESP32", "C/C++", "BME280", "BH1750", "DS18B20", "PCB Design", "Solar"],
    details: [
      "ESP32-based weather station capturing temperature, humidity, light, and soil temperature.",
      "Solar-powered for remote placement. Custom PCB design.",
      "Presented as completed project; no standalone public repo linked here.",
    ],
  },
  {
    id: "home-automation",
    title: "Home Automation with Smart Staircase Lighting",
    blurb:
      "ESP-based home automation with relay modules and a smart staircase lighting controller, managed via Blynk IoT.",
    year: "2024",
    scene: "systems",
    proficiencyLabel: "Hands-on",
    stack: ["Arduino", "Blynk IoT", "Relay Modules", "ESP"],
    details: [
      "ESP-based relay control for home appliances via the Blynk IoT platform.",
      "Smart staircase lighting triggered by presence.",
      "Presented as completed project; no standalone public repo linked here.",
    ],
  },
  {
    id: "basys3-counter",
    title: "4-bit Up/Down Counter on Basys-3 FPGA",
    blurb:
      "A 4-bit up/down counter with synchronous reset designed in Verilog, synthesised in Vivado, and implemented on an Artix-7 Basys-3 FPGA during the PMEC VLSI intensive.",
    year: "2025",
    scene: "fpga",
    proficiencyLabel: "Hands-on",
    stack: ["Verilog HDL", "Xilinx Vivado", "LTSpice", "Artix-7 Basys-3"],
    details: [
      "4-bit up/down counter with synchronous reset and enable.",
      "Implemented on the Artix-7 Basys-3 FPGA during the PMEC VLSI/EDA intensive.",
      "Part of the hands-on VLSI design flow training.",
    ],
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
      "Physical Design",
      "Floorplanning",
      "CTS",
      "Routing",
      "Constraints",
    ],
  },
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
      "Two-week intensive. Designed Verilog/VHDL circuits (adders, muxes, flip-flops, counters) and implemented a 4-bit up/down counter on an Artix-7 Basys-3 FPGA. Studied the full VLSI flow through DRC/LVS/ERC signoff.",
    topics: [
      "LTSpice",
      "Xilinx Vivado",
      "Cadence",
      "Verilog/VHDL",
      "Artix-7 Basys-3",
      "RTL → Synthesis → Physical Design",
      "DRC / LVS / ERC Signoff",
      "NMOS / CMOS Fabrication",
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
    group: "VLSI & Digital Design",
    items: [
      { name: "Verilog", level: "Intermediate" },
      { name: "Digital Logic Design", level: "Proficient" },
      { name: "FPGA Design / Vivado", level: "Intermediate" },
      { name: "RTL Design", level: "Intermediate" },
      { name: "Logic Synthesis", level: "Basic" },
      { name: "VHDL", level: "Basic" },
    ],
  },
  {
    group: "Embedded Systems & IoT",
    items: [
      { name: "Arduino", level: "Proficient" },
      { name: "ESP32", level: "Intermediate" },
      { name: "Raspberry Pi", level: "Basic" },
      { name: "Sensor Integration", level: "Intermediate" },
      { name: "UART / I2C / SPI", level: "Intermediate" },
      { name: "Blynk IoT", level: "Intermediate" },
    ],
  },
  {
    group: "Tools & Software",
    items: [
      { name: "LTSpice", level: "Intermediate" },
      { name: "Xilinx Vivado", level: "Intermediate" },
      { name: "Cadence", level: "Basic" },
      { name: "MATLAB", level: "Basic" },
      { name: "Git & GitHub", level: "Intermediate" },
    ],
  },
  {
    group: "Languages",
    items: [
      { name: "C / C++", level: "Intermediate" },
      { name: "Verilog HDL", level: "Intermediate" },
      { name: "JavaScript (ES6)", level: "Intermediate" },
      { name: "Python", level: "Basic" },
      { name: "HTML5 / CSS3", level: "Intermediate" },
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
    title: "VLSI Design using EDA Tools (Internship)",
    issuer: "PMEC",
  },
  {
    title: "Young IoT Prodigy",
    issuer: "Infosys Spring Board",
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
