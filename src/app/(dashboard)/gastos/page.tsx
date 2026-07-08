import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { ExpenseClient } from "./ExpenseClient";

export default async function GastosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rows } = await supabase
    .from("expenses")
    .select("id, category, amount, description, occurred_at")
    .eq("driver_id", user?.id)
    .order("occurred_at", { ascending: false })
    .limit(100);

  return (
    <>
      <PageHeader title="Gastos" subtitle="Combustible, mantenimiento y más" />
      <div className="p-8">
        <ExpenseClient rows={rows ?? []} />
      </div>
    </>
  );
}
