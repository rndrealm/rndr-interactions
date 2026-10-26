import React from "react";

interface IStatsItem {
  value: string;
  label: string;
}

function StatsItem(props: IStatsItem) {
  const { label, value } = props;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-black font-semibold text-[56px] leading-16">
        {value}
      </h1>
      <p className="text-[#646464] font-medium text-[15px] leading-6">
        {label}
      </p>
    </div>
  );
}

export function Stats() {
  return (
    <div className="app_landing_con flex justify-between mt-50.25 border-b border-[#0B0B0B14] pb-16.75">
      <StatsItem value="15,000+" label="Trips Planned" />
      <StatsItem value="80+" label="Countries covered" />
      <StatsItem value="8M+" label="Destinations " />
      <StatsItem value="15M+" label="Messages Sent by Yasi" />
    </div>
  );
}
