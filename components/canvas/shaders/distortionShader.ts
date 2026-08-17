/**
 * Liquid Image Distortion Shader
 *
 * Distorts UV coordinates based on mouse position and velocity.
 * Used for project thumbnails in the gallery.
 */

export const distortionVertexShader = /* glsl */ `
  varying vec2 vUv;
  uniform vec2 uMouse;
  uniform vec2 uVelocity;
  uniform float uHover;

  void main() {
    vUv = uv;

    vec3 pos = position;

    // Distance from this vertex to the mouse
    float dist = distance(uv, uMouse);
    
    // A soft radius around the mouse where distortion happens
    float influence = smoothstep(0.5, 0.0, dist);

    // Push vertices along the velocity vector
    // Multiply by hover state so it only distorts when hovered
    pos.x += uVelocity.x * influence * uHover * 2.0;
    pos.y -= uVelocity.y * influence * uHover * 2.0; // Invert Y for webgl

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const distortionFragmentShader = /* glsl */ `
  precision highp float;

  uniform sampler2D uTexture;
  uniform vec2 uMouse;
  uniform vec2 uVelocity;
  uniform float uHover;
  
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    
    // RGB Shift effect based on velocity
    float dist = distance(uv, uMouse);
    float influence = smoothstep(0.5, 0.0, dist);
    
    // Shift RGB channels slightly differently
    float rOffset = length(uVelocity) * influence * 0.1 * uHover;
    float bOffset = length(uVelocity) * influence * -0.1 * uHover;

    vec4 rTex = texture2D(uTexture, uv + vec2(rOffset, 0.0));
    vec4 gTex = texture2D(uTexture, uv);
    vec4 bTex = texture2D(uTexture, uv + vec2(bOffset, 0.0));

    vec4 finalColor = vec4(rTex.r, gTex.g, bTex.b, gTex.a);
    
    // Convert to grayscale when not hovered (optional stylish touch)
    float gray = dot(finalColor.rgb, vec3(0.299, 0.587, 0.114));
    finalColor.rgb = mix(vec3(gray), finalColor.rgb, uHover);

    gl_FragColor = finalColor;
  }
`;
