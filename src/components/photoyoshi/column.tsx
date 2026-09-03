import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import gsap from "gsap";
import {
  BOX_VW,
  BOXES_PER_COLUMN,
  COLUMNS,
  MARGIN_VW,
  SURVIVOR_BOX_VW,
  SURVIVOR_MARGIN_VW,
} from "./infinite-row";
import { Mode } from "@/app/photoyoshi/page";

type ColumnData = (typeof COLUMNS)[number];

function gridCardSize(aspect: number) {
  return aspect < 1
    ? { width: `${aspect * 100}%`, height: "100%" }
    : { width: "100%", height: `${(1 / aspect) * 100}%` };
}

interface IProps {
  data: ColumnData;
  mode: Mode;
  initialLeft: number;
}

export const Column = forwardRef<HTMLDivElement, IProps>((props, ref) => {
  const { data, mode, initialLeft } = props;
  const boxRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

  useEffect(() => {
    const boxes = boxRefs.current;
    const cards = cardRefs.current;
    const container = containerRef.current;
    if (boxes.some((b) => !b) || cards.some((c) => !c) || !container) return;

    const tl = gsap.timeline();

    if (mode === "full") {
      tl.to(
        [boxes[0], boxes[4]],
        {
          height: 0,
          y: (i: number) => (i === 0 ? "-10vh" : "10vh"),
          duration: 0.4,
          ease: "power2.out",
        },
        0,
      ).to(
        [boxes[1], boxes[3]],
        {
          height: 0,
          y: (i: number) => (i === 0 ? "-10vh" : "10vh"),
          duration: 0.5,
          ease: "power2.out",
        },
        0.1,
      );

      if (data.isSurvivor) {
        tl.to(
          container,
          { width: `${SURVIVOR_BOX_VW}vw`, duration: 2, ease: "power3.out" },
          0,
        )
          .to(
            container,
            {
              height: "100vh",
              margin: `0 ${SURVIVOR_MARGIN_VW}vw`,
              paddingTop: 0,
              paddingBottom: 0,
              duration: 2,
              ease: "power3.inOut",
            },
            0,
          )
          .to(
            boxes[2],
            { width: `${SURVIVOR_BOX_VW}vw`, duration: 2, ease: "power3.out" },
            0,
          )
          .to(
            boxes[2],
            { height: "100vh", duration: 2, ease: "power3.inOut" },
            0,
          )
          .to(
            cards[2],
            {
              width: "100%",
              height: "100%",
              duration: 2,
              ease: "power3.inOut",
            },
            0,
          );
      } else {
        tl.to(
          container,
          { width: 0, margin: 0, duration: 0.6, ease: "power4.out" },
          0,
        ).to(boxes[2], { width: 0, duration: 0.6, ease: "power4.out" }, 0);
      }
    }

    if (mode === "grid") {
      tl.to(
        container,
        {
          width: `${BOX_VW}vw`,
          height: "calc(100vh - 4vw)",
          margin: `0 ${MARGIN_VW}vw`,
          paddingTop: "1.5rem",
          paddingBottom: "1.5rem",
          duration: 1.2,
          ease: "power4.out",
        },
        0,
      )
        .to(
          [boxes[0], boxes[1], boxes[3], boxes[4]],
          {
            width: `${BOX_VW}vw`,
            height: `${BOX_VW}vw`,
            y: 0,
            duration: 1.2,
            ease: "power4.out",
            delay: 0.4,
          },
          0,
        )
        .to(
          [boxes[2]],
          {
            width: `${BOX_VW}vw`,
            height: `${BOX_VW}vw`,
            y: 0,
            duration: 1.2,
            ease: "power4.out",
            delay: data?.isSurvivor ? 0 : 0.4,
          },
          0,
        )
        // function-based values: each card has its own aspect, so each has its
        // own target rather than one shared tween
        .to(
          cards,
          {
            width: (i: number) => gridCardSize(data.aspects[i]).width,
            height: (i: number) => gridCardSize(data.aspects[i]).height,
            duration: 1.2,
            ease: "power4.out",
          },
          0,
        );
    }

    return () => {
      tl.kill();
    };
  }, [mode, data.isSurvivor, data.aspects]);

  return (
    <div
      ref={containerRef}
      className="absolute top-0 flex flex-col items-center justify-between"
      style={{
        left: `${initialLeft}vw`,
        width: `${BOX_VW}vw`,
        height: "calc(100vh - 4vw)",
        margin: `0 ${MARGIN_VW}vw`,
        paddingTop: "1.5rem",
        paddingBottom: "1.5rem",
        // willChange: "transform",
      }}
    >
      {Array(BOXES_PER_COLUMN)
        .fill(0)
        .map((_, i) => {
          const aspect = data.aspects[i];
          // const { url, title } = getCardImage(data, i);
          // only the survivor's middle card ever reaches full width; every
          // other card stays at BOX_VW or collapses, so asking for a 49vw
          // source for all 180 of them would be wasted bandwidth
          // const isHero = data.isSurvivor && i === 2;
          return (
            <div
              key={i}
              ref={(el) => {
                boxRefs.current[i] = el;
              }}
              // the hook InfiniteRow queries when it builds the flat box list
              data-box={i}
              className="relative flex items-center justify-center"
              style={{
                width: `${BOX_VW}vw`,
                height: `${BOX_VW}vw`,
                zIndex: data?.isSurvivor ? 3 : 0,
              }}
            >
              <div
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                // `fill` positions the image absolutely, so the card has to be
                // a positioned ancestor for it to resolve against
                className="relative overflow-hidden"
                style={{ ...gridCardSize(aspect), background: "#ff0000" }}
              >
                {/* <Image
                  src={url}
                  alt={title}
                  fill
                  sizes={`${isHero ? Math.ceil(SURVIVOR_BOX_VW) : Math.ceil(BOX_VW)}vw`}
                  className="object-cover"
                /> */}
              </div>
            </div>
          );
        })}
    </div>
  );
});

Column.displayName = "Column";
