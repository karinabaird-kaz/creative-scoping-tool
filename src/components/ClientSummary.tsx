import { useRef, useState } from 'react';
import type { Package } from '../data/scopingData';
import type { PhaseState } from './PhaseSection';
import { Logo } from './Logo';

interface ClientSummaryProps {
  pkg: Package;
  phases: PhaseState[];
  fee: number;
  onBack: () => void;
}

function stripPhaseNumber(title: string): string {
  return title.replace(/^\d+\s*-\s*/, '');
}

function isLaterRound(name: string): boolean {
  return /\(Round [2-9]\)/.test(name);
}

export function ClientSummary({ pkg, phases, fee, onBack }: ClientSummaryProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const enabledPhases = phases.map((p) => ({
    ...p,
    deliverables: p.deliverables
      .filter((d) => d.enabled)
      .filter((d) => !isLaterRound(d.name)),
  })).filter((p) => p.deliverables.length > 0);

  async function downloadPDF() {
    if (!contentRef.current) return;
    setGenerating(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        backgroundColor: '#0a0a0a',
        useCORS: true,
        logging: false,
      });

      const pad = 12; // padding in mm
      const maxW = 297; // max width in mm (A4 landscape width)

      // Scale image to fit max width, preserving aspect ratio
      const ratio = canvas.width / canvas.height;
      const imgW = maxW - pad * 2;
      const imgH = imgW / ratio;

      // Page size exactly fits content + padding
      const pageW = imgW + pad * 2;
      const pageH = imgH + pad * 2;

      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [pageH, pageW] });
      // Fill page black
      pdf.setFillColor(10, 10, 10);
      pdf.rect(0, 0, pageW, pageH, 'F');
      // Place image top-aligned
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', pad, pad, imgW, imgH);
      pdf.save(`${pkg.name} - Brand Scope.pdf`);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 py-5">

      {/* Buttons row — not included in PDF */}
      <div className="flex items-center justify-between mb-5">
        <div className="opacity-0 pointer-events-none">
          {/* spacer to keep buttons right-aligned */}
        </div>
        <div className="flex items-center gap-2">
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

      {/* PDF content — everything below is captured */}
      <div ref={contentRef} className="bg-[#0a0a0a]">

        {/* Header */}
        <div className="mb-5">
          <Logo className="h-5 w-auto mb-4" />
          <h1 className="text-white text-xl font-bold mb-2">{pkg.name}</h1>
          <p className="text-white text-xl font-bold">
            ${Math.round(fee).toLocaleString()}{' '}
            <span className="text-white/70 text-sm font-normal">(AUD)</span>
          </p>
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
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
