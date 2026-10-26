uniform float uTime;
uniform float uDirection;
uniform float uProgress;
uniform float uWarp;
uniform vec2 uPlaneSize;

varying vec2 vUv;
varying vec2 relativeUv;

float PI = 3.141592653589793;

// Kept in step with the fragment shader's band, so the geometry bulges exactly
// where the light crest is drawn.
const float BAND_TIGHT = 18.0;

void main() {

  vec3 pos = position;

  // Same sweep frame as the fragment shader.
  float angle = uDirection * PI * 0.5;
  vec2 dir = vec2(sin(angle), cos(angle));
  vec2 crestDir = vec2(cos(angle), -sin(angle));

  float axis = dot(uv, dir);
  float crestAxis = dot(uv, crestDir);

  // uProgress counts whole sweeps — only the fractional part drives a pass, so
  // the plate is flat again on every whole number.
  float sweep = fract(uProgress);

  float span = sin(angle) + cos(angle);
  float sweepPos = mix(-0.3, span + 0.3, sweep);

  float waveX = sin(crestAxis * 6.0 + uTime * 1.3) * 0.020 +
    sin(crestAxis * 13.0 - uTime * 0.9 + 1.4) * 0.012 +
    sin(crestAxis * 21.0 + uTime * 1.7 + 2.6) * 0.006;

  float d = (axis - sweepPos) - waveX;
  float band = exp(-d * d * BAND_TIGHT);

  // Fades the displacement in and out with the sweep so the plane is perfectly
  // flat at rest.
  float entryFade = clamp(4.0 * sweep * (1.0 - sweep), 0.0, 1.0);

  // uWarp is the peak in-plane drag as a fraction of the plane's short side, so
  // the bend looks the same at any viewport size. Worth reading next to the
  // fragment's uRefract, which fakes the same thing in uv space: at its 0.56
  // default that shifts the image by ~31% of its width, so anything much below
  // ~0.1 here is invisible underneath it.
  float scale = min(uPlaneSize.x, uPlaneSize.y);

  float amount = band * entryFade * uWarp * scale;

  // In-plane push along the sweep direction bends the silhouette — the mesh is
  // built smaller than the viewport so the edge has margin to swing into; the z
  // bulge lifts the crest so it catches the light off-axis.
  pos.xy += dir * amount;
  pos.z += amount * 0.6;

  vec4 modelPosition = modelMatrix * vec4(vec3(pos), 1.0);

  vec4 viewPosition = viewMatrix * modelPosition;

  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  vUv = uv;

  // relativeUv = vec2(normalizedPosX, normalizedPosY);
}
