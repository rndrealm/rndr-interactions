// precision mediump float;

uniform sampler2D uTexture;
uniform float uDirection;
uniform float uProgress;
uniform float uTime;
uniform float uRefract;
uniform float uSweeps;
uniform vec3 uPalA;
uniform vec3 uPalB;
uniform vec3 uPalC;
uniform vec3 uPalD;
uniform vec2 uPlaneSize;
uniform vec2 uImageSize;

varying vec2 vUv;
// varying vec2 relativeUv;

float PI = 3.141592653589793;

vec3 pal(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(2.0 * PI * (c * t + d));
}

vec2 CoverUV(vec2 u, vec2 s, vec2 i) {
  float rs = s.x / s.y; // Aspect screen size
  float ri = i.x / i.y; // Aspect image size
  vec2 st = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x); // New st
  vec2 o = (rs < ri ? vec2((st.x - s.x) / 2.0, 0.0) : vec2(0.0, (st.y - s.y) / 2.0)) / st; // Offset
  return u * s / st + o;
}

// Description : Array and textureless GLSL 2D simplex noise function.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : stegu
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//               https://github.com/stegu/webgl-noise
//

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x * 34.0) + 10.0) * x);
}

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
  0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
  -0.577350269189626,  // -1.0 + 2.0 * C.x
  0.024390243902439); // 1.0 / 41.0
// First corner
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);

// Other corners
  vec2 i1;
  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
  //i1.y = 1.0 - i1.x;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  // x0 = x0 - 0.0 + 0.0 * C.xx ;
  // x1 = x0 - i1 + 1.0 * C.xx ;
  // x2 = x0 - 1.0 + 2.0 * C.xx ;
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

// Permutations
  i = mod289(i); // Avoid truncation effects in permutation
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));

  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;

// Gradients: 41 points uniformly over a line, mapped onto a diamond.
// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

// Normalise gradients implicitly by scaling m
// Approximation of: m *= inversesqrt( a0*a0 + h*h );
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);

// Compute final noise value at P
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Palette coefficients arrive as uniforms — the presets live in nft-canvas.tsx.

// The unminted plate: oklch(0.918 0 0), the page's own grey, written straight
// to the framebuffer since this material skips the colorspace conversion.
const vec3 BLANK = vec3(0.893);

// Unresolved-grain controls.
const float NOISE_DETAIL = 500.0; // higher = finer grain
const float NOISE_SPREAD = 10.0;  // multiplies the uv smear
const float NOISE_TINT = 0.08;    // how far the grain pushes the plate colour
const float NOISE_FPS = 14.0;     // grain re-rolls this many times a second
const float NOISE_JUMP = 71.3;    // how far the field jumps on each re-roll
const float NOISE_CHURN = 25.0;   // smooth drift speed of the uv smear

// Sweep band controls — port of glimm's flat shimmer shader.
const float BAND_TIGHT = 18.0; // higher = tighter, more focused crest
const float WAVE_AMOUNT = 1.0; // multiplies the wavy crest displacement
const float BRIGHTNESS = 1.0; // scales the iridescent band before composite

