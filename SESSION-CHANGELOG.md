# Portfolio Transformation — Session Changelog

**Project:** Adarsh Swarup Maharana — Immersive 3D Portfolio
**Branch:** `codex/electronics-theme`
**Session window:** commits `b7236ef` … `495c4da` (16 commits)

A working record of everything done in this session, grouped by theme.
Raw commit messages: `git log --oneline`.

---

## 1. Performance & Stability

- **−70 MB of dead backup textures** deleted from `public/` (`textures/**/backups/`).
- **~3,400 lines of orphaned code removed**: the abandoned TypeScript mirror of the whole 3D experience (`components/canvas`, dead `dom/ui/context/hooks/lib` files), CRA leftovers inside itom, broken `sanity.js`, unused preload list, vendored `.cjs` patch scripts.
- **GPU memory leaks fixed**: render-time texture clones (CorridorWalls / DoorSection / SegmentDoors) hoisted into memoized components; new `useDispose()` hook frees cloned textures/materials/geometries on unmount; shared drei texture cache used instead of raw `TextureLoader`.
- **Per-frame allocations removed** in cloud/billboard/social-barrel animation loops.
- **HIGH-tier tuning**: DPR capped `[1, 1.75]`, shadows disabled (scene is fully unlit).
- **Room keep-alive**: rooms stay mounted (hidden) after first entry — re-entry lag eliminated; ambient audio gated on visibility.
- **Boot fast path**: heavy 4-room warmup removed; preloader no longer stalls at ~90%.
- **Balloon crash fix**: guarded `e.point` in magnet handler (`TypeError: reading 'x'`).

## 2. Identity & Content

- Entrance: hanging sign reads **"WELCOME — come on in"**; door leaves carry **electronics logos** (waveform, STM32 chip, C/C++, PCB traces, ESP32 board, Git branch).
- Hero tagline under ADARSH letters: *"Designing the micro-world that powers the macro-world."*
- Hallway plaques rotate personal mottos + electronics jokes + famous tech quotes (Clarke, Kay, Feynman, Dijkstra).
- Wall frames render **live text boards** (`FrameBoard`) — jokes/mottos set as real 3D text inside frame geometry.
- About room: full name milestone, **ACHIEVEMENTS** cards = Internships (NIT Rourkela + PMEC) & Certificates; Journey rebuilt as **4 education islands** (Class X 2020 · Diploma UCP 2020–23 · B.Tech PMEC 2024–27 · TDS Consultancy 2023–24); wooden glider; blue sky with scroll-following backdrop.
- Skill balloons replaced web-dev set with **Verilog · SystemVerilog · STM32 · C/C++ · ESP32 · Arduino · Vivado · KiCad · Git · Python** (generated sketch art).
- Gallery shows real AI-generated project art (+ painted hover variants) and tech-stack chips on card backs.
- Contact room: CV barrel (Google Drive), honest EMAIL barrel opening an in-portfolio form overlay; original author's branding/content fully scrubbed.

## 3. SEO & Pages

- Static OG card (`app/opengraph-image.png`, regenerate via `scripts/generate-og.mjs`), sitemap, robots, JSON-LD Person schema.
- Virtual room routes rewritten server-side (`/gallery /studio /about /contact`) so F5 works anywhere.
- New **`/email`** standalone page (paper-styled, Web3Forms) + in-experience email overlay (Esc / backdrop / ✕ to close). Submit: *"Let's transmit signal 📡"*.

## 4. Tooling added

| Script | Purpose |
|---|---|
| `npm run check:assets` | Verifies all static asset references exist (runs automatically as `prebuild`). |
| `node scripts/generate-art.mjs` | Regenerates procedural sketch art (doors, sign, balloons, islands…). |
| `node scripts/import-art.mjs` | Re-imports + crops real/AI imagery from `../portfolio-main`. |
| `node scripts/_room-hunt.cjs <url>` | Headless error sweep across corridor + all rooms. |
| `node scripts/_scroll-check.cjs` | Verifies scroll-lock scoping (/email scrolls, / locks). |

## 5. Known follow-ups (deliberately open)

1. **Per-room deep theming** (walls/props carrying each room's identity, not just atmosphere tint) — pending design discussion.
2. `NEXT_PUBLIC_WEB3FORMS_KEY` must be set in Vercel env for form delivery.
3. Domain mismatch to resolve: SEO points to `adarsh-vlsi.vercel.app`; other repo data says `adarsh-maharana.vercel.app`.
4. `eslint.ignoreDuringBuilds: true` still on (~40 style errors to clean before enabling).
5. FPGA counter & sequence-detector projects exist in portfolio_data but aren't gallery cards yet.
