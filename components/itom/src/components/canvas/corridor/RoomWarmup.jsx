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

        let settled = false;
        const finish = () => {
            if (settled) return;
            settled = true;
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

        // SAFETY NET: compileAsync() waits on KHR_parallel_shader_compile, and
        // on some drivers (notably software/ANGLE fallbacks) it never settles.
        // Without this timer the boot gate would never open and the visitor
        // would be stuck on the preloader forever — so cap the wait and carry on.
        const COMPILE_TIMEOUT_MS = 4000;
        const timer = setTimeout(finish, COMPILE_TIMEOUT_MS);

        Promise.resolve(gl.compileAsync(scene, camera, scene))
            .then(() => {
                clearTimeout(timer);
                finish();
            })
            .catch(() => {
                clearTimeout(timer);
                try { gl.compile(scene, camera); } catch { /* noop */ }
                finish();
            });
    });

    if (isDone) return null;
    return null;
};

export default RoomWarmup;
