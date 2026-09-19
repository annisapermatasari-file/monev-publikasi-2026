"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type SessionRow = {
  sessionId: string;
  provinsi: string;
  program: "PKK" | "PKW";
  status: string;
  jumlahKonten: number | null;
  digunakan: boolean | null;
};

type Props = {
  rows: SessionRow[];
  provinces: string[];
};

const statusLabels: Record<string, string> = {
  BELUM_DIMULAI: "Belum dimulai",
  DRAFT: "Draft",
  SEDANG_DIKERJAKAN: "Dikerjakan",
  SUBMIT: "Submit",
  MENUNGGU_REVIEW: "Review",
  PERLU_PERBAIKAN: "Perlu perbaikan",
  DISETUJUI: "Disetujui",
};

const heatColors = ["#f1f5f9", "#dbeafe", "#93c5fd", "#3b82f6", "#1d4ed8"];

export function AnalyticsDashboard({ rows, provinces }: Props) {
  const [province, setProvince] = useState("SEMUA");
  const [program, setProgram] = useState("SEMUA");

  const filteredRows = useMemo(
    () =>
      rows.filter(
        (row) =>
          (province === "SEMUA" || row.provinsi === province) &&
          (program === "SEMUA" || row.program === program)
      ),
    [program, province, rows]
  );

  const provinceChart = useMemo(() => {
    const values = new Map<string, { lokasi: number; konten: number }>();
    const uniqueSessions = new Map(filteredRows.map((row) => [row.sessionId, row]));
    uniqueSessions.forEach((row) => {
      const current = values.get(row.provinsi) ?? { lokasi: 0, konten: 0 };
      current.lokasi += 1;
      values.set(row.provinsi, current);
    });
    filteredRows.forEach((row) => {
      const current = values.get(row.provinsi) ?? { lokasi: 0, konten: 0 };
      current.konten += row.jumlahKonten ?? (row.digunakan ? 1 : 0);
      values.set(row.provinsi, current);
    });
    return [...values.entries()].map(([name, value]) => ({ name, ...value }));
  }, [filteredRows]);

  const statusChart = useMemo(() => {
    const values = new Map<string, number>();
    const uniqueSessions = new Map(filteredRows.map((row) => [row.sessionId, row]));
    uniqueSessions.forEach((row) => values.set(row.status, (values.get(row.status) ?? 0) + 1));
    return [...values.entries()].map(([status, total]) => ({
      name: statusLabels[status] ?? status,
      total,
    }));
  }, [filteredRows]);

  const heatmap = useMemo(
    () =>
      provinces.map((name) =>
        ["PKK", "PKW"].map((programCode) => {
          const matchingRows = rows.filter(
            (row) => row.provinsi === name && row.program === programCode
          );
          const intensity = matchingRows.reduce(
            (total, row) => total + (row.jumlahKonten ?? (row.digunakan ? 1 : 0)),
            0
          );
          return { name, program: programCode, intensity };
        })
      ).flat(),
    [provinces, rows]
  );

  const maxIntensity = Math.max(...heatmap.map((cell) => cell.intensity), 1);
  const totalContent = filteredRows.reduce(
    (total, row) => total + (row.jumlahKonten ?? (row.digunakan ? 1 : 0)),
    0
  );

  return (
    <section className="mt-10" aria-labelledby="analytics-title">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Phase 5</p>
          <h2 id="analytics-title" className="mt-1 text-lg font-semibold text-slate-900">
            Analitik nasional
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Pantau cakupan monev dan intensitas publikasi per wilayah.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            aria-label="Filter provinsi"
            value={province}
            onChange={(event) => setProvince(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400 focus:bg-white"
          >
            <option value="SEMUA">Semua provinsi</option>
            {provinces.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select
            aria-label="Filter program"
            value={program}
            onChange={(event) => setProgram(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400 focus:bg-white"
          >
            <option value="SEMUA">Semua program</option>
            <option value="PKK">PKK</option>
            <option value="PKW">PKW</option>
          </select>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-900">Publikasi per provinsi</h3>
            <span className="text-xs text-slate-500">{totalContent} konten tercatat</span>
          </div>
          <div className="mt-4 h-64">
            {provinceChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={provinceChart} margin={{ left: -20, right: 8, bottom: 35 }}>
                  <CartesianGrid stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} height={55} tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="konten" name="Konten" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="pt-20 text-center text-sm text-slate-400">Belum ada sesi monev.</p>}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900">Status sesi monev</h3>
          <div className="mt-4 h-64">
            {statusChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusChart} dataKey="total" nameKey="name" innerRadius={55} outerRadius={88} paddingAngle={2}>
                    {statusChart.map((entry, index) => <Cell key={entry.name} fill={heatColors[(index % 4) + 1]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="pt-20 text-center text-sm text-slate-400">Belum ada sesi monev.</p>}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
            {statusChart.map((item) => <span key={item.name}>{item.name}: {item.total}</span>)}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-900">Heatmap intensitas publikasi</h3>
          <span className="text-xs text-slate-500">Jumlah konten atau kanal aktif</span>
        </div>
        <div className="mt-4 overflow-x-auto">
          <div className="min-w-[560px]">
            <div className="grid grid-cols-[minmax(180px,1fr)_repeat(2,100px)] gap-1 text-xs font-medium text-slate-500">
              <span className="p-2">Provinsi</span><span className="p-2 text-center">PKK</span><span className="p-2 text-center">PKW</span>
              {provinces.map((name) => (
                <div key={name} className="contents">
                  <span className="truncate p-2 text-slate-700">{name}</span>
                  {["PKK", "PKW"].map((code) => {
                    const cell = heatmap.find((item) => item.name === name && item.program === code)!;
                    const colorIndex = cell.intensity === 0 ? 0 : Math.min(4, Math.ceil((cell.intensity / maxIntensity) * 4));
                    return <span key={code} title={`${name}, ${code}: ${cell.intensity}`} className="rounded-md p-2 text-center font-semibold text-slate-700" style={{ backgroundColor: heatColors[colorIndex] }}>{cell.intensity}</span>;
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}