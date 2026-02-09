"use client";

import Link from "next/link";
import { ApplicationCard } from "./ApplicationCard";
import type { LoanApplication } from "@/types/database";

interface DashboardContentProps {
  applications: LoanApplication[];
}

export function DashboardContent({
  applications,
}: DashboardContentProps) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">案件一覧</h1>
      </div>
      {applications.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500 sm:p-8">
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
