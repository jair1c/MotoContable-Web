import { Gauge, LogOut } from "lucide-react";
import { logout } from "@/app/(auth)/login/actions";

export function MobileTopBar() {
  return (
    <header className="md:hidden flex items-center justify-between px-4 h-14 border-b border-petrol-700 bg-petrol-900 sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-full bg-amber-400 flex items-center justify-center">
          <Gauge className="h-3.5 w-3.5 text-petrol-950" strokeWidth={2.5} />
        </div>
        <span className="font-display font-semibold text-sm tracking-tight">
          MotoContable
        </span>
      </div>
      <form action={logout}>
        <button
          type="submit"
          className="h-8 w-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-petrol-800 transition-colors"
        >
          <LogOut className="h-4 w-4" strokeWidth={2} />
        </button>
      </form>
    </header>
  );
}
