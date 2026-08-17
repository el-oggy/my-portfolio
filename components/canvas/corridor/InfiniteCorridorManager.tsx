"use client";

import { useState, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useScene } from "@/context/SceneContext";
import CorridorSegment, { SEGMENT_LENGTH } from "./CorridorSegment";

export default function InfiniteCorridorManager() {
  const { enterRoom, hasEntered } = useScene();
  const { camera } = useThree();

  // Active segments dynamically streamed around the camera
  const [activeSegments, setActiveSegments] = useState<number[]>([0, 1]);

  const getSegmentFromZ = useCallback((z: number) => {
    return Math.floor((10 - z) / SEGMENT_LENGTH);
  }, []);

  // Update active segments in real-time as camera glides through the infinite corridor
  useFrame(() => {
    const currentSegment = getSegmentFromZ(camera.position.z);
    const shouldBeActive = [
      currentSegment - 1,
      currentSegment,
      currentSegment + 1,
    ];

    const needsUpdate =
      shouldBeActive.some((seg) => !activeSegments.includes(seg)) ||
      activeSegments.some((seg) => !shouldBeActive.includes(seg));

    if (needsUpdate) {
      setActiveSegments(shouldBeActive);
    }
  });

  return (
    <group>
      {activeSegments.map((segmentIndex) => (
        <CorridorSegment
          key={`segment-${segmentIndex}`}
          segmentIndex={segmentIndex}
          onDoorEnter={enterRoom}
        />
      ))}
    </group>
  );
}
