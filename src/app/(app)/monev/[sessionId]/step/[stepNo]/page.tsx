import { notFound } from "next/navigation";
import { STEPS, TOTAL_STEPS } from "@/lib/monev-steps";
import { StepFooter } from "@/components/monev/StepFooter";
import { IndicatorList } from "@/components/monev/IndicatorList";
import { ChannelList } from "@/components/monev/ChannelList";
import { EvidenceList } from "@/components/monev/EvidenceList";
import { BriefList } from "@/components/monev/BriefList";
import { InterviewManager } from "@/components/monev/InterviewManager";
import { MediaLinkManager } from "@/components/monev/MediaLinkManager";
import { RecapCards, SubmitPanel } from "@/components/monev/RecapAndSubmit";
import {
  getSessionMeta,
  getIndicatorsForStep,
  getChannelAudits,
  getEvidenceForSession,
  getStoryBrief,
  getInterviews,
  getMediaAssets,
  getRecap,
  getRecommendations,
  checkCompleteness,
} from "@/lib/actions/monev";

export default async function StepPage({
  params,
}: {
  params: Promise<{ sessionId: string; stepNo: string }>;
}) {
  const { sessionId, stepNo: stepNoStr } = await params;
  const stepNo = parseInt(stepNoStr, 10);
  const stepDef = STEPS.find((s) => s.no === stepNo);
  if (!stepDef) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="mb-1 text-lg font-semibold text-slate-900">
        {stepDef.no}. {stepDef.label}
      </h2>
      <div className="mt-5">
        <StepBody sessionId={sessionId} stepNo={stepNo} />
      </div>
      <StepFooter sessionId={sessionId} stepNo={stepNo} totalSteps={TOTAL_STEPS} />
    </div>
  );
}

async function StepBody({ sessionId, stepNo }: { sessionId: string; stepNo: number }) {
  switch (stepNo) {
    case 1: {
      const { location, program, session } = await getSessionMeta(sessionId);
      return (
        <dl className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-white p-5 text-sm sm:grid-cols-2">
          <Info label="Nama Lembaga" value={location.namaLembaga} />
          <Info label="Program" value={program.name} />
          <Info label="Provinsi / Kab-Kota" value={`${location.kabKota}, ${location.provinsi}`} />
          <Info label="Penanggung Jawab" value={location.penanggungJawab} />
          <Info label="No. Telp" value={location.noTelp} />
          <Info label="Periode" value={session.periode} />
        </dl>
      );
    }
    case 2: {
      const items = await getIndicatorsForStep(sessionId, "KETERPENUHAN");
      return <IndicatorList sessionId={sessionId} items={items} />;
    }
    case 3: {
      const items = await getChannelAudits(sessionId);
      return <ChannelList sessionId={sessionId} items={items} />;
    }
    case 4: {
      const items = await getEvidenceForSession(sessionId);
      return <EvidenceList sessionId={sessionId} items={items} />;
    }
    case 5: {
      const items = await getIndicatorsForStep(sessionId, "KEPATUHAN");
      return <IndicatorList sessionId={sessionId} items={items} />;
    }
    case 6: {
      const items = await getIndicatorsForStep(sessionId, "KINERJA");
      return <IndicatorList sessionId={sessionId} items={items} />;
    }
    case 7: {
      const items = await getIndicatorsForStep(sessionId, "NARASI");
      return <IndicatorList sessionId={sessionId} items={items} />;
    }
    case 8: {
      const items = await getIndicatorsForStep(sessionId, "VISUAL");
      return <IndicatorList sessionId={sessionId} items={items} />;
    }
    case 9: {
      const items = await getStoryBrief(sessionId);
      return <BriefList sessionId={sessionId} items={items} />;
    }
    case 10: {
      const items = await getInterviews(sessionId);
      return <InterviewManager sessionId={sessionId} initial={items} />;
    }
    case 11: {
      const items = await getMediaAssets(sessionId);
      return <MediaLinkManager sessionId={sessionId} initial={items} />;
    }
    case 12: {
      const recap = await getRecap(sessionId);
      const recs = await getRecommendations(sessionId);
      return <RecapCards recap={recap} recommendations={recs} />;
    }
    case 13: {
      const { complete, missing } = await checkCompleteness(sessionId);
      return <SubmitPanel sessionId={sessionId} complete={complete} missing={missing} />;
    }
    default:
      return null;
  }
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-slate-800">{value || "—"}</dd>
    </div>
  );
}
