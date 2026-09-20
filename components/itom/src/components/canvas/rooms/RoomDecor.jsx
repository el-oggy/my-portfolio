import { useMemo, useRef, useLayoutEffect } from 'react';
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
    const { particles } = useMemo(() => {
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
        return { particles: arr };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [count, seed, mode]);

    // Per-instance colors. NOTE: these must go through InstancedMesh.setColorAt()
    // (which allocates instanceColor). Attaching a raw <instancedBufferAttribute>
    // to the mesh makes R3F's `attach` walk a path that doesn't exist
    // (`mesh.attributes.color`) and throw, taking the whole room down with it.
    useLayoutEffect(() => {
        const mesh = meshRef.current;
        if (!mesh || count === 0) return;
        const palette = colors.map((c) => new THREE.Color(c));
        for (let i = 0; i < count; i++) {
            mesh.setColorAt(i, palette[i % palette.length]);
        }
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        // Matrices are written every frame; seed them so nothing sits at origin.
        mesh.instanceMatrix.needsUpdate = true;
    }, [count, colors]);

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
            args={[undefined, undefined, count]}
            frustumCulled={false}
            // Decorative only — never intercept clicks meant for interactive
            // content (project cards, balloons, monitors).
            raycast={() => null}
        >
            <planeGeometry args={[size, size]} />
            <meshBasicMaterial
                transparent
                opacity={opacity}
                depthWrite={false}
                side={THREE.DoubleSide}
            />
        </instancedMesh>
    );
};

export default RoomDecor;
