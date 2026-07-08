import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { RouteClient } from "./RouteClient";

export default async function RutasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rows } = await supabase
    .from("routes")
    .select("id, name, origin, destination, default_fare")
    .eq("driver_id", user?.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <PageHeader title="Rutas" subtitle="Rutas frecuentes y su tarifa habitual" />
      <div className="p-8">
        <RouteClient rows={rows ?? []} />
      </div>
    </>
  );
}
