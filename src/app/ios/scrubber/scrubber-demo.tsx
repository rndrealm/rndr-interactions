"use client";
import React, { useRef, useState } from "react";
import { useMotionPreference } from "../use-motion-preference";
import type { IDemo } from "../demo";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import {
  Point,
  // rubberBandInverse, // STRETCH (disabled)
  springFromResponse,
  clamp,
  // rubberBand, // STRETCH (disabled)
} from "../physics";
import { useDrag } from "../use-drag";
import { ToggleRow } from "../toggle-row";
import { SQUIRCLE } from "../squircle";
import { animate, motion, useMotionValue, useTransform } from "motion/react";

// STRETCH (disabled): pushing past either end used to stretch the bar with the
// rubber band, then spring it back. Turned off for now as it may not ship.
// Every line involved is marked "STRETCH (disabled)"; uncomment them all to
// bring it back. `stretch` itself stays, pinned at 0, so the bar's size
// transforms below don't need to change.
const STRETCH_LIMIT = 12;
const PRESS = springFromResponse(0.3, 0.8);
// const SNAP_BACK = springFromResponse(0.35, 0.75); // STRETCH (disabled)

// Light frosted pills over the video, like iOS's light material
const PILL =
  "flex h-8 items-center rounded-full bg-[oklch(0.993_0_0)]/70 text-[oklch(0.375_0_0)] backdrop-blur-md";
const CONTROL = `${PILL} size-8 cursor-pointer justify-center outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.708_0_0)]`;

const ZONES = [
  { from: 0, rate: 1, short: "1×", label: "Hi-speed scrubbing" },
  { from: 50, rate: 0.5, short: "½×", label: "Half-speed scrubbing" },
  { from: 100, rate: 0.25, short: "¼×", label: "Quarter-speed scrubbing" },
  { from: 150, rate: 0.125, short: "⅛×", label: "Fine scrubbing" },
];

const zoneFor = (distance: number) => {
  let zone = 0;
  ZONES.forEach((z, i) => {
    if (distance >= z.from) zone = i;
  });
  return zone;
};

// Tenths of a second, so you can see how precise each zone is
const formatTime = (t: number) => {
  const tenths = Math.round(t * 10);
  const minutes = Math.floor(tenths / 600);
  const seconds = ((tenths % 600) / 10).toFixed(1).padStart(4, "0");
  return `${minutes}:${seconds}`;
};

const TIME = `${PILL} col-start-1 row-start-1 px-3 font-geist text-xs tabular-nums tracking-[-0.08px] pointer-events-none`;

