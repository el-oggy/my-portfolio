import { useMemo, useEffect, useState, memo } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

import CorridorWalls from './CorridorWalls';
import DoorSection from './DoorSection';
import SegmentDoors from './SegmentDoors';
import Avatar from './Avatar';
import HeroText from './HeroText';
import Doodles from './Doodles';
import CorridorDecorations from './CorridorDecorations';

/**
 * CorridorSegment Component
 * 
 * A single repeatable chunk of the infinite corridor.
 * Each segment contains: walls, avatar, ITOM text, doors, decorations.
 * 
 * Segment length: 80 units
 * Positioned based on segmentIndex * segmentLength
 */
const SEGMENT_LENGTH = 80;

// Sawtooth Geometry Constants (Shared with CorridorWalls logic conceptually)
const WALL_X_OUTER = 3.5;
const WALL_X_INNER = 1.7;
const DOOR_Z_SPAN = 4;
// Angle of the wall relative to the corridor axis
const WALL_ANGLE = Math.atan2(WALL_X_OUTER - WALL_X_INNER, DOOR_Z_SPAN);

// Hallway plaques — personal code, mottos & electronics humor
const QUOTES = [
  { title: "The Code I Live By", body: "Jack of all trades, master of none — yet oftentimes better than the master of one." },
  { title: "What I Do", body: "Designing the micro-world that powers the macro-world." },
  { title: "Binary", body: "There are 10 types of people: those who understand binary and those who don't." },
  { title: "Networking", body: "I'd tell you a UDP joke — but you might not get it." },
  { title: "Calendar Bug", body: "Why do programmers confuse Halloween and Christmas? Because OCT 31 equals DEC 25." },
  { title: "Resistors", body: "The most rebellious components in your box — they always oppose the current." },
  { title: "Capacitors", body: "Proof that sometimes life just needs a quick charge to bounce back." },
  { title: "Debugging", body: "Being the detective in a crime story where you are also the murderer." },
  { title: "Soldering", body: "My iron and I are very close — we've bonded over so many hot topics." },
  { title: "Timing Closure", body: "Like dieting: easy to promise at tape-out, impossible to achieve before the deadline." },
];

function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

const PhotoFrame = ({ side, z, index }) => {
  const dayOfYear = getDayOfYear();
  const quoteIndex = (dayOfYear + index) % QUOTES.length;
  const quote = QUOTES[quoteIndex];
  const wallX = WALL_X_OUTER + 0.02;
  const x = side === 'left' ? -wallX : wallX;
  const rotY = side === 'left' ? Math.PI / 2 : -Math.PI / 2;

  return (
    <group position={[x, 1.4, z]} rotation-y={rotY}>
      <mesh position={[0, 0, -0.04]}>
        <planeGeometry args={[1.2, 0.9]} />
        <meshStandardMaterial color="#292524" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[1.1, 0.8]} />
        <meshStandardMaterial color="#b45309" roughness={0.7} />
      </mesh>
      <Text
        position={[0, 0.28, 0.01]}
        fontSize={0.07}
        color="#c2410c"
        font="/fonts/CabinSketch-Bold.ttf"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.95}
      >
        {quote.title.toUpperCase()}
      </Text>
      <Text
        position={[0, 0, 0.01]}
        fontSize={0.055}
        color="#44403c"
        font="/fonts/CabinSketch-Regular.ttf"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.9}
        textAlign="center"
      >
        {quote.body}
      </Text>
    </group>
  );
};


