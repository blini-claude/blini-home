const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  delivering: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}
