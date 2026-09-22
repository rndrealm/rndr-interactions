import { Vector2 } from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import vertexShader from "../../../../shaders/parallax-infinite/vertex.glsl";
import fragmentShader from "../../../../shaders/parallax-infinite/fragment.glsl";

// Owned by the /parallax/webgl page alone. It started as a copy of
// ParallaxMaterial, but that one is driven by DOM rects and shouldn't have to
// carry this page's texture-transition uniforms.
export const CardMaterial = shaderMaterial(
  {
    uTexture: null,
    uTime: 0,
    uTextureLoaded: 0,
    uCardSize: new Vector2(1),
    uImageSize: new Vector2(1),
    uScrollDelta: new Vector2(0),
    uParallaxRange: 1 / 1.3,
    uParallax: new Vector2(0.5),
  },
  vertexShader,
  fragmentShader,
);

extend({ CardMaterial });

export type CardMaterialImpl = InstanceType<typeof CardMaterial>;
