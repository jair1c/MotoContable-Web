import { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "amber",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  accent?: "amber" | "teal" | "signal";
}) {
  const accentClasses = {
    amber: "text-amber-400 bg-amber-400/10",
    teal: "text-teal bg-teal/10",
    signal: "text-signal bg-signal/10",
  }[accent];

  return (
    <div className="bg-petrol-900 border border-petrol-700 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs uppercase tracking-wider text-white/40">
          {label}
        </span>
        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${accentClasses}`}>
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>
      </div>
      <p className="font-mono tabular text-2xl font-medium">{value}</p>
    </div>
  );
}
