"use client";
import React, { Fragment, Suspense, useMemo, useRef, useState } from "react";
import { ScrollControls, Stats, useScroll } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Group,
  MathUtils,
  Mesh,
  ShaderMaterial,
  Texture,
  Vector2,
} from "three";
import { easing } from "maath";
import { useLazyTextures } from "@/app/hooks/use-lazy-textures";
import "@/components/parallax/card-material";

const IMAGE_URLS = [
  "https://cdn.cosmos.so/d30a3e35-6a3c-4a23-b823-effe0e80fbf9?format=webp",
  "https://cdn.cosmos.so/f33d7d1d-997d-4c49-93b4-d1d20c610f0e?format=webp",
  "https://cdn.cosmos.so/06dc9e29-0169-4aa8-93c4-6358e699697a?format=webp&w=2048",
  "https://cdn.cosmos.so/b5cf435b-1c1a-4abb-965a-42f707474f16?format=webp",
  "https://cdn.cosmos.so/1109f5de-6067-4f9a-a06b-8952457efc1c?format=webp",
  "https://cdn.cosmos.so/3fd8c9fd-5c21-4917-a0d3-2d2766d7f000?format=webp&w=2048",
  "https://cdn.cosmos.so/0d95e126-1a3b-42b7-99fe-1ed5e0b236a5?format=webp",
];

const data = [
  { id: 0, textureUrl: IMAGE_URLS[0] },
  { id: 1, textureUrl: IMAGE_URLS[1] },
  { id: 2, textureUrl: IMAGE_URLS[2] },
  { id: 3, textureUrl: IMAGE_URLS[3] },
  { id: 4, textureUrl: IMAGE_URLS[4] },
  { id: 5, textureUrl: IMAGE_URLS[5] },
  { id: 6, textureUrl: IMAGE_URLS[6] },
];

// Module-level so the array identity is stable across renders.
const TEXTURE_URLS = data.map((item) => item.textureUrl);

const SMALL_CARD_WIDTH = 80;
const SMALL_CARD_HEIGHT = 50;
const SMALL_CARD_PADDING = 12;
const SMALL_CARD_GAP = 8;
// Per-frame change in ScrollControls offset (0-1 across the whole page) that
// counts as a deliberate scroll rather than momentum dying down.
const SCROLL_CLOSE_THRESHOLD = 0.0001;
// How long the scroll has to stay quiet before scroll-to-close arms. A single
// quiet frame isn't enough: a fast flick is a burst of wheel events, and the
// damped offset converges in the gaps between them.
const SCROLL_SETTLE_TIME = 0.2;
// Smoothing time for the hero's texture sliding from one image to the next.
// Higher is slower and softer; this is a damp, so it has no fixed duration.
const SLIDE_SMOOTHING = 0.28;
// How far a card's texture drifts against its frame, as a fraction of the
// card's own height. The shader crops to 0.85 before shifting, so pushing this
// much past ~0.5 starts sampling clamped edge pixels.
const PARALLAX_STRENGTH = 0.5;
// Smoothing time for the hero growing out of a card and shrinking back into it.
const HERO_MORPH = 0.15;
// Smoothing time for a card heading out to the stack.
const CARD_SMOOTHING = 0.15;
// And for the way back. Kept separate so the close can breathe a little without
// making the open feel sluggish.
const CLOSE_SMOOTHING = 0.22;
// Click zones on the open image, as a fraction of its height: the top band goes
// to the previous image and the bottom band to the next, leaving the middle to
// close.
const HERO_ZONE = 0.4;
// Seconds of delay per step away from the open card.
const STAGGER_DELAY = 0.06 * 1.25;

interface IBigCard {
  ref: React.Ref<Mesh>;
  texture: Texture<ImageBitmap> | null;
  restY: number;
  onSelect: () => void;
}

function BigCard(props: IBigCard) {
  const { ref, texture, restY, onSelect } = props;

  // Memoised so a re-render doesn't hand the uniform a fresh Vector2 every time.
  const imageSize = useMemo(() => {
    const image = texture?.source.data;
    return new Vector2(image?.width ?? 1, image?.height ?? 1);
  }, [texture]);

  return (
    <mesh
      ref={ref}
      position-y={restY}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <planeGeometry args={[1, 1]} />
      {/* @ts-ignore */}
      <cardMaterial
        uTexture={texture}
        uTextureLoaded={texture ? 1 : 0}
        uImageSize={imageSize}
      />
    </mesh>
  );
}