const CorridorSegment = ({
    segmentIndex = 0,
    onDoorEnter,
    hideSegmentDoors = false, // Hide only SegmentDoors while keeping content preloaded
    zClip = 100000, // Clipping plane (render everything with Z < zClip)
    setCameraOverride // Function to take over camera control
}) => {

    // Calculate Z offset based on segment index
    // Segment 0 starts at Z=10, goes to Z=-70
    const zOffset = 10 - (segmentIndex * SEGMENT_LENGTH);

    // Door positions within this segment (relative to segment start)
    const doors = useMemo(() => {
        const doorDefs = [
            {
                id: `gallery-${segmentIndex}`,
                roomId: 'gallery',
                relativeZ: -18,
                side: 'left',
                label: 'THE GALLERY',
                icon: '▣',
                color: '#f5efe6'
            },
            {
                id: `studio-${segmentIndex}`,
                roomId: 'studio',
                relativeZ: -32,
                side: 'right',
                label: 'THE STUDIO',
                icon: '⚙',
                color: '#e6f5ef'
            },
            {
                id: `about-${segmentIndex}`,
                roomId: 'about',
                relativeZ: -48,
                side: 'left',
                label: 'THE ABOUT',
                icon: '➤',
                color: '#efe6f5',
                enterDistance: 25 // Enter deep into the room (clouds are far back)
            },
            {
                id: `connect-${segmentIndex}`,
                roomId: 'contact',
                relativeZ: -62,
                side: 'right',
                label: "LET'S CONNECT",
                icon: '✉',
                color: '#f5e6e6'
            },
        ];

        return doorDefs.map(def => {
            // Calculate adjusted Position and Rotation for Sawtooth Walls
            const xBase = (WALL_X_OUTER + WALL_X_INNER) / 2; // Midpoint of the angled wall
            const xPos = def.side === 'left' ? -xBase : xBase;

            // Rotation:
            // Left Wall: Normal was (1,0,0) [RotY 90]. Now angle it towards camera (+Z).
            // Rotate Clockwise by WALL_ANGLE.
            // Right Wall: Normal was (-1,0,0) [RotY -90]. Angle towards camera (+Z).
            // Rotate Counter-Clockwise by WALL_ANGLE.

            const baseRot = def.side === 'left' ? Math.PI / 2 : -Math.PI / 2;
            const rotOffset = def.side === 'left' ? -WALL_ANGLE : WALL_ANGLE;

            return {
                ...def,
                x: xPos,
                rotation: baseRot + rotOffset
            };
        });
    }, [segmentIndex]);

    return (
        <group position={[0, 0, 0]}>
            {/* === CORRIDOR WALLS === */}
            {/* Pass door positions so walls can generate gaps/angles correctly */}
            <CorridorWalls
                zStart={zOffset}
                length={SEGMENT_LENGTH}
                doorPositions={doors}
                zClip={zClip}
            />

            {/* === PHOTO FRAMES (alternating walls) === */}
            {[0, 1, 2, 3].map((i) => (
                <PhotoFrame
                    key={`frame-${segmentIndex}-${i}`}
                    side={i % 2 === 0 ? 'left' : 'right'}
                    z={zOffset - 8 - i * 16}
                    index={segmentIndex * 4 + i}
                />
            ))}

            {/* === WELCOME AREA (Start of segment) - MOVED CLOSER === */}
            <group position={[0, 0, zOffset - 2]}>
                {/* ITOM Text - centered (ITOM letters adjusted internally) */}
                <HeroText position={[0, -0.1, -0.5]} />

                {/* Avatar - center */}
                <Avatar position={[0, -0.61, -0.3]} />


                {/* Doodles around avatar */}
                <Doodles />

                {/* Segment number (debug - can remove later) */}
                <Text
                    position={[1.7, 1.4, 0.3]}
                    fontSize={0.12}
                    color="#ccc"
                    anchorX="center"
                >
                    #{segmentIndex}
                </Text>
            </group>

            {/* === DOOR SECTIONS (wall + door + label as one unit) === */}
            {/* Hidden during entrance animation for segment -1 */}
            {!hideSegmentDoors && doors.map((door) => (
                <DoorSection
                    key={door.id}
                    position={[
                        door.x,
                        0,
                        zOffset + door.relativeZ + 2
                    ]}
                    side={door.side}
                    label={door.label}
                    roomId={door.roomId}
                    icon={door.icon}
                    color={door.color}
                    enterDistance={door.enterDistance}
                    onEnter={() => onDoorEnter?.(door.roomId)}
                    setCameraOverride={setCameraOverride}
                    segmentIndex={segmentIndex}
                />
            ))}

            {/* === LIGHTING === */}
            {/* pointLight removed for optimization as it didn't affect visuals significantly */}

            <CorridorDecorations
                segmentLength={SEGMENT_LENGTH}
                zOffset={zOffset}
                corridorWidth={WALL_X_OUTER * 2}
                corridorHeight={3.5}
                zClip={zClip}
                setCameraOverride={setCameraOverride}
            />

            {/* === SEGMENT END DOORS (hidden during entrance) === */}
            {!hideSegmentDoors && (
                <SegmentDoors
                    position={[0, 0, zOffset - SEGMENT_LENGTH + 5]}
                    corridorHeight={3.5}
                />
            )}
        </group>
    );
};

const MemoizedCorridorSegment = memo(CorridorSegment);

export { SEGMENT_LENGTH, WALL_X_OUTER, WALL_X_INNER, DOOR_Z_SPAN };
export default MemoizedCorridorSegment;
