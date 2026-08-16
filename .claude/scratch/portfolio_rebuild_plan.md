# Architecture & Experience Proposal: Immersive Portfolio

This document outlines the complete architectural and experience plan for the from-scratch rebuild of Adarsh Swarup Maharana's portfolio. It is based on the 57-point master directive, the ITom UX reference audit, and the verified content audit of the live portfolio + GitHub.

> **STATUS: APPROVED — BUILD FROM SCRATCH.** This document is the source of truth. Section M (Verified Content Inventory) supersedes any conflicting assumption in the master directive.

> **AMENDMENT (2026-08-17) — RE-THEME: ELECTRONICS / EMBEDDED / IoT.** Per owner decision, the immersive itomdev-style experience is retained (architecture: single-canvas continuous world, camera path, Lenis+GSAP scroll driver, First-Boot intro, capability tiers) but the identity/world is rebuilt around **electronics, embedded systems, IoT, and robotics** — no VLSI focus. Scene map is now: intro (First Boot) → pcb (Circuit Hub) → embedded (microcontrollers) → iot (sensors & wireless) → drone (robotics hero — STM32 hexacopter) → firmware (ZMK, FlowOS, CI) → journey (signal path timeline) → contact (beacon). Content in `lib/data.ts` follows the same no-fabrication rule; the VLSI-specific projects were dropped and the VLSI internships remain only as honest Journey nodes. See git history for the diff.

---

### A. Experience Map

The visitor journey is a continuous, cinematic progression through a stylized digital hardware world, from "First Boot" to "Final Contact."

1.  **Landing & First Boot:** Near-black screen. A subtle electrical pulse animates, drawing circuit traces that reveal a stylized silicon die. The camera pulls back as the system "powers on."
2.  **Identity Reveal:** "Hello." materializes, followed by **"Adarsh Swarup Maharana"** and professional identity. The "System Initialization" moment.
3.  **Entering the World:** A seamless camera transition moves the visitor *into* the silicon die, which becomes the central hub of the portfolio world.
4.  **Spatial Navigation:** Distinct regions (`RTL`, `ASIC / Physical Design`, `FPGA`, etc.). Navigate primarily by scrolling, which pilots the camera through the environment. A persistent, minimal UI offers direct navigation and sound control.
5.  **Content Discovery:** As the camera enters a region, the environment transforms to match the concept. Scrolling further reveals hero projects (e.g., `2D Systolic Array` visualized as an interactive PE matrix).
6.  **Project Deep Dive:** "Enter Project" triggers an immersive transition — the camera flies *into* the visualization, where detailed project info (HTML) is presented alongside the interactive 3D model.
7.  **The Journey:** A dedicated path visualizes the career timeline as a "signal path through time."
8.  **Final Contact:** The journey concludes at a final, simplified node. Contact info presented cleanly.
9.  **Departure:** The visitor leaves with a memorable story of an engineer's world — experienced, not just read.

### B. Scene Map

Modular scenes, managed by a central controller, **all positioned in a single continuous world coordinate space** (one persistent Canvas — no remount between scenes, for seamless continuity + lazy-loading).

1.  **`IntroScene`** — "First Boot": shader-animated traces → chip reveal → `SiliconScene`.
2.  **`SiliconScene` (Hub)** — stylized chip floorplan; camera travels across it to reach other scenes' entry portals.
3.  **`RTLScene`** — logic blocks, registers, buses, FSM paths; hosts Systolic Array + Sequence Detector.
4.  **`ASICScene`** — physical-design flow: floorplan→placement→power→CTS→routing→timing→GDSII as scroll stages.
5.  **`TimingScene`** — STA visualization: launch→comb. logic→capture registers, animated timing arcs.
6.  **`FPGAScene`** — LUTs, routing channels, I/O blocks; FPGA projects.
7.  **`SystemsScene`** — embedded systems; visually distinct (PCB/component feel, STM32/ESP32).
8.  **`JourneyScene`** — career timeline as a signal path through time.
9.  **`ContactScene`** — minimal endpoint; final CTA + links.

### C. Navigation Model

