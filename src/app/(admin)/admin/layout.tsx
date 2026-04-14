export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin sidebar and header will be added in Plan 4 */}
      <main>{children}</main>
    </div>
  );
}
