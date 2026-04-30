import { useState } from 'react';
import type { Package } from '../data/scopingData';
import { Logo } from './Logo';
import { EffortCalculator } from './EffortCalculator';

interface LandingProps {
  packages: Package[];
  onSelect: (pkg: Package) => void;
}

type CardDeliverable = { id: string; name: string; addon?: boolean; bespoke?: boolean };

function collapseRounds(deliverables: CardDeliverable[]): CardDeliverable[] {
  const result: CardDeliverable[] = [];
  let ideationAdded = false;
  let designDevAdded = false;
  for (const d of deliverables) {
    if (d.name.startsWith('Ideation Round')) {
      if (!ideationAdded) {
        result.push({ ...d, id: 'ideation-merged', name: 'Ideation' });
        ideationAdded = true;
      }
      continue;
    }
    if (d.name.startsWith('Design Development R')) {
      if (!designDevAdded) {
        result.push({ ...d, id: 'design-dev-merged', name: 'Design Development' });
        designDevAdded = true;
      }
      continue;
    }
    result.push(d);
  }
  return result;
}

function calcPackageRange(pkg: Package) {
  let lowHrs = 0;
  let highHrs = 0;
  for (const phase of pkg.data) {
    for (const d of phase.deliverables) {
      if (d.bespoke) continue;
      lowHrs += d.clientService.low + d.strategy.low + d.design.low + d.copywriter.low;
      highHrs += d.clientService.high + d.strategy.high + d.design.high + d.copywriter.high;
    }
  }
  const rate = 220;
  return {
    hrsLow: lowHrs,
    hrsHigh: highHrs,
    feeLow: Math.round(lowHrs * rate),
    feeHigh: Math.round(highHrs * rate),
  };
}

export function Landing({ packages, onSelect }: LandingProps) {
  const strategyPkgs = packages.filter((p) => p.phaseGroup === 'strategy');
  const campaignPkgs = packages.filter((p) => p.phaseGroup === 'campaign');
  const [showEffortCalc, setShowEffortCalc] = useState(false);

  if (showEffortCalc) {
    return (
      <EffortCalculator
        onBack={() => setShowEffortCalc(false)}
        onHome={() => setShowEffortCalc(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center px-8 py-4">
      <div className="w-full max-w-5xl flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          <Logo className="h-5 w-auto" />
        </div>

        <div className="mb-4">
          <h1 className="text-white text-2xl font-bold mb-1">Creative Scoping Tool</h1>
          <p className="text-white/70 text-xs mb-1.5">
            Select a package below to begin.
          </p>
          <p className="text-white text-[13px]">
            Toggle deliverables on or off&nbsp;&nbsp;|&nbsp;&nbsp;Expand any row to adjust hours by discipline&nbsp;&nbsp;|&nbsp;&nbsp;Update service rates per hour
          </p>
        </div>

        <div className="flex-1 space-y-8">
          {/* Top row: Misc (col 1) + Campaign (col 3), cols 2 & 4 empty */}
          {campaignPkgs.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {/* Col 1 — Misc */}
              <div className="flex flex-col">
                <button
                  onClick={() => setShowEffortCalc(true)}
                  className="flex-1 bg-[#141414] border border-white/10 rounded-xl p-5 flex flex-col text-left hover:border-[#fff230]/50 hover:bg-[#1a1a14] transition-all duration-200 relative overflow-hidden"
                >
                  <h2 className="text-white text-[16px] font-semibold leading-snug">
                    Effort Calculator
                  </h2>
                  <div className="flex-1" />
                </button>
              </div>

              {/* Col 2 — empty */}
              <div />

              {/* Col 3 — Campaign */}
              <div className="flex flex-col">
                {campaignPkgs.map((pkg) => {
                  const { hrsLow, hrsHigh, feeLow, feeHigh } = calcPackageRange(pkg);
                  return (
                    <PackageCard
                      key={pkg.id}
                      pkg={pkg}
                      hrsLow={hrsLow}
                      hrsHigh={hrsHigh}
                      feeLow={feeLow}
                      feeHigh={feeHigh}
                      onSelect={onSelect}
                      feeNote="Excludes third-party research costs"
                    />
                  );
                })}
              </div>

              {/* Col 4 — empty */}
              <div />
            </div>
          )}

          {/* Brand Phase */}
          <div>
            <p className="text-white/40 text-[10px] tracking-widest uppercase font-semibold mb-3">
              Brand
            </p>
            <div className="grid grid-cols-4 gap-3 items-start">
              {strategyPkgs.map((pkg) => {
                const { hrsLow, hrsHigh, feeLow, feeHigh } = calcPackageRange(pkg);
                return (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    hrsLow={hrsLow}
                    hrsHigh={hrsHigh}
                    feeLow={feeLow}
                    feeHigh={feeHigh}
                    onSelect={onSelect}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PackageCardProps {
  pkg: Package;
  hrsLow: number;
  hrsHigh: number;
  feeLow: number;
  feeHigh: number;
  onSelect: (pkg: Package) => void;
  feeNote?: string;
}

function PackageCard({ pkg, hrsLow, hrsHigh, feeLow, feeHigh, onSelect, feeNote }: PackageCardProps) {
  return (
    <button
      onClick={() => onSelect(pkg)}
      className="bg-[#141414] border border-white/10 rounded-xl p-5 text-left hover:border-[#fff230]/50 hover:bg-[#1a1a14] transition-all duration-200 flex flex-col"
    >
      <p className="text-white/40 text-[10px] tracking-widest uppercase mb-2 font-semibold">
        {pkg.label}
      </p>
      <h2 className="text-white text-[16px] font-semibold leading-snug mb-1">
        {pkg.name}
      </h2>
      {pkg.subtitle && (
        <p className="text-white/60 text-[11px] leading-snug mb-2">{pkg.subtitle}</p>
      )}

      <div className="mt-3 mb-3 space-y-1">
        {collapseRounds(pkg.data.flatMap((phase) => phase.deliverables)).map((d) => (
          <div key={d.id} className="flex items-start gap-1.5">
            <span className={`mt-[4px] flex-shrink-0 w-1 h-1 rounded-full ${
              d.addon || d.bespoke ? 'bg-white/30' : 'bg-[#fff230]/70'
            }`} />
            <span className={`text-[12px] leading-snug ${
              d.addon || d.bespoke ? 'text-white/50' : 'text-white'
            }`}>
              {d.name}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-3 border-t border-white/10">
        <p className="text-white/55 text-[11px] mb-0.5">
          {hrsLow} - {hrsHigh} hrs
        </p>
        <p className="text-[#fff230] text-sm font-semibold">
          ${feeLow.toLocaleString()} - ${feeHigh.toLocaleString()}
        </p>
        {feeNote && (
          <p className="text-white/40 text-[10px] mt-1">{feeNote}</p>
        )}
      </div>
    </button>
  );
}
