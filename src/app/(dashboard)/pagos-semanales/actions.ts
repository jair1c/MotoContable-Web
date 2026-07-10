"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { startOfWeek, endOfWeek, formatISO } from "date-fns";

// Suma los tramos (ida/vuelta) marcados esta semana por cada pasajero fijo,
// arrastra cualquier saldo pendiente de semanas anteriores, y genera/actualiza
// su liquidación semanal con el monto real.
export async function generateCurrentWeek() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const now = new Date();
  const weekStart = formatISO(startOfWeek(now, { weekStartsOn: 1 }), {
    representation: "date",
  });
  const weekEnd = formatISO(endOfWeek(now, { weekStartsOn: 1 }), {
    representation: "date",
  });

  // 1. Arrastrar saldos pendientes/parciales de semanas anteriores
  const carryover = new Map<string, number>();
  const { data: overdue } = await supabase
    .from("weekly_payments")
    .select("id, passenger_id, amount_due, amount_paid")
    .eq("driver_id", user.id)
    .in("status", ["pendiente", "parcial"])
    .lt("week_start", weekStart);

  for (const payment of overdue ?? []) {
    const remaining = Number(payment.amount_due) - Number(payment.amount_paid);
    if (remaining > 0) {
      carryover.set(
        payment.passenger_id,
        (carryover.get(payment.passenger_id) ?? 0) + remaining
      );
      await supabase
        .from("weekly_payments")
        .update({
          status: "trasladado",
          amount_paid: payment.amount_due, // se salda aquí, el saldo sigue vivo en la próxima
          note: `Saldo de S/ ${remaining.toFixed(2)} trasladado a la semana del ${weekStart}`,
        })
        .eq("id", payment.id);
    }
  }

  // 2. Tramos de esta semana que todavía no están ligados a una liquidación
  const { data: legs } = await supabase
    .from("trip_legs")
    .select("id, passenger_id, amount")
    .eq("driver_id", user.id)
    .is("weekly_payment_id", null)
    .gte("leg_date", weekStart)
    .lte("leg_date", weekEnd);

  const byPassenger = new Map<string, { legIds: string[]; total: number }>();
  for (const leg of legs ?? []) {
    const entry = byPassenger.get(leg.passenger_id) ?? { legIds: [], total: 0 };
    entry.legIds.push(leg.id);
    entry.total += Number(leg.amount);
    byPassenger.set(leg.passenger_id, entry);
  }

  // Combinar pasajeros con tramos nuevos y/o saldo arrastrado
  const passengerIds = new Set([
    ...Array.from(byPassenger.keys()),
    ...Array.from(carryover.keys()),
  ]);
  if (passengerIds.size === 0) {
    revalidatePath("/pagos-semanales");
    return;
  }

  for (const passengerId of Array.from(passengerIds)) {
    const legInfo = byPassenger.get(passengerId);
    const carryAmount = carryover.get(passengerId) ?? 0;
    const total = (legInfo?.total ?? 0) + carryAmount;
    const legIds = legInfo?.legIds ?? [];

    const { data: existingPayment } = await supabase
      .from("weekly_payments")
      .select("id, amount_due, amount_paid, status, paid_at")
      .eq("driver_id", user.id)
      .eq("passenger_id", passengerId)
      .eq("week_start", weekStart)
      .maybeSingle();

    let paymentId = existingPayment?.id;

    if (existingPayment) {
      const newAmountDue = Number(existingPayment.amount_due) + total;
      const currentPaid = Number(existingPayment.amount_paid ?? 0);
      const newStatus =
        currentPaid >= newAmountDue && newAmountDue > 0
          ? "pagado"
          : currentPaid > 0
          ? "parcial"
          : "pendiente";

      await supabase
        .from("weekly_payments")
        .update({
          amount_due: newAmountDue,
          status: newStatus,
          // si dejó de estar totalmente pagado, ya no aplica la fecha de pago
          paid_at: newStatus === "pagado" ? existingPayment.paid_at ?? new Date().toISOString() : null,
        })
        .eq("id", existingPayment.id);
    } else {
      const { data: created } = await supabase
        .from("weekly_payments")
        .insert({
          driver_id: user.id,
          passenger_id: passengerId,
          week_start: weekStart,
          week_end: weekEnd,
          amount_due: total,
          note:
            carryAmount > 0
              ? `Incluye S/ ${carryAmount.toFixed(2)} de saldo pendiente anterior`
              : null,
        })
        .select("id")
        .single();
      paymentId = created?.id;
    }

    if (paymentId && legIds.length > 0) {
      await supabase
        .from("trip_legs")
        .update({ weekly_payment_id: paymentId })
        .in("id", legIds);
    }
  }

  revalidatePath("/pagos-semanales");
  revalidatePath("/dashboard");
}

// Registra un pago (total o parcial) sobre una liquidación semanal
export async function registerPayment(id: string, amountDue: number, amountPaid: number) {
  const supabase = await createClient();

  const clamped = Math.max(0, Math.min(amountPaid, amountDue));
  const status = clamped >= amountDue ? "pagado" : clamped > 0 ? "parcial" : "pendiente";

  await supabase
    .from("weekly_payments")
    .update({
      status,
      amount_paid: clamped,
      paid_at: status === "pagado" ? new Date().toISOString() : null,
    })
    .eq("id", id);

  revalidatePath("/pagos-semanales");
  revalidatePath("/dashboard");
}
