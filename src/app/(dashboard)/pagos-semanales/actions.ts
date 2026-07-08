"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { startOfWeek, endOfWeek, formatISO } from "date-fns";

// Suma los tramos (ida/vuelta) marcados esta semana por cada pasajero fijo
// y genera (o actualiza) su liquidación semanal con el monto real.
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

  // Tramos de esta semana que todavía no están ligados a una liquidación
  const { data: legs } = await supabase
    .from("trip_legs")
    .select("id, passenger_id, amount")
    .eq("driver_id", user.id)
    .is("weekly_payment_id", null)
    .gte("leg_date", weekStart)
    .lte("leg_date", weekEnd);

  if (!legs || legs.length === 0) {
    revalidatePath("/pagos-semanales");
    return;
  }

  const byPassenger = new Map<string, { legIds: string[]; total: number }>();
  for (const leg of legs) {
    const entry = byPassenger.get(leg.passenger_id) ?? { legIds: [], total: 0 };
    entry.legIds.push(leg.id);
    entry.total += Number(leg.amount);
    byPassenger.set(leg.passenger_id, entry);
  }

  for (const [passengerId, { legIds, total }] of Array.from(byPassenger)) {
    // ¿Ya existe una liquidación pendiente para este pasajero esta semana?
    const { data: existingPayment } = await supabase
      .from("weekly_payments")
      .select("id, amount_due, status")
      .eq("driver_id", user.id)
      .eq("passenger_id", passengerId)
      .eq("week_start", weekStart)
      .maybeSingle();

    let paymentId = existingPayment?.id;

    if (existingPayment) {
      await supabase
        .from("weekly_payments")
        .update({ amount_due: Number(existingPayment.amount_due) + total })
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
        })
        .select("id")
        .single();
      paymentId = created?.id;
    }

    if (paymentId) {
      await supabase
        .from("trip_legs")
        .update({ weekly_payment_id: paymentId })
        .in("id", legIds);
    }
  }

  revalidatePath("/pagos-semanales");
}

export async function markPaid(id: string, amountDue: number) {
  const supabase = await createClient();
  await supabase
    .from("weekly_payments")
    .update({
      status: "pagado",
      amount_paid: amountDue,
      paid_at: new Date().toISOString(),
    })
    .eq("id", id);

  revalidatePath("/pagos-semanales");
  revalidatePath("/dashboard");
}
