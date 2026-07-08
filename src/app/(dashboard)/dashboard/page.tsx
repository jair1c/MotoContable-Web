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
  const todayStart = formatISO(startOfDay(now));
  const weekStart = formatISO(startOfWeek(now, { weekStartsOn: 1 }));
  const monthStart = formatISO(startOfMonth(now));

  const [todayIncome, weekIncome, monthExpenses, pendingPayments, last7] =
    await Promise.all([
      supabase
        .from("income_records")
        .select("amount")
        .eq("driver_id", user?.id)
        .gte("occurred_at", todayStart),
      supabase
        .from("income_records")
        .select("amount")
        .eq("driver_id", user?.id)
        .gte("occurred_at", weekStart),
      supabase
        .from("expenses")
        .select("amount")
        .eq("driver_id", user?.id)
        .gte("occurred_at", monthStart),
      supabase
        .from("weekly_payments")
        .select("amount_due, amount_paid")
        .eq("driver_id", user?.id)
        .in("status", ["pendiente", "parcial"]),
      supabase
        .from("income_records")
        .select("amount, occurred_at")
        .eq("driver_id", user?.id)
        .gte("occurred_at", formatISO(new Date(now.getTime() - 6 * 86400000))),
    ]);

  const sum = (rows: { amount: number }[] | null) =>
    (rows ?? []).reduce((acc, r) => acc + Number(r.amount), 0);

  const todayTotal = sum(todayIncome.data);
  const weekTotal = sum(weekIncome.data);
  const expensesTotal = sum(monthExpenses.data);
  const pendingTotal = (pendingPayments.data ?? []).reduce(
    (acc, p) => acc + (Number(p.amount_due) - Number(p.amount_paid)),
    0
  );

  return (
    <>
      <PageHeader
        title="Panel"
        subtitle="Resumen de tu actividad reciente"
      />
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Hoy" value={soles(todayTotal)} icon={Wallet} accent="amber" />
          <StatCard label="Esta semana" value={soles(weekTotal)} icon={TrendingUp} accent="teal" />
          <StatCard label="Gastos del mes" value={soles(expensesTotal)} icon={Receipt} accent="signal" />
          <StatCard label="Pagos pendientes" value={soles(pendingTotal)} icon={AlertCircle} accent="signal" />
        </div>

        <div className="bg-petrol-900 border border-petrol-700 rounded-2xl p-6">
          <h2 className="font-display font-semibold mb-4">Últimos 7 días</h2>
          <WeekChart records={last7.data ?? []} />
        </div>
      </div>
    </>
  );
}
