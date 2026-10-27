"use client";

import { useEffect, useRef } from "react";
import type p5Type from "p5";
import { M_PATHS, M_SVG_W, M_SVG_H } from "./m-paths";

export default function MindmapSketch() {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let instance: p5Type | null = null;

    (async () => {
      const p5 = (await import("p5")).default;

      const sketch = (p: p5Type) => {
        const W = 420;
        const H = 340;
        const CX = 210;
        const CY = 175;
        const S = 420 / 700;

        interface Orbit {
          cx: number;
          cy: number;
          rx: number;
          ry: number;
          rotation: number;
        }

        interface ScribblePass {
          points: { x: number; y: number }[];
          weight: number;
        }

        const orbits: Orbit[] = [];
        const nodes: { x: number; y: number }[] = [];
        const nodeScribbles: {
          pts: { x: number; y: number }[];
          w: number;
        }[][] = [];
        const scribblePasses: ScribblePass[] = [];

        let frame = 0;
        const ORBIT_FRAMES = 140;
        const NODE_FRAMES = 35;
        const M_FRAMES = 180;
        const nodeStart = ORBIT_FRAMES;
        const mStart = nodeStart + NODE_FRAMES;

        p.setup = () => {
          p.createCanvas(W, H);
          p.noiseSeed(123);
          p.randomSeed(123);

          buildOrbits();
          buildNodes();
          buildM();

          p.frameRate(60);
        };

        function buildOrbits() {
          const configs = [
            { dx: 0, dy: 10, rx: 280, ry: 140, rot: -5 },
            { dx: 20, dy: -5, rx: 250, ry: 165, rot: 18 },
            { dx: -25, dy: 15, rx: 300, ry: 115, rot: -22 },
            { dx: 15, dy: -20, rx: 230, ry: 175, rot: 35 },
            { dx: -5, dy: 30, rx: 310, ry: 95, rot: -38 },
            { dx: -20, dy: -8, rx: 195, ry: 155, rot: 50 },
            { dx: 30, dy: 8, rx: 265, ry: 125, rot: -12 },
            { dx: -10, dy: -18, rx: 295, ry: 108, rot: 28 },
            { dx: 8, dy: 22, rx: 240, ry: 168, rot: -45 },
            { dx: -12, dy: 5, rx: 275, ry: 148, rot: 12 },
            { dx: 18, dy: -12, rx: 255, ry: 135, rot: -8 },
          ];
          for (const c of configs) {
            orbits.push({
              cx: CX + c.dx * S,
              cy: CY + c.dy * S,
              rx: c.rx * S,
              ry: c.ry * S,
              rotation: c.rot,
            });
          }
        }

        function pointOnOrbit(o: Orbit, t: number) {
          const a = t * p.TWO_PI;
          const cosR = p.cos(p.radians(o.rotation));
          const sinR = p.sin(p.radians(o.rotation));
          const ex = o.rx * p.cos(a);
          const ey = o.ry * p.sin(a);
          return {
            x: o.cx + ex * cosR - ey * sinR,
            y: o.cy + ex * sinR + ey * cosR,
          };
        }

        function buildNodes() {
          const specs = [
            { orbit: 0, t: 0.12 },
            { orbit: 1, t: 0.72 },
            { orbit: 2, t: 0.38 },
            { orbit: 5, t: 0.55 },
            { orbit: 7, t: 0.22 },
            { orbit: 8, t: 0.62 },
          ];
          for (const s of specs) {
            const pos = pointOnOrbit(orbits[s.orbit], s.t);
            nodes.push(pos);
            const passes: { pts: { x: number; y: number }[]; w: number }[] =
              [];
            for (let i = 0; i < 8; i++) {
              const nOff = p.random(10000);
              const gx = p.random(-2, 2);
              const gy = p.random(-2, 2);
              const pts: { x: number; y: number }[] = [];
              const r = p.random(5, 9);
              for (let j = 0; j <= 24; j++) {
                const a = (j / 24) * p.TWO_PI;
                pts.push({
                  x:
                    pos.x +
                    gx +
                    r * p.cos(a) +
                    (p.noise(nOff + j * 0.15) - 0.5) * 6,
                  y:
                    pos.y +
                    gy +
                    r * p.sin(a) +
                    (p.noise(nOff + 500 + j * 0.15) - 0.5) * 6,
                });
              }
              passes.push({ pts, w: p.random(0.5, 1.2) });
            }
            nodeScribbles.push(passes);
          }
        }

        function buildM() {
          const mTargetW = 220;
          const mTargetH = (M_SVG_H / M_SVG_W) * mTargetW;
          const scale = mTargetW / M_SVG_W;
          const ox = CX - mTargetW / 2;
          const oy = CY - mTargetH / 2;

          for (const subpath of M_PATHS) {
            const points = subpath.map(([sx, sy]) => ({
              x: ox + sx * scale,
              y: oy + sy * scale,
            }));
            scribblePasses.push({
              points,
              weight: 0.57,
            });
          }
        }

        function drawOrbit(o: Orbit, progress: number) {
          p.push();
          p.translate(o.cx, o.cy);
          p.rotate(p.radians(o.rotation));
          p.noFill();
          p.stroke(0);
          p.strokeWeight(0.6);

          const steps = Math.floor(progress * 200);
          if (steps < 3) {
            p.pop();
            return;
          }

          p.beginShape();
          for (let j = 0; j <= steps; j++) {
            const a = (j / 200) * p.TWO_PI;
            const x = o.rx * p.cos(a);
            const y = o.ry * p.sin(a);
            if (j === 0 || j === steps) p.splineVertex(x, y);
            p.splineVertex(x, y);
          }
          p.endShape();
          p.pop();
        }

        function drawNode(idx: number, alpha: number) {
          const passes = nodeScribbles[idx];
          const count = Math.floor(alpha * passes.length);
          p.noFill();
          p.strokeCap(p.ROUND);
          for (let i = 0; i < count; i++) {
            const { pts, w } = passes[i];
            p.stroke(255, 81, 37, alpha * 255);
            p.strokeWeight(w);
            p.beginShape();
            for (let j = 0; j < pts.length; j++) {
              if (j === 0 || j === pts.length - 1)
                p.splineVertex(pts[j].x, pts[j].y);
              p.splineVertex(pts[j].x, pts[j].y);
            }
            p.endShape();
          }
        }

        function drawScribble(pass: ScribblePass) {
          p.noFill();
          p.stroke(0, 82, 255);
          p.strokeWeight(pass.weight);
          p.beginShape();
          for (let i = 0; i < pass.points.length; i++) {
            const pt = pass.points[i];
            if (i === 0 || i === pass.points.length - 1)
              p.splineVertex(pt.x, pt.y);
            p.splineVertex(pt.x, pt.y);
          }
          p.endShape();
        }

        p.draw = () => {
          frame++;
          p.background(255);

          const orbitProg = p.constrain(frame / ORBIT_FRAMES, 0, 1);
          for (let i = 0; i < orbits.length; i++) {
            const tStart = i / orbits.length;
            const tLen = 1.3 / orbits.length;
            const t = p.constrain(
              p.map(orbitProg, tStart, tStart + tLen, 0, 1),
              0,
              1
            );
            if (t > 0) drawOrbit(orbits[i], t);
          }

          if (frame > nodeStart) {
            const nodeProg = p.constrain(
              (frame - nodeStart) / NODE_FRAMES,
              0,
              1
            );
            for (let i = 0; i < nodes.length; i++) {
              const t = i / nodes.length;
              const a = p.constrain(
                p.map(nodeProg, t, t + 0.15, 0, 1),
                0,
                1
              );
              if (a > 0) drawNode(i, a);
            }
          }

          if (frame > mStart) {
            const mProg = p.constrain((frame - mStart) / M_FRAMES, 0, 1);
            const count = Math.floor(mProg * scribblePasses.length);
            for (let i = 0; i < count; i++) {
              drawScribble(scribblePasses[i]);
            }
          }

          if (frame > mStart + M_FRAMES + 10) {
            p.noLoop();
          }
        };
      };

      if (canvasRef.current) {
        instance = new p5(sketch, canvasRef.current);
      }
    })();

    return () => {
      instance?.remove();
    };
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-neutral-100">
      <div
        className="bg-white overflow-hidden flex flex-col"
        style={{ width: 420, height: 600 }}
      >
        <div ref={canvasRef} />

        <div className="flex flex-col justify-between flex-1 px-8 pt-5 pb-7">
          <div>
            <h1
              className="font-diatype font-normal text-black"
              style={{
                fontSize: 48,
                lineHeight: 1,
                letterSpacing: "-1.5px",
              }}
            >
              Map the
              <br />
              Madness
            </h1>

            <p
              className="font-diatype font-normal text-black mt-4"
              style={{
                fontSize: 12,
                lineHeight: 1.4,
                letterSpacing: "-0.36px",
                maxWidth: 280,
              }}
            >
              A web of interconnected thoughts, organized to bridge complex
              ideas with seamless execution.
            </p>
          </div>

          <div className="flex items-center" style={{ gap: 1 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/mindmap-mm.svg"
              alt=""
              width={16}
              height={11}
              className="shrink-0"
            />
            <span
              className="font-diatype font-medium text-black"
              style={{
                fontSize: 14,
                letterSpacing: "-0.42px",
              }}
            >
              indmap
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
