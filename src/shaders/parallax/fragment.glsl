// precision mediump float;

uniform sampler2D uTexture;
uniform float uTime;
uniform float uTextureLoaded;
uniform vec2 uCardSize;
uniform vec2 uImageSize;
uniform float uParallax;

varying vec2 vUv;
// varying vec2 relativeUv;

vec2 CoverUV(vec2 u, vec2 s, vec2 i) {
  float rs = s.x / s.y; // Aspect screen size
  float ri = i.x / i.y; // Aspect image size
  vec2 st = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x); // New st
  vec2 o = (rs < ri ? vec2((st.x - s.x) / 2.0, 0.0) : vec2(0.0, (st.y - s.y) / 2.0)) / st; // Offset
  return u * s / st + o;
}

vec4 loadingColor = vec4(vec3(0.93), 1.0);

void main() {
  vec2 uv = vUv;
  vec2 coverUv = CoverUV(vUv, uCardSize, uImageSize);

  coverUv.y -= uParallax;

  coverUv -= 0.5;
  coverUv *= 0.85;
  coverUv += 0.5;

  vec4 tex = texture2D(uTexture, coverUv);

  vec4 finalTexture = mix(loadingColor, tex, uTextureLoaded);
  // gl_FragColor = vec4(relativeTex, 1.0);
  gl_FragColor = vec4(vec3(vUv, 1.0), 1.0);
  // gl_FragColor = vec4(vec3(0.642736, 0.642736, 0.642736), 1.0);
  gl_FragColor = vec4(finalTexture);

  // #include <colorspace_fragment>
}
