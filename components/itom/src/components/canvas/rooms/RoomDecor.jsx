import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * RoomDecor — a single instanced "confetti / sparkle / firefly" layer shared
 * by all four rooms. One InstancedMesh + one flat MeshBasicMaterial per room =
 * exactly ONE extra draw call, regardless of particle count.
 *
 * - mode 'rise'   → particles drift upward and loop (Gallery confetti, Studio fireflies)
 * - mode 'fall'   → particles drift downward and loop (About petals)
 * - mode 'swirl'  → gentle horizontal bob (Contact fireflies)
 *
 * `count` should already be scaled by useQualityScale() by the caller.
 * Honors reduced-motion by rendering a static (non-animating) field when the
 * user prefers reduced motion.
 */

const _dummy = new THREE.Object3D();

const REDUCED_MOTION =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const RoomDecor = ({
    count = 40,
    colors = ['#ffffff'],
    spread = [24, 12, 20], // x, y, z extents
    center = [0, 2, -6],
    size = 0.12,
    mode = 'rise',
    opacity = 0.9,
    speed = 1.0,
    seed = 7,
}) => {
    const meshRef = useRef();
    const reduced = REDUCED_MOTION;

    // Deterministic pseudo-random so layout is stable across renders/HMR.
    const { particles, colorArray, baseColor } = useMemo(() => {
        let s = seed;
        const rand = () => {
            s = Math.sin(s * 9999) * 10000;
            return s - Math.floor(s);
        };
        const [sx, sy, sz] = spread;
        const [cx, cy, cz] = center;
        const arr = [];
        for (let i = 0; i < count; i++) {
            arr.push({
                x: cx + (rand() - 0.5) * sx,
                y: cy + (rand() - 0.5) * sy,
                z: cz + (rand() - 0.5) * sz,
                phase: rand() * Math.PI * 2,
                speed: speed * (0.5 + rand() * 0.9),
                sway: 0.3 + rand() * 0.7,
                scale: 0.6 + rand() * 0.9,
            });
        }
        // Per-instance colors
        const cols = new Float32Array(count * 3);
        const palette = colors.map((c) => new THREE.Color(c));
        for (let i = 0; i < count; i++) {
            const c = palette[i % palette.length];
            cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b;
        }
        return { particles: arr, colorArray: cols, baseColor: new THREE.Color('#ffffff') };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [count, seed, mode]);

    const geometry = useMemo(() => new THREE.PlaneGeometry(size, size), [size]);

    const rangeY = spread[1];

    useFrame(({ clock }) => {
        if (reduced || !meshRef.current) return;
        const t = clock.getElapsedTime();
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            let y = p.y;
            let x = p.x;
            if (mode === 'rise') {
                y = p.y - ((t * p.speed) % rangeY);
                x = p.x + Math.sin(t * p.sway + p.phase) * 0.4;
            } else if (mode === 'fall') {
                y = p.y + ((t * p.speed) % rangeY);
                x = p.x + Math.sin(t * p.sway + p.phase) * 0.5;
            } else if (mode === 'swirl') {
                x = p.x + Math.sin(t * p.sway + p.phase) * 0.6;
                y = p.y + Math.sin(t * p.sway * 0.7 + p.phase) * 0.35;
            }
            // wrap y into band
            const minY = center[1] - rangeY / 2;
            y = ((y - minY) % rangeY + rangeY) % rangeY + minY;
            _dummy.position.set(x, y, p.z);
            _dummy.rotation.z = p.phase + t * p.sway;
            _dummy.scale.setScalar(p.scale);
            _dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, _dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh
            ref={meshRef}
            args={[geometry, undefined, count]}
            frustumCulled={false}
        >
            <meshBasicMaterial
                color={baseColor}
                transparent
                opacity={opacity}
                depthWrite={false}
                side={THREE.DoubleSide}
            />
            <instancedBufferAttribute attach="attributes-color" args={[colorArray, 3]} />
        </instancedMesh>
    );
};

export default RoomDecor;
