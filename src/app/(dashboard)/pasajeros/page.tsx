import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { PassengerClient } from "./PassengerClient";

export default async function PasajerosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rows } = await supabase
    .from("passengers")
    .select("id, name, phone, fare_ida, fare_vuelta, days_of_week, active")
    .eq("driver_id", user?.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <PageHeader title="Pasajeros" subtitle="Alumnos y profesor con tarifa fija por tramo" />
      <div className="p-5 md:p-8">
        <PassengerClient rows={rows ?? []} />
      </div>
    </>
  );
}
