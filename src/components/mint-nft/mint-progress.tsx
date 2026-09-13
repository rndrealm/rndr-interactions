"use client";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { animate, useMotionValue, type MotionValue } from "motion/react";

export type MintStatus = "idle" | "loading" | "success";

/** One pass of the shader band, in seconds. uProgress gains 1 per sweep. */
const SWEEP_DURATION = 0.9 * 2;
/** Beat between sweeps. uProgress rests on a whole number, where the band is invisible. */
const SWEEP_PAUSE = 0.26;
/** Sweeps per mint — one per layer: identity, interface, code. The shader
 *  reveals 1/SWEEPS of the texture per sweep, so this is the only place the
 *  count is set. */
export const SWEEPS = 3;
/** How long the success label holds before the button returns to idle. */
const SUCCESS_HOLD = 2400;

/**
 * 0 → 1 → hold → 2 → hold → 3, as keyframes. A repeated value is a pause: the
 * segment between the two identical keyframes holds uProgress on the integer.
 */
function buildSequence() {
  const values = [0];
  const stops = [0];
  let at = 0;

  for (let sweep = 0; sweep < SWEEPS; sweep++) {
    if (sweep > 0) {
      at += SWEEP_PAUSE;
      values.push(sweep);
      stops.push(at);
    }
    at += SWEEP_DURATION;
    values.push(sweep + 1);
    stops.push(at);
  }

  return {
    values,
    duration: at,
    times: stops.map((stop) => stop / at),
    // Ease each sweep, hold each pause flat.
    ease: values
      .slice(1)
      .map((value, index) =>
        value === values[index] ? ("linear" as const) : ("easeInOut" as const),
      ),
  };
}

type MintProgressValue = {
  /** Whole sweeps completed, 0–3. Read per frame, never rendered. */
  progress: MotionValue<number>;
  status: MintStatus;
  mint: () => void;
};

const MintProgressContext = createContext<MintProgressValue | null>(null);

export function MintProgressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const progress = useMotionValue(0);
  const [status, setStatus] = useState<MintStatus>("idle");
  const running = useRef<ReturnType<typeof animate> | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      running.current?.stop();
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const mint = useCallback(() => {
    if (status !== "idle") return;

    setStatus("loading");
    progress.set(0);

    const { values, duration, times, ease } = buildSequence();
    running.current = animate(progress, values, {
      duration,
      times,
      ease,
      onComplete: () => {
        setStatus("success");
        // resetTimer.current = setTimeout(() => {
        //   setStatus("idle");
        //   progress.set(0);
        // }, SUCCESS_HOLD);
      },
    });
  }, [progress, status]);

  const value = useMemo(
    () => ({ progress, status, mint }),
    [progress, status, mint],
  );

  return (
    <MintProgressContext.Provider value={value}>
      {children}
    </MintProgressContext.Provider>
  );
}

export function useMintProgress() {
  const value = useContext(MintProgressContext);
  if (!value) {
    throw new Error(
      "useMintProgress must be used inside <MintProgressProvider>",
    );
  }
  return value;
}
