import ExcelJS from "exceljs";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { indicatorResponses, indicators, locations, monevSessions, programs, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return new Response("Tidak memiliki akses.", { status: 403 });
  }

  const rows = await db
    .select({
      id: monevSessions.id,
      lokasi: locations.namaLembaga,
      provinsi: locations.provinsi,
      kabKota: locations.kabKota,
      program: programs.code,
      status: monevSessions.status,
      langkah: monevSessions.currentStep,
      petugas: users.name,
      submittedAt: monevSessions.submittedAt,
      updatedAt: monevSessions.updatedAt,
    })
    .from(monevSessions)
    .innerJoin(locations, eq(monevSessions.locationId, locations.id))
    .innerJoin(programs, eq(monevSessions.programId, programs.id))
    .leftJoin(users, eq(monevSessions.submittedById, users.id));

  const responseRows = await db
    .select({ sessionId: indicatorResponses.sessionId, category: indicators.category, boolValue: indicatorResponses.boolValue, scaleValue: indicatorResponses.scaleValue })
    .from(indicatorResponses)
    .innerJoin(indicators, eq(indicatorResponses.indicatorId, indicators.id));
  const scoreMap = new Map<string, Record<string, number | null>>();
  for (const response of responseRows) {
    const current = scoreMap.get(response.sessionId) ?? {};
    const category = response.category;
    if (category === "KETERPENUHAN" || category === "KEPATUHAN") {
      const total = (current[`${category}_TOTAL`] ?? 0) + 1;
      const yes = (current[`${category}_YES`] ?? 0) + (response.boolValue === true ? 1 : 0);
      current[`${category}_TOTAL`] = total;
      current[`${category}_YES`] = yes;
      current[category] = Math.round((yes / total) * 100);
    } else if (response.scaleValue != null) {
      const total = (current[`${category}_TOTAL`] ?? 0) + 1;
      const sum = (current[`${category}_SUM`] ?? 0) + response.scaleValue;
      current[`${category}_TOTAL`] = total;
      current[`${category}_SUM`] = sum;
      current[category] = Math.round((sum / total) * 100) / 100;
    }
    scoreMap.set(response.sessionId, current);
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Monev Publikasi 2026";
  const sheet = workbook.addWorksheet("Rekap Nasional");
  sheet.columns = [
    { header: "Lokasi", key: "lokasi", width: 30 },
    { header: "Provinsi", key: "provinsi", width: 20 },
    { header: "Kab/Kota", key: "kabKota", width: 24 },
    { header: "Program", key: "program", width: 12 },
    { header: "Status", key: "status", width: 22 },
    { header: "Langkah", key: "langkah", width: 10 },
    { header: "Petugas Submit", key: "petugas", width: 24 },
    { header: "Keterpenuhan %", key: "keterpenuhan", width: 16 },
    { header: "Kepatuhan %", key: "kepatuhan", width: 14 },
    { header: "Kinerja (1-4)", key: "kinerja", width: 14 },
    { header: "Narasi (1-4)", key: "narasi", width: 14 },
    { header: "Visual (1-4)", key: "visual", width: 14 },
    { header: "Waktu Submit", key: "submittedAt", width: 22 },
    { header: "Terakhir Diubah", key: "updatedAt", width: 22 },
  ];
  sheet.addRows(rows.map((row) => {
    const scores = scoreMap.get(row.id) ?? {};
    return {
      ...row,
      keterpenuhan: scores.KETERPENUHAN ?? "",
      kepatuhan: scores.KEPATUHAN ?? "",
      kinerja: scores.KINERJA ?? "",
      narasi: scores.NARASI ?? "",
      visual: scores.VISUAL ?? "",
      submittedAt: row.submittedAt?.toISOString() ?? "",
      updatedAt: row.updatedAt.toISOString(),
    };
  }));
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF26392D" } };
  sheet.autoFilter = { from: "A1", to: "N1" };
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="rekap-monev-nasional-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}