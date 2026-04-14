"use client";

const SORT_OPTIONS = [
  { value: "newest", label: "Më të rejat" },
  { value: "price-asc", label: "Çmimi: Ulët → Lartë" },
  { value: "price-desc", label: "Çmimi: Lartë → Ulët" },
  { value: "name", label: "Emri: A → Z" },
];

export function SortSelect({ current }: { current: string }) {
  return (
    <select
      defaultValue={current}
      onChange={(e) => {
        const url = new URL(window.location.href);
        url.searchParams.set("sort", e.target.value);
        url.searchParams.delete("page");
        window.location.href = url.toString();
      }}
      className="text-sm border border-border rounded px-3 py-2 bg-white"
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
