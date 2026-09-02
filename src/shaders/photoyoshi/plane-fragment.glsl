// precision mediump float;

uniform sampler2D uTexture;
uniform float uTime;
uniform float uScrollVelocity;
uniform float uGridMode;

varying vec2 vUv;
// varying vec2 relativeUv;

float PI = 3.141592653589793;

vec2 CoverUV(vec2 u, vec2 s, vec2 i) {
  float rs = s.x / s.y; // Aspect screen size
  float ri = i.x / i.y; // Aspect image size
  vec2 st = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x); // New st
  vec2 o = (rs < ri ? vec2((st.x - s.x) / 2.0, 0.0) : vec2(0.0, (st.y - s.y) / 2.0)) / st; // Offset
  return u * s / st + o;
}

void main() {
  vec2 uv = vUv;
  vec2 twistedUv = uv;

  float angleX = (uv.x - 0.5) * PI * 0.9; // ±81° at the edges
  twistedUv.y -= tan(angleX) * 0.15;

  // vec2 c = uv - 0.5;
  // float a = length(c) * 4.0;                   // twist falloff
  // float s = sin(a), co = cos(a);
  // vec2 uvTwirl = 0.5 + mat2(co, -s, s, co) * c;

  // vec2 uvWave = uv;
  // uvWave.x += sin(uv.y * 20.0 + uTime * 2.0) * 0.03;   // horizontal snake
// radial version:
  // vec2 d = uv - 0.5;
  // uvWave = uv + normalize(d) * sin(length(d) * 40.0 - uTime * 3.0) * 0.02;

  // vec2 c = uv - 0.5;
  // float ang = atan(c.y, c.x);
  // float rad = length(c);
  // vec2 uvPolar = vec2(ang / (2.0 * PI) + 0.5 + uTime * 0.05, rad * 2.0);

  // Already the mix factor: gain, clamp and the cut-off to exact zero are all
  // applied on the JS side, so 0 here means "no distortion" precisely and the
  // sample below becomes a straight 1:1 lookup.

  vec2 finalUV = mix(uv, twistedUv, (uScrollVelocity) * uGridMode);

  vec4 tex = texture2D(uTexture, finalUV);
  gl_FragColor = vec4(vec3(vUv, 1.0), 1.0);
  gl_FragColor = tex;

  // #include <tonemapping_fragment>
  // #include <colorspace_fragment>
}
