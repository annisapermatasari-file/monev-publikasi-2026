import { auth } from "@/lib/auth";
import { buildAggregateReport } from "@/lib/reporting/aggregate";
import { buildPdfBuffer } from "@/lib/reporting/pdf-render";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return new Response("Tidak memiliki akses.", { status: 403 });
  }

  const data = await buildAggregateReport();
  const buffer = await buildPdfBuffer(data);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="laporan-keseluruhan-monev-${data.periode}.pdf"`,
    },
  });
}
