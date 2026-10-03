import { db } from "@/db";
import {
  monevSessions,
  locations,
  programs,
  indicators,
  indicatorResponses,
  channelAudits,
  publicationChannels,
  publicationEvidence,
  evidenceTypes,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export type ProgramCode = "PKK" | "PKW";

export type YesNoStat = {
  label: string;
  urutan: number;
  yes: number;
  total: number;
  pct: number; // 0-100, rounded
};

export type ScaleStat = {
  label: string;
  urutan: number;
  total: number;
  // index 0..3 = skor 1..4 (1 = Sangat Tidak Baik, 4 = Sangat Baik)
  counts: [number, number, number, number];
  pct: [number, number, number, number];
  avg: number;
};

export type HeatCell = { lkp: string; channel: string; jumlah: number };

export type ProgramReport = {
  code: ProgramCode;
  name: string;
  lkpCount: number;
  provinsi: { provinsi: string; count: number }[];
  keterpenuhan: YesNoStat[];
  saluranInternal: YesNoStat[];
  saluranEksternal: YesNoStat[];
  bukti: YesNoStat[];
  kepatuhan: YesNoStat[];
  kinerja: { lkpList: string[]; channelList: string[]; cells: HeatCell[]; max: number };
  narasi: ScaleStat[];
  visual: ScaleStat[];
};

export type AggregateReportData = {
  generatedAt: Date;
  periode: string;
  totalLkp: number;
  programs: ProgramReport[]; // urutan tampil: PKW dulu, lalu PKK (mengikuti contoh laporan)
};

function pct(part: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}

export async function buildAggregateReport(periode = "2026"): Promise<AggregateReportData> {
  const sessionRows = await db
    .select({
      id: monevSessions.id,
      programCode: programs.code,
      locationName: locations.namaLembaga,
      provinsi: locations.provinsi,
    })
    .from(monevSessions)
    .innerJoin(locations, eq(monevSessions.locationId, locations.id))
    .innerJoin(programs, eq(monevSessions.programId, programs.id))
    .where(eq(monevSessions.status, "DISETUJUI"));

  const sessionsByProgram = new Map<ProgramCode, typeof sessionRows>();
  for (const row of sessionRows) {
    const list = sessionsByProgram.get(row.programCode) ?? [];
    list.push(row);
    sessionsByProgram.set(row.programCode, list);
  }

  const responseRows = await db
    .select({
      sessionId: indicatorResponses.sessionId,
      programCode: programs.code,
      category: indicators.category,
      label: indicators.label,
      urutan: indicators.urutan,
      boolValue: indicatorResponses.boolValue,
      scaleValue: indicatorResponses.scaleValue,
    })
    .from(indicatorResponses)
    .innerJoin(indicators, eq(indicatorResponses.indicatorId, indicators.id))
    .innerJoin(monevSessions, eq(indicatorResponses.sessionId, monevSessions.id))
    .innerJoin(programs, eq(monevSessions.programId, programs.id))
    .where(eq(monevSessions.status, "DISETUJUI"));

  const channelRows = await db
    .select({
      sessionId: channelAudits.sessionId,
      programCode: programs.code,
      locationName: locations.namaLembaga,
      channelName: publicationChannels.name,
      channelType: publicationChannels.type,
      urutan: publicationChannels.urutan,
      digunakan: channelAudits.digunakan,
      jumlahKonten: channelAudits.jumlahKonten,
    })
    .from(channelAudits)
    .innerJoin(publicationChannels, eq(channelAudits.channelId, publicationChannels.id))
    .innerJoin(monevSessions, eq(channelAudits.sessionId, monevSessions.id))
    .innerJoin(programs, eq(monevSessions.programId, programs.id))
    .innerJoin(locations, eq(monevSessions.locationId, locations.id))
    .where(eq(monevSessions.status, "DISETUJUI"));

  const evidenceRows = await db
    .select({
      sessionId: publicationEvidence.sessionId,
      programCode: programs.code,
      label: evidenceTypes.label,
      urutan: evidenceTypes.urutan,
      ada: publicationEvidence.ada,
    })
    .from(publicationEvidence)
    .innerJoin(evidenceTypes, eq(publicationEvidence.evidenceTypeId, evidenceTypes.id))
    .innerJoin(monevSessions, eq(publicationEvidence.sessionId, monevSessions.id))
    .innerJoin(programs, eq(monevSessions.programId, programs.id))
    .where(eq(monevSessions.status, "DISETUJUI"));

  const programDefs: { code: ProgramCode; name: string }[] = [
    { code: "PKW", name: "Pendidikan Kecakapan Wirausaha" },
    { code: "PKK", name: "Pendidikan Kecakapan Kerja" },
  ];

  const programs_: ProgramReport[] = programDefs.map((def) => {
    const mySessions = sessionsByProgram.get(def.code) ?? [];
    const lkpCount = mySessions.length;

    const provinsiMap = new Map<string, number>();
    for (const s of mySessions) provinsiMap.set(s.provinsi, (provinsiMap.get(s.provinsi) ?? 0) + 1);
    const provinsi = [...provinsiMap.entries()]
      .map(([provinsi, count]) => ({ provinsi, count }))
      .sort((a, b) => b.count - a.count);

    const yesNoBucket = (category: "KETERPENUHAN" | "KEPATUHAN") => {
      const map = new Map<string, { urutan: number; yes: number; total: number }>();
      for (const r of responseRows) {
        if (r.programCode !== def.code || r.category !== category || r.boolValue == null) continue;
        const entry = map.get(r.label) ?? { urutan: r.urutan, yes: 0, total: 0 };
        entry.total += 1;
        if (r.boolValue) entry.yes += 1;
        map.set(r.label, entry);
      }
      return [...map.entries()]
        .map(([label, v]) => ({ label, urutan: v.urutan, yes: v.yes, total: v.total, pct: pct(v.yes, v.total) }))
        .sort((a, b) => a.urutan - b.urutan);
    };

    const scaleBucket = (category: "KINERJA" | "NARASI" | "VISUAL") => {
      const map = new Map<string, { urutan: number; counts: [number, number, number, number] }>();
      for (const r of responseRows) {
        if (r.programCode !== def.code || r.category !== category || r.scaleValue == null) continue;
        const entry = map.get(r.label) ?? { urutan: r.urutan, counts: [0, 0, 0, 0] as [number, number, number, number] };
        const idx = Math.min(4, Math.max(1, r.scaleValue)) - 1;
        entry.counts[idx] += 1;
        map.set(r.label, entry);
      }
      return [...map.entries()]
        .map(([label, v]) => {
          const total = v.counts.reduce((a, b) => a + b, 0);
          const pcts = v.counts.map((c) => pct(c, total)) as [number, number, number, number];
          const sum = v.counts.reduce((acc, c, i) => acc + c * (i + 1), 0);
          const avg = total > 0 ? Math.round((sum / total) * 100) / 100 : 0;
          return { label, urutan: v.urutan, total, counts: v.counts, pct: pcts, avg };
        })
        .sort((a, b) => a.urutan - b.urutan);
    };

    const channelBucket = (type: "INTERNAL" | "EKSTERNAL") => {
      const map = new Map<string, { urutan: number; yes: number; total: number }>();
      for (const c of channelRows) {
        if (c.programCode !== def.code || c.channelType !== type) continue;
        const entry = map.get(c.channelName) ?? { urutan: c.urutan, yes: 0, total: 0 };
        entry.total += 1;
        if (c.digunakan) entry.yes += 1;
        map.set(c.channelName, entry);
      }
      return [...map.entries()]
        .map(([label, v]) => ({ label, urutan: v.urutan, yes: v.yes, total: v.total, pct: pct(v.yes, v.total) }))
        .sort((a, b) => a.urutan - b.urutan);
    };

    const bukti = (() => {
      const map = new Map<string, { urutan: number; yes: number; total: number }>();
      for (const e of evidenceRows) {
        if (e.programCode !== def.code) continue;
        const entry = map.get(e.label) ?? { urutan: e.urutan, yes: 0, total: 0 };
        entry.total += 1;
        if (e.ada) entry.yes += 1;
        map.set(e.label, entry);
      }
      return [...map.entries()]
        .map(([label, v]) => ({ label, urutan: v.urutan, yes: v.yes, total: v.total, pct: pct(v.yes, v.total) }))
        .sort((a, b) => a.urutan - b.urutan);
    })();

    const kinerja = (() => {
      const cells: HeatCell[] = [];
      const lkpSet = new Set<string>();
      const channelSet = new Set<string>();
      let max = 0;
      for (const c of channelRows) {
        if (c.programCode !== def.code) continue;
        const jumlah = c.jumlahKonten ?? 0;
        if (jumlah <= 0) continue;
        cells.push({ lkp: c.locationName, channel: c.channelName, jumlah });
        lkpSet.add(c.locationName);
        channelSet.add(c.channelName);
        if (jumlah > max) max = jumlah;
      }
      return { lkpList: [...lkpSet], channelList: [...channelSet], cells, max };
    })();

    return {
      code: def.code,
      name: def.name,
      lkpCount,
      provinsi,
      keterpenuhan: yesNoBucket("KETERPENUHAN"),
      saluranInternal: channelBucket("INTERNAL"),
      saluranEksternal: channelBucket("EKSTERNAL"),
      bukti,
      kepatuhan: yesNoBucket("KEPATUHAN"),
      kinerja,
      narasi: scaleBucket("NARASI"),
      visual: scaleBucket("VISUAL"),
    };
  });

  return {
    generatedAt: new Date(),
    periode,
    totalLkp: sessionRows.length,
    programs: programs_,
  };
}
