"use client";

import { AnimateView } from "motion/react-animate-view";
import { motion } from "motion/react";
import {
  CSSProperties,
  ReactNode,
  startTransition,
  useEffect,
  useState,
} from "react";

export default function SkeletonShimmer({
  shimmerDuration = 1.5,
  loadDelay = 2500,
}: {
  shimmerDuration?: number;
  loadDelay?: number;
}) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded) {
      const timer = setTimeout(
        () => startTransition(() => setLoaded(true)),
        loadDelay,
      );
      return () => clearTimeout(timer);
    }
  }, [loaded, loadDelay]);

  return (
    <div style={containerStyle}>
      <style>{`
                :root {
                    --layer: #1a1a2e;
                    --white: #ffffff;
                    --border: rgba(255, 255, 255, 0.1);
                    --hue-3: #6c63ff;
                    --hue-4: #e040fb;
                }
                @property --wipe {
                    syntax: '<percentage>';
                    inherits: true;
                    initial-value: -100%;
                }
                ::view-transition-group(skeleton-card) {
                    border-radius: 16px;
                    overflow: hidden;
                }
                ::view-transition-image-pair(skeleton-card) {
                    mix-blend-mode: normal;
                }
                ::view-transition-old(skeleton-card) {
                    /* AnimateView update currently animates old layers */
                    /* so we need to set the z-index to 2 to ensure it appears above the new layer */
                    z-index: 2;
                    mask-image: linear-gradient(to right, black var(--wipe), transparent calc(var(--wipe) + 100%));
                }
            `}</style>
      <AnimateView name="skeleton-card" update={wipeTransition}>
        {loaded ? (
          <ProfileCard />
        ) : (
          <SkeletonCard shimmerDuration={shimmerDuration} />
        )}
      </AnimateView>
      <button
        style={reloadBtnStyle}
        onClick={() => startTransition(() => setLoaded(false))}
      >
        Reload
      </button>
    </div>
  );
}

/** ==============   Views   ================ */

function ProfileCard() {
  return (
    <div style={cardStyle}>
      <div style={coverStyle} />
      <div style={profileAreaStyle}>
        <div style={avatarWrapStyle}>
          <div style={avatarStyle}>
            <MotionLogo />
          </div>
        </div>
        <div style={infoGroupStyle}>
          <h3 style={nameStyle}>{PROFILE_NAME}</h3>
          <p style={handleStyle}>{PROFILE_HANDLE}</p>
        </div>
        <p style={bioStyle}>{PROFILE_BIO}</p>
        <div style={statsRowStyle}>
          {STATS.map((stat) => (
            <div key={stat.label} style={statItemStyle}>
              <span style={statValueStyle}>{stat.value}</span>
              <span style={statLabelStyle}>{stat.label}</span>
            </div>
          ))}
        </div>
        <button style={followBtnStyle}>Follow</button>
      </div>
    </div>
  );
}

function SkeletonCard({ shimmerDuration }: { shimmerDuration: number }) {
  return (
    <div style={cardStyle}>
      <Bone
        width="100%"
        height={COVER_HEIGHT}
        borderRadius={0}
        duration={shimmerDuration}
      />
      <div style={profileAreaStyle}>
        <div style={avatarWrapStyle}>
          <div style={avatarRingStyle}>
            <Bone
              width={AVATAR_SIZE - 6}
              height={AVATAR_SIZE - 6}
              borderRadius="50%"
              duration={shimmerDuration}
            />
          </div>
        </div>
        <Shimmer
          duration={shimmerDuration}
          borderRadius="6px"
          style={fitContentStyle}
        >
          <div style={infoGroupStyle}>
            <h3 style={nameStyle}>{PROFILE_NAME}</h3>
            <p style={handleStyle}>{PROFILE_HANDLE}</p>
          </div>
        </Shimmer>
        <Shimmer duration={shimmerDuration} borderRadius="6px">
          <p style={bioStyle}>{PROFILE_BIO}</p>
        </Shimmer>
        <div style={statsRowStyle}>
          {STATS.map((stat) => (
            <Shimmer
              key={stat.label}
              duration={shimmerDuration}
              borderRadius="8px"
              style={flexOneStyle}
            >
              <div style={statItemStyle}>
                <span style={statValueStyle}>{stat.value}</span>
                <span style={statLabelStyle}>{stat.label}</span>
              </div>
            </Shimmer>
          ))}
        </div>
        <Shimmer duration={shimmerDuration} borderRadius="10px">
          <div style={followSizerStyle}>Follow</div>
        </Shimmer>
      </div>
    </div>
  );
}

/** ==============   Components   ================ */

function MotionLogo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1260 454"
      fill="currentColor"
      style={{ width: "65%", height: "65%" }}
    >
      <path d="M475.753 0L226.8 453.6L0 453.6L194.392 99.4116C224.526 44.5081 299.724 0 362.353 0L475.753 0Z" />
      <path d="M1031.93 113.4C1031.93 50.7709 1082.7 0 1145.33 0C1207.96 0 1258.73 50.7709 1258.73 113.4C1258.73 176.029 1207.96 226.8 1145.33 226.8C1082.7 226.8 1031.93 176.029 1031.93 113.4Z" />
      <path d="M518.278 0L745.078 0L496.125 453.6L269.325 453.6L518.278 0Z" />
      <path d="M786.147 0L1012.95 0L818.555 354.188C788.422 409.092 713.223 453.6 650.594 453.6L537.194 453.6L786.147 0Z" />
    </svg>
  );
}

