"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, RefreshCw } from "lucide-react";
import { generateCurrentWeek, registerPayment } from "./actions";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Row {
  id: string;
  week_start: string;
  week_end: string;
  amount_due: number;
  amount_paid: number;
  status: string;
  note: string | null;
  passengers: { name: string } | null;
}

const STATUS_STYLES: Record<string, string> = {
  pagado: "bg-teal/10 text-teal",
  parcial: "bg-amber-400/10 text-amber-400",
  pendiente: "bg-signal/10 text-signal",
  trasladado: "bg-white/5 text-white/40",
};

const STATUS_LABELS: Record<string, string> = {
  pagado: "Pagado",
  parcial: "Parcial",
  pendiente: "Pendiente",
  trasladado: "Trasladado",
};

function PaymentRow({ row, isPending, onSubmit }: {
  row: Row;
  isPending: boolean;
  onSubmit: (amount: number) => void;
}) {
  const remaining = Number(row.amount_due) - Number(row.amount_paid);
  const [amount, setAmount] = useState(remaining.toFixed(2));

  return (
    <div className="flex items-center gap-2 justify-end">
      <input
        type="number"
        step="0.01"
        min="0"
        max={row.amount_due}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-20 rounded-lg bg-petrol-800 border border-petrol-700 px-2 py-1.5 text-xs font-mono text-right outline-none focus:border-amber-400"
      />
      <button
        disabled={isPending}
        onClick={() => onSubmit(Number(amount))}
        className="text-white/40 hover:text-teal transition-colors inline-flex items-center gap-1"
      >
        <CheckCircle2 className="h-4 w-4" />
        <span className="text-xs">Registrar</span>
      </button>
    </div>
  );
}

export function WeeklyClient({ rows }: { rows: Row[] }) {
  const [isPending, startTransition] = useTransition();

  const weekTotal = rows.reduce((acc, r) => acc + Number(r.amount_due), 0);
  const weekPaid = rows.reduce((acc, r) => acc + Number(r.amount_paid), 0);
  const weekPending = rows
    .filter((r) => r.status === "pendiente" || r.status === "parcial")
    .reduce((acc, r) => acc + (Number(r.amount_due) - Number(r.amount_paid)), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <button
          disabled={isPending}
          onClick={() => startTransition(() => generateCurrentWeek())}
          className="flex items-center gap-2 rounded-lg bg-amber-400 hover:bg-amber-500 transition-colors text-petrol-950 font-semibold py-2.5 px-4 text-sm disabled:opacity-60"
        >
          <RefreshCw className="h-4 w-4" />
          Generar liquidaciones de esta semana
        </button>

        <div className="flex gap-6 text-right">
          <div>
            <span className="text-xs text-white/40 uppercase tracking-wider block">Total esperado</span>
            <span className="font-mono tabular text-lg">S/ {weekTotal.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-xs text-white/40 uppercase tracking-wider block">Cobrado</span>
            <span className="font-mono tabular text-lg text-teal">S/ {weekPaid.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-xs text-white/40 uppercase tracking-wider block">Pendiente</span>
            <span className="font-mono tabular text-lg text-signal">S/ {weekPending.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-petrol-900 border border-petrol-700 rounded-2xl overflow-hidden">
        {rows.length === 0 ? (
          <div className="text-center py-16 text-white/40 text-sm">
            No hay liquidaciones todavía. Genera la semana actual arriba
            (requiere pasajeros activos con tramos marcados en Check diario).
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/40 text-xs uppercase tracking-wider border-b border-petrol-700">
                <th className="py-3 px-5 font-medium">Pasajero</th>
                <th className="py-3 px-5 font-medium">Semana</th>
                <th className="py-3 px-5 font-medium text-right">Debe</th>
                <th className="py-3 px-5 font-medium text-right">Pagó</th>
                <th className="py-3 px-5 font-medium">Estado</th>
                <th className="py-3 px-5 font-medium text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-petrol-800 hover:bg-petrol-800/50 align-top">
                  <td className="py-3 px-5">{r.passengers?.name ?? "—"}</td>
                  <td className="py-3 px-5 text-white/60">
                    {format(new Date(r.week_start), "dd MMM", { locale: es })} –{" "}
                    {format(new Date(r.week_end), "dd MMM", { locale: es })}
                  </td>
                  <td className="py-3 px-5 text-right font-mono tabular">
                    S/ {Number(r.amount_due).toFixed(2)}
                  </td>
                  <td className="py-3 px-5 text-right font-mono tabular text-teal">
                    S/ {Number(r.amount_paid).toFixed(2)}
                  </td>
                  <td className="py-3 px-5">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[r.status]}`}>
                      {STATUS_LABELS[r.status] ?? r.status}
                    </span>
                    {r.note && (
                      <p className="text-[11px] text-white/30 mt-1 max-w-[180px]">{r.note}</p>
                    )}
                  </td>
                  <td className="py-3 px-5">
                    {(r.status === "pendiente" || r.status === "parcial") && (
                      <PaymentRow
                        row={r}
                        isPending={isPending}
                        onSubmit={(amount) =>
                          startTransition(() => registerPayment(r.id, r.amount_due, amount))
                        }
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