*   **Primary (Scroll):** Lenis smooth-scroll + GSAP ScrollTrigger. A single normalized scroll-progress value drives the camera along its world path; section reveals triggered at scroll milestones. Real DOM scroll is preserved for accessibility/SEO.
*   **Secondary (Click/UI):** minimal persistent UI — accessible nav overlay (direct links to all sections), `SOUND ON/OFF`, "scroll to explore" prompt.
*   **Tertiary (Pointer/Touch):** Desktop mouse → parallax/lighting/trace intensity. Mobile → swipe + optional gyroscope look.
*   **Keyboard:** full Tab/Enter/Arrow nav via the accessible UI layer.

### D. Technical Architecture

*   **Framework:** Next.js 14 (App Router), React 18, TypeScript.
*   **3D:** React Three Fiber (R3F v8) + @react-three/drei v9 + three.
*   **Animation:** GSAP (+ ScrollTrigger) for camera/scene choreography; Framer Motion for DOM UI micro-interactions.
*   **Scroll:** Lenis, integrated with GSAP.
*   **Styling:** Tailwind CSS + CSS Modules for complex overlays.
*   **State:** React useState/useContext — `soundEnabled`, `currentScene`, `isMobile`, `reducedMotion`, `webGLAvailable`, `introComplete`. No Redux.

### E. Asset Strategy

*   **3D (procedural):** environments built from Three geometry + GLSL shaders (performant, stylistically cohesive). Systolic array = instanced PEs; routing = generated Line geometry.
*   **3D (custom):** low-poly Blender models only where they add real value (e.g., stylized STM32), used sparingly.
*   **Textures:** minimal; rely on shaders/lighting/materials. KTX2 compression when used.
*   **SVG:** UI icons + 2D schematic traces (animated) in the intro.
*   **Content source:** live portfolio + GitHub READMEs (verified — see Section M).

### F. Audio Strategy

*   Central `AudioContext`-based manager: load, play, volume, mute, one-shots, anti-overlap, cleanup.
*   Sounds: `ui_hover`, `ui_click`, `system_boot`, `signal_pulse`, `transition_enter`, `ambient_digital`.
*   **Muted by default.** Visible `SOUND ON/OFF`. Preference in `localStorage`. Preload UI sounds; lazy-load ambient.

### G. Performance Strategy

Code-split scenes via `next/dynamic` (only Intro+Silicon load initially). Draco for models, KTX2 textures, heavy instancing. LODs for distant objects. `PerformanceMonitor` (drei) → auto-fallback below fps threshold. Simple shaders. rAF-gated render loop.

### H. Mobile Strategy

Adaptive (not scaled-down desktop). Reduced 3D complexity (constrained/linear layouts), fewer objects, gentler camera, optional gyroscope, larger touch targets, aggressive perf monitoring → fast 2D fallback.

### I. Accessibility Strategy

*   **Reduced motion** (`prefers-reduced-motion: reduce`): disable camera anim + 3D transitions → clean elegant 2D scrolling portfolio, same palette/type, simple fades.
*   **No-WebGL fallback:** silently render the reduced-motion 2D version; **no error message**.
*   Semantic HTML for all info content, layered over canvas (crawlable + screen-reader readable).
*   Full keyboard nav + visible focus + programmatic focus management during transitions + ARIA labels.

### J. File Architecture
```
app/ page.tsx, layout.tsx
components/
  canvas/ Experience.tsx, scenes/*, lights/, effects/
  ui/ Navigation, ProjectDetails, Timeline, SoundToggle, Loader
  audio/ AudioManager.ts
hooks/ useWindowSize, useScrollProgress, ...
lib/ data.ts, gsap.ts, lenis.ts
public/ models, textures, audio, resume.pdf
styles/ globals.css
```

### K. Implementation Sequence
1 Coresetup(done: research) → 2 Foundation → 3 Intro & Hub → 4 RTL & ASIC hero → 5 UI & data → 6 Supporting scenes → 7 Audio → 8 Mobile & fallbacks → 9 Polish & validation.

### L. Potential Technical Risks
(1) Perf on mid/low devices → monitoring+LOD+fallback. (2) GSAP-timeline spaghetti → per-scene timelines via central scroll controller. (3) Mobile parity → design in parallel. (4) Asset pipeline → favor procedural.