export function ScrubberDemo(props: IDemo) {
  const { embedded = false } = props;
  // Reduced motion: springs settle without overshooting; dragging is unchanged
  const { spring } = useMotionPreference();

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [fine, setFine] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const startPointRef = useRef<Point>({ x: 0, y: 0 });
  // trackY is the bar's centre line in client coords, for measuring zones
  const geometryRef = useRef({ trackY: 0, secondsPerPx: 0 });
  const lastDeltaXRef = useRef(0);
  // const overflowRef = useRef(0); // STRETCH (disabled)

  const isScrubbingRef = useRef(false);
  const wasPlayingRef = useRef(false);

  const videoTimestampRef = useMotionValue(0);
  const pressed = useMotionValue(0);

  const stretch = useMotionValue(0);

  const barHeight = useTransform([pressed, stretch], ([p, s]: number[]) => {
    const thinning = 1 - 0 * (Math.abs(s) / STRETCH_LIMIT);
    return (6 + 8 * p) * thinning;
  });

  const barWidth = useTransform(
    stretch,
    (s) => `calc(100% + ${Math.abs(s)}px)`,
  );

  // const barX = useTransform(stretch, (s) => Math.min(0, s));

  // While held, the buttons fade out and the times fade in, in the same spots
  const timesOpacity = useTransform(pressed, [0, 1], [0, 1]);
  const buttonsOpacity = useTransform(pressed, [0, 1], [1, 0]);
  const videoDuration = useMotionValue(0);
  const elapsedLabel = useTransform(videoTimestampRef, formatTime);
  const durationLabel = useTransform(videoDuration, formatTime);
  // Set per move, so a motion value rather than state
  const zone = useMotionValue(0);
  const zoneLabel = useTransform(zone, (z) => `${ZONES[z].rate}×`);

  const progress = useTransform(
    videoTimestampRef,
    (t) => `${(t / (videoRef.current?.duration || 1)) * 100}%`,
  );

  const drag = useDrag({
    onStart: (start) => {
      startPointRef.current = start;
      const track = trackRef.current!;
      const rect = track.getBoundingClientRect();
      // NaN until the video's metadata loads; scrub nothing until then
      const duration = videoRef.current!.duration || 0;
      geometryRef.current = {
        trackY: rect.top + rect.height / 2,
        secondsPerPx: duration / track.clientWidth,
      };

      lastDeltaXRef.current = 0;
      zone.set(0);

      // STRETCH (disabled): grabbing mid-bounce picked up the current stretch
      // stretch.stop();
      // overflowRef.current =
      //   Math.sign(stretch.get()) *
      //   rubberBandInverse(Math.abs(stretch.get()), STRETCH_LIMIT);

      const video = videoRef.current!;
      // In case loadedmetadata fired before React attached its listener
      videoDuration.set(video.duration || 0);
      isScrubbingRef.current = true;
      wasPlayingRef.current = !video.paused;
      video.pause();

      animate(pressed, 1, spring(PRESS));
    },
    onMove: (delta) => {
      const { trackY, secondsPerPx: basePerPx } = geometryRef.current;
      if (!basePerPx) return;

      // Distance from the bar itself, not from where the finger went down
      const y = startPointRef.current.y + delta.y;
      const current = fine ? zoneFor(Math.abs(y - trackY)) : 0;
      zone.set(current);
      const dx = delta.x - lastDeltaXRef.current;
      lastDeltaXRef.current = delta.x;
      const secondsPerPx = basePerPx * ZONES[current].rate;
      // STRETCH (disabled): make this `let` again when re-enabling, since
      // the overflow below reassigns it
      const move = dx;

      // STRETCH (disabled): moving back undid the stretch before scrubbing
      // if (overflowRef.current !== 0) {
      //   const next = overflowRef.current + move;
      //   if (Math.sign(next) === Math.sign(overflowRef.current)) {
      //     overflowRef.current = next;
      //     move = 0;
      //   } else {
      //     overflowRef.current = 0;
      //     move = next;
      //   }
      // }

      if (move !== 0) {
        const next = videoTimestampRef.get() + move * secondsPerPx;
        const clamped = clamp(next, 0, videoRef.current!.duration);
        // STRETCH (disabled): whatever didn't fit became overflow, in px of
        // finger movement
        // if (next !== clamped)
        //   overflowRef.current = (next - clamped) / secondsPerPx;
        videoTimestampRef.set(clamped);
        videoRef.current!.currentTime = clamped;
      }

      // STRETCH (disabled)
      // stretch.set(
      //   Math.sign(overflowRef.current) *
      //     rubberBand(Math.abs(overflowRef.current), STRETCH_LIMIT),
      // );
    },
    onEnd: () => {
      // STRETCH (disabled)
      // overflowRef.current = 0;
      // animate(stretch, 0, spring(SNAP_BACK));
      animate(pressed, 0, spring(PRESS));

      isScrubbingRef.current = false;
      if (wasPlayingRef.current) videoRef.current!.play();
    },
  });

  return (
    <div className="w-full flex items-center justify-center px-4 py-8">
      <div className="flex flex-col gap-6 max-w-100 w-full">
        {!embedded && (
          <p className="font-geist text-sm leading-5 tracking-[-0.08px] text-[oklch(0.375_0_0)]">
            Drag the bar to scrub, then move your finger away from it: every
            50px scrubs slower, from full speed to half, quarter and an eighth,
            like the iOS video player. The playhead adds your movement instead
            of jumping under your finger, so changing speed never skips.
          </p>
        )}
        <div
          ref={containerRef}
          className={`relative overflow-hidden rounded-xl supports-[corner-shape:squircle]:rounded-[20px] ${SQUIRCLE} max-w-100 w-full bg-[oklch(0.94_0_0)]`}
        >
          <video
            ref={videoRef}
            className="w-full"
            playsInline
            // Driven by the video's own events, so ending or any other pause
            // keeps the icons in sync
            onPlay={() => setPlaying(true)}
            // The scrub's own pause shouldn't flip the icon to play
            onPause={() => {
              if (!isScrubbingRef.current) setPlaying(false);
            }}
            onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
            onLoadedMetadata={(e) =>
              videoDuration.set(e.currentTarget.duration)
            }
            // While playing, keep the bar following the video
            onTimeUpdate={(e) =>
              videoTimestampRef.set(e.currentTarget.currentTime)
            }
          >
            <source src="/media/videos/world_cup.mp4" type="video/mp4" />
          </video>
          <motion.span
            style={{ opacity: timesOpacity }}
            className={`${PILL} pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 w-16 justify-center font-geist text-xs tabular-nums tracking-[-0.08px]`}
          >
            {zoneLabel}
          </motion.span>
          <div className="absolute bottom-4 left-4 right-4 flex flex-col">
            {/* Each side stacks a button and a time in one grid cell */}
            <div className="flex justify-between items-center">
              <div className="grid justify-items-start">
                <motion.button
                  type="button"
                  aria-label={playing ? "Pause" : "Play"}
                  onClick={() => {
                    const video = videoRef.current!;
                    if (video.paused) video.play();
                    else video.pause();
                  }}
                  style={{ opacity: buttonsOpacity }}
                  className={`col-start-1 row-start-1 ${CONTROL}`}
                >
                  {playing ? (
                    <Pause size={14} fill="currentColor" aria-hidden />
                  ) : (
                    <Play size={14} fill="currentColor" aria-hidden />
                  )}
                </motion.button>
                <motion.span style={{ opacity: timesOpacity }} className={TIME}>
                  {elapsedLabel}
                </motion.span>
              </div>
              <div className="grid justify-items-end">
                <motion.button
                  type="button"
                  aria-label={muted ? "Unmute" : "Mute"}
                  onClick={() => {
                    const video = videoRef.current!;
                    video.muted = !video.muted;
                  }}
                  style={{ opacity: buttonsOpacity }}
                  className={`col-start-1 row-start-1 ${CONTROL}`}
                >
                  {muted ? (
                    <VolumeX size={14} aria-hidden />
                  ) : (
                    <Volume2 size={14} aria-hidden />
                  )}
                </motion.button>
                <motion.span style={{ opacity: timesOpacity }} className={TIME}>
                  {durationLabel}
                </motion.span>
              </div>
            </div>
            <div
              ref={trackRef}
              {...drag}
              className="h-7.5 flex items-center cursor-grab touch-none select-none active:cursor-grabbing"
            >
              <motion.div
                style={{ height: barHeight, width: barWidth }}
                className="shrink-0 overflow-hidden rounded-full bg-[oklch(0.993_0_0)]/40 backdrop-blur-md"
              >
                <motion.div
                  style={{ width: progress }}
                  className="h-full bg-[oklch(0.993_0_0)]"
                ></motion.div>
              </motion.div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col rounded-xl bg-[oklch(0.982_0_0)] px-3 py-1.5">
            <ToggleRow
              label="Fine scrubbing"
              checked={fine}
              onChange={setFine}
            />
          </div>
          <pre className="no-scrollbar overflow-x-auto rounded-xl bg-[oklch(0.982_0_0)] px-4 py-3 font-mono text-xs leading-relaxed text-[rgb(3_47_98)] w-full">
            {
              "rate = 1, ½, ¼, ⅛ at 0, 50, 100, 150px from the bar\ntime += Δx · (duration / barWidth) · rate"
            }
          </pre>
        </div>
      </div>
    </div>
  );
}
