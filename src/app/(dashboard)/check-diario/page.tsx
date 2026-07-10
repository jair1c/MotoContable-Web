import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { CheckDiarioClient } from "./CheckDiarioClient";
import { formatISO, getISODay } from "date-fns";

export default async function CheckDiarioPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const date = params.date ?? formatISO(new Date(), { representation: "date" });
  const isoDay = getISODay(new Date(date + "T00:00:00")); // 1=lunes ... 7=domingo

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: allPassengers }, { data: legs }] = await Promise.all([
    supabase
      .from("passengers")
      .select("*")
      .eq("driver_id", user?.id)
      .eq("active", true)
      .order("name"),
    supabase
      .from("trip_legs")
      .select("passenger_id, leg")
      .eq("driver_id", user?.id)
      .eq("leg_date", date),
  ]);

  const passengers = (allPassengers ?? []).filter((p) =>
    (p.days_of_week ?? [1, 2, 3, 4, 5]).includes(isoDay)
  );

  return (
    <>
      <PageHeader
        title="Check diario"
        subtitle="Marca ida y vuelta de cada pasajero fijo"
      />
      <div className="p-5 md:p-8">
        <CheckDiarioClient
          passengers={passengers}
          legsToday={legs ?? []}
          date={date}
        />
      </div>
    </>
  );
}
