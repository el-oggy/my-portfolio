"use client";

import { useEffect, useMemo } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { RoomId } from "@/context/SceneContext";
import CorridorWalls from "./CorridorWalls";
import Door from "./Door";
import Avatar from "./Avatar";
import Doodles from "./Doodles";
import EasterEggs from "./EasterEggs";
import HeroText from "./HeroText";
import { createFrameQuoteTexture, createFrameVlsiTexture } from "@/lib/proceduralTextures";
import { SEGMENT_LENGTH, createCorridorDoors } from "./corridorConfig";

const QUOTES = [
  { title: "Daily Thought", body: "The best way to predict the future is to invent it." },
  { title: "Engineering", body: "Simplicity is the ultimate sophistication. Keep your circuits clean." },
  { title: "Innovation", body: "Any sufficiently advanced technology is indistinguishable from magic." },
  { title: "Perseverance", body: "It's not that I'm so smart, it's just that I stay with problems longer." },
  { title: "Design", body: "Good design is obvious. Great design is transparent." },
  { title: "Learning", body: "The important thing is not to stop questioning. Curiosity has its own reason." },
  { title: "Craftsmanship", body: "First, solve the problem. Then, write the code. Then, tape out the silicon." },
  { title: "Vision", body: "The chip does not care about your deadline. It cares about your timing closure." },
  { title: "Discipline", body: "Premature optimization is the root of all evil — but premature tapeout is worse." },
  { title: "Passion", body: "Engineers like to solve problems. If there are no problems available, they will create their own." },
];

const VLSI_DIAGRAMS = ["nand", "xor", "dff", "adder", "mosfet", "clock", "fsm"];

function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

interface CorridorSegmentProps {
  segmentIndex: number;
  onDoorEnter: (roomId: RoomId) => void;
}

export default function CorridorSegment({ segmentIndex, onDoorEnter }: CorridorSegmentProps) {
  const zOffset = 10 - segmentIndex * SEGMENT_LENGTH;
  const doors = useMemo(() => createCorridorDoors(segmentIndex), [segmentIndex]);

  // Photo frames — 5 per segment, alternating walls
  const frames = useMemo(() => {
    return [...Array(5)].map((_, i) => {
      const globalIndex = segmentIndex * 5 + i;
      const side = globalIndex % 2 === 0 ? -1 : 1;
      const z = zOffset - 12 - i * 14;
      const type = globalIndex % 2 === 0 ? "quote" : "vlsi" as const;
      const dayOfYear = getDayOfYear();
      const quoteIdx = (dayOfYear + globalIndex) % QUOTES.length;
      const diagramIdx = globalIndex % VLSI_DIAGRAMS.length;
      return { side, z, type, quoteIdx, diagramIdx, key: `frame-${segmentIndex}-${i}` };
    });
  }, [segmentIndex, zOffset]);

  const frameTextures = useMemo(
    () =>
      frames.map(({ type, quoteIdx, diagramIdx }) =>
        type === "quote"
          ? createFrameQuoteTexture(QUOTES[quoteIdx].title, QUOTES[quoteIdx].body)
          : createFrameVlsiTexture(VLSI_DIAGRAMS[diagramIdx]),
      ),
    [frames],
  );

  useEffect(
    () => () => frameTextures.forEach((tex) => tex.dispose()),
    [frameTextures],
  );

  return (
    <group>
      <CorridorWalls zStart={zOffset} length={SEGMENT_LENGTH} doorPositions={doors} />

      {/* Photo Frames on corridor walls */}
      {frames.map((frame, fi) => (
        <group
          key={frame.key}
          position={[frame.side * (WALL_X_OUTER + 0.02), 1.4, frame.z]}
          rotation-y={frame.side < 0 ? Math.PI / 2 : -Math.PI / 2}
        >
          <mesh position={[0, 0, -0.04]}>
            <planeGeometry args={[1.4, 1.05]} />
            <meshStandardMaterial color="#292524" roughness={0.85} />
          </mesh>
          <mesh position={[0, 0, -0.02]}>
            <planeGeometry args={[1.3, 0.96]} />
            <meshStandardMaterial color="#b45309" roughness={0.7} />
          </mesh>
          <mesh>
            <planeGeometry args={[1.22, 0.88]} />
            <meshStandardMaterial map={frameTextures[fi]} roughness={0.9} />
          </mesh>
        </group>
      ))}

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
import { WALL_X_OUTER } from "./corridorConfig";
