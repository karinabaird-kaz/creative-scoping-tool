import { useState, useMemo } from 'react';
import type { Package } from '../data/scopingData';
import { DEFAULT_RATE } from '../data/scopingData';
import { SidePanel } from './SidePanel';
import { MetricsBar } from './MetricsBar';
import { PhaseSection } from './PhaseSection';
import type { PhaseState } from './PhaseSection';
import { calcCost } from './DeliverableRow';
import type { Rates, DeliverableState } from './DeliverableRow';

interface CalculatorProps {
  pkg: Package;
  onBack: () => void;
}

function buildPhaseState(pkg: Package): PhaseState[] {
  return pkg.data.map((phase) => ({
    id: phase.id,
    title: phase.title,
    objective: phase.objective,
    deliverables: phase.deliverables.map((d) => ({
      ...d,
      enabled: true,
    })),
  }));
}

export function Calculator({ pkg, onBack }: CalculatorProps) {
  const [phases, setPhases] = useState<PhaseState[]>(() =>
    buildPhaseState(pkg)
  );

  const [rates, setRates] = useState<Rates>({
    clientService: DEFAULT_RATE,
    strategy: DEFAULT_RATE,
    design: DEFAULT_RATE,
    copywriter: DEFAULT_RATE,
  });

  function handleRateChange(key: keyof Rates, value: number) {
    setRates((prev) => ({ ...prev, [key]: value }));
  }

  function handlePhaseChange(updated: PhaseState) {
    setPhases((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  const { totalLowFee, totalMidFee, totalHighFee, totalLowHrs, totalHighHrs } =
    useMemo(() => {
      let totalLowFee = 0;
      let totalHighFee = 0;
      let totalLowHrs = 0;
      let totalHighHrs = 0;

      for (const phase of phases) {
        for (const d of phase.deliverables) {
          if (!d.enabled) continue;
          totalLowFee += calcCost(d, rates, 'low');
          totalHighFee += calcCost(d, rates, 'high');
          totalLowHrs += sumHrs(d, 'low');
          totalHighHrs += sumHrs(d, 'high');
        }
      }

      return {
        totalLowFee,
        totalMidFee: (totalLowFee + totalHighFee) / 2,
        totalHighFee,
        totalLowHrs,
        totalHighHrs,
      };
    }, [phases, rates]);

  return (
    <div className="flex min-h-screen">
      <SidePanel
        pkg={pkg}
        rates={rates}
        onRateChange={handleRateChange}
        onBack={onBack}
      />

      <div className="flex-1 bg-[#f5f5f5] flex flex-col">
        <div className="flex-1 px-8 py-8 overflow-y-auto">
          <MetricsBar
            lowFee={totalLowFee}
            midFee={totalMidFee}
            highFee={totalHighFee}
            lowHrs={totalLowHrs}
            highHrs={totalHighHrs}
          />

          {phases.map((phase) => (
            <PhaseSection
              key={phase.id + phase.title}
              phase={phase}
              rates={rates}
              onChange={handlePhaseChange}
            />
          ))}
        </div>

        <div className="sticky bottom-0 bg-[#111] px-8 py-4 flex items-center justify-between">
          <p className="text-white/50 text-sm font-medium">
            Recommended range
          </p>
          <p className="text-[#fff230] text-lg font-bold">
            ${Math.round(totalLowFee).toLocaleString()} -{' '}
            ${Math.round(totalHighFee).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

function sumHrs(d: DeliverableState, band: 'low' | 'high'): number {
  return (
    d.clientService[band] +
    d.strategy[band] +
    d.design[band] +
    d.copywriter[band]
  );
}
