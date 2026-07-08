import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { PassengerClient } from "./PassengerClient";

export default async function PasajerosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: rows }, { data: routes }] = await Promise.all([
    supabase
      .from("passengers")
      .select("id, name, phone, weekly_rate, active, routes(name)")
      .eq("driver_id", user?.id)
      .order("created_at", { ascending: false }),
    supabase.from("routes").select("*").eq("driver_id", user?.id).order("name"),
  ]);

  return (
    <>
      <PageHeader title="Pasajeros" subtitle="Clientes frecuentes y tarifas semanales" />
      <div className="p-8">
        <PassengerClient
          rows={(rows ?? []).map((r) => ({
            ...r,
            routes: Array.isArray(r.routes) ? r.routes[0] ?? null : r.routes,
          }))}
          routes={routes ?? []}
        />
      </div>
    </>
  );
}
