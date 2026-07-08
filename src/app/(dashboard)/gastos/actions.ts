"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addExpense(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("expenses").insert({
    driver_id: user.id,
    category: formData.get("category") as string,
    amount: Number(formData.get("amount")),
    description: (formData.get("description") as string) || null,
  });

  revalidatePath("/gastos");
  revalidatePath("/dashboard");
}

export async function deleteExpense(id: string) {
  const supabase = await createClient();
  await supabase.from("expenses").delete().eq("id", id);
  revalidatePath("/gastos");
  revalidatePath("/dashboard");
}
