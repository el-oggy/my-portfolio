import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useScene } from '../../context/SceneContext';
import { usePerformance } from '../../context/PerformanceContext';
import { getRoomTheme } from './rooms/RoomThemeConfig';

// Hoisted scratch — no allocations per frame.
const TARGET = { intensity: 0, threshold: 1 };

/**
 * PostFX — Bloom + Vignette, colour-gated per room.
 *
 * Design contract (matches RoomThemeConfig `bloom` entries):
 * - Hallway / entrance runs bloom.intensity 0 with threshold 1.0 → the ink
 *   sketch stays crisp and monochrome; NOTHING can glow there, so the
 *   hallway's permanent B&W identity is enforced at the post level too.
 * - Each room brings its own intensity + luminanceThreshold; values LERP on
 *   enterPreview (set at door click), so the glow floods in during the
 *   camera choreography — same timing as the fog/background flood (3a).
 * - Tier gating: LOW tier skips the composer entirely (post passes are
 *   fill-rate heavy on the hardware that selects LOW).
 *
 * Refs: <Bloom> forwards its BloomEffect instance (wrapEffect → forwardRef),
 * exposing `.intensity` and `.luminanceMaterial.threshold` setters — both
 * verified against the installed postprocessing build.
 */
const PostFX = () => {
    const { enterPreview, currentRoom } = useScene();
    const { tier } = usePerformance();
    const bloomRef = useRef();

    // Smoothed live values (start at hallway = fully off).
    const live = useRef({ intensity: 0, threshold: 1 });

    const theme = getRoomTheme(enterPreview ?? currentRoom);
    const target = theme.bloom ?? TARGET;

    const isLow = tier === 'LOW';

    useFrame((_, delta) => {
        if (isLow || !bloomRef.current) return;
        const k = Math.min(1, delta * 2.5); // framerate-independent, ~0.4s settle
        const live_ = live.current;
        live_.intensity += (target.intensity - live_.intensity) * k;
        live_.threshold += (target.threshold - live_.threshold) * k;
        bloomRef.current.intensity = live_.intensity;
        if (bloomRef.current.luminanceMaterial) {
            bloomRef.current.luminanceMaterial.threshold = live_.threshold;
        }
    });

    if (isLow) return null;

    return (
        <>
            {/* multisampling: the composer bypasses the default framebuffer's
                MSAA (canvas `antialias`), so re-enable it per-tier — 8x on
                HIGH where the DPR headroom exists, 4x on MEDIUM mobile. */}
            <EffectComposer multisampling={tier === 'HIGH' ? 8 : 4} enableNormalPass={false}>
                <Bloom
                    ref={bloomRef}
                    intensity={0}
                    luminanceThreshold={1}
                    luminanceSmoothing={0.2}
                    mipmapBlur
                    radius={0.75}
                />
                {/* Subtle paper-edge vignette — constant across rooms; the
                    hallway's flat white gets a whisper of depth without
                    tinting it. */}
                <Vignette eskil={false} offset={0.25} darkness={0.25} />
            </EffectComposer>
        </>
    );
};

export default PostFX;