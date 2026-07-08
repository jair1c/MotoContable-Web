import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { ExtrasClient } from "./ExtrasClient";

export default async function ExtrasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rows } = await supabase
    .from("extras")
    .select("id, amount, payment_method, note, occurred_at")
    .eq("driver_id", user?.id)
    .order("occurred_at", { ascending: false })
    .limit(100);

  return (
    <>
      <PageHeader title="Extras" subtitle="Carreras sueltas cobradas al momento" />
      <div className="p-8">
        <ExtrasClient rows={rows ?? []} />
      </div>
    </>
  );
}
