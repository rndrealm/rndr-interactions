// precision mediump float;

uniform sampler2D uTexture;
uniform float uColorProgressAB; // dark -> light, applied to each endpoint
uniform float uColorProgressABC;   // colorA -> colorB
uniform float uEdgeX1; // smoothstep edges for the X ramp
uniform float uEdgeX2;
uniform float uEdgeY1; // smoothstep edges for the Y ramp
uniform float uEdgeY2;
uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;

varying vec2 vUv;
// varying vec2 relativeUv;

// Pseudo-random float in 0..1 from a 2D cell coordinate.
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Value noise: random values on a lattice, smoothly interpolated between.
float valueNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f); // hermite fade, kills the grid-aligned creases

  float a = hash(cell);
  float b = hash(cell + vec2(1.0, 0.0));
  float c = hash(cell + vec2(0.0, 1.0));
  float d = hash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// Fractal brownian motion: stack octaves at doubling frequency / halving
// amplitude. This is what makes it read as organic rather than as a ripple.
float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;

  for(int i = 0; i < 5; i++) {
    sum += amp * valueNoise(p);
    p *= 2.0;
    amp *= 0.5;
  }

  return sum;
}

vec2 CoverUV(vec2 u, vec2 s, vec2 i) {
  float rs = s.x / s.y; // Aspect screen size
  float ri = i.x / i.y; // Aspect image size
  vec2 st = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x); // New st
  vec2 o = (rs < ri ? vec2((st.x - s.x) / 2.0, 0.0) : vec2(0.0, (st.y - s.y) / 2.0)) / st; // Offset
  return u * s / st + o;
}

// dark
const vec4 DARK_A = vec4(0.027451, 0.027451, 0.027451, 1.0); // #070707
const vec4 DARK_B = vec4(1.0, 1.0, 1.0, 1.0);                // #ffffff

// light
const vec4 MIDDLE_A = vec4(0.298039, 0.619608, 1.0, 1.0);      // #4c9eff
const vec4 MIDDLE_B = vec4(0.784314, 0.576471, 1.0, 1.0);      // #c893ff

const vec4 LIGHT_A = vec4(0.600000, 0.419608, 0.666667, 1.0); // #996baa
const vec4 LIGHT_B = vec4(0.925490, 0.654902, 0.501961, 1.0); // #eca780

void main() {

  // vec3 colorA = vec3(0.0);
  // vec3 colorB = vec3(1.0);

  const float NOISE_FREQ = 6.0;  // pattern scale: higher = finer, busier edge
  const float NOISE_AMP = 0.15;  // how far the edge strays, in UV units

  vec2 noiseUv = vUv * NOISE_FREQ;
  // noiseUv += uTime * 0.1; // scroll the pattern (needs uTime wired up)

  // Remapped to -0.5..0.5 so the edge wobbles around its original position
  // instead of sliding off in one direction. The +37.0 offset samples a
  // different region of the noise field, so the two edges don't move in
  // lockstep and read as the square merely jittering.
  float nx = (fbm(noiseUv) - 0.5) * NOISE_AMP;
  float ny = (fbm(noiseUv + 37.0) - 0.5) * NOISE_AMP;

  float y = smoothstep(uEdgeY1, uEdgeY2, vUv.y);
  float x = smoothstep(uEdgeX1, uEdgeX2, vUv.x);

  vec4 colorA = mix(DARK_A, LIGHT_A, uColorProgressAB);
  vec4 colorB = mix(DARK_B, LIGHT_B, uColorProgressAB);

  vec4 finalColorA = mix(colorA, MIDDLE_A, uColorProgressABC);
  vec4 finalColorB = mix(colorB, MIDDLE_B, uColorProgressABC);

  vec4 gradientColorY = mix(finalColorB, finalColorA, y);
  vec4 gradientColorX = mix(finalColorB, finalColorA, x);
  vec4 gradientColor = gradientColorX * gradientColorY;
  // gl_FragColor = vec4(relativeTex, 1.0);
  gl_FragColor = vec4(vec3(vUv, 1.0), 1.0);
  gl_FragColor = vec4(gradientColor);
}
