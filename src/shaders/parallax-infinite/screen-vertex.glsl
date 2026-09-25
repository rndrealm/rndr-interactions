uniform float uTime;
uniform float uPlaneWidth;

// The Galaxy S9 Edge curve. The outer uEdgeWidth of each side (as a fraction of
// the sheet's width) wraps around a cylinder through uEdgeAngle degrees, so the
// sheet keeps its full surface area but the sides project into a narrower strip
// than they occupy. The camera is orthographic, which ignores z outright, so
// the wrap has to move vertices in x to be visible at all — that x squeeze is
// the whole effect.
uniform float uEdgeWidth;
uniform float uEdgeAngle;

varying vec2 vUv;

float PI = 3.141592653589793;

void main() {

  vec3 pos = position;

  float band = clamp(uEdgeWidth, 1e-4, 0.5);
  float theta = max(radians(clamp(uEdgeAngle, 0.0, 90.0)), 1e-4);
  float radius = band / theta; // arc length = radius * angle

  float side = uv.x < 0.5 ? -1.0 : 1.0;
  float dist = min(uv.x, 1.0 - uv.x);

  // how far around the curve this column sits: 0 until the roll starts, a full
  // `band` of arc at the very edge of the sheet
  float arc = max(band - dist, 0.0);
  float phi = arc / radius;

  // a cylinder seen head on: `arc` of surface only ever projects to
  // radius * sin(phi). The join needs no smoothing — d(sin)/d(arc) is 1 and its
  // second derivative 0 where the roll begins, so the curve leaves the flat
  // part already travelling in the same direction at the same rate.
  float rolled = band - radius * sin(phi);
  float newDist = dist < band ? rolled : dist;

  // the sides are foreshortened, so scale the sheet back up to fill the screen.
  // The flat face gains exactly what the two curves give up.
  float halfWidth = (0.5 - band) + radius * sin(theta);
  float fill = 0.5 / max(halfWidth, 1e-4);

  float rolledU = 0.5 + side * (0.5 - newDist) * fill;

  pos.x = (rolledU - 0.5) * uPlaneWidth;
  // invisible under the orthographic camera, but it is where the surface
  // actually is, and it keeps the shape honest if the camera ever changes
  pos.z -= radius * (1.0 - cos(phi)) * uPlaneWidth;

  vec4 modelPosition = modelMatrix * vec4(vec3(pos), 1.0);

  vec4 viewPosition = viewMatrix * modelPosition;

  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  vUv = uv;
}
