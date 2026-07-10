"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Gauge,
  LayoutDashboard,
  CheckSquare,
  Zap,
  Receipt,
  Users,
  CalendarClock,
  LogOut,
} from "lucide-react";
import { logout } from "@/app/(auth)/login/actions";

const links = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/check-diario", label: "Check diario", icon: CheckSquare },
  { href: "/extras", label: "Extras", icon: Zap },
  { href: "/gastos", label: "Gastos", icon: Receipt },
  { href: "/pasajeros", label: "Pasajeros", icon: Users },
  { href: "/pagos-semanales", label: "Pagos semanales", icon: CalendarClock },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-60 shrink-0 bg-petrol-900 border-r border-petrol-700 flex-col min-h-screen">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-petrol-700">
        <div className="h-8 w-8 rounded-full bg-amber-400 flex items-center justify-center">
          <Gauge className="h-4 w-4 text-petrol-950" strokeWidth={2.5} />
        </div>
        <span className="font-display font-semibold tracking-tight">
          MotoContable
        </span>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-amber-400 text-petrol-950 font-medium"
                  : "text-white/60 hover:bg-petrol-800 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <form action={logout} className="p-3 border-t border-petrol-700">
        <button
          type="submit"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:bg-petrol-800 hover:text-white w-full transition-colors"
        >
          <LogOut className="h-4 w-4" strokeWidth={2} />
          Cerrar sesión
        </button>
      </form>
    </aside>
  );
}
