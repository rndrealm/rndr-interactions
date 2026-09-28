"use client";

import { Text, Text3D } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Leva, useControls } from "leva";
import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";

const FONT_URL = "/fonts/abc-diatype/ABCDiatype-Medium-Trial.otf";
/* Extruded glyphs need outlines, not an SDF atlas, so the same face is also
   built as three.js typeface JSON — see scripts/otf-to-typeface.py. */
const FONT_3D = "/fonts/diatype-medium.typeface.json";

/* Padding on the control, in the same pixels it renders at. */
const PAD_L_PX = 24;
const PAD_R_PX = 64;
const FIELD_H = 56;
const FONT_FAMILY = '500 100px "ABC Diatype", sans-serif';

/* The tray's footprint is the input field as you see it head-on: W is its width,
   D its height. The third axis — how far a letter falls before it lands — is the
   one the flat view can't show you, because the flat view IS the plan view.

   The control is sized by its padding, the way a padded button is: 56px tall,
   and wide enough for the placeholder plus 24px left and 64px right. CONTENT_PX
   is the advance width of PLACEHOLDER at the default font size — change the
   wording and this has to change with it. */
const PLACEHOLDER = "Enter your email address";
const CONTENT_PX = 201.9;
const TRAY_D = 1.9;
const TRAY_W = (CONTENT_PX + PAD_L_PX + PAD_R_PX) / (FIELD_H / TRAY_D);
/* The rim is a hairline: thick enough to catch the key light and read as the
   border of a pill from straight on, thin enough that tilting reveals a
   thin-walled vessel rather than a chunky slab. */
const WALL = 0.035;

/* Letters come to rest a hair off the floor so the contact shadow stays visible
   underneath them instead of z-fighting with the floor. */
const REST_Y = 0.01;

/* Orthographic zoom is CSS pixels per world unit, so one constant fixes both the
   render and the hit area over it. */
const PX_PER_UNIT = FIELD_H / TRAY_D;
const PAD_L = PAD_L_PX / PX_PER_UNIT;
const PAD_R = PAD_R_PX / PX_PER_UNIT;
/* Where text may start and how much room it has, once padding is taken off. */
const CONTENT_LEFT = -TRAY_W / 2 + WALL + PAD_L;
const CONTENT_W = TRAY_W - 2 * WALL - PAD_L - PAD_R;

const MAX_CHARS = 40;
const STAGGER = 0.05; // seconds between characters when several arrive at once (paste)
const EXIT_MS = 520;

/* Pitch of PI/2 is the camera looking straight down the well: all depth collapses
   and the tray reads as a flat bordered rectangle. */
const FLAT_PITCH = Math.PI / 2;

/* Two letters only shove each other when they are on the same layer. Airborne
   ones pass over the pile instead of bumping it from above, so nothing stacks. */
const SAME_LAYER = 0.12;

/* Overlap a packed tray is allowed to keep. Below this, letters are left alone
   entirely — see the separation pass for why that matters. */
const SLOP = 0.012;

type Letter = { id: number; char: string; delay: number; exiting: boolean };
type Spawned = Letter & { x: number; w: number };

type Theme = {
  page: string;
  floor: string;
  /* The wall's side surfaces, inside and out. Kept close to the page so the
     vessel's bulk disappears and only its top edge draws the shape. */
  body: string;
  /* The top and bottom faces of the wall ring — one hairline each. This is the
     border you see when the field is flat. */
  rim: string;
  ink: string;
  ghost: string;
  /* How hard a letter's contact shadow reads against the floor — a dark floor
     takes far more of it before the letter starts to look unmoored. */
  contact: number;
  ambient: number;
  key: number;
  fill: number;
};

const THEMES: Record<"light" | "dark", Theme> = {
  /* Lighting runs untonemapped (see `flat` on the Canvas), so these intensities
     land on the materials as written: the rim catches the key and clips just past
     white, the floor sits below it, and the inner walls get ambient only. That
     spread is the whole recess — there is no ambient occlusion doing it for us. */
  light: {
    page: "#f2f0ed",
    floor: "#ffffff",
    body: "#f7f5f2",
    rim: "#c9c4ba",
    ink: "#17181b",
    ghost: "#b4afa6",
    contact: 0.2,
    ambient: 1.55,
    key: 0.85,
    fill: 0.5,
  },
  dark: {
    page: "#000000",
    floor: "#0e0e11",
    body: "#141519",
    rim: "#787d88",
    ink: "#ffffff",
    ghost: "#55585f",
    contact: 0.5,
    ambient: 1.0,
    key: 1.35,
    fill: 0.5,
  },
};

