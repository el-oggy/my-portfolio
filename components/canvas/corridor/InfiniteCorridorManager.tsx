"use client";

import { useCallback, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useScene } from "@/context/SceneContext";
import CorridorSegment from "./CorridorSegment";
import { SEGMENT_LENGTH } from "./corridorConfig";

export default function InfiniteCorridorManager() {
  const { enterRoom } = useScene();
  const { camera } = useThree();

  const getSegmentFromZ = useCallback((z: number) => {
    return Math.floor((10 - z) / SEGMENT_LENGTH);
  }, []);

  const initialSegment = getSegmentFromZ(camera.position.z);
  const activeBoundaryRef = useRef(initialSegment);
  const [activeSegments, setActiveSegments] = useState(() => [
    initialSegment,
    initialSegment + 1,
  ]);

  // Reuse two persistent scene slots instead of mounting and destroying segments.
  useFrame(() => {
    const currentSegment = getSegmentFromZ(camera.position.z);

    if (currentSegment !== activeBoundaryRef.current) {
      activeBoundaryRef.current = currentSegment;
      setActiveSegments([currentSegment, currentSegment + 1]);
    }
  });

  return (
    <group>
      {activeSegments.map((segmentIndex, slotIndex) => (
        <CorridorSegment
          key={`corridor-slot-${slotIndex}`}
          segmentIndex={segmentIndex}
          onDoorEnter={enterRoom}
        />
      ))}
    </group>
  );
}
