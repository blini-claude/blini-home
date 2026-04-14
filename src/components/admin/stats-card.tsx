export function StatsCard({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-[#e5e7eb] p-5">
      <p className="text-sm text-[#707070] font-medium">{label}</p>
      <p className="text-2xl font-bold text-[#121212] mt-1">{value}</p>
      {subtitle && <p className="text-xs text-[#707070] mt-1">{subtitle}</p>}
    </div>
  );
}