/* ------------------------------------------------------------------ measuring */

/* troika lays out each glyph asynchronously, so advance widths come from a 2D
   canvas using the same face instead — same numbers, available synchronously. */
function useAdvanceWidths(fontSize: number) {
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) return;
    ctx.font = FONT_FAMILY;
    ctxRef.current = ctx;

    let live = true;
    document.fonts.load('500 100px "ABC Diatype"').then(() => {
      if (!live) return;
      ctx.font = FONT_FAMILY; // re-set: the face may have swapped in since
      setReady(true);
    });
    return () => {
      live = false;
    };
  }, []);

  const measure = useCallback(
    (char: string) => {
      const ctx = ctxRef.current;
      if (!ctx) return fontSize * 0.55;
      return (ctx.measureText(char).width / 100) * fontSize;
    },
    [fontSize],
  );

  return { measure, ready };
}

function makeBlobTexture() {
  if (typeof document === "undefined") return null;
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  grad.addColorStop(0, "rgba(0,0,0,1)");
  grad.addColorStop(0.4, "rgba(0,0,0,0.6)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

const rand = (spread: number) => (Math.random() * 2 - 1) * spread;

/* One extruded, bevelled letter. TextGeometry lays a glyph out from its own
   origin on the baseline; this centres it in its own plane so it spins about its
   middle, while leaving the extrusion sitting on zero so the letter rests ON the
   floor instead of half sunk through it. Re-centring is idempotent — the bounds
   are re-measured each time — which matters because effects run twice in dev. */
function Glyph3D({
  char,
  fontSize,
  depth,
  bevel,
  color,
}: {
  char: string;
  fontSize: number;
  depth: number;
  bevel: number;
  color: string;
}) {
  const mesh = useRef<THREE.Mesh>(null);

  useLayoutEffect(() => {
    const geometry = mesh.current?.geometry;
    if (!geometry) return;
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    if (!box) return;
    geometry.translate(
      -(box.min.x + box.max.x) / 2,
      -(box.min.y + box.max.y) / 2,
      -box.min.z,
    );
  }, [char, fontSize, depth, bevel]);

  return (
    <Text3D
      ref={mesh}
      font={FONT_3D}
      size={fontSize}
      height={depth}
      curveSegments={5}
      bevelEnabled
      bevelThickness={bevel * 0.7}
      bevelSize={bevel}
      bevelOffset={0}
      bevelSegments={3}
    >
      {char}
      <meshStandardMaterial color={color} roughness={0.42} metalness={0.06} />
    </Text3D>
  );
}

/* A stadium: two half-circles joined by straight sides. Everything about the
   tray — its silhouette, its floor and the wall the letters bounce off — is
   this one outline at three different insets. */
function stadium<T extends THREE.Path>(
  path: T,
  width: number,
  depth: number,
): T {
  const r = depth / 2;
  const straight = Math.max(0, width / 2 - r);
  path.absarc(straight, 0, r, -Math.PI / 2, Math.PI / 2, false);
  path.absarc(-straight, 0, r, Math.PI / 2, Math.PI * 1.5, false);
  path.closePath();
  return path;
}

/* -------------------------------------------------------------------- physics */

type Body = {
  id: number;
  radius: number;
  delay: number;
  age: number;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  /* Spin about the tray's up axis — the letter turning on the spot, like a coin
     settling on a table. This is what makes a landed pile look scattered. */
  turn: number;
  turnVel: number;
  /* Tilt out of the floor plane while airborne; damped away on landing so every
     letter ends up lying flat and legible however wildly it tumbled in. */
  tiltX: number;
  tiltZ: number;
  tiltVelX: number;
  tiltVelZ: number;
  scale: number;
  asleep: boolean;
  exiting: boolean;
  /* Cleared the rim and left the tray. Nothing contains it any more and nothing
     catches it — it falls away and the page drops it from the value. */
  escaped: boolean;
  reported: boolean;
};

function makeBody(letter: Spawned, dropFrom: number, fontSize: number): Body {
  const radius = Math.max(letter.w, fontSize * 0.62) * 0.52;
  return {
    id: letter.id,
    radius,
    delay: letter.delay,
    age: 0,
    /* Born sitting on the near rim, then tipped inward — it falls off the edge of
       the field rather than materialising in mid-air above the middle of it. */
    /* Clear of the wall by a hair: born exactly on the boundary, the containment
       pass fires on frame one and throws the letter straight back out. */
    pos: new THREE.Vector3(
      letter.x,
      dropFrom,
      TRAY_D / 2 - WALL - radius - 0.04,
    ),
    vel: new THREE.Vector3(rand(0.55), 0, -(0.45 + Math.random() * 0.45)),
    turn: rand(0.25),
    turnVel: rand(7),
    tiltX: 0,
    tiltZ: 0,
    tiltVelX: rand(5),
    tiltVelZ: rand(5),
    scale: 1,
    asleep: false,
    exiting: false,
    escaped: false,
    reported: false,
  };
}

const Q_FLAT = new THREE.Quaternion().setFromEuler(
  new THREE.Euler(-Math.PI / 2, 0, 0),
);
const scratchEuler = new THREE.Euler();

/* ----------------------------------------------------------------------- pile */

type PileProps = {
  letters: Spawned[];
  frontLimit: number;
  dropFrom: number;
  gravity: number;
  bounce: number;
  friction: number;
  fontSize: number;
  letterDepth: number;
  bevel: number;
  wellDepth: number;
  shake: React.RefObject<THREE.Vector3>;
  shakeGain: number;
  onEscape: (id: number) => void;
  theme: Theme;
  shadowMap: THREE.Texture | null;
};

function Pile({
  letters,
  frontLimit,
  dropFrom,
  gravity,
  bounce,
  friction,
  fontSize,
  letterDepth,
  bevel,
  wellDepth,
  shake,
  shakeGain,
  onEscape,
  theme,
  shadowMap,
}: PileProps) {
  const bodies = useRef(new Map<number, Body>());
  const glyphs = useRef(new Map<number, THREE.Group>());
  const blobs = useRef(new Map<number, THREE.Mesh>());

  useEffect(() => {
    const map = bodies.current;
    const live = new Set<number>();

    for (const letter of letters) {
      live.add(letter.id);
      let body = map.get(letter.id);
      if (!body) {
        body = makeBody(letter, dropFrom, fontSize);
        map.set(letter.id, body);
      }
      if (letter.exiting && !body.exiting) {
        body.exiting = true;
        body.asleep = false;
        body.vel.set(rand(0.4), 3.4, 0.6 + Math.random() * 0.5);
        body.turnVel = rand(10);
        body.tiltVelX = rand(7);
        body.tiltVelZ = rand(7);
      }
    }

    for (const id of [...map.keys()]) {
      if (!live.has(id)) map.delete(id);
    }
    /* Re-running on a slider drag is free: bodies already in the map keep the
       spawn values they were born with. */
  }, [letters, dropFrom, fontSize]);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 1 / 30); // a dropped frame must not tunnel a letter through the floor
    const active = [...bodies.current.values()];

    /* Containment is the stadium outline: clamp to the centre segment, then hold
       the letter within one inner radius of it. A box clamp would let letters sit
       outside the rounded ends. */
    const innerR = TRAY_D / 2 - WALL;
    const straight = Math.max(0, TRAY_W / 2 - WALL - innerR);

    const jolted = (shake.current?.lengthSq() ?? 0) > 4;

    for (const body of active) {
      body.age += dt;
      if (jolted) body.asleep = false;
      if (body.age < body.delay || body.asleep) continue;

      /* The tray is an accelerating frame of reference, so everything inside it
         feels a force the other way — that is the whole of the shake. */
      const jolt = shake.current;
      if (jolt && !body.escaped) {
        body.vel.addScaledVector(jolt, -dt * shakeGain);
        body.turnVel += -jolt.x * dt * shakeGain * 0.35;
      }

      body.vel.y += gravity * dt;
      body.pos.addScaledVector(body.vel, dt);
      body.turn += body.turnVel * dt;
      body.tiltX += body.tiltVelX * dt;
      body.tiltZ += body.tiltVelZ * dt;

      if (body.exiting) {
        body.scale = THREE.MathUtils.damp(body.scale, 0, 8, dt);
        continue; // no floor, no walls — it is on its way out of the tray
      }

      if (body.escaped) continue; // no floor out there

      if (body.pos.y <= REST_Y) {
        body.pos.y = REST_Y;
        const impact = Math.abs(body.vel.y);
        body.vel.y = impact > 0.7 ? impact * bounce : 0;
        /* Grounded: the floor takes the slide and the spin, and the letter flattens
           out of whatever tumble it came in on. */
        /* A tray shaken hard makes its contents chatter off the floor. Without
           this a letter can only leave by happening to slam a wall, which makes
           emptying the field a matter of luck. */
        const rattle = jolt ? jolt.length() : 0;
        if (rattle > 25) body.vel.y += Math.min(rattle * 0.022, 2.4);

        body.vel.x = THREE.MathUtils.damp(body.vel.x, 0, friction, dt);
        body.vel.z = THREE.MathUtils.damp(body.vel.z, 0, friction, dt);
        /* Spin dies faster than slide — a coin dropped on a table stops turning
           well before it stops travelling. At plain floor friction a landed letter
           keeps creeping round for a couple of seconds, which reads as a glitch. */
        body.turnVel = THREE.MathUtils.damp(
          body.turnVel,
          0,
          friction * 2.6,
          dt,
        );
        body.tiltVelX = 0;
        body.tiltVelZ = 0;
        body.tiltX = THREE.MathUtils.damp(body.tiltX, 0, 9, dt);
        body.tiltZ = THREE.MathUtils.damp(body.tiltZ, 0, 9, dt);
      }
    }

    /* Shove overlapping letters apart, but leave a slop band alone. Without it a
       crowded tray never converges: the pushes fight each other, every one of them
       wakes both letters, and the whole pile hums forever. */
    for (let i = 0; i < active.length; i++) {
      const a = active[i];
      if (a.exiting || a.age < a.delay) continue;
      for (let j = i + 1; j < active.length; j++) {
        const b = active[j];
        if (b.exiting || b.age < b.delay) continue;
        if (Math.abs(a.pos.y - b.pos.y) > SAME_LAYER) continue;

        const dx = b.pos.x - a.pos.x;
        const dz = b.pos.z - a.pos.z;
        const gap = a.radius + b.radius;
        const distSq = dx * dx + dz * dz;
        if (distSq >= gap * gap) continue;

        const dist = Math.sqrt(distSq) || 1e-4;
        const overlap = gap - dist;
        if (overlap <= SLOP) continue;

        const nx = dx / dist;
        const nz = dz / dist;
        const push = (overlap - SLOP) * 0.4;

        a.pos.x -= nx * push;
        a.pos.z -= nz * push;
        b.pos.x += nx * push;
        b.pos.z += nz * push;

        /* Only a letter actually arriving disturbs the pile. Two that are merely
           resting against each other get separated in place and stay asleep. */
        const closing = (b.vel.x - a.vel.x) * nx + (b.vel.z - a.vel.z) * nz;
        if (closing < -0.08) {
          const kick = closing * 0.45;
          a.vel.x += nx * kick;
          a.vel.z += nz * kick;
          b.vel.x -= nx * kick;
          b.vel.z -= nz * kick;
          a.turnVel += rand(1.5);
          b.turnVel += rand(1.5);
          a.asleep = false;
          b.asleep = false;
        }
      }
    }

    /* Containment runs after separation and over every letter, asleep or not — one
       shoved out of the tray by its neighbours still has to come back. */
    for (const body of active) {
      if (body.exiting || body.escaped || body.age < body.delay) continue;

      const reachLimit = innerR - body.radius;
      const spineX = THREE.MathUtils.clamp(body.pos.x, -straight, straight);
      const offX = body.pos.x - spineX;
      const offZ = body.pos.z;
      const offDist = Math.hypot(offX, offZ);

      /* High up the wall, the letter can spill over it, so stop containing it
         before it reaches the rim — otherwise every hard hit bounces it back
         inside and nothing can ever be shaken out. Past the wall line up there,
         it is gone. */
      if (body.pos.y >= wellDepth * 0.5) {
        if (offDist > innerR) body.escaped = true;
        continue;
      }

      if (offDist > reachLimit) {
        const nx = offX / (offDist || 1);
        const nz = offZ / (offDist || 1);
        body.pos.x = spineX + nx * reachLimit;
        body.pos.z = nz * reachLimit;
        /* Reflect only what is heading for the wall. Bouncing a letter that is
           already travelling inward fires it straight back out again. */
        const outward = body.vel.x * nx + body.vel.z * nz;
        if (outward > 0) {
          /* A gentle touch bounces off. A hard one barely rebounds at all — it
             converts into climb, which is how a shaken letter gets over the rim
             instead of pinballing around the floor forever. */
          const hard = outward > 0.3;
          const restitution = hard ? 0.12 : 0.45;
          body.vel.x -= nx * outward * (1 + restitution);
          body.vel.z -= nz * outward * (1 + restitution);
          body.turnVel += rand(hard ? 5 : 2);
          if (hard) {
            /* Clearing the rim of a well this deep takes about 5 units of lift,
               so the conversion has to be generous — at a 1:1 swap a shaken
               letter only ever hops a fraction of the way up the wall. */
            body.vel.y += Math.min(outward * 3.6, 13);
          }
        }
      }

      /* The near wall's barrier sits at the edge of what the camera can see into
         rather than at the wall itself — a letter resting in the hidden strip is
         a letter you typed and can't find. */
      if (body.pos.z > frontLimit) {
        body.pos.z = frontLimit;
        if (body.vel.z > 0) body.vel.z *= -0.45;
      }
    }

    for (const body of active) {
      if (body.exiting || body.asleep || body.age < body.delay) continue;
      const still =
        body.pos.y <= REST_Y + 1e-4 &&
        Math.abs(body.vel.x) < 0.006 &&
        Math.abs(body.vel.z) < 0.006 &&
        Math.abs(body.turnVel) < 0.02 &&
        Math.abs(body.tiltX) < 0.004 &&
        Math.abs(body.tiltZ) < 0.004;
      if (!still) continue;
      body.vel.set(0, 0, 0);
      body.turnVel = 0;
      body.tiltX = 0;
      body.tiltZ = 0;
      body.asleep = true;
    }

    for (const body of active) {
      if (body.escaped && !body.reported && body.pos.y < -2.5) {
        body.reported = true;
        onEscape(body.id);
      }

      const glyph = glyphs.current.get(body.id);
      const blob = blobs.current.get(body.id);
      const visible = body.age >= body.delay;

      if (glyph) {
        glyph.visible = visible;
        if (visible) {
          glyph.position.copy(body.pos);
          scratchEuler.set(body.tiltX, body.turn, body.tiltZ, "XYZ");
          glyph.quaternion.setFromEuler(scratchEuler).multiply(Q_FLAT);
          glyph.scale.setScalar(body.scale);
        }
      }

      if (blob) {
        blob.visible = visible && !body.exiting && !body.escaped;
        if (blob.visible) {
          blob.position.set(body.pos.x, 0.004, body.pos.z);
          const height = Math.max(0, body.pos.y - REST_Y);
          /* Tight enough at rest to hide under the glyph — on a light floor a blob
             any wider reads as a smudge around the letter rather than a shadow. */
          blob.scale.setScalar((0.5 + height * 0.6) * body.scale);
          (blob.material as THREE.MeshBasicMaterial).opacity =
            (theme.contact * body.scale) / (1 + height * 1.6);
        }
      }
    }
  });

  return (
    <group>
      {letters.map((letter) =>
        letter.char === " " ? null : (
          <mesh
            key={`shadow-${letter.id}`}
            ref={(node) => {
              if (node) blobs.current.set(letter.id, node);
              else blobs.current.delete(letter.id);
            }}
            rotation-x={-Math.PI / 2}
            renderOrder={-1}
          >
            <planeGeometry args={[fontSize * 1.4, fontSize * 1.4]} />
            <meshBasicMaterial
              map={shadowMap ?? undefined}
              transparent
              depthWrite={false}
              opacity={theme.contact}
            />
          </mesh>
        ),
      )}
      {letters.map((letter) =>
        letter.char === " " ? null : (
          <group
            key={letter.id}
            ref={(node) => {
              if (node) glyphs.current.set(letter.id, node);
              else glyphs.current.delete(letter.id);
            }}
          >
            <Glyph3D
              char={letter.char}
              fontSize={fontSize}
              depth={letterDepth}
              bevel={bevel}
              color={theme.ink}
            />
          </group>
        ),
      )}
    </group>
  );
}

