import React from "react";
import { MenuContentItem } from "./menu-content-item";
import { IMenuData } from "./menu-content";

interface IProps {
  data: IMenuData[];
  title: string;
}

export function MenuGroup(props: IProps) {
  const { data, title } = props;
  return (
    <div className="pt-3 pb-3.5 pl-3 pr-2 flex flex-col border-r border-[#1A1A1A]">
      <div className="w-63.75 flex flex-col">
        <div className="p-2">
          <p className="text-[#6C6C6C] text-[11px] leading-3 tracking-[-0.56%] font-medium font-diatype">
            {title}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          {data?.map((item) => (
            <MenuContentItem
              key={item.id}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
