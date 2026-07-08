"use client";

import { useTransition } from "react";
import { CheckCircle2, RefreshCw } from "lucide-react";
import { generateCurrentWeek, markPaid } from "./actions";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Row {
  id: string;
  week_start: string;
  week_end: string;
  amount_due: number;
  amount_paid: number;
  status: string;
  passengers: { name: string } | null;
}

export function WeeklyClient({ rows }: { rows: Row[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      <button
        disabled={isPending}
        onClick={() => startTransition(() => generateCurrentWeek())}
        className="flex items-center gap-2 rounded-lg bg-amber-400 hover:bg-amber-500 transition-colors text-petrol-950 font-semibold py-2.5 px-4 text-sm disabled:opacity-60"
      >
        <RefreshCw className="h-4 w-4" />
        Generar liquidaciones de esta semana
      </button>

      <div className="bg-petrol-900 border border-petrol-700 rounded-2xl overflow-hidden">
        {rows.length === 0 ? (
          <div className="text-center py-16 text-white/40 text-sm">
            No hay liquidaciones todavía. Genera la semana actual arriba
            (requiere pasajeros activos con tarifa semanal).
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/40 text-xs uppercase tracking-wider border-b border-petrol-700">
                <th className="py-3 px-5 font-medium">Pasajero</th>
                <th className="py-3 px-5 font-medium">Semana</th>
                <th className="py-3 px-5 font-medium text-right">Monto</th>
                <th className="py-3 px-5 font-medium">Estado</th>
                <th className="py-3 px-5 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-petrol-800 hover:bg-petrol-800/50">
                  <td className="py-3 px-5">{r.passengers?.name ?? "—"}</td>
                  <td className="py-3 px-5 text-white/60">
                    {format(new Date(r.week_start), "dd MMM", { locale: es })} –{" "}
                    {format(new Date(r.week_end), "dd MMM", { locale: es })}
                  </td>
                  <td className="py-3 px-5 text-right font-mono tabular">
                    S/ {Number(r.amount_due).toFixed(2)}
                  </td>
                  <td className="py-3 px-5">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        r.status === "pagado"
                          ? "bg-teal/10 text-teal"
                          : "bg-signal/10 text-signal"
                      }`}
                    >
                      {r.status === "pagado" ? "Pagado" : "Pendiente"}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-right">
                    {r.status !== "pagado" && (
                      <button
                        disabled={isPending}
                        onClick={() =>
                          startTransition(() => markPaid(r.id, r.amount_due))
                        }
                        className="text-white/30 hover:text-teal transition-colors inline-flex items-center gap-1"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-xs">Marcar pagado</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
