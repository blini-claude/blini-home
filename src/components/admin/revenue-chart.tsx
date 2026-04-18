"use client";

import { useMemo, useState } from "react";

type Point = { date: string; revenue: number; orders: number };

export function RevenueChart({ data }: { data: Point[] }) {
  const [hover, setHover] = useState<number | null>(null);

  const maxRevenue = useMemo(
    () => Math.max(1, ...data.map((d) => d.revenue)),
    [data]
  );

  if (data.length === 0) {
    return (
      <p className="text-[13px] text-[rgba(18,18,18,0.4)] text-center py-10">
        Nuk ka të dhëna
      </p>
    );
  }

  const W = 800;
  const H = 200;
  const pad = { top: 10, right: 10, bottom: 20, left: 10 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const stepX = data.length > 1 ? chartW / (data.length - 1) : chartW;

  const points = data.map((d, i) => {
    const x = pad.left + i * stepX;
    const y = pad.top + chartH - (d.revenue / maxRevenue) * chartH;
    return { x, y, d };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");

  const areaD = `${pathD} L${points[points.length - 1].x.toFixed(
    1
  )},${pad.top + chartH} L${pad.left},${pad.top + chartH} Z`;

  return (
    <div>
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="none">
          <defs>
            <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#062F35" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#062F35" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((t) => (
            <line
              key={t}
              x1={pad.left}
              x2={W - pad.right}
              y1={pad.top + chartH * t}
              y2={pad.top + chartH * t}
              stroke="#F0F0F0"
              strokeWidth={1}
            />
          ))}
          <path d={areaD} fill="url(#rev-grad)" />
          <path
            d={pathD}
            fill="none"
            stroke="#062F35"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hover === i ? 4 : 2.5}
                fill="#062F35"
                stroke="white"
                strokeWidth={1.5}
              />
              <rect
                x={p.x - stepX / 2}
                y={0}
                width={stepX}
                height={H}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
            </g>
          ))}
        </svg>
        {hover !== null && (
          <div
            className="absolute bg-[#062F35] text-white text-[11px] px-2.5 py-1.5 rounded-[6px] pointer-events-none shadow-lg"
            style={{
              left: `${(points[hover].x / W) * 100}%`,
              top: `${(points[hover].y / H) * 100}%`,
              transform: "translate(-50%, -120%)",
            }}
          >
            <div className="font-bold">€{data[hover].revenue.toFixed(2)}</div>
            <div className="text-[10px] text-[rgba(255,255,255,0.6)]">
              {data[hover].orders} porosi · {data[hover].date}
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-between text-[10px] text-[rgba(18,18,18,0.4)] mt-2">
        <span>{data[0].date}</span>
        <span>{data[data.length - 1].date}</span>
      </div>
    </div>
  );
}
