"use client";

import CorridorWalls from "./CorridorWalls";
import Door from "./Door";
import Avatar from "./Avatar";
import EasterEggs from "./EasterEggs";
import { RoomId } from "@/context/SceneContext";

export const SEGMENT_LENGTH = 80;

interface CorridorSegmentProps {
  segmentIndex: number;
  onDoorEnter: (roomId: RoomId) => void;
}

export default function CorridorSegment({
  segmentIndex = 0,
  onDoorEnter,
}: CorridorSegmentProps) {
  // Calculate Z offset for this segment
  // Segment 0: Z=10 to Z=-70
  // Segment 1: Z=-70 to Z=-150
  // Segment 2: Z=-150 to Z=-230...
  const zOffset = 10 - segmentIndex * SEGMENT_LENGTH;

  return (
    <group position={[0, 0, 0]}>
      {/* 80-unit Continuous Hand-Drawn Corridor Walls, Floor Planks, Baseboards & Ceiling */}
      <CorridorWalls zStart={zOffset} length={SEGMENT_LENGTH} />

      {/* Hallway Interactive Easter Eggs: Hanging Mouse & Duck Pot */}
      <EasterEggs zOffset={zOffset} />

      {/* Walking Doodle Avatar at the entrance of the first segment */}
      {segmentIndex === 0 && <Avatar position={[0, 1.1, zOffset - 4]} />}

      {/* --- The 4 Dedicated Section Doors in this Segment --- */}

      {/* Door 1: The Gallery Room (Left) */}
      <Door
        z={zOffset - 18}
        side="left"
        number="01"
        doorType="projekty"
        label="THE GALLERY"
        sublabel="Hanging Hardware Projects & Schematics"
        accentColor="#059669"
        roomId="gallery"
        onEnter={onDoorEnter}
      />

      {/* Door 2: The Studio / Hardware Lab (Right) */}
      <Door
        z={zOffset - 32}
        side="right"
        number="02"
        doorType="about"
        label="THE STUDIO"
        sublabel="3D Monitor Tower · RTL & Firmware"
        accentColor="#0284c7"
        roomId="studio"
        onEnter={onDoorEnter}
      />

      {/* Door 3: The About & Journey Room (Left) */}
      <Door
        z={zOffset - 48}
        side="left"
        number="03"
        doorType="social"
        label="ABOUT & JOURNEY"
        sublabel="Hot Air Balloons · Floating Island"
        accentColor="#7c3aed"
        roomId="about"
        onEnter={onDoorEnter}
      />

      {/* Door 4: The Contact Hub (Right) */}
      <Door
        z={zOffset - 62}
        side="right"
        number="04"
        doorType="kontakt"
        label="LET'S CONNECT"
        sublabel="Message In A Bottle · Direct Transmission"
        accentColor="#ea580c"
        roomId="contact"
        onEnter={onDoorEnter}
      />
    </group>
  );
}
