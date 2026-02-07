"use client";

import Link from "next/link";
import { ApplicationCard } from "./ApplicationCard";
import type { LoanApplication } from "@/types/database";

interface DashboardContentProps {
  applications: LoanApplication[];
  isLoggedIn: boolean;
}

export function DashboardContent({
  applications,
  isLoggedIn,
}: DashboardContentProps) {
  return (
    <div className="mx-auto max-w-5xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">案件一覧</h1>
      </div>
      {!isLoggedIn ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          <p>ログインすると、融資案件の一覧を表示し新規案件を作成できます。</p>
          <p className="mt-2 text-sm">Supabase の認証を設定してください。</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          <p>まだ案件がありません。</p>
          <p className="mt-2 text-sm">
            <Link
              href="/new"
              className="font-medium text-[#2563eb] hover:underline"
            >
              新規案件作成
            </Link>
            から追加してください。
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {applications.map((app) => (
            <li key={app.id}>
              <ApplicationCard application={app} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
