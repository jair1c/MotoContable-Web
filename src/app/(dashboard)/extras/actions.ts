"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addExtra(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("extras").insert({
    driver_id: user.id,
    amount: Number(formData.get("amount")),
    payment_method: (formData.get("payment_method") as string) || "efectivo",
    note: (formData.get("note") as string) || null,
  });

  revalidatePath("/extras");
  revalidatePath("/dashboard");
}

export async function deleteExtra(id: string) {
  const supabase = await createClient();
  await supabase.from("extras").delete().eq("id", id);
  revalidatePath("/extras");
  revalidatePath("/dashboard");
}
