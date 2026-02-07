"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "案件一覧" },
  { href: "/new", label: "新規案件作成" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-slate-200 bg-slate-50/80">
      <div className="flex h-full flex-col p-4">
        <Link
          href="/"
          className="mb-8 font-semibold text-slate-800 no-underline"
        >
          <span className="text-primary-600 text-xl">Finsight</span>
        </Link>
        <nav className="flex flex-col gap-1">
          {navItems.map(({ href, label }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-lg px-3 py-2 text-sm font-medium no-underline transition-colors ${
                  isActive
                    ? "bg-[#2563eb] text-white"
                    : "text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
