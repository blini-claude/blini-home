interface CustomerRow {
  phone: string;
  name: string;
  city: string;
  orderCount: number;
  totalSpent: number;
  lastOrder: string;
}

export function CustomersTable({ customers }: { customers: CustomerRow[] }) {
  if (customers.length === 0) {
    return (
      <div className="bg-white rounded-[12px] border border-[#E8E8E8] p-12 text-center">
        <p className="text-[13px] text-[rgba(18,18,18,0.4)]">Nuk ka klientë ende</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[12px] border border-[#E8E8E8] overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#F0F0F0]">
            <th className="text-left text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
              Klienti
            </th>
            <th className="text-left text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
              Telefoni
            </th>
            <th className="text-left text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
              Qyteti
            </th>
            <th className="text-center text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
              Porosi
            </th>
            <th className="text-right text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
              Shpenzuar
            </th>
            <th className="text-right text-[11px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-3">
              Porosia e fundit
            </th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c, i) => (
            <tr
              key={i}
              className="border-b border-[#F8F8F8] hover:bg-[#FAFBFC] transition-colors"
            >
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-[32px] h-[32px] rounded-full bg-[#F0F7F8] flex items-center justify-center text-[10px] font-bold text-[#062F35]">
                    {c.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <span className="text-[13px] font-semibold text-[#062F35]">
                    {c.name}
                  </span>
                </div>
              </td>
              <td className="px-5 py-3.5 text-[12px] text-[rgba(18,18,18,0.5)]">
                {c.phone}
              </td>
              <td className="px-5 py-3.5 text-[12px] text-[rgba(18,18,18,0.5)]">
                {c.city}
              </td>
              <td className="px-5 py-3.5 text-center">
                <span className="text-[11px] font-bold px-2 py-1 rounded-[4px] bg-[#F0F7F8] text-[#062F35]">
                  {c.orderCount}
                </span>
              </td>
              <td className="px-5 py-3.5 text-right text-[13px] font-bold text-[#062F35]">
                €{c.totalSpent.toFixed(0)}
              </td>
              <td className="px-5 py-3.5 text-right text-[12px] text-[rgba(18,18,18,0.4)]">
                {new Date(c.lastOrder).toLocaleDateString("sq-AL", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
