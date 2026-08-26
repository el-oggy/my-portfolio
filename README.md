# 🛰️ Adarsh Swarup Maharana — 3D Interactive Portfolio

> *"Designing the micro-world that powers the macro-world."*

An immersive, interactive 3D WebGL portfolio celebrating embedded systems, microcontrollers, IoT, robotics, and hardware engineering. Built with **Next.js 14**, **Three.js / React Three Fiber**, **GSAP**, and **Tailwind CSS**.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-0.169-black?style=flat-square&logo=three.js)](https://threejs.org/)
[![React Three Fiber](https://img.shields.io/badge/R3F-8.18-red?style=flat-square)](https://docs.pmnd.rs/react-three-fiber/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

---

## 🌟 Key Features

- 🏛️ **3D Infinite Sketchbook Corridor**: Smooth camera progression through an architectural paper hallway along the Z-axis, with interactive hanging signs, Easter eggs, and dynamic room doorways.
- 🚪 **4 Dedicated 3D Thematic Rooms**:
  - **🎓 About Room**: 4 hand-drawn education islands (Class X, UCP Diploma, PMEC B.Tech, TDS Consultancy), real industry internships (NIT Rourkela & PMEC), certifications, and 3D electronics skill balloons (*Verilog, SystemVerilog, STM32, C/C++, KiCad, ESP32, Vivado, Git, Python*).
  - **🖼️ Gallery Room**: Interactive showcase of real hardware, firmware, and digital design builds (STM32 Hexacopter, Solar Weather Station, IoT Smart Staircase, Systolic Array, etc.) with detailed lightbox modals.
  - **🛠️ Studio Room**: 3D electronics workshop scene with interactive props and tools.
  - **📬 Contact Room**: Interactive 3D barrels for CV download and direct signal transmission, backed by an in-experience Web3Forms modal and standalone `/email` route.
- ⚡ **Optimized Performance Engine**:
  - Room keep-alive caching to eliminate re-entry lag.
  - Dynamic performance scaling (`LOW`, `MED`, `HIGH` tiers) with automatic DPR and antialiasing adjustments.
  - GPU memory management and texture lifecycle handling.
- ♿ **Semantic Accessibility & SEO**:
  - Full semantic HTML fallback cards for screen readers and SEO indexers.
  - Schema.org `Person` JSON-LD metadata and dynamic OpenGraph social cards.

---

## 🛠️ Tech Stack

| Domain | Technologies |
|---|---|
| **Framework & Core** | [Next.js 14](https://nextjs.org/) (App Router), React 18, TypeScript |
| **3D & Canvas** | [Three.js](https://threejs.org/), [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/), [@react-three/drei](https://github.com/pmndrs/drei) |
| **Animation & Motion** | [GSAP 3](https://greensock.com/gsap/), [Framer Motion](https://www.framer.com/motion/), [Lenis](https://lenis.darkroom.engineering/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/), Sass / SCSS modules |
| **Tooling & Scripts** | Custom asset validators (`check-assets.cjs`), procedural canvas sketch generators |

---

## 📁 Repository Structure

```text
├── app/                  # Next.js App Router (pages, layout, metadata, email route)
├── components/
│   ├── experience/       # WebGL root bridge & fallback wrappers
│   ├── itom/             # 3D Canvas scenes (corridor, entrance, rooms, shaders)
│   └── ui/               # DOM UI overlays (lightbox, gallery, navigation, email modal)
├── lib/                  # Centralized content layer (data.ts) & scene camera config
├── public/               # Textures, models, audio, fonts, and sketch art assets
├── scripts/              # Asset verification, OG generator, and procedural art tools
└── SESSION-CHANGELOG.md  # Detailed record of performance refactors and transformations
```

---

## 🙏 Credits & Acknowledgments

Special recognition and immense gratitude to **Tom** ([**itom.dev**](https://itom.dev) / [**@itomdev on GitHub**](https://github.com/itomdev)) for the original 3D paper sketchbook portfolio concept, creative aesthetic direction, and foundational WebGL reference that inspired this project.

This repository adapts and rebuilds upon that visual language, transforming the experience to showcase the world of **Electronics, Embedded Systems, Microcontrollers, and Robotics**.

---

## 📬 Contact & Connect

- **Engineer:** Adarsh Swarup Maharana
- **GitHub:** [@el-oggy](https://github.com/el-oggy)
- **LinkedIn:** [Adarsh Swarup Maharana](https://www.linkedin.com/in/adarsh-swarup-maharana-4839763b8/)
- **Email:** [adarshswarupmaharana@gmail.com](mailto:adarshswarupmaharana@gmail.com)
- **Live Site:** [adarsh-vlsi.vercel.app](https://adarsh-vlsi.vercel.app/)
