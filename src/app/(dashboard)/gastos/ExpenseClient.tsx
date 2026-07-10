"use client";

import { useRef, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { addExpense, deleteExpense } from "./actions";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Row {
  id: string;
  category: string;
  amount: number;
  description: string | null;
  occurred_at: string;
}

const categories = [
  { value: "combustible", label: "Combustible" },
  { value: "mantenimiento", label: "Mantenimiento" },
  { value: "seguro", label: "Seguro" },
  { value: "multa", label: "Multa" },
  { value: "otro", label: "Otro" },
];

export function ExpenseClient({ rows }: { rows: Row[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      <form
        ref={formRef}
        action={(fd) =>
          startTransition(async () => {
            await addExpense(fd);
            formRef.current?.reset();
          })
        }
        className="bg-petrol-900 border border-petrol-700 rounded-2xl p-5 grid grid-cols-2 md:grid-cols-4 gap-3 items-end"
      >
        <div>
          <label className="text-xs text-white/50 mb-1 block">Categoría</label>
          <select
            name="category"
            className="w-full rounded-lg bg-petrol-800 border border-petrol-700 px-3 py-2 text-sm outline-none focus:border-amber-400"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
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
          <label className="text-xs text-white/50 mb-1 block">Detalle</label>
          <input
            name="description"
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
            No hay gastos registrados todavía.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/40 text-xs uppercase tracking-wider border-b border-petrol-700">
                <th className="py-3 px-5 font-medium">Fecha</th>
                <th className="py-3 px-5 font-medium">Categoría</th>
                <th className="py-3 px-5 font-medium">Detalle</th>
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
                  <td className="py-3 px-5 capitalize">{r.category}</td>
                  <td className="py-3 px-5 text-white/60">{r.description ?? "—"}</td>
                  <td className="py-3 px-5 text-right font-mono tabular text-signal">
                    S/ {Number(r.amount).toFixed(2)}
                  </td>
                  <td className="py-3 px-5 text-right">
                    <button
                      disabled={isPending}
                      onClick={() => startTransition(() => deleteExpense(r.id))}
                      className="text-white/30 hover:text-signal transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
