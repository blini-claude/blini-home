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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider text-text-secondary">Name</th>
            <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider text-text-secondary">Phone</th>
            <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider text-text-secondary">City</th>
            <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider text-text-secondary">Orders</th>
            <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider text-text-secondary">Total Spent</th>
            <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider text-text-secondary">Last Order</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {customers.map((c, i) => (
            <tr key={i} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-medium text-text">{c.name}</td>
              <td className="px-6 py-4 text-text-secondary">{c.phone}</td>
              <td className="px-6 py-4 text-text">{c.city}</td>
              <td className="px-6 py-4 text-text">{c.orderCount}</td>
              <td className="px-6 py-4 font-semibold text-text">{c.totalSpent.toFixed(0)} ALL</td>
              <td className="px-6 py-4 text-text-secondary">
                {new Date(c.lastOrder).toLocaleDateString("en-GB")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {customers.length === 0 && (
        <p className="text-center py-12 text-sm text-text-secondary">No customers yet</p>
      )}
    </div>
  );
}
