export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-8 h-16 border-b border-petrol-700 sticky top-0 bg-petrol-950/90 backdrop-blur z-10">
      <div>
        <h1 className="font-display text-lg font-semibold leading-none">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-white/40 mt-1">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
