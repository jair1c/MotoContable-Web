"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addPassenger(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const routeId = formData.get("route_id") as string;
  const weeklyRate = formData.get("weekly_rate") as string;

  await supabase.from("passengers").insert({
    driver_id: user.id,
    name: formData.get("name") as string,
    phone: (formData.get("phone") as string) || null,
    route_id: routeId || null,
    weekly_rate: weeklyRate ? Number(weeklyRate) : null,
  });

  revalidatePath("/pasajeros");
}

export async function togglePassenger(id: string, active: boolean) {
  const supabase = await createClient();
  await supabase.from("passengers").update({ active: !active }).eq("id", id);
  revalidatePath("/pasajeros");
}

export async function deletePassenger(id: string) {
  const supabase = await createClient();
  await supabase.from("passengers").delete().eq("id", id);
  revalidatePath("/pasajeros");
}
