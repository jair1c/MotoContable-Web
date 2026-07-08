"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteIncome } from "./actions";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Row {
  id: string;
  amount: number;
  payment_method: string;
  occurred_at: string;
  notes: string | null;
  passengers: { name: string } | null;
  routes: { name: string } | null;
}

export function IncomeTable({ rows }: { rows: Row[] }) {
  const [isPending, startTransition] = useTransition();

  if (rows.length === 0) {
    return (
      <div className="text-center py-16 text-white/40 text-sm">
        Aún no registras carreras. Agrega la primera arriba.
      </div>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-white/40 text-xs uppercase tracking-wider border-b border-petrol-700">
          <th className="py-3 px-5 font-medium">Fecha</th>
          <th className="py-3 px-5 font-medium">Pasajero</th>
          <th className="py-3 px-5 font-medium">Ruta</th>
          <th className="py-3 px-5 font-medium">Pago</th>
          <th className="py-3 px-5 font-medium text-right">Monto</th>
          <th className="py-3 px-5 font-medium"></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id} className="border-b border-petrol-800 hover:bg-petrol-800/50">
            <td className="py-3 px-5 text-white/70">
              {format(new Date(r.occurred_at), "dd MMM, HH:mm", { locale: es })}
            </td>
            <td className="py-3 px-5">{r.passengers?.name ?? "Ocasional"}</td>
            <td className="py-3 px-5 text-white/60">{r.routes?.name ?? "—"}</td>
            <td className="py-3 px-5 capitalize text-white/60">{r.payment_method}</td>
            <td className="py-3 px-5 text-right font-mono tabular text-amber-400">
              S/ {Number(r.amount).toFixed(2)}
            </td>
            <td className="py-3 px-5 text-right">
              <button
                disabled={isPending}
                onClick={() => startTransition(() => deleteIncome(r.id))}
                className="text-white/30 hover:text-signal transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
