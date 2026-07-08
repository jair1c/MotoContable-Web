"use client";

import { useRef, useState, useTransition } from "react";
import { Trash2, Power } from "lucide-react";
import { addPassenger, togglePassenger, deletePassenger, toggleDay } from "./actions";

interface Row {
  id: string;
  name: string;
  phone: string | null;
  fare_ida: number;
  fare_vuelta: number;
  days_of_week: number[];
  active: boolean;
}

const DAY_LABELS = [
  { value: 1, label: "L" },
  { value: 2, label: "M" },
  { value: 3, label: "X" },
  { value: 4, label: "J" },
  { value: 5, label: "V" },
  { value: 6, label: "S" },
  { value: 7, label: "D" },
];

export function PassengerClient({ rows }: { rows: Row[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [newDays, setNewDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <form
        ref={formRef}
        action={(fd) =>
          startTransition(async () => {
            const result = await addPassenger(fd);
            if (result?.error) {
              setError(result.error);
            } else {
              setError(null);
              formRef.current?.reset();
              setNewDays([1, 2, 3, 4, 5]);
            }
          })
        }
        className="bg-petrol-900 border border-petrol-700 rounded-2xl p-5 space-y-4"
      >
        {error && (
          <div className="rounded-lg bg-signal/10 border border-signal/30 px-3 py-2 text-sm text-signal">
            {error}
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
          <div>
            <label className="text-xs text-white/50 mb-1 block">Nombre</label>
            <input
              name="name"
              required
              className="w-full rounded-lg bg-petrol-800 border border-petrol-700 px-3 py-2 text-sm outline-none focus:border-amber-400"
              placeholder="Ej: Ana (alumna) / Profesor Luis"
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
            <label className="text-xs text-white/50 mb-1 block">Tarifa ida (S/)</label>
            <input
              name="fare_ida"
              type="number"
              step="0.01"
              min="0"
              required
              className="w-full rounded-lg bg-petrol-800 border border-petrol-700 px-3 py-2 text-sm font-mono outline-none focus:border-amber-400"
              placeholder="2.00"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Tarifa vuelta (S/)</label>
            <input
              name="fare_vuelta"
              type="number"
              step="0.01"
              min="0"
              required
              className="w-full rounded-lg bg-petrol-800 border border-petrol-700 px-3 py-2 text-sm font-mono outline-none focus:border-amber-400"
              placeholder="2.00"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-amber-400 hover:bg-amber-500 transition-colors text-petrol-950 font-semibold py-2 text-sm disabled:opacity-60"
          >
            {isPending ? "Guardando…" : "Agregar"}
          </button>
        </div>

        <div>
          <label className="text-xs text-white/50 mb-1.5 block">
            Días que aplica (aparecerá en Check diario solo esos días)
          </label>
          <div className="flex gap-1.5">
            {DAY_LABELS.map((d) => {
              const checked = newDays.includes(d.value);
              return (
                <label key={d.value}>
                  <input
                    type="checkbox"
                    name="days"
                    value={d.value}
                    checked={checked}
                    onChange={() =>
                      setNewDays((prev) =>
                        checked
                          ? prev.filter((v) => v !== d.value)
                          : [...prev, d.value].sort()
                      )
                    }
                    className="peer sr-only"
                  />
                  <span
                    onClick={() =>
                      setNewDays((prev) =>
                        checked
                          ? prev.filter((v) => v !== d.value)
                          : [...prev, d.value].sort()
                      )
                    }
                    className={`h-8 w-8 flex items-center justify-center rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                      checked
                        ? "bg-amber-400 text-petrol-950"
                        : "bg-petrol-800 text-white/40 hover:text-white"
                    }`}
                  >
                    {d.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </form>

      <div className="bg-petrol-900 border border-petrol-700 rounded-2xl overflow-hidden">
        {rows.length === 0 ? (
          <div className="text-center py-16 text-white/40 text-sm">
            Aún no registras pasajeros fijos. Agrega a tus alumnos y al profesor.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/40 text-xs uppercase tracking-wider border-b border-petrol-700">
                <th className="py-3 px-5 font-medium">Nombre</th>
                <th className="py-3 px-5 font-medium">Ida</th>
                <th className="py-3 px-5 font-medium">Vuelta</th>
                <th className="py-3 px-5 font-medium">Días</th>
                <th className="py-3 px-5 font-medium">Estado</th>
                <th className="py-3 px-5 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-petrol-800 hover:bg-petrol-800/50">
                  <td className="py-3 px-5">{r.name}</td>
                  <td className="py-3 px-5 font-mono tabular">S/ {Number(r.fare_ida).toFixed(2)}</td>
                  <td className="py-3 px-5 font-mono tabular">S/ {Number(r.fare_vuelta).toFixed(2)}</td>
                  <td className="py-3 px-5">
                    <div className="flex gap-1">
                      {DAY_LABELS.map((d) => {
                        const on = r.days_of_week.includes(d.value);
                        return (
                          <button
                            key={d.value}
                            disabled={isPending}
                            onClick={() =>
                              startTransition(() => toggleDay(r.id, r.days_of_week, d.value))
                            }
                            className={`h-6 w-6 flex items-center justify-center rounded text-[10px] font-medium transition-colors ${
                              on
                                ? "bg-teal/20 text-teal"
                                : "bg-white/5 text-white/30 hover:text-white/60"
                            }`}
                          >
                            {d.label}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="py-3 px-5">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        r.active ? "bg-teal/10 text-teal" : "bg-white/5 text-white/40"
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
