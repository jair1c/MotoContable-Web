"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addPassenger(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "No hay sesión activa. Vuelve a iniciar sesión." };
  }

  const days = formData.getAll("days").map((d) => Number(d));

  const { error } = await supabase.from("passengers").insert({
    driver_id: user.id,
    name: formData.get("name") as string,
    phone: (formData.get("phone") as string) || null,
    fare_ida: Number(formData.get("fare_ida")) || 0,
    fare_vuelta: Number(formData.get("fare_vuelta")) || 0,
    days_of_week: days.length > 0 ? days : [1, 2, 3, 4, 5],
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/pasajeros");
  revalidatePath("/check-diario");
  return { error: null };
}

export async function toggleDay(id: string, currentDays: number[], day: number) {
  const supabase = await createClient();
  const newDays = currentDays.includes(day)
    ? currentDays.filter((d) => d !== day)
    : [...currentDays, day].sort();

  await supabase.from("passengers").update({ days_of_week: newDays }).eq("id", id);
  revalidatePath("/pasajeros");
  revalidatePath("/check-diario");
}

export async function togglePassenger(id: string, active: boolean) {
  const supabase = await createClient();
  await supabase.from("passengers").update({ active: !active }).eq("id", id);
  revalidatePath("/pasajeros");
  revalidatePath("/check-diario");
}

export async function deletePassenger(id: string) {
  const supabase = await createClient();
  await supabase.from("passengers").delete().eq("id", id);
  revalidatePath("/pasajeros");
  revalidatePath("/check-diario");
}
