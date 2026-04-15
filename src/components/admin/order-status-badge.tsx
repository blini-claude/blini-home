const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-[#FFF8E1]", text: "text-[#B8860B]", label: "Në pritje" },
  confirmed: { bg: "bg-[#E3F2FD]", text: "text-[#1565C0]", label: "Konfirmuar" },
  delivering: { bg: "bg-[#EDE7F6]", text: "text-[#5E35B1]", label: "Në dërgesë" },
  delivered: { bg: "bg-[#E8F5E9]", text: "text-[#2E7D32]", label: "Dërguar" },
  cancelled: { bg: "bg-[#FFEBEE]", text: "text-[#C62828]", label: "Anuluar" },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || {
    bg: "bg-[#F5F5F5]",
    text: "text-[#666]",
    label: status,
  };

  return (
    <span
      className={`inline-flex items-center text-[10px] px-2.5 py-1 rounded-[6px] font-bold ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}