interface IHeroCard {
  ref: React.Ref<Mesh>;
  /** Given where the click landed, 0 at the bottom edge of the image to 1 at
   *  the top. Omitted while closed, which also takes the plane out of R3F's
   *  event list so it can't swallow clicks meant for the cards behind it. */
  onActivate?: (uvY: number) => void;
}

function HeroCard(props: IHeroCard) {
  const { ref, onActivate } = props;

  return (
    <mesh
      ref={ref}
      position={[0, 0, 0.1]}
      onClick={
        onActivate &&
        ((e) => {
          e.stopPropagation();
          // No uv means the raycast gave no surface point; fall back to the
          // middle so the click still closes rather than doing nothing.
          onActivate(e.uv?.y ?? 0.5);
        })
      }
    >
      <planeGeometry args={[1, 1]} />
      {/* @ts-ignore */}
      <cardMaterial transparent depthWrite={false} />
    </mesh>
  );
}

function Experience() {
  const [selected, setSelected] = useState(-1);
  // The card the stagger fans out from, and when the current transition began.
  // The anchor survives closing so the return unwinds from the same card it
  // opened from, instead of fanning out from index 0.
  const anchor = useRef(-1);
  const [selectedAt, setSelectedAt] = useState(0);
  const { height, width } = useThree((state) => state.size);
  const clock = useThree((state) => state.clock);
  const refs = useRef<Mesh[]>([]);
  const heroRef = useRef<Mesh>(null);
  const groupRef = useRef<Group>(null);
  const scrollData = useScroll();
  // Loaded up here rather than per card: the hero has to be able to reach any
  // item's texture, not just its own.
  const textures = useLazyTextures(TEXTURE_URLS);

  const previousScrollOffsetRef = useRef(0);
  // Scroll-to-close stays disarmed until the scroll already in flight when the
  // card opened has died down, so clicking mid-fling doesn't close it again on
  // the very next frame.
  const scrollArmedRef = useRef(false);
  const scrollQuietForRef = useRef(0);

  // Which item the hero is showing, which one is sliding in over it, and how far
  // along that slide is. Refs rather than state: they drive uniforms directly,
  // so nothing here needs to re-render React.
  const heroVisibleRef = useRef(false);
  const shownRef = useRef(-1);
  const incomingRef = useRef(-1);
  const slideRef = useRef(0);
  const slideDirRef = useRef(1);

  const imageSizes = useMemo(
    () =>
      textures.map((texture) => {
        const image = texture?.source.data;
        return new Vector2(image?.width ?? 1, image?.height ?? 1);
      }),
    [textures],
  );

  const groupHeight = height * 0.65 * (data.length - 1);

  // Bottom-right stack, in screen space: go to the edge, come in by the
  // padding, then by half the card, since a plane is centred on its position.
  const stackX = width / 2 - SMALL_CARD_PADDING - SMALL_CARD_WIDTH / 2;
  const stackY0 = -height / 2 + SMALL_CARD_PADDING + SMALL_CARD_HEIGHT / 2;
  const stackStep = SMALL_CARD_HEIGHT + SMALL_CARD_GAP;
  // Parked just past the right edge, level with its own slot, so a card only
  // ever travels horizontally on its way into the stack.
  const offscreenX = width / 2 + SMALL_CARD_WIDTH / 2 + SMALL_CARD_PADDING;
  // Inverted so data order reads top-down, like a DOM column pinned to bottom.
  const slotY = (i: number) => stackY0 + (data.length - 1 - i) * stackStep;
  // Clock time each card is allowed to start moving: nearest the open one first.
  const startAt = (i: number) =>
    selectedAt + Math.abs(anchor.current - i) * STAGGER_DELAY;

  // Hands the fullscreen plane back to the card it stands for: snap that card
  // onto the hero's exact rect, then stop drawing the hero. Same texture, same
  // size, so the swap is invisible — and the card, not a second copy, is what
  // travels back to the column.
  const handOverToCard = () => {
    const hero = heroRef.current;
    const card = refs.current[shownRef.current];

    if (hero && card) {
      const groupY = groupRef.current?.position.y ?? 0;
      card.position.set(
        hero.position.x,
        hero.position.y - groupY,
        hero.position.z,
      );
      card.scale.copy(hero.scale);
    }

    heroVisibleRef.current = false;
  };

  const handleSelect = (id: number) => {
    // Already showing it — including a second click on the active card in the
    // stack, which should do nothing at all.
    if (selected === id) return;

    if (selected === -1) {
      anchor.current = id;
      scrollArmedRef.current = false;
      scrollQuietForRef.current = 0;
      shownRef.current = id;
      incomingRef.current = -1;
      slideRef.current = 0;

      // Start the hero exactly on the clicked card so it reads as that card
      // growing, rather than a new plane appearing over it. The card itself
      // carries on to the stack with the others.
      const card = refs.current[id];
      const hero = heroRef.current;
      if (card && hero) {
        const groupY = groupRef.current?.position.y ?? 0;
        hero.position.set(card.position.x, card.position.y + groupY, 0.1);
        hero.scale.copy(card.scale);
        heroVisibleRef.current = true;

        // The hero now occupies this card's place on screen, so the card can
        // leave from off to the right and slide into its slot. Flying it out of
        // the column instead is what showed a second copy peeling away.
        card.position.set(offscreenX, slotY(id) - groupY, 0.2);
        card.scale.set(SMALL_CARD_WIDTH, SMALL_CARD_HEIGHT, 1);
      }

      setSelectedAt(clock.elapsedTime);
      setSelected(id);
      return;
    }

    // Switching while open: the hero stays put and swaps its texture. A slide
    // still in flight is committed first, so the new one starts from whatever
    // was already on its way in rather than snapping back.
    if (incomingRef.current !== -1) shownRef.current = incomingRef.current;
    // A lower id slides down into place (entering from the top); a higher one
    // comes up from the bottom.
    slideDirRef.current = id < shownRef.current ? 1 : -1;
    incomingRef.current = id;
    slideRef.current = 0;
    setSelected(id);
  };

  // The open image doubles as its own pager: top band back, bottom band forward,
  // middle closes. Paging off either end does nothing rather than wrapping.
  const handleHeroClick = (uvY: number) => {
    if (selected === -1) return;

    if (uvY > 1 - HERO_ZONE) {
      if (selected > 0) handleSelect(selected - 1);
      return;
    }

    if (uvY < HERO_ZONE) {
      if (selected < data.length - 1) handleSelect(selected + 1);
      return;
    }

    handleClose();
  };

  const handleClose = () => {
    handOverToCard();
    setSelectedAt(clock.elapsedTime);
    setSelected(-1);
  };

  useFrame((state, delta) => {
    const groupY = scrollData.offset * groupHeight;

    if (groupRef.current) {
      groupRef.current.position.y = groupY;
    }

    const scrolled = Math.abs(
      scrollData.offset - previousScrollOffsetRef.current,
    );
    previousScrollOffsetRef.current = scrollData.offset;

    if (selected !== -1) {
      if (!scrollArmedRef.current) {
        // Any movement restarts the count, so a burst of wheel events can never
        // arm this between its own frames.
        scrollQuietForRef.current =
          scrolled < SCROLL_CLOSE_THRESHOLD
            ? scrollQuietForRef.current + delta
            : 0;
        if (scrollQuietForRef.current >= SCROLL_SETTLE_TIME) {
          scrollArmedRef.current = true;
        }
      } else if (scrolled > SCROLL_CLOSE_THRESHOLD) {
        // Stamp the clock so the close staggers like a click-close does;
        // without it every card's delay has already elapsed and they all move
        // at once.
        handOverToCard();
        setSelectedAt(state.clock.elapsedTime);
        setSelected(-1);
      }
    }

    for (let i = 0; i < data.length; i++) {
      // Cards nearest the open one move first; the rest hold their current
      // pose until their turn comes round.
      if (state.clock.elapsedTime < startAt(i)) continue;

      const mesh = refs.current[i];
      if (!mesh) continue;

      if (selected === -1) {
        // Nothing open: damp back to the column rather than freezing at
        // whatever scale the card happened to hold.
        easing.damp3(
          mesh.scale,
          [Math.min(800, width - 32), 0.6 * height, 1],
          CLOSE_SMOOTHING,
          delta,
        );
        easing.damp3(
          mesh.position,
          [0, i * -height * 0.65, 0],
          CLOSE_SMOOTHING,
          delta,
        );
      } else {
        // Every card goes to the stack now, the open one included — the hero is
        // a plane of its own, so no card has to be fullscreen.
        easing.damp3(
          mesh.scale,
          [SMALL_CARD_WIDTH, SMALL_CARD_HEIGHT, 1],
          CARD_SMOOTHING,
          delta,
        );
        // These cards are children of the scrolled group, so an absolute screen
        // position has to subtract groupY back out.
        easing.damp3(
          mesh.position,
          [stackX, slotY(i) - groupY, 0.2],
          CARD_SMOOTHING,
          delta,
        );
      }

      // After the easing, not before: the shader needs the size the card
      // actually holds this frame, not the target it is heading for.
      const material = mesh.material as ShaderMaterial;
      material.uniforms.uCardSize.value.set(mesh.scale.x, mesh.scale.y);

      // Parallax is the card centre's distance from the middle of the viewport,
      // normalised by viewport height — the same measure experience.tsx takes
      // off DOM rects, except an ortho camera at the origin means the card's
      // world Y already is that offset.
      const screenY = mesh.position.y + groupY;
      // Faded out by how far the card has shrunk: a crop shift of a quarter of
      // the image reads as depth on a full-bleed card and as a misaligned
      // thumbnail at 80x50.
      const columnness = MathUtils.clamp(
        (mesh.scale.y - SMALL_CARD_HEIGHT) / (0.6 * height - SMALL_CARD_HEIGHT),
        0,
        1,
      );

      material.uniforms.uParallax.value =
        -(screenY / height) * PARALLAX_STRENGTH * columnness;
    }

    const hero = heroRef.current;
    if (!hero) return;

    hero.visible = heroVisibleRef.current;
    if (!hero.visible) return;

    if (incomingRef.current !== -1) {
      // slideRef is already a { current } object, so damp drives it in place.
      // It snaps to the target inside its epsilon and reports back false, which
      // is the arrival the commit needs — the next slide can't start until this
      // one has been folded in.
      const running = easing.damp(
        slideRef,
        "current",
        1,
        SLIDE_SMOOTHING,
        delta,
      );

      if (!running) {
        shownRef.current = incomingRef.current;
        incomingRef.current = -1;
        slideRef.current = 0;
      }
    }

    const shown = shownRef.current;
    const incoming = incomingRef.current;
    const material = hero.material as ShaderMaterial;
    const uniforms = material.uniforms;

    // Only ever grows: the shrink back is done by the card itself, handed the
    // hero's rect at the moment of closing.
    easing.damp3(hero.position, [0, 0, 0.1], HERO_MORPH, delta);
    easing.damp3(hero.scale, [width, height, 1], HERO_MORPH, delta);

    uniforms.uCardSize.value.set(hero.scale.x, hero.scale.y);

    if (shown !== -1) {
      uniforms.uTexture.value = textures[shown];
      uniforms.uTextureLoaded.value = textures[shown] ? 1 : 0;
      uniforms.uImageSize.value.copy(imageSizes[shown]);
    }

    uniforms.uNextTexture.value = incoming === -1 ? null : textures[incoming];
    uniforms.uNextTextureLoaded.value =
      incoming !== -1 && textures[incoming] ? 1 : 0;
    if (incoming !== -1)
      uniforms.uNextImageSize.value.copy(imageSizes[incoming]);

    uniforms.uSlide.value = incoming === -1 ? 0 : slideRef.current;
    uniforms.uSlideDir.value = slideDirRef.current;
  });

  return (
    <Fragment>
      <group ref={groupRef}>
        {data?.map((item, index) => {
          return (
            <BigCard
              key={item?.id}
              ref={(el) => {
                if (el) refs.current[index] = el;
              }}
              texture={textures[index]}
              restY={index * -height * 0.65}
              onSelect={() => handleSelect(index)}
            />
          );
        })}
      </group>

      {/* Outside the scrolled group: the hero is viewport-fixed, and it sits in
          front of the column but behind the stack so stack clicks win. */}
      <HeroCard
        ref={heroRef}
        onActivate={selected === -1 ? undefined : handleHeroClick}
      />
    </Fragment>
  );
}

export default function Page() {
  return (
    <div className="w-full h-screen bg-white">
      <Canvas
        orthographic
        camera={{ position: [0, 0, 100], zoom: 1, near: 0.1, far: 1000 }}
        style={{
          position: "fixed",
          inset: 0,
          // pointerEvents: "none",
          zIndex: 9,
        }}
      >
        {/* <Stats /> */}
        <ScrollControls pages={5}>
          <Suspense fallback={null}>
            <Experience />
          </Suspense>
        </ScrollControls>
      </Canvas>
    </div>
  );
}
