import React from "react";
import { TextMorph } from "torph/react";
import { CaretRight } from "../icons";

interface IProps {
  title?: string;
  description?: string;
}

const DEFAULT_DESCRIPTION = "Powerful, Agile trading";
const DEFAULT_TITLE = "Trading Terminal";

const MORPH = { scale: false, duration: 320 } as const;

export function MenuContentItem(props: IProps) {
  const { description = DEFAULT_DESCRIPTION, title = DEFAULT_TITLE } = props;

  return (
    <div
      // type="button"
      className="p-2 flex items-center justify-between rounded-[8px] text-left cursor-pointer hover:bg-[#131313]"
    >
      <div className="flex items-center gap-2 flex-1">
        <div className="w-8 h-8 rounded-[6px] bg-[#26262680]"></div>
        <div className="flex flex-col gap-1 flex-1">
          <div className="h-4 relative">
            <p className="text-[#EEEEEE] text-[13px] leading-4 tracking-[-0.56%] font-diatype flex-1 absolute top-0 left-0">
              <TextMorph {...MORPH}>{title}</TextMorph>
            </p>
          </div>

          <p className="text-[#6C6C6C] text-[11px] leading-3 tracking-[-0.56%] font-diatype flex-1">
            <TextMorph {...MORPH}>{description}</TextMorph>
          </p>
        </div>
      </div>
      <div className="w-2.5 h-2.5 flex items-center justify-center">
        <CaretRight />
      </div>
    </div>
  );
}
