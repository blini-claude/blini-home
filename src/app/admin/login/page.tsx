"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#121212]">BLINI HOME</h1>
          <p className="text-sm text-[#707070] mt-1">Admin Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-[#e5e7eb] p-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#374151] mb-1">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoFocus
              className="w-full h-10 px-3 border border-[#d1d5db] rounded-md text-sm outline-none focus:ring-2 focus:ring-[#6767A7] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#374151] mb-1">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full h-10 px-3 border border-[#d1d5db] rounded-md text-sm outline-none focus:ring-2 focus:ring-[#6767A7] focus:border-transparent"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-[#121212] text-white rounded-md text-sm font-medium hover:bg-[#121212]/90 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
