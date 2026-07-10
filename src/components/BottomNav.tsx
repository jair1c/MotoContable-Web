"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Zap,
  Receipt,
  Users,
  CalendarClock,
} from "lucide-react";

const links = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/check-diario", label: "Check", icon: CheckSquare },
  { href: "/extras", label: "Extras", icon: Zap },
  { href: "/gastos", label: "Gastos", icon: Receipt },
  { href: "/pasajeros", label: "Pasajeros", icon: Users },
  { href: "/pagos-semanales", label: "Pagos", icon: CalendarClock },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-petrol-900 border-t border-petrol-700 flex items-stretch"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
              active ? "text-amber-400" : "text-white/40"
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
