// precision mediump float;

uniform sampler2D uTexture;
uniform sampler2D uNextTexture;
uniform float uTime;
uniform float uTextureLoaded;
uniform float uNextTextureLoaded;
uniform vec2 uCardSize;
uniform vec2 uImageSize;
uniform vec2 uNextImageSize;
uniform float uParallax;
uniform float uSlide;
uniform float uSlideDir;
uniform float uOpacity;

varying vec2 vUv;

vec2 CoverUV(vec2 u, vec2 s, vec2 i) {
  float rs = s.x / s.y; // Aspect screen size
  float ri = i.x / i.y; // Aspect image size
  vec2 st = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x); // New st
  vec2 o = (rs < ri ? vec2((st.x - s.x) / 2.0, 0.0) : vec2(0.0, (st.y - s.y) / 2.0)) / st; // Offset
  return u * s / st + o;
}

vec4 loadingColor = vec4(vec3(0.93), 1.0);

// Takes a coordinate in card space so the slide can be applied before the cover
// fit. CoverUV is affine, so a shift of 1.0 here is exactly one card height on
// screen whatever the image's aspect.
vec4 SampleCard(sampler2D tex, vec2 cardUv, vec2 imageSize, float loaded) {
  vec2 uv = CoverUV(cardUv, uCardSize, imageSize);

  uv.y -= uParallax;

  uv -= 0.5;
  uv *= 0.85;
  uv += 0.5;

  return mix(loadingColor, texture2D(tex, uv), loaded);
}

void main() {
  // Push transition: the outgoing image leaves as the incoming one arrives,
  // both travelling the same way. uSlideDir is +1 when the incoming image
  // enters from the top, -1 when it enters from the bottom.
  vec2 curCard = vUv + vec2(0.0, uSlide * uSlideDir);
  vec2 nextCard = vUv + vec2(0.0, (uSlide - 1.0) * uSlideDir);

  vec4 cur = SampleCard(uTexture, curCard, uImageSize, uTextureLoaded);
  vec4 next = SampleCard(uNextTexture, nextCard, uNextImageSize, uNextTextureLoaded);

  // The incoming image only paints the band it has actually slid into. The
  // uSlide guard keeps a resting card off this path entirely — without it the
  // top row of pixels would sample an unset uNextTexture.
  float inNext =
    step(0.0, nextCard.y) * step(nextCard.y, 1.0) * step(0.0001, uSlide);

  vec4 color = mix(cur, next, inNext);

  gl_FragColor = vec4(color.rgb, color.a * uOpacity);

  // #include <colorspace_fragment>
}
