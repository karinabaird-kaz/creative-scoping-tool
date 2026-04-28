import { useRef, useState } from 'react';
import type { Package } from '../data/scopingData';
import type { PhaseState } from './PhaseSection';
import { calcCost } from './DeliverableRow';
import type { Rates } from './DeliverableRow';
import { Logo } from './Logo';

interface ClientSummaryProps {
  pkg: Package;
  phases: PhaseState[];
  fee: number;
  rates: Rates;
  band: 'low' | 'mid' | 'high';
  onBack: () => void;
  onHome: () => void;
}

function stripPhaseNumber(title: string): string {
  return title.replace(/^\d+\s*-\s*/, '');
}

function isLaterRound(name: string): boolean {
  return /\(Round [2-9]\)/.test(name);
}

type SummaryDeliverable = { id: string; name: string; description: string; pagination?: import('../data/scopingData').PaginationPage[] };

function consolidateCampaignDeliverables(deliverables: SummaryDeliverable[]): SummaryDeliverable[] {
  const result: SummaryDeliverable[] = [];
  let ideationAdded = false;
  let designDevAdded = false;

  for (const d of deliverables) {
    // Merge all Ideation rounds into one entry
    if (d.name.startsWith('Ideation Round')) {
      if (!ideationAdded) {
        result.push({ ...d, id: 'ideation-merged', name: 'Ideation' });
        ideationAdded = true;
      }
      continue;
    }
    // Merge all Design Development rounds into one entry
    if (d.name.startsWith('Design Development R')) {
      if (!designDevAdded) {
        result.push({ ...d, id: 'design-dev-merged', name: 'Design Development' });
        designDevAdded = true;
      }
      continue;
    }
    // (Third Party Costs row removed — now embedded in Customer Research row)
    result.push(d);
  }
  return result;
}

export function ClientSummary({ pkg, phases, fee, rates, band, onBack, onHome }: ClientSummaryProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const isCampaign = pkg.phaseGroup === 'campaign';

  function calcPhaseFee(phase: PhaseState): number {
    return phase.deliverables
      .filter((d) => d.enabled)
      .reduce((sum, d) => sum + calcCost(d, rates, band), 0);
  }

  const enabledPhases = phases.map((p) => {
    const filtered = p.deliverables
      .filter((d) => d.enabled)
      .filter((d) => !isLaterRound(d.name));
    const displayDeliverables = isCampaign ? consolidateCampaignDeliverables(filtered) : filtered;
    const phaseFee = calcPhaseFee(p);
    return { ...p, deliverables: displayDeliverables, phaseFee };
  }).filter((p) => p.deliverables.length > 0);

  async function downloadPDF() {
    if (!contentRef.current) return;
    setGenerating(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      if (buttonsRef.current) buttonsRef.current.style.visibility = 'hidden';

      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        backgroundColor: '#0a0a0a',
        useCORS: true,
        logging: false,
      });

      const pad = 5;
      const maxW = 297;
      const ratio = canvas.width / canvas.height;
      const imgW = maxW - pad * 2;
      const imgH = imgW / ratio;
      const pageW = imgW + pad * 2;
      const pageH = imgH + pad * 2;

      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [pageH, pageW] });
      pdf.setFillColor(10, 10, 10);
      pdf.rect(0, 0, pageW, pageH, 'F');
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', pad, pad, imgW, imgH);
      pdf.save(`${pkg.name} - Brand Scope.pdf`);
    } finally {
      if (buttonsRef.current) buttonsRef.current.style.visibility = '';
      setGenerating(false);
    }
  }

  return (
    <div ref={contentRef} className="min-h-screen bg-[#0a0a0a] px-6 py-5">

      {/* Header row: logo + title left, buttons right (buttons hidden during PDF capture) */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <Logo className="h-5 w-auto mb-4" onClick={onHome} />
          <h1 className="text-white text-xl font-bold mb-2">{pkg.name}</h1>
          <p className="text-white text-xl font-bold">
            ${Math.round(fee).toLocaleString()}{' '}
            <span className="text-white/70 text-sm font-normal">(AUD)</span>
          </p>
        </div>
        <div ref={buttonsRef} className="flex items-center gap-2 mt-1">
          <button
            onClick={downloadPDF}
            disabled={generating}
            className="flex items-center gap-2 text-white/75 hover:text-white text-xs border border-white/20 rounded-full px-4 py-2 transition-colors disabled:opacity-50"
          >
            {generating ? 'Generating…' : (
              <>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF
              </>
            )}
          </button>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/75 hover:text-white text-xs border border-white/20 rounded-full px-4 py-2 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to scoping
          </button>
        </div>
      </div>

      {/* Phase columns */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${Math.min(enabledPhases.length, 3)}, 1fr)` }}
      >
        {enabledPhases.map((phase) => (
          <div key={phase.id + phase.title} className="flex flex-col gap-3">
            <div className="bg-white/10 rounded-xl px-4 py-3">
              <h2 className="text-white text-sm font-bold mb-0.5">
                {stripPhaseNumber(phase.title)}
              </h2>
              <p className="text-white/75 text-xs leading-snug">{phase.objective}</p>
            </div>

            <div className="bg-[#f5f5f5] rounded-xl px-4 py-3 flex flex-col divide-y divide-[#e8e8e8]">
              {phase.deliverables.map((d) => (
                <div key={d.id} className="py-2.5 first:pt-0 last:pb-0">
                  <p className="text-black text-[13px] font-bold mb-0.5">{d.name}</p>
                  <p className="text-gray-500 text-[12px] leading-snug">{d.description}</p>

                  {d.pagination && d.pagination.length > 0 && (
                    <div className="mt-3 bg-white rounded-lg px-3 py-3">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Proposed Brand Guideline Pagination
                      </p>
                      <ol className="space-y-1">
                        {d.pagination.map((page, idx) => (
                          <li key={idx} className="flex gap-2 text-[12px]">
                            <span className="text-gray-400 flex-shrink-0 w-5 text-right">
                              {idx + 1}.
                            </span>
                            <span className={page.isHeader ? 'font-bold text-black' : 'text-gray-600'}>
                              {page.text}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-[#fff230] rounded-xl px-4 py-2.5 flex items-center justify-between">
              <p className="text-black text-[11px] font-semibold uppercase tracking-wider">
                {stripPhaseNumber(phase.title)} Total
              </p>
              <p className="text-black text-[13px] font-bold">
                ${Math.round(phase.phaseFee).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
