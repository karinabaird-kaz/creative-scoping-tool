import { useState, useMemo } from 'react';
import type { Package, Phase } from '../data/scopingData';
import { DEFAULT_RATE, creativePhaseOptions } from '../data/scopingData';
import { SidePanel } from './SidePanel';
import { PhaseSection } from './PhaseSection';
import type { PhaseState } from './PhaseSection';
import { calcCost } from './DeliverableRow';
import type { Rates, DeliverableState } from './DeliverableRow';
import { ClientSummary } from './ClientSummary';

type Band = 'low' | 'mid' | 'high';

interface CalculatorProps {
  pkg: Package;
  onBack: () => void;
  onHome: () => void;
}

function buildPhaseState(pkg: Package): PhaseState[] {
  return pkg.data.map((phase) => ({
    id: phase.id,
    title: phase.title,
    objective: phase.objective,
    deliverables: phase.deliverables.map((d) => ({ ...d, enabled: !d.addon })),
  }));
}

function phaseToState(phase: Phase): PhaseState {
  return {
    id: phase.id,
    title: phase.title,
    objective: phase.objective,
    deliverables: phase.deliverables.map((d) => ({ ...d, enabled: !d.addon })),
  };
}

function calcPhaseRange(phase: Phase, rates: Rates) {
  let lowFee = 0, highFee = 0, lowHrs = 0, highHrs = 0;
  for (const d of phase.deliverables) {
    lowFee += d.clientService.low * rates.clientService + d.strategy.low * rates.strategy + d.design.low * rates.design + d.copywriter.low * rates.copywriter;
    highFee += d.clientService.high * rates.clientService + d.strategy.high * rates.strategy + d.design.high * rates.design + d.copywriter.high * rates.copywriter;
    lowHrs += d.clientService.low + d.strategy.low + d.design.low + d.copywriter.low;
    highHrs += d.clientService.high + d.strategy.high + d.design.high + d.copywriter.high;
  }
  return { lowFee, highFee, lowHrs, highHrs };
}