---

### M. Verified Content Inventory & Resolved Decisions (data-layer source of truth)

Defines the exact content for `lib/data.ts`. Built from the live portfolio (`adarsh-vlsi.vercel.app`) + GitHub (`el-oggy`). **Only confirmed, non-fabricated content is included.**

> **Writing rule (§18, §53):** No tapeouts, fabricated silicon, industry PD employment, ICC2/PrimeTime expertise, fake metrics/certs/titles. Capability claims require a corroborating repo or cert — else excluded.

#### M.0 Resolved decisions
- **VLSI training:** Feature **both** PMEC (Oct 2025, verified) and NIELIT Noida (2025–2026) as separate Journey nodes, honest "Training / Exposure vs Hands-on" labels (§20).
- **LinkedIn:** `https://www.linkedin.com/in/adarsh-swarup-maharana-4839763b8/` (live-site slug).
- **Excluded:** the unverifiable "RISC-V SoC modules" capability claim (no repo).

#### M.1 Identity & contact
```
name            Adarsh Swarup Maharana
titleLine1      Physical Design · RTL · FPGA
titleLine2      Embedded Systems
supportingLine  Building efficient digital hardware from RTL toward silicon.
                (Current learning, not professional tapeout experience)
location        Berhampur, Odisha, India
email           adarshswarupmaharana@gmail.com
github          https://github.com/el-oggy
linkedin        https://www.linkedin.com/in/adarsh-swarup-maharana-4839763b8/
portfolioURL    https://adarsh-vlsi.vercel.app/
resume          /resume.pdf  (configurable — see M.8)
currentCV       https://drive.google.com/file/d/1XYQu1boH9sWpseAs0uv-9hWWglkdFMjl/view?usp=sharing
```

#### M.2 Projects (verified)
**Hero — 2D Systolic Array** (RTLScene centerpiece)
```
repo https://github.com/el-oggy/2D-systolic-array-  lang Verilog
purpose 2D systolic array accelerator for matrix multiplication (C=A×B), INT8, Edge AI Hackathon 2026
perf Fully pipelined; 3N−1 cycles; parameterized N & DATA_WIDTH (tested 2×2, 4×4)
arch systolic_top { skew buffers A/B → N×N PE grid → controller FSM }; FSM IDLE→LOAD→COMPUTE→DONE
modules 1_pe.v, 3_systolic_array.v, 5_skew_buffer.v, 6_controller.v, 7_systolic_top.v
verify 3 testbenches passing: pe_tb, systolic_2x2_tb, systolic_4x4_tb (4×4 known-answer + negatives)
notable B-matrix transposition → single shift-register buffer for both streams; N× bandwidth reduction
refs Kung & Leiserson 1978; Jouppi 2017 (TPU); Eyeriss 2016
apps Edge-AI inference / matrix multiply; convolution/DSP/MIMO as related areas (RTL computes matmul)
```
**STM32 Drone Sensor Integration** (SystemsScene)
```
repo https://github.com/el-oggy/Drone-hexcoptor-  year 2024
stack STM32, KiCad, MPU6500 IMU, GPS, Embedded C++, I2C & UART
desc Custom hexacopter (6-rotor) flight controller; .ino test files; docs/hardware/firmware/images
```
**ZMK Custom Keyboard Firmware** (SystemsScene)
```
repo https://github.com/el-oggy/zmk-config  year 2026
stack ZMK Firmware, Zephyr RTOS, GitHub Actions CI, build.yaml, YAML, C  desc split-keyboard firmware config; CI pipeline
```
**FlowOS / Habit Tracker** (secondary, software)
```
repo https://github.com/el-oggy/PersonalDashboard  year 2026
stack Vanilla JS ES6, IndexedDB, HTML5/CSS3
note GitHub renamed "Habit Tracker (formerly FlowOS)"; display as "FlowOS — Offline-First Productivity Dashboard", link PersonalDashboard
```
**Featured-without-GitHub** (from live portfolio; no repo confirmed — feature, no fabricated links)
```
FPGA Sequence Detector — Mealy & Moore (2024): Verilog, Vivado, FPGA, FSM; detects '1011'
4-bit Up/Down Counter on Basys-3 FPGA (2025): Verilog, Vivado, LTSpice, Artix-7 Basys-3 (PMEC)
IoT Weather Monitoring System (2023): ESP32, C/C++, BME280, BH1750, DS18B20, PCB, solar
Home Automation with Smart Staircase Lighting (2024): Arduino, Blynk IoT, relays, ESP
```

