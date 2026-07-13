"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { formatISO } from "date-fns";

// Idempotente a propósito: en vez de "voltear" el tramo, recibe el estado
// deseado (marcado o no). Así es seguro reintentarlo desde la cola offline
// sin arriesgarse a desordenar los taps si se reenvían fuera de orden.
export async function setLeg(
  passengerId: string,
  leg: "ida" | "vuelta",
  marked: boolean,
  amount: number,
  date?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No hay sesión activa");

  const legDate = date ?? formatISO(new Date(), { representation: "date" });

  const { data: existing } = await supabase
    .from("trip_legs")
    .select("id")
    .eq("passenger_id", passengerId)
    .eq("leg_date", legDate)
    .eq("leg", leg)
    .maybeSingle();

  if (marked && !existing) {
    await supabase.from("trip_legs").insert({
      driver_id: user.id,
      passenger_id: passengerId,
      leg_date: legDate,
      leg,
      amount,
    });
  } else if (!marked && existing) {
    await supabase.from("trip_legs").delete().eq("id", existing.id);
  }
  // si ya estaba en el estado pedido, no hace nada — es idempotente

  revalidatePath("/check-diario");
  revalidatePath("/dashboard");
  revalidatePath("/pagos-semanales");
}
