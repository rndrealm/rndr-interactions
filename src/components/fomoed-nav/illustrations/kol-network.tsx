import React from "react";
import { motion } from "motion/react";
import { Avatar, C, draw, pop } from "./shared";

type Point = readonly [number, number];

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

const KOL_R = 18;
const NODE_R = 11;

/**
 * Every ping leaves the KOL and hops along its route. `at` is its launch time
 * within the shared loop — deliberately uneven, so the loop doesn't tick like
 * a metronome.
 */
const ROUTES: { path: NodeId[]; at: number }[] = [
  { path: ["kol", "a", "f"], at: 0 },
  { path: ["kol", "c", "d"], at: 0.55 },
  { path: ["kol", "b"], at: 1.6 },
  { path: ["kol", "e", "d"], at: 2.25 },
];

const CYCLE = 3.6;
/** Units per second. */
const SPEED = 230;
/** Pings start once the entrance has settled. */
const ENTER = 0.8;

/** Each edge once, oriented the way its route first travels it. */
const EDGES = ROUTES.flatMap(({ path }) =>
  path.slice(1).map((to, i) => [path[i], to] as const),
).filter(
  ([from, to], i, all) =>
    all.findIndex(
      ([f, t]) => (f === from && t === to) || (f === to && t === from),
    ) === i,
);

function timeline(path: NodeId[]) {
  const points = path.map((id) => NODES[id]);
  const arrivals = [0];
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    arrivals.push(arrivals[i - 1] + Math.hypot(x1 - x0, y1 - y0) / SPEED);
  }
  const duration = arrivals[arrivals.length - 1];
  return { points, arrivals, duration };
}

function loop(duration: number, delay: number) {
  return {
    duration,
    delay: ENTER + delay,
    repeat: Infinity,
    repeatDelay: CYCLE - duration,
  };
}

interface IPing {
  path: NodeId[];
  at: number;
}

/** A dot travelling node to node. It sits under the avatars, so it slips in and out of them. */
function Ping({ path, at }: IPing) {
  const { points, arrivals, duration } = timeline(path);
  const times = arrivals.map((t) => t / duration);
  const motionLoop = {
    ...loop(duration, at),
    times,
    ease: "easeInOut" as const,
  };

  return (
    <motion.circle
      cx={0}
      cy={0}
      r={3}
      fill={C.accent}
      initial={{ x: points[0][0], y: points[0][1] }}
      animate={{ x: points.map(([x]) => x), y: points.map(([, y]) => y) }}
      transition={{ x: motionLoop, y: motionLoop }}
    />
  );
}

interface IPulse {
  node: NodeId;
  at: number;
}

/** Bursts out fast, then drifts to a stop. */
const BURST = [0.16, 1, 0.3, 1] as const;

/**
 * A ring that ripples off a node when a ping reaches it. The ring bursts out
 * and decelerates while its fade trails behind, so it lingers as it slows
 * instead of dying at a constant rate.
 */
function Pulse({ node, at }: IPulse) {
  const [cx, cy] = NODES[node];
  const duration = 0.9;

  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={NODE_R}
      fill="none"
      stroke={C.accent}
      initial={{ opacity: 0, scale: 1 }}
      animate={{ opacity: [0.7, 0], scale: [1, 1.55] }}
      transition={{
        scale: { ...loop(duration, at), ease: BURST },
        opacity: { ...loop(duration, at), ease: "easeIn" },
      }}
    />
  );
}

export function KolNetwork() {
  return (
    <>
      {EDGES.map(([from, to], i) => {
        const [x1, y1] = NODES[from];
        const [x2, y2] = NODES[to];
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

      {ROUTES.map((route) => (
        <Ping key={route.at} {...route} />
      ))}

      {(Object.keys(NODES) as NodeId[]).map((id, i) => {
        const [cx, cy] = NODES[id];
        const isKol = id === "kol";
        return (
          <motion.g key={id} {...pop(isKol ? 0 : 0.1 + i * 0.05)}>
            <Avatar cx={cx} cy={cy} r={isKol ? KOL_R : NODE_R} ring={isKol} />
          </motion.g>
        );
      })}

      {ROUTES.flatMap(({ path, at }) => {
        const { arrivals } = timeline(path);
        // Followers ripple as pings reach them; the KOL itself stays still.
        return path
          .slice(1)
          .map((node, i) => (
            <Pulse
              key={`${at}-${node}`}
              node={node}
              at={at + arrivals[i + 1]}
            />
          ));
      })}
    </>
  );
}
