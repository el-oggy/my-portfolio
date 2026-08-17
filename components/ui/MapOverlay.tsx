"use client";

import { useScene, RoomId } from "@/context/SceneContext";
import { sfx } from "@/lib/soundEffects";

interface MapOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const MAP_ROOMS: { id: RoomId; title: string; num: string; desc: string; color: string }[] = [
  {
    id: "gallery",
    title: "THE GALLERY",
    num: "01",
    desc: "Hanging Hardware Builds & Certificates",
    color: "#059669",
  },
  {
    id: "studio",
    title: "HARDWARE STUDIO",
    num: "02",
    desc: "3D Monitors & Live RTL Oscilloscope",
    color: "#0284c7",
  },
  {
    id: "about",
    title: "ABOUT & JOURNEY",
    num: "03",
    desc: "3D Paper Airplane & Milestone Cloud Sky",
    color: "#7c3aed",
  },
  {
    id: "contact",
    title: "TRANSMISSION & CONTACT",
    num: "04",
    desc: "3D Notice Board & Direct Email",
    color: "#ea580c",
  },
];

export default function MapOverlay({ isOpen, onClose }: MapOverlayProps) {
  const { teleportTo } = useScene();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in select-none">
      <div className="relative w-full max-w-xl bg-[#fbf9f5] border-4 border-[#1a1917] rounded-2xl p-6 sm:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={() => {
            sfx.play("paper");
            onClose();
          }}
          className="absolute top-4 right-4 text-xl font-bold font-mono w-8 h-8 flex items-center justify-center border-2 border-[#1a1917] rounded-full hover:bg-[#fef9c3] transition-colors"
        >
          ✕
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <h2
            className="text-2xl sm:text-3xl font-extrabold text-[#1a1917]"
            style={{ fontFamily: "'CabinSketch', cursive" }}
          >
            ✦ BLUEPRINT & CORRIDOR MAP ✦
          </h2>
          <p
            className="text-xs sm:text-sm text-[#78716c] font-bold"
            style={{ fontFamily: "'CabinSketch', cursive" }}
          >
            SELECT A ROOM TO TELEPORT DIRECTLY
          </p>
        </div>

        {/* Room Blueprint Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MAP_ROOMS.map((room) => (
            <button
              key={room.id}
              onClick={() => {
                sfx.play("openDoor");
                teleportTo(room.id);
                onClose();
              }}
              className="group text-left p-4 rounded-xl border-2 border-[#1a1917] bg-white hover:bg-[#fef9c3] hover:shadow-md transition-all duration-200 active:scale-95"
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className="text-xs font-mono font-bold px-2 py-0.5 rounded border border-[#1a1917]"
                  style={{ backgroundColor: room.color + "20", color: room.color }}
                >
                  ROOM {room.num}
                </span>
                <span className="text-xs font-bold text-[#a8a29e] group-hover:text-[#1a1917] transition-colors">
                  ENTER ➔
                </span>
              </div>
              <div
                className="text-lg font-bold text-[#1a1917] group-hover:text-[#c2410c] transition-colors"
                style={{ fontFamily: "'CabinSketch', cursive" }}
              >
                {room.title}
              </div>
              <div className="text-xs text-[#57534e] font-sans mt-0.5">
                {room.desc}
              </div>
            </button>
          ))}
        </div>

        {/* Corridor Return Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              sfx.play("paper");
              teleportTo(null);
              onClose();
            }}
            className="sketch-btn py-2 px-6 text-xs font-bold font-mono hover:bg-[#fef9c3]"
          >
            ✦ RETURN TO MAIN HALLWAY ✦
          </button>
        </div>
      </div>
    </div>
  );
}
