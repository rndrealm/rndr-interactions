// useEffect and instancedRef below are retained for the commented-out
// instanced path; both come back into use the moment it is uncommented.

import React, { Fragment, useEffect, useMemo, useRef } from "react";
import { createPortal, extend, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { shaderMaterial, useFBO } from "@react-three/drei";
import { easing } from "maath";
import {
  BOXES_PER_COLUMN,
  COLOR_MAP,
  COLUMNS,
  ScrollApi,
  TOTAL_COLUMNS,
} from "./infinite-row";
import screenVertexShader from "../../shaders/photoyoshi/plane-vertex.glsl";
import screenFragmentShader from "../../shaders/photoyoshi/plane-fragment.glsl";
import vertexShader from "../../shaders/photoyoshi/vertex.glsl";
import fragmentShader from "../../shaders/photoyoshi/fragment.glsl";
import { Mode } from "@/app/photoyoshi/page";

/** Shown until a card's image has decoded. */
const PLACEHOLDER_COLOR = "#f4f4f4";

export const ScreenMaterial = shaderMaterial(
  {
    uTexture: null,
    uTime: 0,
    uScrollVelocity: 0,
    uGridMode: 1,
  },
  screenVertexShader,
  screenFragmentShader,
);

export const CardMaterial = shaderMaterial(
  {
    uTexture: null,
    uTime: 0,
    uCardSize: new THREE.Vector2(0),
    uImageSize: new THREE.Vector2(0),
    uPlaceholder: new THREE.Color(PLACEHOLDER_COLOR),
    // 0 while the image is still decoding, 1 once it is on the GPU. Also the
    // hook for a fade later — tween it instead of snapping it to 1.
    uLoaded: 0,
  },
  vertexShader,
  fragmentShader,
);

extend({ ScreenMaterial, CardMaterial });

const TOTAL_BOXES = TOTAL_COLUMNS * BOXES_PER_COLUMN;

/**
 * The card list is static: how many there are and what each looks like comes
 * from COLUMNS, a module constant. Only *where* they are comes from the DOM, and
 * that is read per frame in useFrame.
 *
 * Deriving this from `api.boxes()` during render is what made it fragile — the
 * box list is populated in an effect that runs after Canvas has already
 * rendered its children, so the first pass sees an empty list.
 */
const CARDS = Array.from({ length: TOTAL_BOXES }, (_, flatIndex) => ({
  flatIndex,
  color: COLUMNS[Math.floor(flatIndex / BOXES_PER_COLUMN)].color,
}));

/**
 * One geometry, and one material per *colour*, shared across all 180 meshes as
 * props. A <mesh> with no material child gets its own default MeshBasicMaterial
 * from three, so 180 of them means 180 distinct materials — three caches
 * material state between consecutive draws, and distinct materials defeat that
 * completely.
 *
 * Plain module constants: building geometry and materials touches no browser
 * API, so there is nothing to defer, and it sidesteps the "don't mutate a memo
 * result" / "don't read a ref during render" bind these otherwise land in.
 */
const CARD_GEOMETRY = new THREE.PlaneGeometry(1, 1);

/**
 * Resolution of the source render target, as a multiple of CSS pixels.
 *
 * useFBO defaults to `size * viewport.dpr`, so on a retina screen the target is
 * 4x the fragments — and every one of them is written once by the card pass and
 * read once by the screen pass. Full mode is where that bites: most columns
 * collapse to zero width, but the surviving cards grow to 49vw x 100vh, so the
 * fill area jumps several times over.
 *
 * The output goes through a distortion shader, which hides the softness. Raise
 * toward `viewport.dpr` if edges look too soft.
 */
const FBO_PIXEL_RATIO = 1;

/**
 * How scroll velocity drives the screen distortion.
 *
 * GAIN turns width-normalised velocity into the shader's mix factor, where 1 is
 * full distortion. It lives here rather than as a `* 5.0` inside the shader so
 * that the gain, the clamp and the range it clamps to are all stated together —
 * and so it is tunable without a shader recompile.
 *
 * Attack and release are deliberately asymmetric. This value drives a *reaction*
 * to a gesture: it should register on the frame the flick happens and then trail
 * off. Symmetric smoothing has to pick one — either it lags the onset or it cuts
 * the tail. maath's damp is delta-based, so both are in seconds and behave the
 * same at 60Hz and 120Hz.
 */
const SCROLL_DISTORTION_GAIN = 5;
const SCROLL_DISTORTION_ATTACK = 0.06;
const SCROLL_DISTORTION_RELEASE = 0.22;

/**
 * Below this the mix factor snaps to exactly 0. Sized so the snap is invisible:
 * the distortion's largest UV offset is `t * 0.93` (tan(0.45pi) * 0.15), so at
 * a 1080px target this lands well under a tenth of a pixel.
 *
 * Without it the distortion never stops — damp is exponential, so it approaches
 * zero forever and the whole frame keeps being resampled a fraction of a pixel
 * differently every frame.
 */
const SCROLL_DISTORTION_EPSILON = 5e-5;

const LONG_IMAGES = [
  "https://cdn.cosmos.so/492155c5-b6de-46e1-8c9d-754f8d52f6e2?format=webp",
  "https://cdn.cosmos.so/a618eb98-7a6d-4c22-a801-1643d27044a3?format=webp",
  "https://cdn.cosmos.so/e4074aec-78de-4740-8670-0dbd4f6ee38c?format=webp",
  "https://cdn.cosmos.so/3ef669ae-be3a-48d5-a30f-4f5964a0f22f?format=webp",
  "https://cdn.cosmos.so/046d8569-c52a-402f-ab5b-71bb48b2cec6?format=webp",
  "https://cdn.cosmos.so/8f1c3ba0-8f56-4e12-9f4a-8758b12c2a95?format=webp",
  "https://cdn.cosmos.so/c8c265a9-55a1-4cca-a59b-24c47e37d6f7?format=webp",
  "https://cdn.cosmos.so/18c26b39-08be-47fd-9a88-5e02729365bb?format=webp",
  "https://cdn.cosmos.so/587e688f-1e89-438c-8da4-baa4f267a066?format=webp",
  "https://cdn.cosmos.so/a2b6dfbc-5fa2-47a2-a56d-9f28633bd1da?format=webp",
  "https://cdn.cosmos.so/4406bcb5-6476-4fe1-bf87-c1afecd289f9?format=webp",
  "https://cdn.cosmos.so/e1667fa3-3466-4e62-8602-a238b81247fc?format=webp",
  "https://cdn.cosmos.so/1ce3087e-a6e2-478b-a442-48d440d95dcd?format=webp",
  "https://cdn.cosmos.so/cb63dc28-d32d-4640-8d79-889f23fdb7bf?format=webp",
  "https://cdn.cosmos.so/8c1dfa8d-18cd-452b-b6e6-e8b4f4804723?format=webp",
  "https://cdn.cosmos.so/7b93e7f7-8e29-4562-981a-a61f3b27a3d2?format=webp",
  "https://cdn.cosmos.so/b8fa8da8-efaa-49fa-96d1-eabeaf8f6a73?format=webp",
  "https://cdn.cosmos.so/f151b7bf-a7d2-4fb9-9b22-42575bdc1cbb.?format=webp",
  "https://cdn.cosmos.so/1295319b-c394-42d5-a3d6-a60341ba266d?format=webp",
  "https://cdn.cosmos.so/c10ac47b-b259-4e21-af28-60df3b35327c?format=webp",
];

const WIDE_IMAGES = [
  "https://cdn.cosmos.so/8ec557d3-8e37-4cfb-a303-12be4e7c1256?format=webp",
  "https://cdn.cosmos.so/22b35f5d-d8cc-44dd-a471-9d130bafea60?format=webp",
  "https://cdn.cosmos.so/7d0af33a-5522-4953-a29a-4d3a932d0918?format=webp",
  "https://cdn.cosmos.so/a9d1d9ec-11f1-46ca-ae89-79fb8518e2aa?format=webp",
  "https://cdn.cosmos.so/419c3b3b-b6ec-4ebd-b7e4-a0e5a9e781e9?format=webp",
];

/**
 * Which image each card shows, deduped: 180 cards over ~25 distinct URLs, so
 * CARD_IMAGE_URLS holds each once and CARD_TEXTURE maps a flatIndex to its slot.
 *
 * The pool is chosen by aspect — portrait cards take LONG_IMAGES, landscape
 * cards take WIDE_IMAGES — so the source is never cropped against its grain.
 */
const CARD_IMAGE_URLS: string[] = [];
const CARD_TEXTURE = new Uint8Array(TOTAL_BOXES);

{
  const slotByUrl = new Map<string, number>();

  for (let i = 0; i < TOTAL_BOXES; i++) {
    const column = COLUMNS[Math.floor(i / BOXES_PER_COLUMN)];
    const boxIndex = i % BOXES_PER_COLUMN;
    const pool = column.aspects[boxIndex] < 1 ? LONG_IMAGES : WIDE_IMAGES;

    // Reuses the per-box draw already baked into COLUMNS rather than adding a
    // second hash: it is deterministic (so SSR and client agree) and already
    // uncorrelated with the aspect draw that picked the pool.
    const url = pool[column.movies[boxIndex] % pool.length];

    let slot = slotByUrl.get(url);
    if (slot === undefined) {
      slot = CARD_IMAGE_URLS.push(url) - 1;
      slotByUrl.set(url, slot);
    }
    CARD_TEXTURE[i] = slot;
  }
}

/**
 * One texture and one material per distinct image, created empty and up front.
 * Nothing here touches a browser API, so they can be plain module constants.
 *
 * The Texture objects never change identity — an image arriving just sets
 * `.image` and `needsUpdate`, so no material swap and no React re-render. Until
 * then `uLoaded` is 0 and the shader paints uPlaceholder, so cards appear
 * immediately and fill in one by one.
 */
const CARD_TEXTURES = CARD_IMAGE_URLS.map(() => new THREE.Texture());

const CARD_MATERIALS = CARD_TEXTURES.map((texture) => {
  const material = new CardMaterial();
  // assigned after construction, not through the constructor: drei's
  // shaderMaterial defines its uniform accessors *after* super() has run
  // setValues, so a value passed in is overwritten by the default

  material.uniforms.uTexture.value = texture;
  material.uniforms.uImageSize.value = new THREE.Vector2(
    texture.width,
    texture.height,
  );

  return material;
});

let loadStarted = false;

/**
 * Fires all the requests at once and lets each land whenever it lands. Nothing
 * suspends, so the canvas draws from the first frame — the opposite of
 * useTexture, which is built on useLoader and resolves only once every entry in
 * the array has arrived.
 *
 * ImageBitmapLoader rather than TextureLoader because it decodes off the main
 * thread; TextureLoader would turn each image into a frame hitch.
 */
function loadCardTextures() {
  if (loadStarted) return;
  loadStarted = true;

  const loader = new THREE.ImageBitmapLoader();
  // Texture.flipY is *ignored* for ImageBitmap — orientation has to be baked in
  // at decode time, or every card renders upside down.
  loader.setOptions({ imageOrientation: "flipY" });
  loader.setCrossOrigin("anonymous");

  CARD_IMAGE_URLS.forEach((url, slot) => {
    loader.load(
      url,
      (bitmap) => {
        const texture = CARD_TEXTURES[slot];
        texture.image = bitmap;
        texture.needsUpdate = true;

        const uniforms = CARD_MATERIALS[slot].uniforms;
        uniforms.uImageSize.value.set(bitmap.width, bitmap.height);
        uniforms.uLoaded.value = 1;
      },
      undefined,
      () => {
        // leave uLoaded at 0 so a failed card keeps the placeholder rather than
        // sampling an empty texture
        console.warn(`[photoyoshi] card texture failed: ${url}`);
      },
    );
  });
}

interface IProps {
  api: React.RefObject<ScrollApi | null>;
  mode: Mode;
}

export function Experience(props: IProps) {
  const { api, mode } = props;
  // Selector form on purpose: bare useThree() subscribes to the whole store and
  // re-renders on any change to it, and a re-render here reconciles 180 meshes
  // and re-attaches 180 refs.
  const size = useThree((state) => state.size);
  const viewport = useThree((state) => state.viewport);

  const sourceScene = useMemo(() => new THREE.Scene(), []);

  const sourceRenderTarget = useFBO(
    size.width * THREE.MathUtils.clamp(viewport.dpr, 1, 2),
    size.height * THREE.MathUtils.clamp(viewport.dpr, 1, 2),
    {
      // UnsignedByteType over drei's HalfFloatType default: half-float is 8
      // bytes per pixel against 4, so it doubles bandwidth on both the write and
      // the read, and there is nothing here to spend that on — the source scene
      // is flat sRGB with no HDR range and no tone mapping.
      type: THREE.UnsignedByteType,

      // Canvas `antialias` applies to the default framebuffer, not to this
      // target, so without this the card pass has no AA at all. Hard edges are
      // what turn sub-pixel scroll creep into visible vibration: an edge
      // crossing x.5 flips a whole pixel between background and card instead of
      // shading gradually.
      samples: 4,

      // The distortion's UV derivatives explode near uv.x 0 and 1 — adjacent
      // screen pixels sample far-apart rows of this texture. With drei's plain
      // LinearFilter and no mip chain the GPU cannot drop a LOD, so it point
      // samples an undersampled signal and sparkles. A mipmap filter lets it
      // blur exactly where the derivative is large and stay at level 0 through
      // the middle, where the mapping is near identity.
      //
      // Costs a mip chain rebuild per frame (~33% of the target). three does the
      // MSAA resolve first and generates mipmaps after, at the end of the
      // gl.render() call below, so the two compose correctly.
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
    },
  );

  const cardRefs = useRef<(THREE.Mesh | null)[]>([]);

  const instancedRef = useRef<THREE.InstancedMesh>(null);

  const materialRef = useRef<any>(null);

  useEffect(() => {
    loadCardTextures();
  }, []);

  // Colour is static per instance — COLUMNS is a module constant, so this needs
  // nothing from the DOM side and runs exactly once.
  useEffect(() => {
    const mesh = instancedRef.current;
    if (!mesh) return;

    const color = new THREE.Color();
    for (let i = 0; i < TOTAL_BOXES; i++) {
      const column = COLUMNS[Math.floor(i / BOXES_PER_COLUMN)];
      mesh.setColorAt(i, color.set(COLOR_MAP[column.color]));
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, []);

  useFrame((state, delta) => {
    const { gl, camera } = state;
    const rects = api.current?.rects;

    // Deliberately not an early return: the FBO pass below must run even on a
    // frame with no rects, or uTexture is never assigned and the screen plane
    // samples an empty texture.
    if (rects) {
      for (let i = 0; i < TOTAL_BOXES; i++) {
        const card = cardRefs.current[i];
        if (!card) continue;

        const offset = i * 4;
        const width = rects[offset + 2];
        const height = rects[offset + 3];

        // A collapsed card contributes nothing, and skipping the draw is
        // cheaper than drawing a degenerate quad. In row mode most columns sit
        // at zero width, so this covers the bulk of them.
        card.visible = width > 0 && height > 0;
        if (!card.visible) continue;

        // DOM rects are top-left origin with y growing downward; three is
        // centre-origin with y growing up. The camera is 1 unit = 1 px, so the
        // only conversion needed is recentring and flipping y.
        card.position.set(
          rects[offset] + width / 2 - size.width / 2,
          size.height / 2 - (rects[offset + 1] + height / 2),
          0,
        );
        card.scale.set(width, height, 1);
      }
    }

    // if (!rects) return;

    // const mesh = instancedRef.current;
    // if (!mesh) return;

    // for (let i = 0; i < TOTAL_BOXES; i++) {
    //   const offset = i * 4;
    //   const width = rects[offset + 2];
    //   const height = rects[offset + 3];

    //   dummy.position.set(
    //     rects[offset] + width / 2 - size.width / 2,
    //     size.height / 2 - (rects[offset + 1] + height / 2),
    //     0,
    //   );

    //   dummy.scale.set(width || 0.0001, height || 0.0001, 1);
    //   dummy.updateMatrix();
    //   mesh.setMatrixAt(i, dummy.matrix);
    // }
    // mesh.instanceMatrix.needsUpdate = true;

    gl.setRenderTarget(sourceRenderTarget);
    gl.clear();

    gl.render(sourceScene, camera);

    if (materialRef.current) {
      materialRef.current.uniforms.uTexture.value = sourceRenderTarget.texture;
      const distortion = materialRef.current.uniforms.uScrollVelocity;

      // Clamped to the mix factor's meaningful range: past ±1 the shader
      // extrapolates beyond twistedUv rather than interpolating toward it, and a
      // hard drag can hand us several times that. Signed on purpose — the sign
      // is which way the curve leans.
      const target = THREE.MathUtils.clamp(
        ((api.current?.scroll.velocity ?? 0) / size.width) *
          SCROLL_DISTORTION_GAIN,
        -1,
        1,
      );

      // Magnitudes, not signed values: a direction reversal is a fresh impulse
      // to attack toward, not a slow drift through zero.
      const rising = Math.abs(target) > Math.abs(distortion.value);

      easing.damp(
        distortion,
        "value",
        target,
        rising ? SCROLL_DISTORTION_ATTACK : SCROLL_DISTORTION_RELEASE,
        delta,
      );

      easing.damp(
        materialRef.current.uniforms.uGridMode,
        "value",
        mode === "grid" ? 1 : 0.5,
        0.22,
        delta,
      );

      if (Math.abs(distortion.value) < SCROLL_DISTORTION_EPSILON) {
        distortion.value = 0;
      }
    }

    gl.setRenderTarget(null);
  });

  return (
    <Fragment>
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[size.width, size.height]} />
        {/* @ts-ignore */}
        <screenMaterial ref={materialRef} />
      </mesh>

      {createPortal(
        <Fragment>
          <color attach={"background"} args={["#fff"]} />
          {/*
            No position or scale props: those are per-frame values, written in
            useFrame. As JSX props they would be frozen at whatever they held
            when this last rendered.
          */}
          {CARDS.map(({ flatIndex }) => {
            const material = CARD_MATERIALS[CARD_TEXTURE[flatIndex]];
            return (
              <mesh
                key={flatIndex}
                ref={(el) => {
                  cardRefs.current[flatIndex] = el;
                  if (!el) return;
                  // uCardSize is per card, but the material is shared by every
                  // card using this image — so it cannot be set once. This runs
                  // immediately before *this* mesh draws, which is the only
                  // point a shared uniform can carry per-mesh data.
                  el.onBeforeRender = () => {
                    material.uniforms.uCardSize.value.set(
                      el.scale.x,
                      el.scale.y,
                    );
                  };
                }}
                geometry={CARD_GEOMETRY}
                material={material}
              />
            );
          })}
        </Fragment>,
        sourceScene,
      )}
    </Fragment>
  );
}
