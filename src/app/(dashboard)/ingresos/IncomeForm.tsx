"use client";

import { useRef, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { addIncome } from "./actions";
import type { Passenger, Route } from "@/types/database";

export function IncomeForm({
  passengers,
  routes,
}: {
  passengers: Passenger[];
  routes: Route[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-petrol-900 border border-petrol-700 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium"
      >
        <span className="flex items-center gap-2">
          <Plus className="h-4 w-4 text-amber-400" />
          Registrar carrera
        </span>
        <span className="text-white/40 text-xs">{open ? "Ocultar" : "Mostrar"}</span>
      </button>

      {open && (
        <form
          ref={formRef}
          action={(fd) =>
            startTransition(async () => {
              await addIncome(fd);
              formRef.current?.reset();
            })
          }
          className="px-5 pb-5 grid grid-cols-2 md:grid-cols-5 gap-3 items-end"
        >
          <div className="col-span-1">
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
          <div className="col-span-1">
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
          <div className="col-span-1">
            <label className="text-xs text-white/50 mb-1 block">Pasajero</label>
            <select
              name="passenger_id"
              className="w-full rounded-lg bg-petrol-800 border border-petrol-700 px-3 py-2 text-sm outline-none focus:border-amber-400"
            >
              <option value="">Ocasional</option>
              {passengers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-1">
            <label className="text-xs text-white/50 mb-1 block">Ruta</label>
            <select
              name="route_id"
              className="w-full rounded-lg bg-petrol-800 border border-petrol-700 px-3 py-2 text-sm outline-none focus:border-amber-400"
            >
              <option value="">Sin especificar</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-1">
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-amber-400 hover:bg-amber-500 transition-colors text-petrol-950 font-semibold py-2 text-sm disabled:opacity-60"
            >
              {isPending ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