/* ----------------------------------------------------------------------- tray */

function Tray({ depth, theme }: { depth: number; theme: Theme }) {
  const rim = useMemo(() => {
    const shape = stadium(new THREE.Shape(), TRAY_W, TRAY_D);
    shape.holes.push(
      stadium(new THREE.Path(), TRAY_W - WALL * 2, TRAY_D - WALL * 2),
    );
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: false,
      curveSegments: 64,
    });
    /* Built flat in XY and extruded along Z, then stood up: the extrusion becomes
       the well's depth and the outline lies in the floor plane. */
    geometry.rotateX(-Math.PI / 2);
    return geometry;
  }, [depth]);

  const floor = useMemo(() => {
    const geometry = new THREE.ShapeGeometry(
      stadium(new THREE.Shape(), TRAY_W - WALL * 2, TRAY_D - WALL * 2),
      64,
    );
    geometry.rotateX(-Math.PI / 2);
    return geometry;
  }, []);

  useEffect(() => () => rim.dispose(), [rim]);
  useEffect(() => () => floor.dispose(), [floor]);

  return (
    <group>
      <mesh geometry={floor}>
        <meshStandardMaterial
          color={theme.floor}
          roughness={0.95}
          metalness={0}
        />
      </mesh>
      {/* ExtrudeGeometry splits into two groups: 0 is the cap faces — after the
          rotation, the hairline top and bottom of the ring — and 1 is everything
          swept between them. */}
      <mesh geometry={rim}>
        <meshStandardMaterial
          attach="material-0"
          color={theme.rim}
          roughness={0.5}
          metalness={0.1}
        />
        <meshStandardMaterial
          attach="material-1"
          color={theme.body}
          roughness={0.9}
          metalness={0}
        />
      </mesh>
    </group>
  );
}

