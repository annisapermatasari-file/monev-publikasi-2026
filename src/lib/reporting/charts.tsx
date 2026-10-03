import type { YesNoStat, ScaleStat, ProgramReport } from "./aggregate";

const SCALE_COLORS = ["#dc2626", "#f59e0b", "#84cc16", "#15803d"]; // 1..4: merah -> hijau
const SCALE_LABELS = ["Sangat Tidak Baik", "Tidak Baik", "Baik", "Sangat Baik"];

/** Horizontal bar chart Ya/Tidak (%) rendered as inline SVG. */
export function YesNoBarChart({ items, title }: { items: YesNoStat[]; title: string }) {
  if (items.length === 0) return <p className="text-sm text-slate-400">Belum ada data.</p>;
  const rowH = 28;
  const width = 560;
  const labelW = 200;
  const barMaxW = width - labelW - 50;
  const height = items.length * rowH + 10;

  return (
    <div className="overflow-x-auto">
      <p className="mb-2 text-sm font-medium text-slate-800">{title}</p>
      <svg width={width} height={height} role="img" aria-label={title}>
        {items.map((it, i) => {
          const y = i * rowH + 8;
          const barW = Math.max(2, (it.pct / 100) * barMaxW);
          const color = it.pct >= 75 ? "#15803d" : it.pct >= 50 ? "#84cc16" : it.pct >= 25 ? "#f59e0b" : "#dc2626";
          return (
            <g key={it.label}>
              <text x={0} y={y + 13} fontSize={11} fill="#334155">
                {it.label.length > 30 ? it.label.slice(0, 28) + "…" : it.label}
              </text>
              <rect x={labelW} y={y} width={barMaxW} height={16} fill="#f1f5f9" rx={3} />
              <rect x={labelW} y={y} width={barW} height={16} fill={color} rx={3} />
              <text x={labelW + barMaxW + 8} y={y + 13} fontSize={11} fill="#0f172a" fontWeight={600}>
                {it.pct}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** Stacked horizontal bar per indikator untuk skala 1-4 (Narasi/Visual). */
export function ScaleStackedChart({ items, title }: { items: ScaleStat[]; title: string }) {
  if (items.length === 0) return <p className="text-sm text-slate-400">Belum ada data.</p>;
  const rowH = 30;
  const width = 620;
  const labelW = 200;
  const barMaxW = width - labelW - 70;
  const height = items.length * rowH + 10;

  return (
    <div className="overflow-x-auto">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-800">{title}</p>
        <div className="flex flex-wrap gap-2 text-[10px] text-slate-500">
          {SCALE_LABELS.map((l, i) => (
            <span key={l} className="inline-flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-sm" style={{ background: SCALE_COLORS[i] }} /> {l}
            </span>
          ))}
        </div>
      </div>
      <svg width={width} height={height} role="img" aria-label={title}>
        {items.map((it, i) => {
          const y = i * rowH + 8;
          let x = labelW;
          return (
            <g key={it.label}>
              <text x={0} y={y + 13} fontSize={11} fill="#334155">
                {it.label.length > 30 ? it.label.slice(0, 28) + "…" : it.label}
              </text>
              <rect x={labelW} y={y} width={barMaxW} height={16} fill="#f1f5f9" rx={3} />
              {it.pct.map((p, idx) => {
                const w = (p / 100) * barMaxW;
                const seg = (
                  <rect key={idx} x={x} y={y} width={w} height={16} fill={SCALE_COLORS[idx]} />
                );
                x += w;
                return seg;
              })}
              <text x={labelW + barMaxW + 8} y={y + 13} fontSize={11} fill="#0f172a" fontWeight={600}>
                {it.avg}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** Heatmap LKP x Saluran untuk jumlah konten (Kinerja). */
export function KinerjaHeatmap({ kinerja, title }: { kinerja: ProgramReport["kinerja"]; title: string }) {
  if (kinerja.cells.length === 0) return <p className="text-sm text-slate-400">Belum ada data kinerja konten.</p>;
  const cellMap = new Map<string, number>();
  for (const c of kinerja.cells) cellMap.set(`${c.lkp}__${c.channel}`, c.jumlah);

  const cellW = 54;
  const cellH = 26;
  const labelW = 180;
  const headerH = 90;
  const width = labelW + kinerja.channelList.length * cellW + 10;
  const height = headerH + kinerja.lkpList.length * cellH + 10;

  function colorFor(v: number) {
    if (v <= 0) return "#f8fafc";
    const ratio = kinerja.max > 0 ? v / kinerja.max : 0;
    // interpolasi putih -> hijau tua
    const r = Math.round(240 - ratio * 190);
    const g = Math.round(249 - ratio * 90);
    const b = Math.round(240 - ratio * 190);
    return `rgb(${r},${g},${b})`;
  }

  return (
    <div className="overflow-x-auto">
      <p className="mb-2 text-sm font-medium text-slate-800">{title}</p>
      <svg width={width} height={height} role="img" aria-label={title}>
        {kinerja.channelList.map((ch, ci) => (
          <text
            key={ch}
            x={labelW + ci * cellW + cellW / 2}
            y={headerH - 8}
            fontSize={10}
            fill="#334155"
            textAnchor="end"
            transform={`rotate(-45 ${labelW + ci * cellW + cellW / 2} ${headerH - 8})`}
          >
            {ch.length > 18 ? ch.slice(0, 16) + "…" : ch}
          </text>
        ))}
        {kinerja.lkpList.map((lkp, ri) => (
          <g key={lkp}>
            <text x={0} y={headerH + ri * cellH + cellH / 2 + 4} fontSize={10} fill="#334155">
              {lkp.length > 24 ? lkp.slice(0, 22) + "…" : lkp}
            </text>
            {kinerja.channelList.map((ch, ci) => {
              const v = cellMap.get(`${lkp}__${ch}`) ?? 0;
              return (
                <g key={ch}>
                  <rect
                    x={labelW + ci * cellW}
                    y={headerH + ri * cellH}
                    width={cellW - 2}
                    height={cellH - 2}
                    fill={colorFor(v)}
                    stroke="#e2e8f0"
                  />
                  {v > 0 && (
                    <text
                      x={labelW + ci * cellW + (cellW - 2) / 2}
                      y={headerH + ri * cellH + cellH / 2 + 4}
                      fontSize={10}
                      textAnchor="middle"
                      fill="#0f172a"
                    >
                      {v}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        ))}
      </svg>
    </div>
  );
}
