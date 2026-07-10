import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { WeeklyClient } from "./WeeklyClient";

export default async function PagosSemanalesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rows } = await supabase
    .from("weekly_payments")
    .select("id, week_start, week_end, amount_due, amount_paid, status, note, passengers(name)")
    .eq("driver_id", user?.id)
    .order("week_start", { ascending: false });

  return (
    <>
      <PageHeader
        title="Pagos semanales"
        subtitle="Liquidación de pasajeros con tarifa fija"
      />
      <div className="p-5 md:p-8">
        <WeeklyClient
          rows={(rows ?? []).map((r) => ({
            ...r,
            passengers: Array.isArray(r.passengers) ? r.passengers[0] ?? null : r.passengers,
          }))}
        />
      </div>
    </>
  );
}
