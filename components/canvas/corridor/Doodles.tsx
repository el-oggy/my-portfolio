"use client";

export default function Doodles() {
  return (
    <group>
      {[
        [-1.55, 0.55, 0.1, 0.24],
        [1.45, 0.72, -0.05, 0.19],
        [-1.25, -0.65, 0.04, 0.16],
        [1.35, -0.5, 0.08, 0.22],
      ].map(([x, y, rotation, size], index) => (
        <mesh key={index} position={[x, y, 0.1]} rotation-z={rotation}>
          <circleGeometry args={[size, index % 2 ? 3 : 20]} />
          <meshBasicMaterial
            color={index === 0 ? "#c2410c" : index === 1 ? "#0284c7" : "#1a1917"}
            transparent
            opacity={index > 1 ? 0.14 : 0.75}
          />
        </mesh>
      ))}
    </group>
  );
}
