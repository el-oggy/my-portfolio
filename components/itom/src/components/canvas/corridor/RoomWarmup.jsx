import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { isSanityDataLoaded } from '../../../hooks/useSanityData';

/**
 * RoomWarmup — LIGHTWEIGHT BOOT GATE
 *
 * Previously this mounted ALL FOUR rooms off-screen and ran a full
 * gl.compileAsync — which is exactly why the preloader crawled from ~90%
 * to 100%. Rooms are keep-alive now (RoomInterior parks them mounted but
 * hidden after first entry), so first-entry hitches are already masked by
 * the paper transition. Boot only needs to:
 *   1. wait for data,
 *   2. let the corridor graph flush a couple of frames,
 *   3. compile the (small) visible scene.
 *
 * If you ever want the old heavy warmup back, see git history.
 */
const RoomWarmup = ({ onWarmupComplete, isLowTier }) => {
    const [isDone, setIsDone] = useState(false);
    const frameCount = useRef(0);
    const completeFired = useRef(false);
    const settleStart = useRef(0);
    const { gl, scene, camera } = useThree();

    useFrame(() => {
        if (isDone || completeFired.current) return;

        // Wait until Sanity data is loaded before starting
        if (!isSanityDataLoaded()) return;

        frameCount.current++;

        // Let the corridor graph flush a few frames
        const targetFrames = 2;
        if (frameCount.current < targetFrames) return;
        if (!settleStart.current) settleStart.current = performance.now();

        // Small settle window so pending corridor textures kick off
        if (performance.now() - settleStart.current < 250) return;

        completeFired.current = true;

        const finish = () => {
            requestAnimationFrame(() => {
                setIsDone(true);
                onWarmupComplete?.();
            });
        };

        // Compile only what exists today (corridor + entrance) — cheap now.
        // Low tier skips even this to avoid Context Lost risk.
        if (isLowTier || typeof gl.compileAsync !== 'function') {
            finish();
            return;
        }

        Promise.resolve(gl.compileAsync(scene, camera, scene))
            .then(finish)
            .catch(() => {
                try { gl.compile(scene, camera); } catch { /* noop */ }
                finish();
            });
    });

    if (isDone) return null;
    return null;
};

export default RoomWarmup;