const Shimmer = ({
  duration,
  borderRadius = "6px",
  style,
  children,
}: {
  duration: number;
  borderRadius?: string;
  style?: CSSProperties;
  children: ReactNode;
}) => (
  <motion.div
    animate={shimmerAnimate}
    transition={{ duration, ease: "easeInOut", repeat: Infinity }}
    style={{
      borderRadius,
      background: SHIMMER_GRADIENT,
      backgroundSize: "200% 100%",
      overflow: "hidden",
      ...style,
    }}
  >
    <div style={shimmerSizerStyle}>{children}</div>
  </motion.div>
);

const shimmerSizerStyle: CSSProperties = { visibility: "hidden" };
const fitContentStyle: CSSProperties = { alignSelf: "flex-start" };
const flexOneStyle: CSSProperties = { flex: 1 };

const Bone = ({
  width,
  height,
  borderRadius = 6,
  duration,
}: {
  width: number | string;
  height: number;
  borderRadius?: number | string;
  duration: number;
}) => (
  <motion.div
    animate={shimmerAnimate}
    transition={{ duration, ease: "easeInOut", repeat: Infinity }}
    style={{
      width,
      height,
      borderRadius,
      background: SHIMMER_GRADIENT,
      backgroundSize: "200% 100%",
      flexShrink: 0,
    }}
  />
);

/** ==============   Animation   ================ */

const wipeTransition = {
  "--wipe": ["100%", "-100%"],
  transition: { duration: 0.6, ease: "easeInOut" as const },
};

/** ==============   Styles   ================ */

const COVER_HEIGHT = 120;
const AVATAR_SIZE = 56;
const AVATAR_OVERLAP = 28;

const BONE_BASE = "rgba(255, 255, 255, 0.08)";
const BONE_HIGHLIGHT = "rgba(255, 255, 255, 0.28)";
const SHIMMER_GRADIENT = `linear-gradient(90deg, ${BONE_BASE} 30%, ${BONE_HIGHLIGHT} 50%, ${BONE_BASE} 70%)`;
const shimmerAnimate = { backgroundPosition: ["-200% 0", "200% 0"] };

const containerStyle: CSSProperties = {
  width: "100%",
  minHeight: "100dvh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 16,
  padding: 20,
  boxSizing: "border-box",
  background: "#0e0e1a",
};

const cardStyle: CSSProperties = {
  width: "100%",
  maxWidth: 360,
  borderRadius: "16px",
  border: "1px solid var(--border)",
  backgroundColor: "var(--layer)",
  overflow: "hidden",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
};

const coverStyle: CSSProperties = {
  width: "100%",
  height: COVER_HEIGHT,
  background: "linear-gradient(135deg, var(--hue-4) 0%, var(--hue-3) 100%)",
};

const profileAreaStyle: CSSProperties = {
  padding: "0 20px 20px",
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

const avatarWrapStyle: CSSProperties = {
  marginTop: -AVATAR_OVERLAP,
};

const avatarRingStyle: CSSProperties = {
  width: AVATAR_SIZE,
  height: AVATAR_SIZE,
  borderRadius: "50%",
  backgroundColor: "var(--layer)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const avatarStyle: CSSProperties = {
  width: AVATAR_SIZE,
  height: AVATAR_SIZE,
  borderRadius: "50%",
  background: "#f5e725",
  border: "3px solid var(--layer)",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#000",
};

const infoGroupStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const nameStyle: CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 600,
  color: "var(--white)",
  lineHeight: 1.2,
};

const handleStyle: CSSProperties = {
  margin: 0,
  fontSize: 13,
  color: "rgba(255, 255, 255, 0.45)",
  lineHeight: 1.2,
};

const bioStyle: CSSProperties = {
  margin: 0,
  fontSize: 13,
  lineHeight: 1.5,
  color: "rgba(255, 255, 255, 0.55)",
};

const statsRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
};

const statItemStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "8px 4px",
  borderRadius: "8px",
  backgroundColor: "rgba(255, 255, 255, 0.04)",
  flex: 1,
  gap: 2,
};

const statValueStyle: CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  color: "var(--white)",
  lineHeight: 1.3,
};

const statLabelStyle: CSSProperties = {
  fontSize: 11,
  color: "rgba(255, 255, 255, 0.35)",
  lineHeight: 1.3,
};

const followBaseStyle: CSSProperties = {
  width: "100%",
  padding: "10px 0",
  fontSize: 14,
  fontWeight: 600,
  fontFamily: "inherit",
};

const followSizerStyle: CSSProperties = {
  ...followBaseStyle,
  textAlign: "center",
};

const followBtnStyle: CSSProperties = {
  ...followBaseStyle,
  borderRadius: "10px",
  border: "none",
  background: "var(--hue-4)",
  color: "var(--white)",
  cursor: "pointer",
};

const reloadBtnStyle: CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: "10px",
  background: "transparent",
  color: "var(--white)",
  padding: "8px 20px",
  fontSize: 13,
  fontWeight: 500,
  fontFamily: "inherit",
  cursor: "pointer",
};

/** ==============   Data   ================ */

const PROFILE_NAME = "Motion";
const PROFILE_HANDLE = "@motiondotdev";
const PROFILE_BIO =
  "Free and open source. Create stunning web animations for React, JavaScript and Vue.";

const STATS = [
  { value: "127", label: "Posts" },
  { value: "11K", label: "Followers" },
  { value: "5", label: "Following" },
];
