"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/security", label: "Dashboard", icon: "📊", exact: true },
  { href: "/security/review", label: "Review", icon: "🔍" },
  { href: "/security/antrian", label: "Antrian", icon: "📋" },
  { href: "/security/scan", label: "Gate Scan", icon: "📷" },
];

export function SecurityNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 md:flex-col">
      {LINKS.map((l) => {
        const active = l.exact
          ? pathname === l.href
          : pathname === l.href || pathname.startsWith(l.href + "/");
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
              active
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span className="text-base">{l.icon}</span>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