/* ---------------------------------------------------------------------- scene */

type SceneProps = {
  letters: Spawned[];
  focused: boolean;
  empty: boolean;
  wellDepth: number;
  dropFrom: number;
  drag: React.RefObject<{ x: number; y: number }>;
  shakeGain: number;
  onEscape: (id: number) => void;
  tiltPitch: number;
  tiltYaw: number;
  gravity: number;
  bounce: number;
  friction: number;
  fontSize: number;
  letterDepth: number;
  bevel: number;
  theme: Theme;
};

function Scene({
  letters,
  focused,
  empty,
  wellDepth,
  dropFrom,
  drag,
  shakeGain,
  onEscape,
  tiltPitch,
  tiltYaw,
  gravity,
  bounce,
  friction,
  fontSize,
  letterDepth,
  bevel,
  theme,
}: SceneProps) {
  const shell = useRef<THREE.Group>(null);
  const yaw = useRef<THREE.Group>(null);
  const pitch = useRef<THREE.Group>(null);
  const shadowMap = useMemo(() => makeBlobTexture(), []);

  /* The tray's own motion, differentiated twice, then rotated into the frame the
     letters live in. Held across frames so we can take the difference. */
  const shellVel = useRef(new THREE.Vector2());
  const shake = useRef(new THREE.Vector3());
  const invQuat = useRef(new THREE.Quaternion());

  /* A deep well hides a strip of its own floor behind the near wall, so the tilt
     refuses to go shallower than the well can afford — otherwise letters that
     settle toward the front get eaten from the bottom up. */
  const reach = fontSize * 0.55;
  const innerEdge = TRAY_D / 2 - WALL;
  const minPitch = Math.atan(wellDepth / (innerEdge - reach));
  const openPitch = Math.min(Math.max(tiltPitch, minPitch), FLAT_PITCH);
  const frontLimit = innerEdge - wellDepth / Math.tan(openPitch) - reach * 0.6;

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 1 / 30);

    const group = shell.current;
    if (group && pitch.current) {
      const beforeX = group.position.x;
      const beforeY = group.position.y;
      /* Springy rather than instant: the lag is what turns a drag into a shake. */
      group.position.x = THREE.MathUtils.damp(
        group.position.x,
        drag.current.x,
        13,
        dt,
      );
      group.position.y = THREE.MathUtils.damp(
        group.position.y,
        drag.current.y,
        13,
        dt,
      );

      const vx = (group.position.x - beforeX) / dt;
      const vy = (group.position.y - beforeY) / dt;
      shake.current.set(
        (vx - shellVel.current.x) / dt,
        (vy - shellVel.current.y) / dt,
        0,
      );
      shellVel.current.set(vx, vy);

      const MAX_SHAKE = 140;
      if (shake.current.lengthSq() > MAX_SHAKE * MAX_SHAKE) {
        shake.current.setLength(MAX_SHAKE);
      }
      pitch.current.getWorldQuaternion(invQuat.current);
      shake.current.applyQuaternion(invQuat.current.invert());
    }

    if (pitch.current) {
      pitch.current.rotation.x = THREE.MathUtils.damp(
        pitch.current.rotation.x,
        focused ? openPitch : FLAT_PITCH,
        5.5,
        dt,
      );
    }
    if (yaw.current) {
      yaw.current.rotation.y = THREE.MathUtils.damp(
        yaw.current.rotation.y,
        focused ? tiltYaw : 0,
        5.5,
        dt,
      );
    }
  });

  return (
    <>
      <ambientLight intensity={theme.ambient} />
      <directionalLight position={[3, 9, 6]} intensity={theme.key} />
      <directionalLight position={[-5, 3, 9]} intensity={theme.fill} />

      <group ref={shell}>
        <group ref={yaw}>
          <group ref={pitch} rotation-x={FLAT_PITCH}>
            <Tray depth={wellDepth} theme={theme} />

            <Suspense fallback={null}>
              <Pile
                letters={letters}
                frontLimit={frontLimit}
                dropFrom={Math.max(dropFrom, wellDepth + 0.8)}
                gravity={gravity}
                bounce={bounce}
                friction={friction}
                fontSize={fontSize}
                letterDepth={letterDepth}
                bevel={bevel}
                wellDepth={wellDepth}
                shake={shake}
                shakeGain={shakeGain}
                onEscape={onEscape}
                theme={theme}
                shadowMap={shadowMap}
              />
            </Suspense>

            {/* Only while the field is shut. Tilted open, a centred placeholder runs
              into the near rim and past the rounded end — and it would sit in the
              middle of where the letters are about to land. */}
            {empty && !focused && (
              <Text
                font={FONT_URL}
                fontSize={fontSize}
                anchorX="center"
                anchorY="middle"
                color={theme.ghost}
                position={[CONTENT_LEFT + CONTENT_W / 2, REST_Y, 0]}
                rotation-x={-Math.PI / 2}
              >
                {PLACEHOLDER}
              </Text>
            )}
          </group>
        </group>
      </group>
    </>
  );
}

