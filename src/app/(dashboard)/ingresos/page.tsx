import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { IncomeForm } from "./IncomeForm";
import { IncomeTable } from "./IncomeTable";

export default async function IngresosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: passengers }, { data: routes }, { data: records }] =
    await Promise.all([
      supabase
        .from("passengers")
        .select("*")
        .eq("driver_id", user?.id)
        .eq("active", true)
        .order("name"),
      supabase.from("routes").select("*").eq("driver_id", user?.id).order("name"),
      supabase
        .from("income_records")
        .select("id, amount, payment_method, occurred_at, notes, passengers(name), routes(name)")
        .eq("driver_id", user?.id)
        .order("occurred_at", { ascending: false })
        .limit(100),
    ]);

  return (
    <>
      <PageHeader
        title="Ingresos"
        subtitle="Registra cada carrera que realizas"
      />
      <div className="p-8 space-y-6">
        <IncomeForm passengers={passengers ?? []} routes={routes ?? []} />
        <div className="bg-petrol-900 border border-petrol-700 rounded-2xl overflow-hidden">
          <IncomeTable
            rows={(records ?? []).map((r) => ({
              ...r,
              passengers: Array.isArray(r.passengers) ? r.passengers[0] ?? null : r.passengers,
              routes: Array.isArray(r.routes) ? r.routes[0] ?? null : r.routes,
            }))}
          />
        </div>
      </div>
    </>
  );
}
