import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PositionalAudio } from '@react-three/drei';
import * as THREE from 'three';
import PaperAirplane from './PaperAirplane';
import InfiniteSkyManager from './InfiniteSkyManager';
import { useScene } from '../../../../context/SceneContext';
import { useAchievements } from '../../../../context/AchievementsContext';
import { useAudio } from '../../../../context/AudioManager';
import RoomBackdrop from '../RoomBackdrop';
import RoomDecor from '../RoomDecor';
import { getRoomTheme } from '../RoomThemeConfig';
import { useQualityScale } from '../../../../hooks/useQualityScale';
import { usePaintMaterial } from '../Gallery/usePaintMaterial';

// ============================================
// ⚙️ PAINT CONFIGURATION — brush-wipe entry (Phase 3)
// About sits on the LEFT side of the corridor, same as Gallery:
// reveal sweeps from the door (-X) into the room depth.
// Matches Gallery defaults so the entry wipe feels consistent.
// ============================================
const ABOUT_PAINT_CONFIG = {
    dirX: -1.0,
    dirY: 0.0,
    dirZ: 0.1,
    startDist: -5.0,
    endDist: 55.0,
    noiseAxes: 'yz'
};

// Chunk length for looping flight effect (matches SkyChunk)
const CHUNK_LENGTH = 40;

// ============================================
// ⚙️ AUDIO SETTINGS - TWEAK HERE
// Edytuj te wartości, aby zmienić głośność i zasięg słyszalności szumu wiatru
// ============================================
export const AUDIO_SETTINGS = {
    volume: 2.5,
    distance: 2,
    rolloff: 0.8
};

