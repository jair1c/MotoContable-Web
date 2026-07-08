"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { startOfWeek, endOfWeek, formatISO } from "date-fns";

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

  const { data: passengers } = await supabase
    .from("passengers")
    .select("id, weekly_rate")
    .eq("driver_id", user.id)
    .eq("active", true)
    .not("weekly_rate", "is", null);

  const { data: existing } = await supabase
    .from("weekly_payments")
    .select("passenger_id")
    .eq("driver_id", user.id)
    .eq("week_start", weekStart);

  const existingIds = new Set((existing ?? []).map((e) => e.passenger_id));

  const toInsert = (passengers ?? [])
    .filter((p) => !existingIds.has(p.id))
    .map((p) => ({
      driver_id: user.id,
      passenger_id: p.id,
      week_start: weekStart,
      week_end: weekEnd,
      amount_due: p.weekly_rate,
    }));

  if (toInsert.length > 0) {
    await supabase.from("weekly_payments").insert(toInsert);
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
