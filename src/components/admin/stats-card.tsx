import type { ReactNode } from "react";

export function StatsCard({
  label,
  value,
  subtitle,
  icon,
  iconBg = "bg-[#F0F7F8]",
  trend,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  iconBg?: string;
  trend?: { value: string; positive: boolean };
}) {
  return (
    <div className="bg-white rounded-[12px] border border-[#E8E8E8] p-5 hover:shadow-[0_4px_12px_rgba(6,47,53,0.06)] transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[11px] text-[rgba(18,18,18,0.5)] font-semibold uppercase tracking-[1px]">
            {label}
          </p>
          <p className="text-[28px] font-bold text-[#062F35] mt-1.5 tracking-[-1px] leading-none">
            {value}
          </p>
          <div className="flex items-center gap-2 mt-2">
            {trend && (
              <span
                className={`text-[11px] font-bold px-1.5 py-0.5 rounded-[4px] ${
                  trend.positive
                    ? "bg-[#ECFDF5] text-[#059669]"
                    : "bg-[#FEF2F2] text-[#DC2626]"
                }`}
              >
                {trend.positive ? "↑" : "↓"} {trend.value}
              </span>
            )}
            {subtitle && (
              <p className="text-[11px] text-[rgba(18,18,18,0.4)]">{subtitle}</p>
            )}
          </div>
        </div>
        {icon && (
          <div
            className={`w-[42px] h-[42px] rounded-[10px] ${iconBg} flex items-center justify-center flex-shrink-0`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
