import React from "react";
import { motion } from "motion/react";
import { C, draw } from "./shared";
import { camera, pawn, turn, type IPawnSize, type Vec3 } from "./iso";

/**
 * KOL in the Hairline look: the network laid flat on the desk. Players stand
 * as pawns, links run along the ground, and pings travel out from the KOL,
 * the larger pawn, slipping under the pawns they pass. A follower's ground
 * ripples as a ping reaches it. The KOL holds the one bright edge, and the
 * pings, its signal, share it.
 *
 * Layout, routes and timing are the flat version's: its canvas positions are
 * laid onto the ground, and distances are still measured there, so the pings
 * keep their pace.
 */

type Point = readonly [number, number];

/** The flat version's positions, on its 240-wide canvas. */
const NODES = {
  kol: [120, 140],
  a: [60, 84],
  b: [178, 72],
  c: [200, 158],
  d: [150, 226],
  e: [62, 196],
  f: [118, 50],
} as const satisfies Record<string, Point>;

type NodeId = keyof typeof NODES;
const IDS = Object.keys(NODES) as NodeId[];

const ROUTES: { path: NodeId[]; at: number }[] = [
  { path: ["kol", "a", "f"], at: 0 },
  { path: ["kol", "c", "d"], at: 0.55 },
  { path: ["kol", "b"], at: 1.6 },
  { path: ["kol", "e", "d"], at: 2.25 },
];

const CYCLE = 3.6;
/** Canvas units per second, as in the flat version. */
const SPEED = 230;
const ENTER = 0.8;

const KOL: IPawnSize = { r: 6, base: 8, head: 5.2 };
const FOLLOWER: IPawnSize = { r: 4.2, base: 6, head: 3.8 };

/** Canvas to ground: centred on the KOL, scaled, and turned so it lies square to the screen. */
const SCALE = 0.8;
const DESK = -45;
const ground = ([x, y]: Point): [number, number] =>
  turn((x - NODES.kol[0]) * SCALE, (y - NODES.kol[1]) * SCALE, 0, 0, DESK);

const CAM = camera(
  1.7,
  IDS.flatMap((id): Vec3[] => {
    const size = id === "kol" ? KOL : FOLLOWER;
    return [
      [...ground(NODES[id]), 0],
      [...ground(NODES[id]), size.base + size.head * 2],
    ];
  }),
  120,
  140,
);

const at = (id: NodeId) => CAM.P(...ground(NODES[id]), 0);

/** Each link once, oriented the way its route first travels it. */
const EDGES = ROUTES.flatMap(({ path }) => path.slice(1).map((to, i) => [path[i], to] as const)).filter(
  ([from, to], i, all) => all.findIndex(([f, t]) => (f === from && t === to) || (f === to && t === from)) === i,
);

function timeline(path: NodeId[]) {
  const arrivals = [0];
  for (let i = 1; i < path.length; i++) {
    const [x0, y0] = NODES[path[i - 1]];
    const [x1, y1] = NODES[path[i]];
    arrivals.push(arrivals[i - 1] + Math.hypot(x1 - x0, y1 - y0) / SPEED);
  }
  return { arrivals, duration: arrivals[arrivals.length - 1] };
}

function loop(duration: number, delay: number) {
  return { duration, delay: ENTER + delay, repeat: Infinity, repeatDelay: CYCLE - duration };
}

function Ping({ path, at: launch }: { path: NodeId[]; at: number }) {
  const { arrivals, duration } = timeline(path);
  const points = path.map(at);
  const motionLoop = { ...loop(duration, launch), times: arrivals.map((t) => t / duration), ease: "easeInOut" as const };

  return (
    <motion.circle
      cx={0}
      cy={0}
      r={2.4}
      fill={C.ink}
      initial={{ x: points[0][0], y: points[0][1] }}
      animate={{ x: points.map(([x]) => x), y: points.map(([, y]) => y) }}
      transition={{ x: motionLoop, y: motionLoop }}
    />
  );
}

/** Bursts out fast, then drifts to a stop. */
const BURST = [0.16, 1, 0.3, 1] as const;

/** A ring rippling out across the ground round a follower's foot: an ellipse, as the ground is seen at 2:1. */
function Pulse({ node, at: when }: { node: NodeId; at: number }) {
  const [cx, cy] = at(node);
  const rx = (FOLLOWER.r + 2) * CAM.S;
  const duration = 0.9;

  return (
    <motion.ellipse
      cx={cx}
      cy={cy}
      rx={rx}
      ry={rx / 2}
      fill="none"
      stroke={C.muted}
      // Opacity starts its keyframes at 0: the first keyframe shows during the
      // delay, and a ring waiting at 0.8 would sit round every foot.
      initial={{ opacity: 0, scale: 1 }}
      animate={{ opacity: [0, 0.8, 0], scale: [1, 1.8] }}
      transition={{
        scale: { ...loop(duration, when), ease: BURST },
        opacity: { ...loop(duration, when), times: [0, 0.02, 1], ease: ["linear", "easeIn"] },
      }}
    />
  );
}

function Pawn({ id, delay }: { id: NodeId; delay: number }) {
  const isKol = id === "kol";
  const { base, head } = pawn(CAM, ...ground(NODES[id]), 0, isKol ? KOL : FOLLOWER);
  const edge = isKol ? C.ink : C.muted;
  return (
    <motion.g
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        y: { type: "spring", visualDuration: 0.4, bounce: 0.35, delay },
        opacity: { duration: 0.12, delay },
      }}
    >
      <path d={base.sil} fill={C.plate} stroke={edge} strokeLinejoin="round" />
      <circle {...head} fill={C.plate} stroke={edge} />
    </motion.g>
  );
}

/** Back to front, so nearer pawns cover farther ones: ground x + y ascending. */
const DEPTH = IDS.slice().sort((p, q) => {
  const [px, py] = ground(NODES[p]), [qx, qy] = ground(NODES[q]);
  return px + py - (qx + qy);
});

export function KolHairline() {
  return (
    <g strokeWidth={1}>
      {EDGES.map(([from, to], i) => {
        const [x1, y1] = at(from);
        const [x2, y2] = at(to);
        return (
          <motion.line
            key={`${from}-${to}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={C.line}
            {...draw(0.15 + i * 0.04, 0.5)}
          />
        );
      })}

      {ROUTES.flatMap(({ path, at: launch }) => {
        const { arrivals } = timeline(path);
        // Followers ripple as pings reach them; the KOL itself stays still.
        return path.slice(1).map((node, i) => <Pulse key={`${launch}-${node}`} node={node} at={launch + arrivals[i + 1]} />);
      })}

      {ROUTES.map((route) => (
        <Ping key={route.at} {...route} />
      ))}

      {/* The KOL lands first, then its followers. */}
      {DEPTH.map((id) => (
        <Pawn key={id} id={id} delay={id === "kol" ? 0 : 0.15 + IDS.indexOf(id) * 0.05} />
      ))}
    </g>
  );
}
