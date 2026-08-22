"use client";

import { useEffect, useMemo } from "react";
import { CORRIDOR_HEIGHT, DOOR_Z_SPAN, WALL_X_OUTER } from "./corridorConfig";
import type { CorridorDoorDefinition } from "./corridorConfig";
import { createPaperTexture, createWoodTexture } from "@/lib/proceduralTextures";

interface CorridorWallsProps {
  zStart: number;
  length: number;
  doorPositions: CorridorDoorDefinition[];
}

interface WallFiller {
  side: "left" | "right";
  z: number;
  width: number;
  trimHigh: boolean;
  trimLow: boolean;
}

function createFillers(
  zStart: number,
  length: number,
  doors: CorridorDoorDefinition[],
): WallFiller[] {
  const endZ = zStart - length;
  const sorted = [...doors].sort((a, b) => b.relativeZ - a.relativeZ);
  const fillers: WallFiller[] = [];
  let cursor = zStart;

  sorted.forEach((door) => {
    const highZ = zStart + door.relativeZ + DOOR_Z_SPAN / 2;
    const lowZ = zStart + door.relativeZ - DOOR_Z_SPAN / 2;

    if (cursor > highZ) {
      fillers.push({
        side: door.side,
        z: (cursor + highZ) / 2,
        width: cursor - highZ,
        trimHigh: false,
        trimLow: true,
      });
    }
    cursor = lowZ;
  });

  if (cursor > endZ) {
    fillers.push({
      side: sorted[0]?.side ?? "left",
      z: (cursor + endZ) / 2,
      width: cursor - endZ,
      trimHigh: true,
      trimLow: false,
    });
  }

  return fillers.filter((filler) => filler.width > 0.05);
}

export default function CorridorWalls({ zStart, length, doorPositions }: CorridorWallsProps) {
  const floorY = -CORRIDOR_HEIGHT / 2;
  const endZ = zStart - length;

  const wallTexture = useMemo(() => createPaperTexture(1, 1), []);
  const floorTexture = useMemo(() => createWoodTexture(1, 3), []);

  useEffect(
    () => () => {
      wallTexture.dispose();
      floorTexture.dispose();
    },
    [wallTexture, floorTexture],
  );

  const leftFillers = useMemo(
    () => createFillers(zStart, length, doorPositions.filter((door) => door.side === "left")),
    [doorPositions, length, zStart],
  );
  const rightFillers = useMemo(
    () => createFillers(zStart, length, doorPositions.filter((door) => door.side === "right")),
    [doorPositions, length, zStart],
  );

  const floorTiles = useMemo(() => {
    const tiles: number[] = [];
    let tileZ = zStart - 5;
    while (tileZ > endZ - 5) {
      tiles.push(tileZ);
      tileZ -= 10;
    }
    return tiles;
  }, [endZ, zStart]);

  return (
    <group>
      {floorTiles.map((tileZ, index) => (
        <group key={tileZ} position={[0, floorY, tileZ]}>
          <mesh rotation-x={-Math.PI / 2} rotation-z={index % 2 ? Math.PI : 0}>
            <planeGeometry args={[10, 5]} />
            <meshBasicMaterial map={floorTexture} side={2} toneMapped={false} />
          </mesh>
          {[-3, 3].map((x) => (
            <mesh key={x} position={[x, 0, 0]} rotation-x={-Math.PI / 2}>
              <planeGeometry args={[10, 1]} />
              <meshBasicMaterial color="#eee7d8" side={2} toneMapped={false} />
            </mesh>
          ))}
        </group>
      ))}

      {[...leftFillers, ...rightFillers].map((filler, index) => {
        const side = filler.side === "left" ? -1 : 1;
        return (
          <group key={`${filler.side}-${index}`}>
            <mesh
              position={[side * WALL_X_OUTER, 0, filler.z]}
              rotation-y={(side * Math.PI) / 2}
            >
              <planeGeometry args={[filler.width, CORRIDOR_HEIGHT]} />
              <meshBasicMaterial map={wallTexture} side={2} toneMapped={false} />
            </mesh>
            <mesh
              position={[side * (WALL_X_OUTER - 0.015), floorY + 0.08, filler.z]}
              rotation-y={(side * Math.PI) / 2}
            >
              <planeGeometry args={[Math.max(0, filler.width - 0.35), 0.16]} />
              <meshBasicMaterial color="#e7dccc" side={2} toneMapped={false} />
            </mesh>
          </group>
        );
      })}

      <mesh position={[0, CORRIDOR_HEIGHT / 2, (zStart + endZ) / 2]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[7, length]} />
        <meshBasicMaterial color="#f6f1e7" side={2} toneMapped={false} />
      </mesh>
    </group>
  );
}
