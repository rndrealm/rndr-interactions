import { yondaAssets } from "@/lib/assests/yonda";
import Image, { StaticImageData } from "next/image";
import React from "react";

const data = [
  {
    id: 1,
    image: yondaAssets.ecosystem1,
    title: "Flights",
    description:
      "Yonda takes trip planning and preparations and weighs it against.",
  },
  {
    id: 2,
    image: yondaAssets.ecosystem2,
    title: "Stays",
    description:
      "Yonda takes trip planning and preparations and weighs it against.",
  },
  {
    id: 3,
    image: yondaAssets.ecosystem3,
    title: "Experiences",
    description:
      "Yonda takes trip planning and preparations and weighs it against.",
  },
  {
    id: 4,
    image: yondaAssets.ecosystem4,
    title: "Dining",
    description:
      "Yonda takes trip planning and preparations and weighs it against.",
  },
  {
    id: 5,
    image: yondaAssets.ecosystem1,
    title: "Wellness",
    description:
      "Yonda takes trip planning and preparations and weighs it against.",
  },
];

interface IEcosystemItem {
  title: string;
  description: string;
  img: StaticImageData;
}

function EcosystemItem(props: IEcosystemItem) {
  const { description, img, title } = props;

  return (
    <div className="flex flex-col gap-6.5 w-75.75 shrink-0">
      <div className="aspect-303/381 w-full overflow-hidden rounded-[20px]">
        <Image src={img} alt={title} />
      </div>
      <div className="flex flex-col gap-4">
        <p className="text-[#1E1E1E] text-[15px] leading-6 font-medium">
          {title}
        </p>

        <p className="text-[#646464] text-[15px] leading-6">{description}</p>
      </div>
    </div>
  );
}

export function Ecosystem() {
  return (
    <div className="flex flex-col mt-26 gap-12">
      <div className="app_landing_con">
        <div className="max-w-79.75 w-full">
          <h3 className="text-[#646464] text-[28px] leading-9 tracking-[-0.28px] font-medium">
            An Ecosystem built around You.
          </h3>
        </div>
      </div>
      <div className="w-full overflow-x-auto no-scrollbar px-[max(0px,calc((100%-1280px)/2))] flex gap-4 flex-nowrap">
        {data?.map((item) => {
          return (
            <EcosystemItem
              key={item.id}
              description={item.description}
              img={item.image}
              title={item.title}
            />
          );
        })}
      </div>
    </div>
  );
}
