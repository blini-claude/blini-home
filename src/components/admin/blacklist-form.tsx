"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function BlacklistForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/blacklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, reason, notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gabim");
        return;
      }
      setPhone("");
      setReason("");
      setNotes("");
      router.refresh();
    } catch {
      setError("Gabim në rrjet");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-[12px] border border-[#E8E8E8] p-5 space-y-3"
    >
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-[14px] font-bold text-[#062F35]">Shto numër në listë të zezë</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+355 69 123 4567"
          required
          className="h-[40px] px-3 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors"
        />
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Arsyeja (p.sh. porosi të papranuara)"
          className="h-[40px] px-3 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors"
        />
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Shënime (opsionale)"
          className="h-[40px] px-3 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors"
        />
      </div>
      {error && (
        <p className="text-[12px] text-[#C62828] font-medium">{error}</p>
      )}
      <button
        type="submit"
        disabled={submitting || !phone.trim()}
        className="h-[40px] px-5 bg-[#062F35] text-white rounded-[8px] text-[13px] font-bold hover:bg-[#0a4049] transition-colors cursor-pointer disabled:opacity-60"
      >
        {submitting ? "Duke shtuar..." : "Shto"}
      </button>
    </form>
  );
}
