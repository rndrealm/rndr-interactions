import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { DomApi, PlaneInfo } from "@/app/parallax/page";
import { cn } from "@/lib/utils";

const IMAGE_ULRS = [
  "https://cdn.cosmos.so/d30a3e35-6a3c-4a23-b823-effe0e80fbf9?format=webp",
  "https://cdn.cosmos.so/f33d7d1d-997d-4c49-93b4-d1d20c610f0e?format=webp",
  "https://cdn.cosmos.so/06dc9e29-0169-4aa8-93c4-6358e699697a?format=webp&w=2048",
  // "https://cdn.cosmos.so/db19e8e8-a51a-487f-9c7a-cf7d6037f1ae?format=webp",
  "https://cdn.cosmos.so/b5cf435b-1c1a-4abb-965a-42f707474f16?format=webp",
  // "https://cdn.cosmos.so/49118378-5024-4b0b-bf66-31625d00a409?format=webp",
  // "https://cdn.cosmos.so/d266936b-22ab-4781-8612-63f6b9bd2cd7?format=webp",
];

interface IProps {
  isVisible: boolean;
}

export const ParallaxDom = forwardRef<DomApi, IProps>((props, ref) => {
  const { isVisible } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const planesInfoRef = useRef<PlaneInfo[]>([]);

  const [selected, setSelected] = useState(-1);

  console.log(selected);

  const collectBoxInfo = useCallback(() => {
    if (!containerRef.current) return;
    containerRef.current
      .querySelectorAll<HTMLElement>("[data-box]")
      .forEach((element, index) => {
        const rect = element.getBoundingClientRect();
        planesInfoRef.current[index] = {
          element,
          index,
          rect: {
            width: rect.width,
            height: rect.height,
            left: rect.left,
            top: rect.top + window.scrollY,
          },
        };
      });
  }, []);

  useImperativeHandle(ref, () => {
    return {
      planesInfo: planesInfoRef.current,
    };
  });

  useEffect(() => {
    const observer = new ResizeObserver(collectBoxInfo);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [collectBoxInfo]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col items-center gap-10 py-[20vh] will-change-transform px-4",
        !isVisible && "opacity-0",
      )}
    >
      {Array(9)
        .fill(0)
        .map((_, index) => {
          return (
            <div
              key={index}
              className="max-w-200 w-full h-[60vh] relative overflow-hidden will-change-transform"
              data-box={index}
              onClick={() => {
                setSelected((prev) => {
                  if (prev === index) return -1;
                  return index;
                });
              }}
            >
              {/* <Image
                src={IMAGE_ULRS[index % IMAGE_ULRS.length]}
                alt="parallax"
                fill
                className="absolute left-0 right-0 h-[150%]! top-[-25%]! object-cover"
                draggable={false}
              /> */}
            </div>
          );
        })}
    </div>
  );
});

ParallaxDom.displayName = "ParallaxDom";
