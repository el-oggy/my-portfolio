"use client";

import { useMemo } from "react";
import CorridorWalls from "./CorridorWalls";
import Door from "./Door";
import Avatar from "./Avatar";
import SegmentDoors from "./SegmentDoors";
import EasterEggs from "./EasterEggs";
import { RoomId } from "@/context/SceneContext";
import { Text } from "@react-three/drei";

export const SEGMENT_LENGTH = 80;

interface CorridorSegmentProps {
  segmentIndex: number;
  onDoorEnter: (roomId: RoomId) => void;
  hideSegmentDoors?: boolean;
}

export default function CorridorSegment({
  segmentIndex = 0,
  onDoorEnter,
  hideSegmentDoors = false,
}: CorridorSegmentProps) {
  // Calculate Z offset for this segment
  // Segment 0: Z=10 to Z=-70
  // Segment 1: Z=-70 to Z=-150
  // Segment 2: Z=-150 to Z=-230...
  const zOffset = 10 - segmentIndex * SEGMENT_LENGTH;

  return (
    <group position={[0, 0, 0]}>
      {/* 80-unit Corridor Walls, Floor Planks, Baseboards & Ceiling */}
      <CorridorWalls zStart={zOffset} length={SEGMENT_LENGTH} />

      {/* Hallway Interactive Easter Eggs: Hanging Mouse & Duck Pot */}
      <EasterEggs zOffset={zOffset} />

      {/* Walking Doodle Avatar at the entrance of each segment */}
      <Avatar position={[0, 1.1, zOffset - 4]} />

      {/* Segment Header Title */}
      <group position={[0, 3.8, zOffset - 6]}>
        <Text
          position={[0, 0.2, 0]}
          fontSize={0.3}
          color="#1a1917"
          font="/fonts/CabinSketch-Bold.ttf"
          anchorX="center"
          anchorY="middle"
        >
          {segmentIndex === 0
            ? "✦ ENGINEERING CORRIDOR ✦"
            : `✦ CORRIDOR SECTION #${segmentIndex + 1} ✦`}
        </Text>
        <Text
          position={[0, -0.22, 0]}
          fontSize={0.18}
          color="#78716c"
          font="/fonts/CabinSketch-Regular.ttf"
          anchorX="center"
          anchorY="middle"
        >
          SCROLL TO GLIDE FOREVER · CLICK DOORS TO ENTER
        </Text>
      </group>

      {/* --- The 4 Dedicated Section Doors in this Segment --- */}

      {/* Door 1: The Gallery Room (Left) */}
      <Door
        z={zOffset - 18}
        side="left"
        number="01"
        doorType="projekty"
        label="THE GALLERY"
        sublabel="Hanging Hardware Projects & Certificates"
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
        label="THE HARDWARE STUDIO"
        sublabel="STM32 MCU · RTL Compute · Schematics"
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
        sublabel="3D Paper Airplane · Flight Milestones"
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
        sublabel="3D Notice Board · Résumé · Transmission"
        accentColor="#ea580c"
        roomId="contact"
        onEnter={onDoorEnter}
      />

      {/* Segment End Doors (connecting to next segment seamlessly) */}
      {!hideSegmentDoors && (
        <SegmentDoors position={[0, 0, zOffset - SEGMENT_LENGTH + 5]} />
      )}
    </group>
  );
}
