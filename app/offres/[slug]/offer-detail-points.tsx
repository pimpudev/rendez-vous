"use client";

import { useSiteLanguage, type SiteLanguage } from "../../site-language";

export default function OfferDetailPoints({ points }: { points: Record<SiteLanguage, string[]> }) {
  const language = useSiteLanguage();
  const localizedPoints = points[language];

  if (localizedPoints.length === 0) return null;

  return (
    <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 sm:p-8">
      <ul className="list-disc space-y-2 pl-5 text-base leading-7 text-slate-700 marker:text-red-600">
        {localizedPoints.map((point) => <li key={point}>{point}</li>)}
      </ul>
    </div>
  );
}
