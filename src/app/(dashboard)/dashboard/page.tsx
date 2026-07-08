import { Wallet, Receipt, TrendingUp, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { WeekChart } from "@/components/WeekChart";
import { startOfWeek, startOfMonth, startOfDay, formatISO } from "date-fns";

function soles(n: number) {
  return `S/ ${n.toFixed(2)}`;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const now = new Date();
  const todayDate = formatISO(startOfDay(now), { representation: "date" });
  const weekStartDate = formatISO(startOfWeek(now, { weekStartsOn: 1 }), {
    representation: "date",
  });
  const monthStartISO = formatISO(startOfMonth(now));
  const sevenDaysAgoDate = formatISO(new Date(now.getTime() - 6 * 86400000), {
    representation: "date",
  });

  const [
    todayLegs,
    todayExtras,
    weekLegs,
    weekExtras,
    monthExpenses,
    pendingPayments,
    last7Legs,
    last7Extras,
  ] = await Promise.all([
    supabase.from("trip_legs").select("amount").eq("driver_id", user?.id).eq("leg_date", todayDate),
    supabase
      .from("extras")
      .select("amount")
      .eq("driver_id", user?.id)
      .gte("occurred_at", formatISO(startOfDay(now))),
    supabase.from("trip_legs").select("amount").eq("driver_id", user?.id).gte("leg_date", weekStartDate),
    supabase.from("extras").select("amount").eq("driver_id", user?.id).gte("occurred_at", formatISO(startOfWeek(now, { weekStartsOn: 1 }))),
    supabase.from("expenses").select("amount").eq("driver_id", user?.id).gte("occurred_at", monthStartISO),
    supabase
      .from("weekly_payments")
      .select("amount_due, amount_paid")
      .eq("driver_id", user?.id)
      .in("status", ["pendiente", "parcial"]),
    supabase
      .from("trip_legs")
      .select("amount, leg_date")
      .eq("driver_id", user?.id)
      .gte("leg_date", sevenDaysAgoDate),
    supabase
      .from("extras")
      .select("amount, occurred_at")
      .eq("driver_id", user?.id)
      .gte("occurred_at", formatISO(new Date(now.getTime() - 6 * 86400000))),
  ]);

  const sum = (rows: { amount: number }[] | null) =>
    (rows ?? []).reduce((acc, r) => acc + Number(r.amount), 0);

  const todayTotal = sum(todayLegs.data) + sum(todayExtras.data);
  const weekTotal = sum(weekLegs.data) + sum(weekExtras.data);
  const expensesTotal = sum(monthExpenses.data);
  const pendingTotal = (pendingPayments.data ?? []).reduce(
    (acc, p) => acc + (Number(p.amount_due) - Number(p.amount_paid)),
    0
  );

  const chartRecords = [
    ...(last7Legs.data ?? []).map((l) => ({ amount: l.amount, occurred_at: l.leg_date })),
    ...(last7Extras.data ?? []).map((e) => ({ amount: e.amount, occurred_at: e.occurred_at })),
  ];

  return (
    <>
      <PageHeader title="Panel" subtitle="Resumen de tu actividad reciente" />
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Hoy" value={soles(todayTotal)} icon={Wallet} accent="amber" />
          <StatCard label="Esta semana" value={soles(weekTotal)} icon={TrendingUp} accent="teal" />
          <StatCard label="Gastos del mes" value={soles(expensesTotal)} icon={Receipt} accent="signal" />
          <StatCard label="Pagos pendientes" value={soles(pendingTotal)} icon={AlertCircle} accent="signal" />
        </div>

        <div className="bg-petrol-900 border border-petrol-700 rounded-2xl p-6">
          <h2 className="font-display font-semibold mb-4">Últimos 7 días</h2>
          <WeekChart records={chartRecords} />
        </div>
      </div>
    </>
  );
}
