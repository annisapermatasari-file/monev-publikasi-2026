type BriefElement = { id: string; elemen: string; arahan: string | null };

export function BriefList({ elements }: { elements: BriefElement[] }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium text-slate-900">Poin-poin yang perlu dicakup</p>
        <p className="mt-0.5 text-xs text-slate-600">
          Gunakan poin-poin ini sebagai panduan saat menggali cerita dari narasumber di langkah
          Wawancara — brief liputan ditulis di sana, bukan di langkah ini.
        </p>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          {elements.map((el) => (
            <li key={el.id} className="text-sm text-slate-700">
              <span className="font-medium text-slate-900">{el.elemen}</span>
              {el.arahan && <span className="text-slate-600"> — {el.arahan}</span>}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
