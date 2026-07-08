"use client";

import { useRef, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { addExtra, deleteExtra } from "./actions";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Row {
  id: string;
  amount: number;
  payment_method: string;
  note: string | null;
  occurred_at: string;
}

export function ExtrasClient({ rows }: { rows: Row[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  const todayTotal = rows
    .filter(
      (r) =>
        format(new Date(r.occurred_at), "yyyy-MM-dd") ===
        format(new Date(), "yyyy-MM-dd")
    )
    .reduce((acc, r) => acc + Number(r.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/50">
          Carreras sueltas — se cobran al momento, no van a liquidación semanal.
        </p>
        <div className="text-right">
          <span className="text-xs text-white/40 uppercase tracking-wider block">
            Extras hoy
          </span>
          <span className="font-mono tabular text-lg text-amber-400">
            S/ {todayTotal.toFixed(2)}
          </span>
        </div>
      </div>

      <form
        ref={formRef}
        action={(fd) =>
          startTransition(async () => {
            await addExtra(fd);
            formRef.current?.reset();
          })
        }
        className="bg-petrol-900 border border-petrol-700 rounded-2xl p-5 grid grid-cols-2 md:grid-cols-4 gap-3 items-end"
      >
        <div>
          <label className="text-xs text-white/50 mb-1 block">Monto (S/)</label>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0"
            required
            className="w-full rounded-lg bg-petrol-800 border border-petrol-700 px-3 py-2 text-sm font-mono outline-none focus:border-amber-400"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="text-xs text-white/50 mb-1 block">Pago</label>
          <select
            name="payment_method"
            className="w-full rounded-lg bg-petrol-800 border border-petrol-700 px-3 py-2 text-sm outline-none focus:border-amber-400"
          >
            <option value="efectivo">Efectivo</option>
            <option value="yape">Yape</option>
            <option value="plin">Plin</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-white/50 mb-1 block">Nota</label>
          <input
            name="note"
            type="text"
            className="w-full rounded-lg bg-petrol-800 border border-petrol-700 px-3 py-2 text-sm outline-none focus:border-amber-400"
            placeholder="Opcional"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-amber-400 hover:bg-amber-500 transition-colors text-petrol-950 font-semibold py-2 text-sm disabled:opacity-60"
        >
          {isPending ? "Guardando…" : "Guardar"}
        </button>
      </form>

      <div className="bg-petrol-900 border border-petrol-700 rounded-2xl overflow-hidden">
        {rows.length === 0 ? (
          <div className="text-center py-16 text-white/40 text-sm">
            Aún no registras carreras extra.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/40 text-xs uppercase tracking-wider border-b border-petrol-700">
                <th className="py-3 px-5 font-medium">Fecha</th>
                <th className="py-3 px-5 font-medium">Nota</th>
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
                  <td className="py-3 px-5 text-white/60">{r.note ?? "—"}</td>
                  <td className="py-3 px-5 capitalize text-white/60">{r.payment_method}</td>
                  <td className="py-3 px-5 text-right font-mono tabular text-amber-400">
                    S/ {Number(r.amount).toFixed(2)}
                  </td>
                  <td className="py-3 px-5 text-right">
                    <button
                      disabled={isPending}
                      onClick={() => startTransition(() => deleteExtra(r.id))}
                      className="text-white/30 hover:text-signal transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
