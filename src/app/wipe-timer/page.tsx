"use client"

import { AnimateView } from "motion/react-animate-view"
import {
    CSSProperties,
    startTransition,
    useEffect,
    useRef,
    useState,
} from "react"

const TICK_MS = 5000
const START_VALUE = 20
const DIGIT_NAMES = ["td0", "td1", "td2", "td3"] as const

export default function WipeTimer() {
    const [count, setCount] = useState(START_VALUE)
    const [running, setRunning] = useState(true)
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const expired = count === 0

    useEffect(() => {
        if (running && !expired) {
            intervalRef.current = setInterval(() => {
                startTransition(() => setCount((c) => Math.max(0, c - 1)))
            }, TICK_MS)
            return () => clearInterval(intervalRef.current!)
        }
    }, [running, expired])

    const reset = () => {
        startTransition(() => {
            setCount(START_VALUE)
            setRunning(true)
        })
    }

    const togglePause = () => setRunning((r) => !r)

    const minutes = String(Math.floor(count / 12)).padStart(2, "0")
    const ticks = String(count % 12).padStart(2, "0")
    const digits = [minutes[0], minutes[1], ticks[0], ticks[1]]

    return (
        <div style={containerStyle}>
            <style>{`
                @property --wipe {
                    syntax: '<percentage>';
                    inherits: true;
                    initial-value: 100%;
                }
                ${DIGIT_NAMES.map(
                    (name) => `
                    ::view-transition-group(${name}) { overflow: hidden; }
                    ::view-transition-image-pair(${name}) { mix-blend-mode: normal; }
                    ::view-transition-old(${name}) {
                        z-index: 2;
                        mask-image: linear-gradient(
                            to bottom,
                            black var(--wipe),
                            transparent calc(var(--wipe) + 60%)
                        );
                    }
                `
                ).join("")}
            `}</style>

            <p style={labelStyle}>
                {running && count > 0
                    ? "COUNTING DOWN"
                    : count === 0
                      ? "DONE"
                      : "PAUSED"}
            </p>

            <div style={displayStyle}>
                <WipeDigit name="td0" value={digits[0]} />
                <WipeDigit name="td1" value={digits[1]} />
                <span style={colonStyle}>:</span>
                <WipeDigit name="td2" value={digits[2]} />
                <WipeDigit name="td3" value={digits[3]} />
            </div>

            <div style={buttonRow}>
                <button style={btnStyle} onClick={togglePause}>
                    {running ? "Pause" : "Resume"}
                </button>
                <button style={btnStyle} onClick={reset}>
                    Reset
                </button>
            </div>
        </div>
    )
}

function WipeDigit({ name, value }: { name: string; value: string }) {
    return (
        <AnimateView name={name} update={wipeTransition}>
            <span key={value} style={digitStyle}>
                {value}
            </span>
        </AnimateView>
    )
}

const wipeTransition = {
    "--wipe": ["100%", "-100%"],
    transition: { duration: 1.5, ease: "easeInOut" as const },
}

const containerStyle: CSSProperties = {
    width: "100%",
    minHeight: "100dvh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    padding: 20,
    boxSizing: "border-box",
    background: "#111",
}

const labelStyle: CSSProperties = {
    margin: 0,
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: "0.15em",
    color: "rgba(255, 255, 255, 0.4)",
}

const displayStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: "16px 28px",
    borderRadius: 20,
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
}

const digitStyle: CSSProperties = {
    fontSize: 96,
    fontWeight: 700,
    fontVariantNumeric: "tabular-nums",
    color: "#ffffff",
    lineHeight: 1,
    width: 64,
    textAlign: "center",
    display: "inline-block",
}

const colonStyle: CSSProperties = {
    fontSize: 80,
    fontWeight: 300,
    color: "rgba(255, 255, 255, 0.25)",
    lineHeight: 1,
    marginBottom: 8,
}

const buttonRow: CSSProperties = {
    display: "flex",
    gap: 12,
}

const btnStyle: CSSProperties = {
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: 12,
    background: "transparent",
    color: "#ffffff",
    padding: "10px 28px",
    fontSize: 14,
    fontWeight: 500,
    fontFamily: "inherit",
    cursor: "pointer",
}
