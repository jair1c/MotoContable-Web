"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { formatISO } from "date-fns";

export async function toggleLeg(
  passengerId: string,
  leg: "ida" | "vuelta",
  amount: number,
  date?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const legDate = date ?? formatISO(new Date(), { representation: "date" });

  const { data: existing } = await supabase
    .from("trip_legs")
    .select("id")
    .eq("passenger_id", passengerId)
    .eq("leg_date", legDate)
    .eq("leg", leg)
    .maybeSingle();

  if (existing) {
    await supabase.from("trip_legs").delete().eq("id", existing.id);
  } else {
    await supabase.from("trip_legs").insert({
      driver_id: user.id,
      passenger_id: passengerId,
      leg_date: legDate,
      leg,
      amount,
    });
  }

  revalidatePath("/check-diario");
  revalidatePath("/dashboard");
  revalidatePath("/pagos-semanales");
}
