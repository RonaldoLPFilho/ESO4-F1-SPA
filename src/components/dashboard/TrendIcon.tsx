import { Card } from "./Cards";

function TrendIcon({ delta }: { delta?: number }) {
  if (delta == null) return null;
  const up = delta > 0;
  const down = delta < 0;
  const neutral = delta === 0;
  return (
    <span
      className={`inline-flex items-center text-xs ml-2 ${
        up ? "text-emerald-600" : down ? "text-rose-600" : "text-slate-500"
      }`}
    >
      {up ? "↑" : down ? "↓" : "→"}
    </span>
  );
}

export function StatCard({
  title,
  value,
  subtitle,
  tone,
  delta,
}: {
  title: string;
  value: string;
  subtitle?: string;
  tone?: "default" | "good" | "bad";
  delta?: number;
}) {
  return (
    <Card tone={tone} className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-600">{title}</p>
          <p className="text-3xl font-semibold mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
        <TrendIcon delta={delta} />
      </div>
    </Card>
  );
}
