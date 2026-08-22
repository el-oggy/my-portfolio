"use client";

import { useMemo } from "react";
import { Text } from "@react-three/drei";
import { RoomId } from "@/context/SceneContext";
import CorridorWalls from "./CorridorWalls";
import Door from "./Door";
import Avatar from "./Avatar";
import Doodles from "./Doodles";
import EasterEggs from "./EasterEggs";
import HeroText from "./HeroText";
import { SEGMENT_LENGTH, createCorridorDoors } from "./corridorConfig";

interface CorridorSegmentProps {
  segmentIndex: number;
  onDoorEnter: (roomId: RoomId) => void;
}

export default function CorridorSegment({ segmentIndex, onDoorEnter }: CorridorSegmentProps) {
  const zOffset = 10 - segmentIndex * SEGMENT_LENGTH;
  const doors = useMemo(() => createCorridorDoors(segmentIndex), [segmentIndex]);

  return (
    <group>
      <CorridorWalls zStart={zOffset} length={SEGMENT_LENGTH} doorPositions={doors} />

      <group position={[0, 0, zOffset - 2]}>
        <HeroText position={[0, -0.1, -0.5]} />
        <Avatar position={[0, -0.61, -0.3]} />
        <Doodles />
      </group>

      <EasterEggs zOffset={zOffset} />

      {doors.map((door) => (
        <Door
          key={door.id}
          z={zOffset + door.relativeZ}
          side={door.side}
          label={door.label}
          sublabel={door.roomId === "gallery" ? "Projects & schematics" : door.roomId === "studio" ? "RTL & firmware work" : door.roomId === "about" ? "Journey & milestones" : "Direct transmission"}
          number={String(doors.indexOf(door) + 1).padStart(2, "0")}
          icon={door.icon}
          accentColor={door.color}
          roomId={door.roomId}
          onEnter={onDoorEnter}
        />
      ))}

      <Text position={[2.5, 1.35, zOffset - 1]} fontSize={0.1} color="#a8a29e" anchorX="center">
        {`SEG ${segmentIndex}`}
      </Text>
    </group>
  );
}
