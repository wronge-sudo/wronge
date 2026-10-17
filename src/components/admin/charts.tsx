import { taka } from "@/lib/format";

/** Daily revenue bars with order counts. Pure SVG, server-rendered. */
export function RevenueChart({ series }: { series: { day: string; orders: number; revenue: number }[] }) {
  const W = 720;
  const H = 220;
  const pad = { l: 8, r: 8, t: 16, b: 26 };
  const max = Math.max(...series.map((d) => d.revenue), 1);
  const bw = (W - pad.l - pad.r) / series.length;
  const label = (day: string) => new Date(`${day}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
  const every = Math.ceil(series.length / 8);
  const totalOrders = series.reduce((s, d) => s + d.orders, 0);

  if (totalOrders === 0) {
    return (
      <div className="grid h-[220px] place-items-center rounded-xl bg-paper-2/60 text-sm text-muted">
        No orders in this period yet. They will show up here.
      </div>
    );
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Revenue per day">
      {[0.25, 0.5, 0.75, 1].map((g) => (
        <line key={g} x1={pad.l} x2={W - pad.r} y1={pad.t + (H - pad.t - pad.b) * (1 - g)} y2={pad.t + (H - pad.t - pad.b) * (1 - g)} stroke="#e9e8e3" />
      ))}
      {series.map((d, i) => {
        const h = ((H - pad.t - pad.b) * d.revenue) / max;
        const x = pad.l + i * bw;
        return (
          <g key={d.day}>
            <title>{`${label(d.day)}: ${taka(d.revenue)} · ${d.orders} order${d.orders === 1 ? "" : "s"}`}</title>
            <rect x={x} y={pad.t} width={bw} height={H - pad.t - pad.b} fill="transparent" />
            <rect x={x + bw * 0.16} y={H - pad.b - h} width={bw * 0.68} height={Math.max(h, d.orders ? 2 : 0)} rx={Math.min(4, bw * 0.2)} fill={d.revenue ? "#0b0b0b" : "#d8d7d1"} />
            {i % every === 0 && (
              <text x={x + bw / 2} y={H - 8} textAnchor="middle" fontSize="10" fill="#6b6a64" fontFamily="var(--font-jetbrains)">
                {label(d.day)}
              </text>
            )}
          </g>
        );
      })}
      <text x={W - pad.r} y={11} textAnchor="end" fontSize="10" fill="#6b6a64" fontFamily="var(--font-jetbrains)">
        peak {taka(max)}
      </text>
    </svg>
  );
}

/** Stacked status bar. */
export function StatusBar({ status, colors }: { status: Record<string, number>; colors: Record<string, string> }) {
  const total = Object.values(status).reduce((a, b) => a + b, 0);
  if (!total) return <div className="h-3 rounded-full bg-paper-2" />;
  return (
    <div className="flex h-3 overflow-hidden rounded-full bg-paper-2">
      {Object.entries(status).map(([s, n]) => (
        <div key={s} className={colors[s]} style={{ width: `${(n / total) * 100}%` }} title={`${s}: ${n}`} />
      ))}
    </div>
  );
}
