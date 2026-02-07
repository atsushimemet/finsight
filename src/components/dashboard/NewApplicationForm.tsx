"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface NewApplicationFormProps {
  userId: string;
}

export function NewApplicationForm({ userId: _userId }: NewApplicationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const companyName = (formData.get("company_name") as string)?.trim();
    const loanAmount = Number(formData.get("loan_amount"));
    const loanPeriod = Number(formData.get("loan_period"));
    if (!companyName || !loanAmount || !loanPeriod) {
      setError("企業名・融資希望額・返済期間は必須です。");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName,
          industry: (formData.get("industry") as string) || null,
          loan_amount: Math.round(loanAmount * 10000),
          loan_period: loanPeriod,
          status: "draft",
          risk_level: "medium",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "作成に失敗しました");
      }
      const { id } = await res.json();
      router.push(`/applications/${id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "作成に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label htmlFor="company_name" className="block text-sm font-medium text-slate-700">
            企業名 <span className="text-red-500">*</span>
          </label>
          <input
            id="company_name"
            name="company_name"
            type="text"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
          />
        </div>
        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-slate-700">
            業種
          </label>
          <input
            id="industry"
            name="industry"
            type="text"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
          />
        </div>
        <div>
          <label htmlFor="loan_amount" className="block text-sm font-medium text-slate-700">
            融資希望額（万円） <span className="text-red-500">*</span>
          </label>
          <input
            id="loan_amount"
            name="loan_amount"
            type="number"
            min="1"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-slate-900"
          />
        </div>
        <div>
          <label htmlFor="loan_period" className="block text-sm font-medium text-slate-700">
            返済期間（月） <span className="text-red-500">*</span>
          </label>
          <input
            id="loan_period"
            name="loan_period"
            type="number"
            min="1"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-slate-900"
          />
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white hover:bg-[#1d4ed8] disabled:opacity-50"
        >
          {loading ? "作成中…" : "作成する"}
        </button>
        <a
          href="/"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          キャンセル
        </a>
      </div>
    </form>
  );
}
