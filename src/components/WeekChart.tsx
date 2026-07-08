"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Record {
  amount: number;
  occurred_at: string;
}

export function WeekChart({ records }: { records: Record[] }) {
  const map = new Map<string, number>();

  for (const r of records) {
    const day = format(new Date(r.occurred_at), "yyyy-MM-dd");
    map.set(day, (map.get(day) ?? 0) + Number(r.amount));
  }

  const data = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = format(d, "yyyy-MM-dd");
    return {
      day: format(d, "EEE dd", { locale: es }),
      total: map.get(key) ?? 0,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#274654" vertical={false} />
        <XAxis
          dataKey="day"
          stroke="#ffffff60"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#ffffff60"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `S/${v}`}
        />
        <Tooltip
          contentStyle={{
            background: "#12262F",
            border: "1px solid #274654",
            borderRadius: 8,
            fontSize: 13,
          }}
          formatter={(value) => [`S/ ${Number(value).toFixed(2)}`, "Ingresos"]}
        />
        <Bar dataKey="total" fill="#F2A93B" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
