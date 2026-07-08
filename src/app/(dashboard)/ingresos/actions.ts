"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addIncome(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const amount = Number(formData.get("amount"));
  const paymentMethod = formData.get("payment_method") as string;
  const passengerId = formData.get("passenger_id") as string;
  const routeId = formData.get("route_id") as string;
  const notes = formData.get("notes") as string;

  await supabase.from("income_records").insert({
    driver_id: user.id,
    amount,
    payment_method: paymentMethod || "efectivo",
    passenger_id: passengerId || null,
    route_id: routeId || null,
    notes: notes || null,
  });

  revalidatePath("/ingresos");
  revalidatePath("/dashboard");
}

export async function deleteIncome(id: string) {
  const supabase = await createClient();
  await supabase.from("income_records").delete().eq("id", id);
  revalidatePath("/ingresos");
  revalidatePath("/dashboard");
}
