import type { Package } from '../data/scopingData';
import { Logo } from './Logo';

interface LandingProps {
  packages: Package[];
  onSelect: (pkg: Package) => void;
}

function calcPackageRange(pkg: Package) {
  let lowHrs = 0;
  let highHrs = 0;
  for (const phase of pkg.data) {
    for (const d of phase.deliverables) {
      lowHrs +=
        d.clientService.low +
        d.strategy.low +
        d.design.low +
        d.copywriter.low;
      highHrs +=
        d.clientService.high +
        d.strategy.high +
        d.design.high +
        d.copywriter.high;
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
  const firstRow = packages.slice(0, 3);
  const secondRow = packages.slice(3);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col px-8 py-10">
      <div className="mb-12">
        <Logo className="h-8 w-auto" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <p className="text-white/50 text-sm tracking-widest uppercase mb-10">
          Select a package to build your scope and estimate.
        </p>

        <div className="flex gap-5 mb-5 justify-center">
          {firstRow.map((pkg) => {
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

        <div className="flex gap-5 justify-center">
          {secondRow.map((pkg) => {
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
  );
}

interface PackageCardProps {
  pkg: Package;
  hrsLow: number;
  hrsHigh: number;
  feeLow: number;
  feeHigh: number;
  onSelect: (pkg: Package) => void;
}

function PackageCard({
  pkg,
  hrsLow,
  hrsHigh,
  feeLow,
  feeHigh,
  onSelect,
}: PackageCardProps) {
  return (
    <button
      onClick={() => onSelect(pkg)}
      className="w-72 bg-[#141414] border border-white/10 rounded-2xl p-7 text-left hover:border-[#fff230]/60 hover:bg-[#1a1a14] transition-all duration-200 group"
    >
      <p className="text-white/40 text-xs tracking-widest uppercase mb-2 font-medium">
        {pkg.label}
      </p>
      <h2 className="text-white text-[22px] font-semibold leading-tight mb-4">
        {pkg.name}
      </h2>
      <p className="text-white/40 text-xs tracking-wider uppercase mb-4">
        {pkg.phases}
      </p>
      <div className="border-t border-white/10 pt-4">
        <p className="text-white/30 text-xs mb-1">
          {hrsLow} - {hrsHigh} hrs
        </p>
        <p className="text-[#fff230] text-base font-semibold">
          ${feeLow.toLocaleString()} - ${feeHigh.toLocaleString()}
        </p>
      </div>
    </button>
  );
}
