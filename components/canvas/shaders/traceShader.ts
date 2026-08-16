/**
 * "First Boot" circuit-trace shader (custom, procedural — no stock assets, §7).
 *
 * Renders a field of circuit traces on a Manhattan grid that "power up" in a
 * wave from a seed point. The illusion: a dormant substrate begins to energize,
 * traces light up, then fade back into graphite as the camera flies forward
 * into the silicon hub.
 *
 * Uniforms:
 *   uTime        — animation clock in seconds (drives the power-up wave + flow).
 *   uResolution  — framebuffer pixels (for crispness / aspect).
 *   uAlpha       — global fade (0 → scene disappears; camera flew past).
 *   uIntensity   — master brightness so the boot can crescendo then recede.
 */

export const traceVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

export const traceFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2  uResolution;
  uniform float uAlpha;
  uniform float uIntensity;
  varying vec2 vUv;

  // Hash + value noise for trace-routing jitter (so the grid isn't too uniform).
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  // A trace is an energized segment along an axis grid line. We measure, for
  // the current fragment, the distance to the nearest vertical/horizontal grid
  // line and light it up if a "pulse" is traveling along that line near us.
  float traceField(vec2 uv, float wave) {
    // Grid density in UV space.
    float cells = 26.0;
    vec2 g = uv * cells;

    // Nearest grid line coordinates (fractional distance to each axis line).
    vec2 d = abs(fract(g) - 0.5);

    // Line thickness falloff (sharp, with a soft glow skirt).
    float lineX = smoothstep(0.5, 0.0, (d.y * 12.0));
    float lineY = smoothstep(0.5, 0.0, (d.x * 12.0));

    // Which lines are energized: pick a subset via hashing so only some traces exist.
    float segX = step(0.62, hash(vec2(floor(g.y), floor(g.x) * 0.5)));
    float segY = step(0.62, hash(vec2(floor(g.x), floor(g.y) * 0.5)));

    // A pulse traveling along each line: glow band moving with uTime.
    float pulseX = sin(g.x * 3.1415 - uTime * 2.2 + floor(g.y) * 1.7);
    float pulseY = sin(g.y * 3.1415 - uTime * 2.2 + floor(g.x) * 1.7);
    float bandX = smoothstep(0.6, 1.0, pulseX) * lineX * segX;
    float bandY = smoothstep(0.6, 1.0, pulseY) * lineY * segY;

    // Static dim base traces (always faintly present once wave reaches them).
    float baseX = lineX * segX * 0.18;
    float baseY = lineY * segY * 0.18;

    // Reveal wave from the seed (center). Traces appear within radius of the wave.
    float dist = length(uv - vec2(0.5, 0.42));
    float revealed = smoothstep(wave + 0.25, wave - 0.25, dist);

    return (bandX + bandY + baseX + baseY) * revealed;
  }

  void main() {
    // Aspect-correct UV.
    vec2 uv = vUv;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    uv.x *= aspect;

    // The power-up wave radius expands from seed over the first ~2s.
    float wave = clamp(uTime * 0.55, 0.0, 1.6);
    float traces = traceField(uv, wave);

    // Seed point glow — the little point of light that starts it all (§7 State 1).
    float seed = smoothstep(0.18, 0.0, length(uv - vec2(0.5 * aspect, 0.42)));
    float seedPulse = (0.6 + 0.4 * sin(uTime * 4.0)) * smoothstep(2.0, 0.3, uTime);

    // Color: cold electric cyan-violet on graphite. Subtle, never neon.
    vec3 base = vec3(0.035, 0.045, 0.07);
    vec3 traceColor = mix(vec3(0.36, 0.62, 1.0), vec3(0.48, 0.36, 1.0), 0.5);
    vec3 col = base + traceColor * traces * 1.4;
    col += traceColor * seed * seedPulse * 0.7;

    // Vignette so edges fade into the graphite body.
    float vig = 1.0 - dot(uv - vec2(0.5 * aspect, 0.5), uv - vec2(0.5 * aspect, 0.5)) * 0.9;
    col *= clamp(vig, 0.25, 1.0);

    // Subtle film grain to keep it from being sterile (very faint, §7).
    float grain = (hash(uv * uResolution * 0.5 + uTime) - 0.5) * 0.02;
    col += grain;

    // Crescendo then recede: intensity ramps up, then gently down as camera moves.
    float a = uAlpha * uIntensity;
    gl_FragColor = vec4(col, a);
  }
`;
