interface CustomerRow {
  phone: string;
  name: string;
  city: string;
  orderCount: number;
  totalSpent: number;
  lastOrder: string;
}

export function CustomersTable({ customers }: { customers: CustomerRow[] }) {
  return (
    <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#e5e7eb] bg-[#f8f9fa]">
            <th className="text-left px-4 py-3 font-medium text-[#707070]">Name</th>
            <th className="text-left px-4 py-3 font-medium text-[#707070]">Phone</th>
            <th className="text-left px-4 py-3 font-medium text-[#707070]">City</th>
            <th className="text-left px-4 py-3 font-medium text-[#707070]">Orders</th>
            <th className="text-left px-4 py-3 font-medium text-[#707070]">Total Spent</th>
            <th className="text-left px-4 py-3 font-medium text-[#707070]">Last Order</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e5e7eb]">
          {customers.map((c, i) => (
            <tr key={i} className="hover:bg-[#f8f9fa]">
              <td className="px-4 py-3 font-medium">{c.name}</td>
              <td className="px-4 py-3 text-[#707070]">{c.phone}</td>
              <td className="px-4 py-3">{c.city}</td>
              <td className="px-4 py-3">{c.orderCount}</td>
              <td className="px-4 py-3 font-semibold">€{c.totalSpent.toFixed(2)}</td>
              <td className="px-4 py-3 text-[#707070]">
                {new Date(c.lastOrder).toLocaleDateString("en-GB")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {customers.length === 0 && (
        <p className="text-center py-8 text-sm text-[#707070]">No customers yet</p>
      )}
    </div>
  );
}
