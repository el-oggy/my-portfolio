import { useState, useCallback, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

import CorridorSegment, { SEGMENT_LENGTH } from './CorridorSegment';

/**
 * Wrapper to toggle segment visibility based on camera position.
 * Massively reduces Draw Calls by hiding segments fully behind the camera.
 */
const SegmentVisibilityWrapper = ({ children, segmentIndex }) => {
    const groupRef = useRef();
    const { camera } = useThree();

    // Z bounds for this segment
    // Segment 0: Z=10 to Z=-70
    // Segment 1: Z=-70 to Z=-150
    const startZ = 10 - (segmentIndex * SEGMENT_LENGTH);
    const endZ = startZ - SEGMENT_LENGTH;

    useFrame(() => {
        if (!groupRef.current) return;
        // Camera looks towards -Z. 
        // If camera is significantly "in front" of the segment (e.g., camera Z is much less than endZ), hide it.
        // We reduce the buffer from 20 to 5. Once we pass the segment by 5 units, it disappears, freeing CPU.
        const isBehindCamera = camera.position.z < endZ - 5;
        // If camera is significantly "behind" the segment (e.g., camera Z is much greater than startZ + buffer), hide it.
        const isFarAhead = camera.position.z > startZ + 30;

        const isVisible = !(isBehindCamera || isFarAhead);

        if (groupRef.current.visible !== isVisible) {
            groupRef.current.visible = isVisible;
        }
    });

    return (
        <group ref={groupRef}>
            {children}
        </group>
    );
};

/**
 * InfiniteCorridorManager Component
 * 
 * Manages dynamic generation/removal of corridor segments.
 * 
 * hideDoorsForSegments: Array of segment indices that should hide their SegmentDoors
 * (used during entrance to avoid duplicate doors while keeping content preloaded)
 */
const InfiniteCorridorManager = ({
    onDoorEnter,
    hideDoorsForSegments = [], // Segments that should hide their SegmentDoors
    clipSegmentNeg1 = false, // Whether to clip segment -1 at EntranceDoors
    setCameraOverride, // Function to take over camera control
    enabled = true // Mount nothing until the entrance has been walked through
}) => {
    const { camera } = useThree();
    // Segments are only reachable AFTER the visitor walks through the entrance
    // doors (Z=22, camera starts at Z=28). Segments 0 and 1 occupy Z=10..-150,
    // so during the entire boot/preloader phase they sit behind the closed
    // doors and contribute nothing visible.
    //
    // They were previously pre-mounted ([0, 1]) purely to warm shaders during
    // the preloader. That cost ~4.6s of main-thread blocking time (Lighthouse
    // TBT 7766ms, 97% attributed to the three.js chunk) for geometry the
    // visitor cannot see, and it also forced every corridor texture to
    // download before first paint.
    //
    // They now mount when the entrance completes. The paper transition
    // (PaperTransition) already covers the first-frame compile of the corridor,
    // so the hitch it used to pre-empt is masked rather than eliminated.
    const [activeSegments, setActiveSegments] = useState([]);

    // Calculate which segment the camera is in
    const getSegmentFromZ = useCallback((z) => {
        return Math.floor((10 - z) / SEGMENT_LENGTH);
    }, []);

    // Update active segments based on camera position
    useFrame(() => {
        // Gated: stay empty until the entrance is done. Without this the
        // camera's boot position (Z=28) maps to segment -1, which would
        // immediately mount the very geometry we are deferring.
        if (!enabled) return;

        const currentSegment = getSegmentFromZ(camera.position.z);

        // Render previous, current, and next segment
        const shouldBeActive = [
            currentSegment - 1,
            currentSegment,
            currentSegment + 1
        ];

        // Check if we need to update
        const needsUpdate = shouldBeActive.some(seg => !activeSegments.includes(seg)) ||
            activeSegments.some(seg => !shouldBeActive.includes(seg));

        if (needsUpdate) {
            setActiveSegments(shouldBeActive);
        }
    });

    return (
        <group>
            {activeSegments.map((segmentIndex) => (
                <SegmentVisibilityWrapper key={`seg-wrap-${segmentIndex}`} segmentIndex={segmentIndex}>
                    <CorridorSegment
                        key={`segment-${segmentIndex}`}
                        segmentIndex={segmentIndex}
                        onDoorEnter={onDoorEnter}
                        hideSegmentDoors={hideDoorsForSegments.includes(segmentIndex)}
                        zClip={clipSegmentNeg1 && segmentIndex === -1 ? 22 : 100000}
                        setCameraOverride={setCameraOverride}
                    />
                </SegmentVisibilityWrapper>
            ))}
        </group>
    );
};

export default InfiniteCorridorManager;
