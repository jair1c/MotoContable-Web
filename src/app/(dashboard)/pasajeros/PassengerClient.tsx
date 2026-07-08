"use client";

import { useRef, useTransition } from "react";
import { Trash2, Power } from "lucide-react";
import { addPassenger, togglePassenger, deletePassenger } from "./actions";
import type { Route } from "@/types/database";

interface Row {
  id: string;
  name: string;
  phone: string | null;
  weekly_rate: number | null;
  active: boolean;
  routes: { name: string } | null;
}

export function PassengerClient({ rows, routes }: { rows: Row[]; routes: Route[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      <form
        ref={formRef}
        action={(fd) =>
          startTransition(async () => {
            await addPassenger(fd);
            formRef.current?.reset();
          })
        }
        className="bg-petrol-900 border border-petrol-700 rounded-2xl p-5 grid grid-cols-2 md:grid-cols-5 gap-3 items-end"
      >
        <div>
          <label className="text-xs text-white/50 mb-1 block">Nombre</label>
          <input
            name="name"
            required
            className="w-full rounded-lg bg-petrol-800 border border-petrol-700 px-3 py-2 text-sm outline-none focus:border-amber-400"
            placeholder="Nombre del pasajero"
          />
        </div>
        <div>
          <label className="text-xs text-white/50 mb-1 block">Teléfono</label>
          <input
            name="phone"
            className="w-full rounded-lg bg-petrol-800 border border-petrol-700 px-3 py-2 text-sm outline-none focus:border-amber-400"
            placeholder="Opcional"
          />
        </div>
        <div>
          <label className="text-xs text-white/50 mb-1 block">Ruta</label>
          <select
            name="route_id"
            className="w-full rounded-lg bg-petrol-800 border border-petrol-700 px-3 py-2 text-sm outline-none focus:border-amber-400"
          >
            <option value="">Sin ruta</option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-white/50 mb-1 block">Tarifa semanal (S/)</label>
          <input
            name="weekly_rate"
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
            Aún no registras pasajeros frecuentes.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/40 text-xs uppercase tracking-wider border-b border-petrol-700">
                <th className="py-3 px-5 font-medium">Nombre</th>
                <th className="py-3 px-5 font-medium">Ruta</th>
                <th className="py-3 px-5 font-medium">Tarifa semanal</th>
                <th className="py-3 px-5 font-medium">Estado</th>
                <th className="py-3 px-5 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-petrol-800 hover:bg-petrol-800/50">
                  <td className="py-3 px-5">{r.name}</td>
                  <td className="py-3 px-5 text-white/60">{r.routes?.name ?? "—"}</td>
                  <td className="py-3 px-5 font-mono tabular">
                    {r.weekly_rate ? `S/ ${Number(r.weekly_rate).toFixed(2)}` : "—"}
                  </td>
                  <td className="py-3 px-5">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        r.active
                          ? "bg-teal/10 text-teal"
                          : "bg-white/5 text-white/40"
                      }`}
                    >
                      {r.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-right space-x-3">
                    <button
                      disabled={isPending}
                      onClick={() => startTransition(() => togglePassenger(r.id, r.active))}
                      className="text-white/30 hover:text-amber-400 transition-colors inline-block"
                    >
                      <Power className="h-4 w-4" />
                    </button>
                    <button
                      disabled={isPending}
                      onClick={() => startTransition(() => deletePassenger(r.id))}
                      className="text-white/30 hover:text-signal transition-colors inline-block"
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