#### M.3 Experience (JourneyScene nodes) — honest Training/Exposure vs Hands-on labels
1. Research & Technical Intern — NIT Rourkela (Recent): hardware systems eng, digital design, embedded; academic collaboration.
2. Technical Intern — VLSI Design using EDA Tools — PMEC (Oct 2025, Berhampur): 2-wk intensive. LTSpice, Vivado, Cadence. Verilog/VHDL (adders/muxes/ff/counters). 4-bit Up/Down Counter on Artix-7 Basys-3. Full VLSI flow RTL→synthesis→back-end physical→DRC/LVS/ERC signoff→fabrication. NMOS/CMOS fab.
3. Consultancy Agent — TDS Consultancy (Dec 2023–Jun 2024, Berhampur): client-facing technical research, requirements, planning.
4. NIELIT Noida — VLSI Design Flow: RTL→GDS-II (2025–2026; Training/Current Learning): RTL, synthesis, STA, Linux, TCL, PD, floorplanning, CTS, routing, constraints. Label "Currently Learning / Training — Exposure" (NOT hands-on production PD).

#### M.4 Journey timeline (signal path through time)
```
2023   Diploma — Electronics & Telecom, Uma Charan Pattnaik Engg School, Berhampur (IoT Weather)
2023-24 TDS Consultancy — Consultancy Agent
2024   STM32 Drone · FPGA Sequence Detector · Home Automation
Oct25  PMEC — VLSI/EDA intensive
2025   NIT Rourkela — Research & Technical Intern; Basys-3 counter
2025-26 NIELIT Noida — RTL→GDSII (Training/Current Learning)
2026   Habit Tracker/FlowOS · ZMK Keyboard Firmware
2027   B.Tech expected — Electronics & Telecom, Parala Maharaja Engg College, Sitalapali (2421109136)
bg     High School — St. Xavier High School, Ambapua, Berhampur
```

#### M.5 Skills matrix (self-reported; render with honest proficiency badges)
```
VLSI & Digital Design: Verilog(Int) Digital Logic(Prof) FPGA/Vivado(Int) RTL(Int) Synthesis(Basic) VHDL(Basic)
Embedded & IoT: Arduino(Prof) ESP32(Int) RPi(Basic) Sensor Int.(Int) UART/I2C/SPI(Int) Blynk(Int)
Tools: LTSpice(Int) Vivado(Int) Cadence(Basic) MATLAB(Basic) Git/GitHub(Int)
Languages: C/C++(Int) Verilog(Int) JS ES6(Int) Python(Basic) HTML5/CSS3(Int)
```

#### M.6 Certifications (4, listed on live portfolio) — ⚠️ needs asset files
1. VLSI Design using EDA Tools — PMEC (Internship)  2. Infosys Spring Board — Young IoT Prodigy  3. Python Programming for Everybody — Coursera  4. VLSI Innovation, Embedded Systems & Cutting-Edge Hardware Solutions — Cert Program
> Portfolio links `/certificates/*.{jpg,pdf}` which I do **not** possess. Omitted or behind a "view certificate" affordance until you supply files. Do not fabricate cert visuals.

#### M.7 Color system (§33)
```
bg graphite/near-black #0A0C10→#06070A
RTL violet/blue #7C5CFF #4B7BFF | ASIC/PD teal/cyan #2DD4BF #22D3EE | FPGA electric blue #3B82F6
Timing cyan #22D3EE | Embedded green/teal #34D399 #14B8A6 | Timeline mixed gradient
accents subtle glow/glass/technical line — no giant neon fills
```

#### M.8 Resume / CV endpoint (§37)
- Configurable endpoint `/resume.pdf` (constant `links.resume` in lib/data.ts).
- Current CV placeholder = Google Drive link in M.1 ("Download current CV" fallback).
- Update path: drop Intel-targeted PDF at `public/resume.pdf`; no code change.

