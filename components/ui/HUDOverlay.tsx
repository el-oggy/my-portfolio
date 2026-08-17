"use client";

import { useScene, RoomId } from "@/context/SceneContext";
import { identity } from "@/lib/data";

const QUICK_ROOMS: { id: RoomId; label: string; num: string }[] = [
  { id: "pcb", label: "PCB Hub", num: "01" },
  { id: "embedded", label: "Embedded", num: "02" },
  { id: "iot", label: "IoT", num: "03" },
  { id: "drone", label: "Drone", num: "04" },
  { id: "firmware", label: "Firmware", num: "05" },
  { id: "rtl", label: "RTL", num: "06" },
  { id: "projects", label: "Projects", num: "07" },
  { id: "journey", label: "Journey", num: "08" },
  { id: "contact", label: "Contact", num: "09" },
];

export default function HUDOverlay() {
  const { hasEntered, currentRoom, enterRoom, soundEnabled, toggleSound } = useScene();

  if (!hasEntered || currentRoom !== null) return null;

  return (
    <aside aria-label="Interactive HUD" className="fixed inset-0 pointer-events-none z-30 flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* Top Bar HUD */}
      <header className="flex flex-wrap items-center justify-between gap-4 pointer-events-auto bg-[var(--bg-paper-warm)]/85 backdrop-blur-sm border-2 border-[var(--pencil-line)] p-3 sm:px-5 sm:py-2.5 rounded-xl shadow-md">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-embedded)] animate-pulse" />
          <div>
            <div className="font-bold text-sm text-[var(--ink)] tracking-tight">
              {identity.name}
            </div>
            <div className="text-[10px] font-mono text-[var(--ink-faint)]">
              VLSI & EMBEDDED SYSTEMS
            </div>
          </div>
        </div>

        {/* Quick Jump Room Pills */}
        <nav aria-label="Corridor Rooms" className="hidden md:flex items-center gap-1.5 overflow-x-auto py-1">
          {QUICK_ROOMS.map((r) => (
            <button
              key={r.id}
              onClick={() => enterRoom(r.id)}
              className="font-mono text-xs px-2.5 py-1 rounded-md border border-[var(--pencil-line)]/40 hover:border-[var(--pencil-line)] bg-white/80 hover:bg-[var(--note-yellow)] text-[var(--ink)] transition-colors"
            >
              <span className="text-[var(--accent-embedded)] mr-1">{r.num}</span>
              <span>{r.label}</span>
            </button>
          ))}
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="font-mono text-xs px-2.5 py-1 border border-[var(--pencil-line)] rounded bg-white hover:bg-[var(--note-yellow)] text-[var(--ink)] transition-colors"
          >
            {soundEnabled ? "🔊 SOUND ON" : "🔇 SOUND OFF"}
          </button>
        </div>
      </header>

      {/* Bottom Hint Banner */}
      <footer className="self-center pointer-events-auto bg-[var(--bg-paper-warm)]/90 backdrop-blur-sm border-2 border-[var(--pencil-line)] py-2 px-5 rounded-full shadow-md text-center">
        <p className="font-caveat text-base sm:text-lg text-[var(--ink)] font-bold">
          ✦ SCROLL TO WALK CORRIDOR · HOVER TO PAINT · CLICK DOORS TO ENTER ✦
        </p>
      </footer>
    </aside>
  );
}
