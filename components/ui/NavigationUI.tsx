"use client";

import { useState } from "react";
import { useScene } from "@/context/SceneContext";
import { sfx } from "@/lib/soundEffects";
import MapOverlay from "./MapOverlay";

export default function NavigationUI() {
  const { hasEntered, currentRoom, exitRoom, soundEnabled, toggleSound } = useScene();
  const [mapOpen, setMapOpen] = useState(false);

  return (
    <>
      <nav className="fixed inset-0 pointer-events-none z-40 select-none p-5 sm:p-7 flex flex-col justify-between">
        {/* Top Bar: Minimalist Clean Corners */}
        <div className="flex items-center justify-between w-full">
          {/* Left: Brand or Room Back Button */}
          <div className="pointer-events-auto">
            {currentRoom ? (
              <button
                onClick={() => {
                  sfx.play("closeDoor");
                  exitRoom();
                }}
                className="sketch-btn py-2 px-5 text-sm font-bold flex items-center gap-2 bg-[#fef9c3] hover:bg-[#fde047] shadow-lg animate-bounce"
              >
                <span>←</span>
                <span>BACK TO CORRIDOR</span>
              </button>
            ) : (
              <div
                className="font-bold text-base tracking-widest text-[#1a1917]"
                style={{ fontFamily: "'CabinSketch', cursive" }}
              >
                ADARSH MAHARANA
              </div>
            )}
          </div>

          {/* Right: Map & Audio Toggle Buttons */}
          <div className="pointer-events-auto flex items-center gap-2.5">
            <button
              onClick={() => {
                sfx.play("paper");
                setMapOpen(true);
              }}
              className="font-mono text-xs px-3.5 py-1.5 border-2 border-[#1a1917] rounded-full bg-white/90 hover:bg-[#fef9c3] text-[#1a1917] shadow-sm transition-transform active:scale-95 flex items-center gap-1.5"
            >
              <span>🗺️</span>
              <span className="font-bold">MAP</span>
            </button>

            <button
              onClick={() => {
                toggleSound();
                sfx.setEnabled(!soundEnabled);
              }}
              className="font-mono text-xs px-3 py-1.5 border-2 border-[#1a1917] rounded-full bg-white/90 hover:bg-[#fef9c3] text-[#1a1917] shadow-sm transition-transform active:scale-95"
            >
              {soundEnabled ? "🔊 SOUND ON" : "🔇 SOUND OFF"}
            </button>
          </div>
        </div>

        {/* Bottom Hint Banner (Only visible in corridor) */}
        {hasEntered && !currentRoom && (
          <div className="self-center pointer-events-auto bg-[#fbf9f5]/90 backdrop-blur-sm border-2 border-[#1a1917] py-2 px-6 rounded-full shadow-md text-center">
            <p
              className="text-base sm:text-lg text-[#1a1917] font-bold"
              style={{ fontFamily: "'CabinSketch', cursive" }}
            >
              ✦ SCROLL TO WALK FOREVER · HOVER TO PAINT · CLICK DOORS TO ENTER ✦
            </p>
          </div>
        )}
      </nav>

      {/* Blueprint Map Modal */}
      <MapOverlay isOpen={mapOpen} onClose={() => setMapOpen(false)} />
    </>
  );
}
