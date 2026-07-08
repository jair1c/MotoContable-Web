"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addRoute(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const defaultFare = formData.get("default_fare") as string;

  await supabase.from("routes").insert({
    driver_id: user.id,
    name: formData.get("name") as string,
    origin: (formData.get("origin") as string) || null,
    destination: (formData.get("destination") as string) || null,
    default_fare: defaultFare ? Number(defaultFare) : null,
  });

  revalidatePath("/rutas");
}

export async function deleteRoute(id: string) {
  const supabase = await createClient();
  await supabase.from("routes").delete().eq("id", id);
  revalidatePath("/rutas");
}
