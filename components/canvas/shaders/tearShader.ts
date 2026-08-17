/**
 * Paper Tear Intro Shader
 *
 * Simulates a sheet of paper ripping open down the middle.
 * The rip edge is generated using 1D noise, and the two halves pull apart
 * based on the uTime uniform, revealing the 3D canvas underneath.
 */

export const tearVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

export const tearFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;      // 0.0 (closed) to 1.0+ (fully torn)
  uniform vec2  uResolution;
  varying vec2 vUv;

  // Simple 1D noise for the jagged rip edge
  float hash(float n) {
    return fract(sin(n) * 43758.5453123);
  }

  float noise(float x) {
    float p = floor(x);
    float f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(hash(p), hash(p + 1.0), f);
  }

  void main() {
    // Generate a jagged vertical line around x = 0.5
    // We add multiple octaves of noise for a paper-like edge
    float n1 = noise(vUv.y * 10.0) * 0.05;
    float n2 = noise(vUv.y * 50.0) * 0.01;
    float n3 = noise(vUv.y * 200.0) * 0.002;
    float splitX = 0.5 + n1 + n2 + n3;

    // How far apart the two halves have pulled
    // Smoothstep creates a nice acceleration curve
    float pull = smoothstep(0.0, 1.0, uTime) * 0.6; // Max distance to pull

    // Determine if this pixel belongs to the left or right half of the paper
    // To do this, we work backwards: where did this pixel come from before the pull?
    
    vec4 color = vec4(0.98, 0.98, 0.98, 1.0); // Off-white paper color
    float alpha = 1.0;

    // We check both possibilities (could this fragment be from the left piece, or the right piece?)
    // Left piece is displaced left by -pull
    float originalX_left = vUv.x + pull;
    bool isLeftPiece = originalX_left < splitX;

    // Right piece is displaced right by +pull
    float originalX_right = vUv.x - pull;
    bool isRightPiece = originalX_right > splitX;

    // The shadow on the torn edge
    float edgeShadow = 0.0;

    if (isLeftPiece) {
      // Inside the left half
      // Add a slight darkening right at the torn edge
      float dist = abs(originalX_left - splitX);
      edgeShadow = smoothstep(0.02, 0.0, dist) * 0.15;
    } else if (isRightPiece) {
      // Inside the right half
      float dist = abs(originalX_right - splitX);
      edgeShadow = smoothstep(0.02, 0.0, dist) * 0.15;
    } else {
      // The empty gap between the torn halves
      alpha = 0.0;
    }

    // Apply shadow and noise grain to the paper
    vec3 finalColor = color.rgb - edgeShadow;
    
    // Add subtle paper grain
    float grain = (fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.03;
    finalColor += grain;

    gl_FragColor = vec4(finalColor, alpha);
  }
`;
