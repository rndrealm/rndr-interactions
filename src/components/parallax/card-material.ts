import { Vector2 } from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import vertexShader from "../../shaders/parallax-webgl/vertex.glsl";
import fragmentShader from "../../shaders/parallax-webgl/fragment.glsl";

// Owned by the /parallax/webgl page alone. It started as a copy of
// ParallaxMaterial, but that one is driven by DOM rects and shouldn't have to
// carry this page's texture-transition uniforms.
export const CardMaterial = shaderMaterial(
  {
    uTexture: null,
    uNextTexture: null,
    uTime: 0,
    uTextureLoaded: 0,
    uNextTextureLoaded: 0,
    uCardSize: new Vector2(1),
    uImageSize: new Vector2(1),
    uNextImageSize: new Vector2(1),
    uParallax: 0,
    // Transition state, only ever driven on the hero plane. uSlideDir defaults
    // to +1 so a resting card's incoming layer sits fully off the top edge.
    uSlide: 0,
    uSlideDir: 1,
    uOpacity: 1,
  },
  vertexShader,
  fragmentShader,
);

extend({ CardMaterial });
