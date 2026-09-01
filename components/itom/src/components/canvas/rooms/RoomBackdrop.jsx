import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getRoomTheme } from './RoomThemeConfig';

const gradientVertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const gradientFragmentShader = `
    uniform vec3 colorTop;
    uniform vec3 colorBottom;
    varying vec2 vUv;
    void main() {
        vec3 color = mix(colorBottom, colorTop, vUv.y);
        gl_FragColor = vec4(color, 1.0);
    }
`;

const RoomBackdrop = ({ roomId, visible }) => {
    const theme = getRoomTheme(roomId);
    const materialRef = useRef();

    const uniforms = useMemo(() => ({
        colorTop: { value: new THREE.Color(theme.palette.gradientTop) },
        colorBottom: { value: new THREE.Color(theme.palette.gradientBottom) }
    }), [theme]);

    useFrame((state, delta) => {
        if (!visible || !materialRef.current) return;
        
        // Smoothly transition colors if theme changes
        const currentTop = materialRef.current.uniforms.colorTop.value;
        const currentBottom = materialRef.current.uniforms.colorBottom.value;
        const targetTop = new THREE.Color(theme.palette.gradientTop);
        const targetBottom = new THREE.Color(theme.palette.gradientBottom);

        currentTop.lerp(targetTop, delta * 2);
        currentBottom.lerp(targetBottom, delta * 2);
    });

    return (
        <group visible={visible}>
            {/* Massive backdrop sphere to simulate sky/environment */}
            <mesh position={[0, 0, -200]} scale={[-1, 1, 1]}>
                <sphereGeometry args={[300, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
                <shaderMaterial
                    ref={materialRef}
                    vertexShader={gradientVertexShader}
                    fragmentShader={gradientFragmentShader}
                    uniforms={uniforms}
                    side={THREE.BackSide}
                    depthWrite={false}
                    transparent={true}
                />
            </mesh>
            
            {/* Ambient light for the room based on theme */}
            <ambientLight intensity={1.5} color={theme.palette.ambient} />
        </group>
    );
};

export default RoomBackdrop;
