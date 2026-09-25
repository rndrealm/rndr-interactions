// precision mediump float;

uniform sampler2D uTexture;
uniform float uTime;

// Glass over all four sides. On x it sits on top of the curve the vertex shader
// bends, sharing uEdgeWidth and uEdgeAngle with it so the two land on the same
// strip; on y it is the whole effect, since the geometry stays flat there.
uniform float uEdgeWidth;
uniform float uCurve;
uniform float uEdgeAngle;
uniform float uRefraction;
uniform float uIor;
uniform float uDispersion;

varying vec2 vUv;

vec2 CoverUV(vec2 u, vec2 s, vec2 i) {
  float rs = s.x / s.y; // Aspect screen size
  float ri = i.x / i.y; // Aspect image size
  vec2 st = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x); // New st
  vec2 o = (rs < ri ? vec2((st.x - s.x) / 2.0, 0.0) : vec2(0.0, (st.y - s.y) / 2.0)) / st; // Offset
  return u * s / st + o;
}

// How far the glass has rolled over along one axis: 0 across the flat middle,
// 1 hard against the edge, accelerating the whole way out. The exponent leaves
// both the value and its slope at zero where the roll begins, so the start of
// the curve has no seam — that needs uCurve >= 2.
float edgeRoll(float u, float band, float curve) {
  float dist = min(u, 1.0 - u);
  float s = clamp(1.0 - dist / band, 0.0, 1.0);
  return pow(s, max(curve, 2.0));
}

// The surface tilt this axis contributes, leaning back towards the middle.
// refract flips the sign of the sideways travel, so leaning inward is what
// crams a wide band of source into the narrow edge strip — lean it the other
// way and the edge stretches instead.
float edgeTilt(float u, float band, float curve, float maxAngle) {
  float side = u < 0.5 ? -1.0 : 1.0;
  float theta = maxAngle * edgeRoll(u, band, curve);
  return -side * tan(theta);
}

float foldUnit(float x) {
  x = abs(x);
  return x > 1.0 ? max(2.0 - x, 0.0) : x;
}

// Fold back into [0, 1] rather than clamping. The bend samples further out than
// it lands, so the last sliver runs off the texture; clamping would smear the
// outermost row or column down the whole edge, where a fold reads as glass
// catching the light.
vec2 foldUnit(vec2 uv) {
  return vec2(foldUnit(uv.x), foldUnit(uv.y));
}

// Sideways travel of a head-on view ray bent through the glass.
vec2 refractOffset(vec3 normal, float ior) {
  vec3 incident = vec3(0.0, 0.0, -1.0);
  return refract(incident, normal, 1.0 / max(ior, 1.0)).xy;
}

void main() {
  float band = max(uEdgeWidth, 1e-4);
  float maxAngle = radians(clamp(uEdgeAngle, 0.0, 89.0));

  // Each axis tilts the surface on its own, so the corners — where both are
  // leaning at once — fall out of the maths without a special case.
  vec2 tilt = vec2(
    edgeTilt(vUv.x, band, uCurve, maxAngle),
    edgeTilt(vUv.y, band, uCurve, maxAngle)
  );
  vec3 normal = normalize(vec3(tilt, 1.0));

  vec2 rOffset = refractOffset(normal, uIor * (1.0 - uDispersion)) * uRefraction;
  vec2 gOffset = refractOffset(normal, uIor) * uRefraction;
  vec2 bOffset = refractOffset(normal, uIor * (1.0 + uDispersion)) * uRefraction;

  vec3 color;
  color.r = texture2D(uTexture, foldUnit(vUv + rOffset)).r;
  color.g = texture2D(uTexture, foldUnit(vUv + gOffset)).g;
  color.b = texture2D(uTexture, foldUnit(vUv + bOffset)).b;

  gl_FragColor = vec4(color, 1.0);

  #include <colorspace_fragment>
}
