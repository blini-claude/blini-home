import type { ReactNode } from "react";

export function StatsCard({
  label,
  value,
  subtitle,
  icon,
  iconBg = "bg-gray-100",
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  iconBg?: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-secondary font-medium">{label}</p>
          <p className="text-3xl font-bold text-text mt-2">{value}</p>
          {subtitle && <p className="text-sm text-text-secondary mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
