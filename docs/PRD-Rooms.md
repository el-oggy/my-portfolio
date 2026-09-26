# Portfolio 3D Rooms Redesign - Product Requirements Document (PRD)

## Overview
The goal is to transition the four primary rooms in the 3D portfolio from a stylized/abstract look to a highly realistic, immersive 3D aesthetic. The entrance hallway will remain black and white, serving as a stark contrast to the vivid, detailed, and realistic interiors of the rooms.

## Design Themes & Implementations

### 1. About Room: Vintage Electronics Workshop
**Concept:** A warm, nostalgic workspace that grounds the user's VLSI engineering background in tactile history.
**Key Elements:**
- **Lighting:** Warm incandescent overhead lights and desk lamps casting realistic shadows.
- **Environment:** Sturdy wooden workbenches, pegboards with tools, and a slightly dusty, lived-in atmosphere.
- **Props:** Scattered blueprints, vintage oscilloscopes with glowing green traces, soldering irons, and piles of electronic components (resistors, capacitors, early chips).
- **Interactivity:** Blueprints can be clicked to reveal the "About Me" information, and the oscilloscope screen can display dynamic waveforms responding to audio or interaction.

### 2. Gallery Room: VR-Style Interactive Museum
**Concept:** A cutting-edge, high-tech exhibition space for showcasing projects and achievements.
**Key Elements:**
- **Lighting:** Deep spatial lighting with glowing data streams illuminating the dark environment.
- **Environment:** Clean, architectural lines with a sense of vast, infinite space typical of VR environments.
- **Props:** Floating holographic screens displaying project details, glowing pedestals, and dynamic data particles flowing through the air.
- **Interactivity:** Approaching a pedestal expands a floating screen with detailed project metrics and visuals.

### 3. Studio Room: VLSI Command Center
**Concept:** A realistic, modern engineering workstation that reflects current, high-end VLSI design environments.
**Key Elements:**
- **Lighting:** Ambient LED strip lighting (cool blues and purples) contrasting with bright, focused task lights.
- **Environment:** A sleek, dark-themed command center with high-tech acoustic paneling.
- **Props:** Multiple curved monitors displaying complex EDA (Electronic Design Automation) software, glowing server racks in the background, and a high-end ergonomic chair.
- **Interactivity:** Monitors serve as the interface for the user's core skills and current workflow/tools.

### 4. Contact Room: High-Rise Executive Office at Dusk
**Concept:** A professional, sleek, and atmospheric space for final interactions and reaching out.
**Key Elements:**
- **Lighting:** Dramatic dusk lighting filtering through floor-to-ceiling windows, mixing warm sunset colors with cool interior accents.
- **Environment:** A modern high-rise office overlooking a glowing, hyper-realistic city skyline.
- **Props:** A sleek glass desk, leather seating, and an interactive holographic communication terminal.
- **Interactivity:** The holographic terminal serves as the contact form interface, allowing visitors to send a message directly to the creator.

## Performance Requirements
- Maintain a minimum of 45fps on throttled mobile profiles.
- Keep new 3D assets optimized (target < 1.5MB per room where possible).
- Utilize `NEXT_PUBLIC_REALISM_MODE=stylized|legacy` feature flags to allow fallback for lower-end devices.
- Implement aggressive frustum culling and LOD (Level of Detail) for the realistic assets.
