"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { dashboardNavItems } from "./navItems";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="relative z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/80 md:hidden">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          aria-label="メニュー"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
          className="rounded-lg border border-slate-200 p-2 text-slate-600"
        >
          <span className="block h-0.5 w-5 bg-current" />
          <span className="mt-1 block h-0.5 w-5 bg-current" />
          <span className="mt-1 block h-0.5 w-5 bg-current" />
        </button>
        <Link href="/" className="text-lg font-semibold text-slate-900 no-underline">
          Finsight
        </Link>
        <Link
          href="/new"
          className="rounded-lg bg-[#2563eb] px-3 py-2 text-sm font-medium text-white no-underline"
        >
          新規
        </Link>
      </div>
      {open && (
        <>
          <div
            className="fixed inset-0 z-20 bg-slate-900/20"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-4 right-4 top-full z-30 mt-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
            <nav className="flex flex-col gap-1">
              {dashboardNavItems.map(({ href, label }) => {
                const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium no-underline ${
                      isActive
                        ? "bg-[#2563eb] text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
