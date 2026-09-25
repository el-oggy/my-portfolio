import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';

// M6 — optional badge alt set (chip / MCU / sensor / drone prop / RTL gate).
// Flag (locked in M0): NEXT_PUBLIC_ELECTRONICS_BADGES. Off by default, so the
// Studio renders exactly as before unless the env var is explicitly 'true'.
// Deterministic layout: no Math.random, no per-load churn.
const BADGES = [
    { label: 'RTL', color: '#8b5cff', position: [-1.7, 0.65, 0], size: [0.9, 0.9] },
    { label: 'MCU', color: '#ff5d8f', position: [0, 0.65, 0], size: [0.9, 0.9] },
    { label: 'CHIP', color: '#4dd8ff', position: [1.7, 0.65, 0], size: [0.9, 0.9] },
    { label: 'SENSOR', color: '#ffd94d', position: [-0.85, -0.65, 0], size: [0.8, 0.8] },
    { label: 'DRONE', color: '#6bffb8', position: [0.85, -0.65, 0], size: [0.8, 0.8] },
];

export const ElectronicsBadges = ({ isStylized }) => {
    // M6 flag (locked): NEXT_PUBLIC_ELECTRONICS_BADGES. Off by default.
    if (process.env.NEXT_PUBLIC_ELECTRONICS_BADGES !== 'true') return null;

    // Fallback if badges should not be displayed without stylized mode
    if (!isStylized) return null;

    return <ElectronicsBadgeSet />;
};

// Split so the hooks below only run when the flags actually enable the set
// (conditional-hook safety: ElectronicsBadges returns null before any hooks).
const ElectronicsBadgeSet = () => {
    const groupRef = useRef();

    // Gentle deterministic bob — one useFrame for all five plates.
    useFrame((state) => {
        if (!groupRef.current) return;
        const t = state.clock.elapsedTime;
        groupRef.current.position.y = 2 + Math.sin(t * 0.8) * 0.08;
    });

    return (
        <group ref={groupRef} position={[-5, 2, -10]}>
            {BADGES.map((badge) => (
                <mesh key={badge.label} position={badge.position}>
                    <boxGeometry args={[badge.size[0], badge.size[1], 0.1]} />
                    <meshStandardMaterial
                        color={badge.color}
                        emissive={badge.color}
                        emissiveIntensity={0.35}
                    />
                    <Text position={[0, 0, 0.1]} fontSize={0.18} color="#ffffff">
                        {badge.label}
                    </Text>
                </mesh>
            ))}
        </group>
    );
};

