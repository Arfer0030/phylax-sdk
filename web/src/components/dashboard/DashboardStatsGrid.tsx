"use client";

import type { DashboardStat } from "./dashboard-data";

type DashboardStatsGridProps = {
  stats: DashboardStat[];
};

export default function DashboardStatsGrid({ stats }: DashboardStatsGridProps) {
  return (
    <section className="grid gap-4 xl:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.id} className="min-h-[148px] bg-[#111111] p-5">
          <p className="phx-label text-zinc-500">{stat.label}</p>
          <p className="mt-8 whitespace-nowrap text-[1.9rem] font-extrabold leading-none tracking-[-0.065em] text-white sm:text-[2rem] xl:text-[2.15rem]">
            {stat.value}
          </p>
        </div>
      ))}
    </section>
  );
}
