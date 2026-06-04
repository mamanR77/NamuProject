"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: "📊", exact: true },
  { href: "/admin/visits", label: "Kunjungan", icon: "🚪" },
  { href: "/security", label: "Antrian Security", icon: "🛡️" },
  { href: "/admin/users", label: "Pengguna", icon: "👥" },
  { href: "/admin/departments", label: "Departemen", icon: "🏢" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
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
