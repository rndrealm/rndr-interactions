import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import vertexShader from "../../../../shaders/parallax-infinite/screen-vertex.glsl";
import fragmentShader from "../../../../shaders/parallax-infinite/screen-fragment.glsl";

// Owned by the /parallax/webgl page alone. It started as a copy of
// ParallaxMaterial, but that one is driven by DOM rects and shouldn't have to
// carry this page's texture-transition uniforms.
export const InfiniteScreenMaterial = shaderMaterial(
  {
    uTexture: null,
    uTime: 0,
    uPlaneWidth: 1,
    uEdgeWidth: 0.05,
    uCurve: 3,
    uEdgeAngle: 65,
    uRefraction: 0.08,
    uIor: 1.45,
    uDispersion: 0.04,
  },
  vertexShader,
  fragmentShader,
);

extend({ InfiniteScreenMaterial });

export type InfiniteScreenMaterialImpl = InstanceType<
  typeof InfiniteScreenMaterial
>;