/* ----------------------------------------------------------------------- page */

export default function DeepInputPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [focused, setFocused] = useState(false);

  const nextId = useRef(0);

  /* Where the field has been dragged to, in world units. A ref, not state: the
     scene reads it every frame and a re-render per pointermove would be waste. */
  const drag = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);
  const grabOrigin = useRef({ x: 0, y: 0 });
  const [grabbed, setGrabbed] = useState(false);

  const {
    mode,
    wellDepth,
    dropFrom,
    tiltPitch,
    tiltYaw,
    gravity,
    bounce,
    friction,
    fontSize,
    letterDepth,
    bevel,
    shakeGain,
  } = useControls({
    mode: { value: "light", options: ["light", "dark"], label: "Theme" },
    /* Deepening the well forces a steeper look into it — the scene raises the tilt
       to match, so this can go as deep as you like without losing the letters. */
    wellDepth: {
      value: 3,
      min: 0.15,
      max: 3,
      step: 0.01,
      label: "Well depth",
    },
    dropFrom: { value: 3, min: 0.4, max: 7, step: 0.05, label: "Drop from" },
    tiltPitch: {
      value: 1.29,
      min: 0.5,
      max: Math.PI / 2,
      step: 0.01,
      label: "Tilt floor (rad)",
    },
    tiltYaw: { value: -0.26, min: -1, max: 1, step: 0.01, label: "Yaw (rad)" },
    gravity: { value: -14, min: -40, max: -2, step: 0.5, label: "Gravity" },
    bounce: { value: 0.34, min: 0, max: 0.7, step: 0.01, label: "Bounce" },
    friction: {
      value: 3.7,
      min: 0.4,
      max: 12,
      step: 0.1,
      label: "Floor friction",
    },
    fontSize: {
      value: 0.62,
      min: 0.2,
      max: 1.1,
      step: 0.01,
      label: "Font size",
    },
    letterDepth: {
      value: 0.11,
      min: 0.01,
      max: 0.4,
      step: 0.005,
      label: "Letter depth",
    },
    /* Bevel has to stay well under the thinnest stem in the face or the glyph
       eats itself where two edges meet. */
    bevel: {
      value: 0.012,
      min: 0,
      max: 0.045,
      step: 0.001,
      label: "Letter bevel",
    },
    shakeGain: {
      value: 1.95,
      min: 0,
      max: 3,
      step: 0.05,
      label: "Shake force",
    },
  });

  const theme = THEMES[mode as "light" | "dark"];
  const { measure, ready } = useAdvanceWidths(fontSize);

  /* Letters are dropped in at a typewriter cursor rather than all from one spot,
     so a long string spreads across the tray before physics takes over. The row
     wraps back to the left instead of piling up against the right wall. */
  const spawned = useMemo(() => {
    const innerLeft = CONTENT_LEFT;
    const innerW = CONTENT_W;
    const out: Spawned[] = [];
    let cursor = 0;
    for (const letter of letters) {
      const w = measure(letter.char);
      if (cursor + w > innerW) cursor = 0;
      out.push({ ...letter, w, x: innerLeft + cursor + w / 2 });
      cursor += w;
    }
    return out;
    // `ready` is a dependency because widths change the moment the face loads
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [letters, measure, ready]);

  /* The field's value IS the pile — derived, never stored alongside it. A letter
     shaken out of the tray therefore leaves the value with no syncing at all. */
  const value = useMemo(
    () =>
      letters
        .filter((l) => !l.exiting)
        .map((l) => l.char)
        .join(""),
    [letters],
  );

  const handleEscape = useCallback((id: number) => {
    setLetters((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const exit = useCallback((ids: number[]) => {
    if (!ids.length) return;
    const doomed = new Set(ids);
    setLetters((prev) =>
      prev.map((l) => (doomed.has(l.id) ? { ...l, exiting: true } : l)),
    );
    window.setTimeout(
      () => setLetters((prev) => prev.filter((l) => !doomed.has(l.id))),
      EXIT_MS,
    );
  }, []);

  const spawn = useCallback(
    (chars: string) =>
      chars.split("").map((char, i) => ({
        id: nextId.current++,
        char,
        delay: i * STAGGER,
        exiting: false,
      })),
    [],
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value.slice(0, MAX_CHARS);

    const live = letters.filter((l) => !l.exiting);
    const current = live.map((l) => l.char).join("");
    if (next === current) return;

    if (next.startsWith(current)) {
      const fresh = spawn(next.slice(current.length));
      setLetters((prev) => [...prev, ...fresh]);
      return;
    }

    if (current.startsWith(next)) {
      exit(live.slice(next.length).map((l) => l.id));
      return;
    }

    // Wholesale replacement (select-all and type, autofill): evict everything, refill.
    const doomed = new Set(live.map((l) => l.id));
    const fresh = spawn(next);
    setLetters((prev) => [
      ...prev.map((l) => (doomed.has(l.id) ? { ...l, exiting: true } : l)),
      ...fresh,
    ]);
    window.setTimeout(
      () => setLetters((prev) => prev.filter((l) => !doomed.has(l.id))),
      EXIT_MS,
    );
  };

  const startGrab = (event: React.PointerEvent<HTMLInputElement>) => {
    dragging.current = true;
    grabOrigin.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
    setGrabbed(true);
  };

  const moveGrab = (event: React.PointerEvent<HTMLInputElement>) => {
    if (!dragging.current) return;
    const dx = (event.clientX - grabOrigin.current.x) / PX_PER_UNIT;
    const dy = -(event.clientY - grabOrigin.current.y) / PX_PER_UNIT;
    drag.current.x = THREE.MathUtils.clamp(dx, -3.4, 3.4);
    drag.current.y = THREE.MathUtils.clamp(dy, -2, 2);
  };

  const endGrab = (event: React.PointerEvent<HTMLInputElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    drag.current.x = 0;
    drag.current.y = 0;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    setGrabbed(false);
  };

  /* There is no caret to move — a letter is wherever it rolled to — so anything
     that implies editing mid-string would be writing a cheque the pile can't cash. */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
      ].includes(event.key)
    ) {
      event.preventDefault();
    }
    if (event.key === "Escape") inputRef.current?.blur();
  };

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center gap-10 px-6"
      style={{ backgroundColor: theme.page }}
    >
      <Leva hidden />

      <div className="relative aspect-[16/9] w-full max-w-[980px]">
        <Canvas
          flat
          orthographic
          camera={{ position: [0, 0, 20], zoom: PX_PER_UNIT }}
          dpr={[1, 2]}
        >
          <Scene
            letters={spawned}
            focused={focused}
            empty={letters.length === 0}
            wellDepth={wellDepth}
            dropFrom={dropFrom}
            drag={drag}
            shakeGain={shakeGain}
            onEscape={handleEscape}
            tiltPitch={tiltPitch}
            tiltYaw={tiltYaw}
            gravity={gravity}
            bounce={bounce}
            friction={friction}
            fontSize={fontSize}
            letterDepth={letterDepth}
            bevel={bevel}
            theme={theme}
          />
        </Canvas>

        {/* Exactly the pill's flat footprint, in the same pixels the camera
            renders it at — the control is 56px tall and the hit area matches. */}
        <input
          ref={inputRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPointerDown={startGrab}
          onPointerMove={moveGrab}
          onPointerUp={endGrab}
          onPointerCancel={endGrab}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-label="Deep input"
          autoComplete="off"
          spellCheck={false}
          style={{ width: TRAY_W * PX_PER_UNIT, height: FIELD_H }}
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-transparent text-transparent caret-transparent outline-none selection:bg-transparent selection:text-transparent ${
            grabbed ? "cursor-grabbing" : "cursor-grab"
          }`}
        />
      </div>
    </main>
  );
}
