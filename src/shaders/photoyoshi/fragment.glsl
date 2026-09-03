// precision mediump float;

uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uCardSize;
uniform vec2 uImageSize;
uniform vec3 uPlaceholder;
uniform float uLoaded;

varying vec2 vUv;

float PI = 3.141592653589793;

vec2 CoverUV(vec2 u, vec2 s, vec2 i) {
  float rs = s.x / s.y; // Aspect screen size
  float ri = i.x / i.y; // Aspect image size
  vec2 st = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x); // New st
  vec2 o = (rs < ri ? vec2((st.x - s.x) / 2.0, 0.0) : vec2(0.0, (st.y - s.y) / 2.0)) / st; // Offset
  return u * s / st + o;
}

void main() {
  // Stretched for now. Swap in CoverUV(vUv, uCardSize, uImageSize) for cover
  // fit — both uniforms are already fed: uImageSize on decode, uCardSize per
  // mesh in onBeforeRender.

  vec2 uv = vUv;
  vec2 coverUv = CoverUV(uv, uCardSize, uImageSize);
  vec4 tex = texture2D(uTexture, coverUv);

  // uLoaded is 0 until the bitmap is on the GPU, so an undecoded card shows the
  // placeholder instead of sampling an empty texture. Tween it for a fade-in.
  gl_FragColor = vec4(mix(uPlaceholder, tex.rgb, uLoaded), 1.0);

  // #include <tonemapping_fragment>
  // #include <colorspace_fragment>
}