const AboutRoom = ({ showRoom, onReady, isExiting, isWarmup }) => {
    const quality = useQualityScale();
    const { camera } = useThree();
    const { isTeleporting, overlayContent } = useScene();
    const { showTutorial, unlockAchievement, hidePopup } = useAchievements();
    const { globalVolume, isMuted } = useAudio();
    const effectiveVolume = isMuted ? 0 : AUDIO_SETTINGS.volume * globalVolume;

    const audioRef = useRef();
    useEffect(() => {
        if (audioRef.current && audioRef.current.setVolume) {
            audioRef.current.setVolume(effectiveVolume);
        }
    }, [effectiveVolume]);

    // Use ref to track overlay state for event listeners (avoids stale closures)
    const overlayRef = useRef(overlayContent);
    const isExitingRef = useRef(isExiting);
    const isTeleportingRef = useRef(isTeleporting);
    
    useEffect(() => {
        overlayRef.current = overlayContent;
        isExitingRef.current = isExiting;
        isTeleportingRef.current = isTeleporting;
    }, [overlayContent, isExiting, isTeleporting]);

    useEffect(() => {
        if (isExiting || isTeleporting) {
            hidePopup();
        }
    }, [isExiting, isTeleporting, hidePopup]);

    // Track if we've signaled ready
    const hasSignaledReady = useRef(false);
    const frameCount = useRef(0);
    const FRAMES_TO_WAIT = 25;

    // Momentum-based scroll state
    const scrollPosition = useRef(0);
    const scrollVelocity = useRef(0);

    // Save base camera rotation on first render
    const baseCameraRotation = useRef({ x: 0, y: 0, z: 0 });
    const isFlightActive = useRef(false);

    // Smoothed flight effect values
    const currentBank = useRef(0);
    const currentPitch = useRef(0);

    // Ref for the entire room to manage frustum culling
    const roomRef = useRef();
    const airplaneGroupRef = useRef();

    // ===== PHASE 3 — PAINT TRANSITION (brush-wipe entry) =====
    // Gallery / Studio / Contact each animate usePaintMaterial's
    // uPaintProgress 0 → 1 on room show (skipped on map teleport).
    // About previously had NO entry wipe — its clouds/milestones just
    // popped in while every sibling room painted in. Wire the same hook
    // here. The glider + sky clouds opt in via paintOnBeforeCompile, so
    // unrelated materials (milestones, balloons, decor) are untouched.
    const {
        onBeforeCompile: paintOnBeforeCompile,
        animatePaint,
        resetPaint,
        uniformsData: paintUniforms,
        updateRoomOrigin,
    } = usePaintMaterial(ABOUT_PAINT_CONFIG);

    const [, setIsTransitioning] = useState(false);

    const wasTeleportedRef = useRef(false);
    useEffect(() => {
        if (isTeleporting) wasTeleportedRef.current = true;
    }, [isTeleporting]);

    useEffect(() => {
        if (showRoom && !isWarmup) {
            if (wasTeleportedRef.current || isTeleporting) {
                // Map teleport: skip the wipe, reveal instantly.
                paintUniforms.uPaintProgress.value = 1.0;
                setIsTransitioning(false);
            } else {
                setIsTransitioning(true);
                resetPaint();
                // Slight delay so the wipe lands *during* the door fly-in.
                animatePaint(0.2, 2.5);
                const t = setTimeout(() => setIsTransitioning(false), 2700);
                return () => clearTimeout(t);
            }
        } else {
            // Warmup / hidden: keep fully revealed so pre-entry mounts
            // (RoomWarmup keep-alive) never flash a half-painted state.
            paintUniforms.uPaintProgress.value = 1.0;
        }
        // paintUniforms/animatePaint/resetPaint are stable hook returns
        // (useMemo closures over one uniforms object) — intentionally
        // excluded from deps so the entry wipe fires once per room show.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showRoom, isWarmup, isTeleporting]);

    // Reset camera rotation when teleporting starts
    useEffect(() => {
        if (isTeleporting) {
            // Reset flight effect to prevent tilted camera after teleport
            currentBank.current = 0;
            currentPitch.current = 0;
            isFlightActive.current = false;
            baseCameraRotation.current = { x: 0, y: 0, z: 0 };
            scrollPosition.current = 0;
            scrollVelocity.current = 0;
        }
    }, [isTeleporting]);

    // Ready detection + flight animation
    useFrame((state, delta) => {
        // Keep the paint-wipe shader's room origin in sync (one
        // getWorldPosition per frame — same pattern as Gallery/Studio).
        updateRoomOrigin(roomRef);

        if (!hasSignaledReady.current) {
            // Force rendering of all objects (even outside frustum) to compile shaders
            if (roomRef.current) {
                roomRef.current.traverse((child) => {
                    if (child.isMesh) child.frustumCulled = false;
                });
            }

            frameCount.current++;
            if (frameCount.current >= FRAMES_TO_WAIT) {
                // Restore frustum culling for performance
                if (roomRef.current) {
                    roomRef.current.traverse((child) => {
                        if (child.isMesh) child.frustumCulled = true;
                    });
                }

                hasSignaledReady.current = true;
                onReady?.();
                // trigger achievement hint when showing the room
                if (!isTeleporting && !isExiting) {
                    if (!isWarmup) setTimeout(() => showTutorial('about_fly'), 2000);
                }
            }
        }

        // === TELEPORTING: Stop all camera control ===
        if (isTeleporting) {
            return;
        }

        // Do not modify camera or physics if room is hidden (and not currently exiting)
        if (!showRoom && !isExiting) {
            return;
        }

        // Apply velocity to position (momentum)
        scrollPosition.current += scrollVelocity.current * delta * 60;
        // No clamp - allow flying backward too!

        // Friction
        scrollVelocity.current *= 0.95;
        if (Math.abs(scrollVelocity.current) < 0.001) {
            scrollVelocity.current = 0;
        }

        // Unlock achievement if user scrolled enough
        if (scrollPosition.current > 15) {
            unlockAchievement('about_fly');
        }

        // === EXITING: Smoothly reset rotation to 0 before freezing ===
        if (isExiting) {
            // Smoothly lerp back to 0 so DoorSection starts from a flat plane
            currentBank.current = THREE.MathUtils.lerp(currentBank.current, 0, 0.1);
            currentPitch.current = THREE.MathUtils.lerp(currentPitch.current, 0, 0.1);
            
            camera.rotation.x = baseCameraRotation.current.x + currentPitch.current;
            camera.rotation.z = baseCameraRotation.current.z + currentBank.current;
            return;
        }

        // === FLIGHT EFFECT (camera rotation only) ===
        // Activate flight only after first scroll
        if (!isFlightActive.current && scrollPosition.current > 0.5) {
            isFlightActive.current = true;
            baseCameraRotation.current = {
                x: camera.rotation.x,
                y: camera.rotation.y,
                z: camera.rotation.z
            };
        }

        if (isFlightActive.current) {
            // Get position within current chunk (0 to 1)
            const chunkProgress = (scrollPosition.current % CHUNK_LENGTH) / CHUNK_LENGTH;

            // Flight maneuver pattern - loops back to start at each chunk
            // Slow down the start: if chunkProgress is small, multiply by a curve
            let bankAngle = Math.sin(chunkProgress * Math.PI * 2) * 0.12;
            let pitchAngle = Math.sin(chunkProgress * Math.PI * 4) * 0.05;

            // Ease in the flight effect during the first few units
            const flightProgress = Math.min(1, (scrollPosition.current - 0.5) / 5.0);
            bankAngle *= flightProgress;
            pitchAngle *= flightProgress;

            // Smooth lerp
            const lerpSpeed = 1 - Math.pow(0.02, delta);
            currentBank.current = THREE.MathUtils.lerp(currentBank.current, bankAngle, lerpSpeed);
            currentPitch.current = THREE.MathUtils.lerp(currentPitch.current, pitchAngle, lerpSpeed);

            // Apply to camera (base + effect)
            camera.rotation.x = baseCameraRotation.current.x + currentPitch.current;
            camera.rotation.z = baseCameraRotation.current.z + currentBank.current;
        } else {
            // Unconditionally keep these zero before flight active
            currentBank.current = 0;
            currentPitch.current = 0;
        }

        // Apply to airplane unconditionally so it stays properly aligned
        // When pitch is 0, rotation.x is 0.1
        // When bank is 0, rotation.z is 0
        if (airplaneGroupRef.current) {
            airplaneGroupRef.current.rotation.x = currentPitch.current * 3 + 0.1;
            airplaneGroupRef.current.rotation.z = -currentBank.current * 2;
        }
    });

    // Handle scroll wheel (desktop)
    useEffect(() => {
        const handleWheel = (e) => {
            if (overlayRef.current || isExitingRef.current || isTeleportingRef.current) return;
            scrollVelocity.current += e.deltaY * 0.002;
        };

        window.addEventListener('wheel', handleWheel, { passive: true });
        return () => window.removeEventListener('wheel', handleWheel);
    }, []);

    // Handle touch (mobile) - vertical swipe = scroll
    const lastTouchY = useRef(0);
    useEffect(() => {
        const handleTouchStart = (e) => {
            if (overlayRef.current || isExitingRef.current || isTeleportingRef.current) return;
            if (e.touches.length === 1) {
                lastTouchY.current = e.touches[0].clientY;
            }
        };

        const handleTouchMove = (e) => {
            if (overlayRef.current || isExitingRef.current || isTeleportingRef.current) return;
            if (e.touches.length === 1) {
                const deltaY = lastTouchY.current - e.touches[0].clientY;
                lastTouchY.current = e.touches[0].clientY;
                // Convert touch movement to scroll velocity
                scrollVelocity.current += deltaY * 0.005;
            }
        };

        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
        };
    }, []);

    return (
        <group ref={roomRef} position={[0, 0, -25]}>


            {!isWarmup && showRoom && (
                <PositionalAudio
                    ref={audioRef}
                    url="/sounds/szumwiatru.mp3"
                    distanceModel="exponential"
                    refDistance={AUDIO_SETTINGS.distance}
                    rolloffFactor={AUDIO_SETTINGS.rolloff}
                    loop
                    autoplay
                    volume={effectiveVolume}
                />
            )}

            {/* === WOODEN GLIDER (follows camera maneuvers) === */}
            <group ref={airplaneGroupRef} position={[0, -0.3, 1]}>
                <PaperAirplane
                    scale={0.8}
                    color="#a9744a"
                    paintOnBeforeCompile={paintOnBeforeCompile}
                />
            </group>

            {/* === INFINITE SKY WITH CLOUDS + STORY MILESTONES === */}
            <InfiniteSkyManager
                scrollProgressRef={scrollPosition}
                paintOnBeforeCompile={paintOnBeforeCompile}
            />

            {/* === DRIFTING PETALS / SKY CONFETTI (daydream) === */}
            <RoomDecor
                count={Math.round(60 * quality)}
                colors={getRoomTheme('about').palette.accents}
                spread={[30, 14, 30]}
                center={[0, 2, -10]}
                size={0.26}
                mode="fall"
                opacity={0.9}
                speed={0.5}
                seed={21}
            />

            {/* === ROOM BACKDROP (follows scroll so it always sits behind the islands) === */}
            <group position={[0, 0, scrollPosition.current * -1]}>
                <RoomBackdrop roomId="about" visible={showRoom} />
            </group>
        </group>
    );
};

export default AboutRoom;