export function Calculator({ pkg, onBack, onHome }: CalculatorProps) {
  const [phases, setPhases] = useState<PhaseState[]>(() => buildPhaseState(pkg));
  const [rates, setRates] = useState<Rates>({
    clientService: DEFAULT_RATE,
    strategy: DEFAULT_RATE,
    design: DEFAULT_RATE,
    copywriter: DEFAULT_RATE,
  });
  const [selectedBand, setSelectedBand] = useState<Band>('mid');
  const [showSummary, setShowSummary] = useState(false);
  const [selectedCreativeId, setSelectedCreativeId] = useState<string | null>(null);
  const [creativePhases, setCreativePhases] = useState<PhaseState[]>([]);

  function handleRateChange(key: keyof Rates, value: number) {
    setRates((prev) => ({ ...prev, [key]: value }));
  }

  function handlePhaseChange(updated: PhaseState) {
    setPhases((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  function handleCreativePhaseChange(updated: PhaseState) {
    setCreativePhases((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  function handleCreativeSelect(id: string) {
    if (selectedCreativeId === id) {
      setSelectedCreativeId(null);
      setCreativePhases([]);
    } else {
      const option = creativePhaseOptions.find((o) => o.id === id)!;
      setSelectedCreativeId(id);
      setCreativePhases([phaseToState(option.phase)]);
    }
  }

  const {
    strategyLowFee, strategyMidFee, strategyHighFee, strategyLowHrs, strategyHighHrs,
    creativeLowFee, creativeMidFee, creativeHighFee, creativeLowHrs, creativeHighHrs,
  } = useMemo(() => {
    let sLow = 0, sHigh = 0, sLowHrs = 0, sHighHrs = 0;
    let cLow = 0, cHigh = 0, cLowHrs = 0, cHighHrs = 0;

    for (const phase of phases) {
      for (const d of phase.deliverables) {
        if (!d.enabled) continue;
        sLow += calcCost(d, rates, 'low');
        sHigh += calcCost(d, rates, 'high');
        sLowHrs += sumHrs(d, 'low');
        sHighHrs += sumHrs(d, 'high');
      }
    }

    for (const phase of creativePhases) {
      for (const d of phase.deliverables) {
        if (!d.enabled) continue;
        cLow += calcCost(d, rates, 'low');
        cHigh += calcCost(d, rates, 'high');
        cLowHrs += sumHrs(d, 'low');
        cHighHrs += sumHrs(d, 'high');
      }
    }

    return {
      strategyLowFee: sLow,
      strategyMidFee: (sLow + sHigh) / 2,
      strategyHighFee: sHigh,
      strategyLowHrs: sLowHrs,
      strategyHighHrs: sHighHrs,
      creativeLowFee: cLow,
      creativeMidFee: (cLow + cHigh) / 2,
      creativeHighFee: cHigh,
      creativeLowHrs: cLowHrs,
      creativeHighHrs: cHighHrs,
    };
  }, [phases, creativePhases, rates]);

  const totalLowFee = strategyLowFee + creativeLowFee;
  const totalMidFee = strategyMidFee + creativeMidFee;
  const totalHighFee = strategyHighFee + creativeHighFee;
  const totalLowHrs = strategyLowHrs + creativeLowHrs;
  const totalHighHrs = strategyHighHrs + creativeHighHrs;
  const midHrs = Math.round((totalLowHrs + totalHighHrs) / 2);

  const selectedFee =
    selectedBand === 'low' ? totalLowFee : selectedBand === 'high' ? totalHighFee : totalMidFee;

  const hasCreative = selectedCreativeId !== null;

  if (showSummary) {
    return (
      <ClientSummary
        pkg={pkg}
        phases={[...phases, ...creativePhases]}
        fee={selectedFee}
        rates={rates}
        band={selectedBand}
        onBack={() => setShowSummary(false)}
        onHome={onHome}
      />
    );
  }

  return (
    <div className="flex h-screen">
      <SidePanel
        pkg={pkg}
        rates={rates}
        onRateChange={handleRateChange}
        onBack={onBack}
        onHome={onHome}
      />

      <div className="flex-1 bg-[#f5f5f5] flex flex-col overflow-hidden">
        <div className="flex-1 px-5 py-3 overflow-y-auto">
          {pkg.calculatorNote && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5">
              <p className="text-[12px] text-blue-700 leading-snug">
                {pkg.calculatorNote}
              </p>
            </div>
          )}

          {phases.map((phase) => (
            <PhaseSection
              key={phase.id + phase.title}
              phase={phase}
              rates={rates}
              onChange={handlePhaseChange}
            />
          ))}

          {pkg.phaseGroup === 'strategy' && (
            <div className="mt-3 pt-3 border-t border-[#e0e0e0]">
              <div className="flex items-baseline gap-2 mb-3">
                <h3 className="text-[15px] font-bold text-black">
                  {hasCreative ? 'Creative phase' : 'Add a creative phase'}
                </h3>
                <p className="text-[12px] text-gray-500">
                  {hasCreative
                    ? 'Creative phase added to your scope.'
                    : 'Optionally bolt on a creative phase to your scope.'}
                </p>
              </div>

              {hasCreative ? (
                <div className="flex gap-2 mb-4">
                  {creativePhaseOptions.map((option) => {
                    const isSelected = selectedCreativeId === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleCreativeSelect(option.id)}
                        className={`rounded-xl px-5 py-2 text-sm font-semibold transition-all duration-150 ${
                          isSelected
                            ? 'bg-[#fff230] text-black'
                            : 'bg-[#e8e8e8] text-gray-500 hover:bg-[#e0e0e0]'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {creativePhaseOptions.map((option) => {
                    const { lowFee, highFee } = calcPhaseRange(option.phase, rates);
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleCreativeSelect(option.id)}
                        className="bg-[#1a1a1a] border border-[#2a2a2a] hover:border-white/20 rounded-xl px-3 py-2 text-left transition-all duration-200"
                      >
                        <p className="text-xs font-semibold mb-0.5 text-white">{option.label}</p>
                        <p className="text-[11px] mb-1.5 leading-snug text-white/70">{option.subtitle}</p>
                        <p className="text-[#fff230] text-sm font-semibold">
                          ${Math.round(lowFee).toLocaleString()} - ${Math.round(highFee).toLocaleString()}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}

              {hasCreative && creativePhases.map((phase) => (
                <PhaseSection
                  key={phase.id}
                  phase={phase}
                  rates={rates}
                  onChange={handleCreativePhaseChange}
                />
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#f5f5f5] border-t border-[#e0e0e0] px-6 py-2 flex items-center justify-center gap-2.5 flex-shrink-0">
          <SummaryTile
            label="Low"
            fee={totalLowFee}
            hrs={totalLowHrs}
            selected={selectedBand === 'low'}
            onClick={() => setSelectedBand('low')}
          />
          <SummaryTile
            label="Mid"
            fee={totalMidFee}
            hrs={midHrs}
            selected={selectedBand === 'mid'}
            onClick={() => setSelectedBand('mid')}
          />
          <SummaryTile
            label="High"
            fee={totalHighFee}
            hrs={totalHighHrs}
            selected={selectedBand === 'high'}
            onClick={() => setSelectedBand('high')}
          />
          <button
            onClick={() => setShowSummary(true)}
            className="bg-[#fff230] rounded-xl px-6 h-[44px] flex items-center gap-2 font-bold text-xs text-black hover:bg-[#f5e820] transition-colors"
          >
            View client summary
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function sumHrs(d: DeliverableState, band: 'low' | 'high'): number {
  return d.clientService[band] + d.strategy[band] + d.design[band] + d.copywriter[band];
}

interface SummaryTileProps {
  label: string;
  fee: number;
  hrs: number;
  selected?: boolean;
  onClick?: () => void;
}

function SummaryTile({ label, fee, hrs, selected, onClick }: SummaryTileProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center rounded-xl px-6 h-[44px] gap-0 transition-all duration-150 outline-none
        ${selected ? 'bg-[#fff230]' : 'bg-[#e8e8e8] hover:bg-[#e0e0e0]'}
      `}
    >
      <p className="text-[8px] font-semibold uppercase tracking-widest text-black/40">
        {label}
      </p>
      <p className="text-xs font-bold leading-none text-black">
        ${Math.round(fee).toLocaleString()}
      </p>
      <p className="text-[10px] text-black/40 mt-0.5">
        {hrs} hrs
      </p>
    </button>
  );
}
