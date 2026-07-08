"use client";

import { useRef, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { addRoute, deleteRoute } from "./actions";

interface Row {
  id: string;
  name: string;
  origin: string | null;
  destination: string | null;
  default_fare: number | null;
}

export function RouteClient({ rows }: { rows: Row[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      <form
        ref={formRef}
        action={(fd) =>
          startTransition(async () => {
            await addRoute(fd);
            formRef.current?.reset();
          })
        }
        className="bg-petrol-900 border border-petrol-700 rounded-2xl p-5 grid grid-cols-2 md:grid-cols-5 gap-3 items-end"
      >
        <div>
          <label className="text-xs text-white/50 mb-1 block">Nombre de ruta</label>
          <input
            name="name"
            required
            className="w-full rounded-lg bg-petrol-800 border border-petrol-700 px-3 py-2 text-sm outline-none focus:border-amber-400"
            placeholder="Terminal - Mercado"
          />
        </div>
        <div>
          <label className="text-xs text-white/50 mb-1 block">Origen</label>
          <input
            name="origin"
            className="w-full rounded-lg bg-petrol-800 border border-petrol-700 px-3 py-2 text-sm outline-none focus:border-amber-400"
            placeholder="Opcional"
          />
        </div>
        <div>
          <label className="text-xs text-white/50 mb-1 block">Destino</label>
          <input
            name="destination"
            className="w-full rounded-lg bg-petrol-800 border border-petrol-700 px-3 py-2 text-sm outline-none focus:border-amber-400"
            placeholder="Opcional"
          />
        </div>
        <div>
          <label className="text-xs text-white/50 mb-1 block">Tarifa habitual (S/)</label>
          <input
            name="default_fare"
            type="number"
            step="0.01"
            className="w-full rounded-lg bg-petrol-800 border border-petrol-700 px-3 py-2 text-sm font-mono outline-none focus:border-amber-400"
            placeholder="Opcional"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-amber-400 hover:bg-amber-500 transition-colors text-petrol-950 font-semibold py-2 text-sm disabled:opacity-60"
        >
          {isPending ? "Guardando…" : "Agregar"}
        </button>
      </form>

      <div className="bg-petrol-900 border border-petrol-700 rounded-2xl overflow-hidden">
        {rows.length === 0 ? (
          <div className="text-center py-16 text-white/40 text-sm">
            Aún no registras rutas frecuentes.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/40 text-xs uppercase tracking-wider border-b border-petrol-700">
                <th className="py-3 px-5 font-medium">Ruta</th>
                <th className="py-3 px-5 font-medium">Origen</th>
                <th className="py-3 px-5 font-medium">Destino</th>
                <th className="py-3 px-5 font-medium">Tarifa</th>
                <th className="py-3 px-5 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-petrol-800 hover:bg-petrol-800/50">
                  <td className="py-3 px-5">{r.name}</td>
                  <td className="py-3 px-5 text-white/60">{r.origin ?? "—"}</td>
                  <td className="py-3 px-5 text-white/60">{r.destination ?? "—"}</td>
                  <td className="py-3 px-5 font-mono tabular">
                    {r.default_fare ? `S/ ${Number(r.default_fare).toFixed(2)}` : "—"}
                  </td>
                  <td className="py-3 px-5 text-right">
                    <button
                      disabled={isPending}
                      onClick={() => startTransition(() => deleteRoute(r.id))}
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
