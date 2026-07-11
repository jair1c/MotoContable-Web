"use client";

import { useEffect, useState, useTransition } from "react";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";
import { toggleLeg } from "./actions";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Passenger, Leg } from "@/types/database";

interface Props {
  passengers: Passenger[];
  legsToday: { passenger_id: string; leg: Leg }[];
  date: string;
}

export function CheckDiarioClient({ passengers, legsToday, date }: Props) {
  const [isPending, startTransition] = useTransition();
  const [selectedDate, setSelectedDate] = useState(date);
  // Copia local que se actualiza al instante al tocar un botón, sin
  // esperar la respuesta del servidor (actualización optimista).
  const [localLegs, setLocalLegs] = useState(legsToday);

  useEffect(() => {
    setLocalLegs(legsToday);
  }, [legsToday]);

  const isMarked = (passengerId: string, leg: Leg) =>
    localLegs.some((l) => l.passenger_id === passengerId && l.leg === leg);

  function handleToggle(passengerId: string, leg: Leg, amount: number) {
    const wasMarked = isMarked(passengerId, leg);
    setLocalLegs((prev) =>
      wasMarked
        ? prev.filter((l) => !(l.passenger_id === passengerId && l.leg === leg))
        : [...prev, { passenger_id: passengerId, leg }]
    );
    startTransition(() => toggleLeg(passengerId, leg, amount, selectedDate));
  }

  const total = passengers.reduce((acc, p) => {
    let sum = acc;
    if (isMarked(p.id, "ida")) sum += Number(p.fare_ida);
    if (isMarked(p.id, "vuelta")) sum += Number(p.fare_vuelta);
    return sum;
  }, 0);

  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs text-white/50 mb-1 block">Fecha</label>
          <input
            type="date"
            value={selectedDate}
            max={today}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              window.location.href = `/check-diario?date=${e.target.value}`;
            }}
            className="rounded-lg bg-petrol-800 border border-petrol-700 px-3 py-2 text-sm outline-none focus:border-amber-400"
          />
        </div>
        <div className="text-right">
          <span className="text-xs text-white/40 uppercase tracking-wider block mb-1">
            Total del día {isPending && <span className="text-amber-400/70">· sincronizando…</span>}
          </span>
          <span className="font-mono tabular text-2xl text-amber-400">
            S/ {total.toFixed(2)}
          </span>
        </div>
      </div>

      {passengers.length === 0 ? (
        <div className="bg-petrol-900 border border-petrol-700 rounded-2xl text-center py-16 text-white/40 text-sm">
          No tienes pasajeros fijos programados este día.{" "}
          <a href="/pasajeros" className="text-amber-400 hover:underline">
            Revisa sus días
          </a>{" "}
          o registra una carrera suelta en{" "}
          <a href="/extras" className="text-amber-400 hover:underline">
            Extras
          </a>
          .
        </div>
      ) : (
        <div className="bg-petrol-900 border border-petrol-700 rounded-2xl divide-y divide-petrol-800">
          {passengers.map((p) => {
            const idaOn = isMarked(p.id, "ida");
            const vueltaOn = isMarked(p.id, "vuelta");
            return (
              <div
                key={p.id}
                className="flex items-center justify-between px-5 py-4"
              >
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-white/40 font-mono tabular mt-0.5">
                    S/ {Number(p.fare_ida).toFixed(2)} ida · S/{" "}
                    {Number(p.fare_vuelta).toFixed(2)} vuelta
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(p.id, "ida", p.fare_ida)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      idaOn
                        ? "bg-teal text-white"
                        : "bg-petrol-800 text-white/50 hover:text-white"
                    }`}
                  >
                    {idaOn ? <Check className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
                    Ida
                  </button>
                  <button
                    onClick={() => handleToggle(p.id, "vuelta", p.fare_vuelta)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      vueltaOn
                        ? "bg-teal text-white"
                        : "bg-petrol-800 text-white/50 hover:text-white"
                    }`}
                  >
                    {vueltaOn ? <Check className="h-3.5 w-3.5" /> : <ArrowLeft className="h-3.5 w-3.5" />}
                    Vuelta
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-white/30">
        {format(new Date(selectedDate + "T00:00:00"), "EEEE dd 'de' MMMM", { locale: es })}
        {" — "}toca Ida/Vuelta cuando recojas o dejes a cada pasajero. Si no lo marcas, no se cuenta (faltó).
      </p>
    </div>
  );
}
