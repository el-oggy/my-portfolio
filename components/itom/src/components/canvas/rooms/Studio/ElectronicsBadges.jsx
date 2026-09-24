import React from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export const ElectronicsBadges = ({ isStylized }) => {
    if (process.env.NEXT_PUBLIC_ELECTRONICS_BADGES !== 'true') return null;
    
    // Fallback if badges should not be displayed without stylized mode
    if (!isStylized) return null;

    return (
        <group position={[-5, 2, -10]}>
            {/* simple floating badge */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[1, 1, 0.1]} />
                <meshStandardMaterial color="#8b5cff" />
                <Text position={[0, 0, 0.1]} fontSize={0.2} color="#ffffff">MCU</Text>
            </mesh>
            <mesh position={[2, -1, 0]}>
                <boxGeometry args={[0.8, 0.8, 0.1]} />
                <meshStandardMaterial color="#ff5d8f" />
                <Text position={[0, 0, 0.1]} fontSize={0.15} color="#ffffff">SENSOR</Text>
            </mesh>
        </group>
    );
};