---

## N. ITom UX Audit (2026-08-17) + Phase Evolution Decisions

### N.1 ITom reference audit (live fetch of itomdev.com)
- **Journey shape:** ONE continuous 3D world — a hand-drawn / pencil-on-paper **corridor** the camera walks via **scroll + mouse + mobile gyroscope**. Not scene-per-section; a hub path with **interactive doors leading into a few deep content rooms** (Gallery=projects, Studio=blog/content, Contact; About + Awards along the corridor walls).
- **Intro:** a "sheet of paper rips open" reveal that drops the visitor into the corridor.
- **Aesthetic:** flat geometry, hand-drawn pencil textures, custom GLSL **paint-reveal** shaders. Projects use **real-time image distortion** (WebGL shader warps/bends photographs on mouse move) + **FLIP-technique shared-element lightbox** transitions. GSAP for transitions/micro-interactions/scroll-triggered motion.
- **Tech stack:** React + Next.js + Three.js + R3F + GSAP + Lenis + custom GLSL + Sanity CMS + Vercel. (Identical to ours minus CMS + the sketch aesthetic.)
- **Implication:** our foundation already matches ITom's *architecture + interaction model + stack*. The real gaps are (a) journey shape (we fly *past* 9 dioramas; they enter *rooms*), (b) aesthetic flourishes (paper-tear intro, image-distortion, FLIP lightbox), (c) CMS (they use Sanity; we use a hardcoded `lib/data.ts`, which is fine for a personal portfolio).

### N.2 Reconciled Phase-5+ decisions (2026-08-17)
- **Journey shape → HYBRID PATH + ROOMS.** Keep the scroll-driven scene path, but make 2–3 scenes "deep" enterable rooms (a **Projects gallery** room aggregating all builds; the **Journey** room), and tighten the others (pcb hub, embedded, iot, drone, firmware, rtl, contact) into corridor passage. No full corridor rebuild.
- **Aesthetic → BORROW ITOM FLOURISHES, keep neon-technical look.** Do NOT adopt the sketch/paper aesthetic. DO port: (1) **FLIP lightbox** project deep-dive transition, (2) **real-time image-distortion** GLSL shader on project media, (3) evolve the First-Boot intro reveal toward a paper-tear-style drop-in flourish (composable onto the existing circuit-trace shader).
- **Content → KEEP REAL verified content.** `lib/data.ts` stays Adarsh's real embedded/IoT/robotics inventory. No placeholders, no fabrication (§18/§53 still enforced).
- **Identity subject → Adarsh, broader dev.** Identity stays Adarsh; the "broader dev" goal is satisfied by the re-theme away from a VLSI-only niche toward embedded/IoT/robotics/firmware/RTL breadth.

### N.3 Build-health verification (2026-08-17)
- `tsc --noEmit` → **0 errors** after the re-theme.
- `next dev` → HTTP 200, page title `Adarsh Swarup Maharana — Embedded Systems · IoT · Electronics`, ready in 5.1s. All 9 scenes mount in `Experience.tsx`. No runtime import errors.
- **State:** re-themed working tree is coherent and runnable; it is uncommitted.

### N.4 Implementation sequence (evolution, not rebuild)
1. Commit the current re-themed working tree as a checkpoint (preserves the 9 scenes before structural evolution).
2. Repo-data: add a `portal`/`room` notion to `SceneDef` (sceneConfig.ts) so the camera + DOM know which scenes are corridor-passage vs deep-room; restructure the journey into hub → corridor → rooms.
3. Build the **Projects gallery room** scene (aggregates all `projects` into an enterable 3D space + a DOM detail panel).
4. Build the **FLIP lightbox** UI component for project deep-dives (Framer Motion + FLIP; shared-element transition from gallery thumbnail to detail overlay).
5. Build the **image-distortion GLSL shader** for project media (mouse-driven warp on `<ProjectMedia>` planes).
6. Evolve **IntroScene/IntroOverlay** toward a paper-tear-style drop-in flourish layered on the circuit-trace shader.
7. Polish + mobile/fallback validation (per Phase 8/9 of the original sequence).
