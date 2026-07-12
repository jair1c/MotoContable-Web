import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { differenceInCalendarDays, formatISO } from "date-fns";

export async function PendingBanner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const today = formatISO(new Date(), { representation: "date" });

  const [overduePayments, pendingExtras] = await Promise.all([
    supabase
      .from("weekly_payments")
      .select("id, amount_due, amount_paid, week_end, passengers(name)")
      .eq("driver_id", user.id)
      .in("status", ["pendiente", "parcial"])
      .lt("week_end", today),
    supabase
      .from("extras")
      .select("id, amount, occurred_at")
      .eq("driver_id", user.id)
      .eq("paid", false),
  ]);

  const payments = overduePayments.data ?? [];
  const extras = pendingExtras.data ?? [];

  const paymentsTotal = payments.reduce(
    (acc, p) => acc + (Number(p.amount_due) - Number(p.amount_paid)),
    0
  );
  const extrasTotal = extras.reduce((acc, e) => acc + Number(e.amount), 0);
  const total = paymentsTotal + extrasTotal;

  if (total <= 0) return null;

  // El pasajero/extra que lleva más días debiendo, para dar contexto rápido
  const oldestPaymentDays = payments.length
    ? Math.max(
        ...payments.map((p) => differenceInCalendarDays(new Date(), new Date(p.week_end)))
      )
    : 0;
  const oldestExtraDays = extras.length
    ? Math.max(
        ...extras.map((e) => differenceInCalendarDays(new Date(), new Date(e.occurred_at)))
      )
    : 0;
  const oldestDays = Math.max(oldestPaymentDays, oldestExtraDays);

  const itemCount = payments.length + extras.length;

  return (
    <Link
      href="/pagos-semanales"
      className="flex items-center justify-between gap-3 px-4 md:px-8 py-2.5 bg-signal/10 border-b border-signal/20 hover:bg-signal/15 transition-colors"
    >
      <div className="flex items-center gap-2 min-w-0">
        <AlertTriangle className="h-4 w-4 text-signal shrink-0" strokeWidth={2} />
        <p className="text-xs md:text-sm text-signal truncate">
          <span className="font-semibold">S/ {total.toFixed(2)} pendientes</span>
          {" · "}
          {itemCount} {itemCount === 1 ? "cobro" : "cobros"} por cobrar
          {oldestDays > 0 && (
            <span className="text-signal/70">
              {" "}
              · el más antiguo lleva {oldestDays} {oldestDays === 1 ? "día" : "días"}
            </span>
          )}
        </p>
      </div>
      <span className="text-xs text-signal/70 shrink-0 hidden sm:inline">Ver detalle →</span>
    </Link>
  );
}