void main() {

  float time = uTime;
  float angle = uDirection * PI * 0.5;      // 0 -> 0rad, 0.5 -> 45deg, 1 -> 90deg
  vec2 dir = vec2(sin(angle), cos(angle)); // travel direction
  vec2 crest = vec2(cos(angle), -sin(angle));// perpendicular (crest line)

  float axis = dot(vUv, dir);   // sweep progresses along this
  float cross = dot(vUv, crest); // runs along the crest (wave + hue)

  // uProgress counts whole sweeps: a mint runs it 0 -> 3, one unit per layer.
  // The fractional part drives the current pass, so it rests invisible on every
  // whole number — that is the pause between sweeps.
  float sweep = fract(uProgress);

  float span = sin(angle) + cos(angle);
  float pos = mix(-0.3, span + 0.3, sweep);

  float waveSine = sin(cross * 6.0 + time * 1.3) * 0.020 + sin(cross * 13.0 - time * 0.9 + 1.4) * 0.012 + sin(cross * 21.0 + time * 1.7 + 2.6) * 0.006;

  float waveAlt = sin(cross * 4.7 + time * 1.10) * 0.022 +
    sin(cross * 7.6 - time * 0.83 + 1.7) * 0.014 +
    sin(cross * 12.3 + time * 1.47 + 0.6) * 0.009 +
    sin(cross * 19.9 - time * 0.61 + 2.9) * 0.005;
  float waveX = mix(waveSine, waveAlt, 0.1) * WAVE_AMOUNT;

// float warp = sin(cross * 3.0 + time * 0.7) * 0.6;
// float waveAlt = sin(cross * 9.0 + warp + time * 1.2) * 0.028
//               + sin(cross * 17.0 + warp * 1.5 - time * 0.5) * 0.010;
// float waveX = mix(waveSine, waveAlt, uNoiseEdge) * WAVE_AMOUNT;

// float x = cross * 6.0 + time * 0.5;
// float i = floor(x);
// float f = fract(x);
// f = f * f * (3.0 - 2.0 * f); // smoothstep
// float n = mix(hash21(vec2(i, 1.0)), hash21(vec2(i + 1.0, 1.0)), f);
// float waveAlt = (n - 0.5) * 0.06;
// float waveX = mix(waveSine, waveAlt, uNoiseEdge) * WAVE_AMOUNT;

  float d = (axis - pos) - waveX;
  float band = exp(-d * d * BAND_TIGHT);

  float trail = clamp(0.5 - d * 1.3, 0.0, 1.0);
  trail = pow(trail, 2.5) * 0.30;
  float intensity = max(band * 0.95, trail);

  float dhDaxis = -2.0 * d * BAND_TIGHT * band;
  vec3 N = normalize(vec3(-dhDaxis * 0.18, 0.0, 1.0));

  float t = N.x * 0.45 + axis * 1.4 + cross * 0.35 + uTime * 0.04;
  vec3 col = pal(t, uPalA, uPalB, uPalC, uPalD) * BRIGHTNESS;

  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 L = normalize(vec3(0.35, 0.55, 0.9));
  vec3 H = normalize(L + V);
  float NdotH = clamp(dot(N, H), 0.0, 1.0);
  float NdotV = clamp(dot(N, V), 0.0, 1.0);
  float fresnel = pow(1.0 - NdotV, 3.0);
  float spec = pow(NdotH, 80.0);

  float entryFade = clamp(4.0 * sweep * (1.0 - sweep), 0.0, 1.0);

  float grain = snoise(gl_FragCoord.xy) * 0.01 * band;
  vec2 refractOffset = (dir * N.x * uRefract + grain) * entryFade;

  // Each sweep hands over another 1/uSweeps of the texture, and the handover
  // rides the band front: d < 0 is ground the crest has already crossed.
  float steps = max(uSweeps, 1.0);
  float passed = 1.0 - smoothstep(-0.04, 0.04, d);
  float reveal = clamp((floor(uProgress) + passed) / steps, 0.0, 1.0);

  // Grain rides the same ramp in reverse: heaviest on the unminted plate, and
  // every sweep takes 1/uSweeps of it out as it hands over its share of the
  // texture, so the image sharpens and settles in one move.
  float unresolved = 1.0 - reveal;

  // Both fields are scaled by `unresolved`, so the plate is restless until the
  // mint lands and dead still afterwards.
  //
  // The tint re-rolls in steps rather than per frame — film grain, not a
  // strobe — which also keeps the cadence the same on a 120Hz display.
  float grainSignal = snoise(vUv * NOISE_DETAIL + floor(uTime * NOISE_FPS) * NOISE_JUMP);
  // The smear drifts smoothly instead, so a half-formed image boils rather
  // than stutters.
  float smearSignal = snoise(vUv * NOISE_DETAIL + uTime * NOISE_CHURN);
  vec2 noiseOffset = vec2(smearSignal * 0.01 * NOISE_SPREAD) * unresolved;

  vec2 coverUv = CoverUV(vUv, uPlaneSize, uImageSize);
  vec3 baseColor = mix(BLANK, texture2D(uTexture, coverUv + refractOffset + noiseOffset).rgb, reveal);
  // The plate is flat colour until the first sweep, so the uv smear alone would
  // show nothing there — this tint is what makes the unminted card read as noisy.
  baseColor += grainSignal * NOISE_TINT * unresolved;

  vec3 bodyCol = col * intensity * entryFade;
  vec3 highEmit = (col * fresnel * 0.55 + vec3(spec) * 1.1) * band * entryFade;

  vec4 tex = texture2D(uTexture, coverUv);
  vec3 finalColor = baseColor + (bodyCol + highEmit) * tex.a;

  // gl_FragColor = vec4(relativeTex, 1.0);
  gl_FragColor = vec4(vec3(vUv, 1.0), 1.0);
  gl_FragColor = vec4(finalColor, 1.0);

  // #include <tonemapping_fragment>
  // #include <colorspace_fragment>
}
