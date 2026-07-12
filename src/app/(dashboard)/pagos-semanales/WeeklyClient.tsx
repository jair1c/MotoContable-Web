"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, RefreshCw, FileDown } from "lucide-react";
import { generateCurrentWeek, registerPayment, getPaymentDetail } from "./actions";
import { downloadPaymentPdf } from "./pdf";
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
  const defaultValue = row.status === "pagado" ? Number(row.amount_paid) : remaining;
  const [amount, setAmount] = useState(defaultValue.toFixed(2));

  return (
    <div className="flex items-center gap-2">
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

function PdfButton({ paymentId }: { paymentId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const detail = await getPaymentDetail(paymentId);
      if (detail) {
        await downloadPaymentPdf(detail);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      disabled={loading}
      onClick={handleDownload}
      className="text-white/40 hover:text-amber-400 transition-colors inline-flex items-center gap-1 disabled:opacity-50"
      title="Descargar PDF"
    >
      <FileDown className="h-4 w-4" />
      <span className="text-xs">{loading ? "Generando…" : "PDF"}</span>
    </button>
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
      <button
        disabled={isPending}
        onClick={() => startTransition(() => generateCurrentWeek())}
        className="flex items-center gap-2 rounded-lg bg-amber-400 hover:bg-amber-500 transition-colors text-petrol-950 font-semibold py-2.5 px-4 text-sm disabled:opacity-60"
      >
        <RefreshCw className="h-4 w-4" />
        Generar liquidaciones de esta semana
      </button>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-petrol-900 border border-petrol-700 rounded-xl p-3">
          <span className="text-[10px] text-white/40 uppercase tracking-wider block mb-0.5">Esperado</span>
          <span className="font-mono tabular text-sm sm:text-base block truncate">S/ {weekTotal.toFixed(2)}</span>
        </div>
        <div className="bg-petrol-900 border border-petrol-700 rounded-xl p-3">
          <span className="text-[10px] text-white/40 uppercase tracking-wider block mb-0.5">Cobrado</span>
          <span className="font-mono tabular text-sm sm:text-base text-teal block truncate">S/ {weekPaid.toFixed(2)}</span>
        </div>
        <div className="bg-petrol-900 border border-petrol-700 rounded-xl p-3">
          <span className="text-[10px] text-white/40 uppercase tracking-wider block mb-0.5">Pendiente</span>
          <span className="font-mono tabular text-sm sm:text-base text-signal block truncate">S/ {weekPending.toFixed(2)}</span>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="bg-petrol-900 border border-petrol-700 rounded-2xl text-center py-16 text-white/40 text-sm">
          No hay liquidaciones todavía. Genera la semana actual arriba
          (requiere pasajeros activos con tramos marcados en Check diario).
        </div>
      ) : (
        <>
          {/* Tarjetas — móvil */}
          <div className="md:hidden space-y-2">
            {rows.map((r) => (
              <div
                key={r.id}
                className="bg-petrol-900 border border-petrol-700 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{r.passengers?.name ?? "—"}</p>
                    <p className="text-xs text-white/40 mt-0.5">
                      {format(new Date(r.week_start), "dd MMM", { locale: es })} –{" "}
                      {format(new Date(r.week_end), "dd MMM", { locale: es })}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${STATUS_STYLES[r.status]}`}>
                    {STATUS_LABELS[r.status] ?? r.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <span className="text-white/60">
                    Debe <span className="font-mono tabular text-white">S/ {Number(r.amount_due).toFixed(2)}</span>
                  </span>
                  <span className="text-white/60">
                    Pagó <span className="font-mono tabular text-teal">S/ {Number(r.amount_paid).toFixed(2)}</span>
                  </span>
                </div>

                {r.note && <p className="text-[11px] text-white/30">{r.note}</p>}

                <div className="pt-2 border-t border-petrol-800 flex items-center justify-between gap-2">
                  <PaymentRow
                    row={r}
                    isPending={isPending}
                    onSubmit={(amount) =>
                      startTransition(() => registerPayment(r.id, r.amount_due, amount))
                    }
                  />
                  <PdfButton paymentId={r.id} />
                </div>
              </div>
            ))}
          </div>

          {/* Tabla — escritorio */}
          <div className="hidden md:block bg-petrol-900 border border-petrol-700 rounded-2xl overflow-hidden">
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
                    <td className="py-3 px-5 text-right">
                      <div className="flex flex-col items-end gap-2">
                        <PaymentRow
                          row={r}
                          isPending={isPending}
                          onSubmit={(amount) =>
                            startTransition(() => registerPayment(r.id, r.amount_due, amount))
                          }
                        />
                        <PdfButton paymentId={r.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
