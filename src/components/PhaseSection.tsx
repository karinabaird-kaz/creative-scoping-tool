import { DeliverableRow } from './DeliverableRow';
import type { DeliverableState, Rates } from './DeliverableRow';

export interface PhaseState {
  id: string;
  title: string;
  objective: string;
  deliverables: DeliverableState[];
}

interface PhaseSectionProps {
  phase: PhaseState;
  rates: Rates;
  onChange: (updated: PhaseState) => void;
}

function stripPhaseNumber(title: string): string {
  return title.replace(/^\d+\s*-\s*/, '');
}

export function PhaseSection({ phase, rates, onChange }: PhaseSectionProps) {
  function handleDeliverableChange(updated: DeliverableState) {
    onChange({
      ...phase,
      deliverables: phase.deliverables.map((d) =>
        d.id === updated.id ? updated : d
      ),
    });
  }

  return (
    <div className="mb-2">
      <h3 className="text-[12px] font-bold text-black mb-0.5">
        {stripPhaseNumber(phase.title)}
      </h3>
      <p className="text-[10px] text-black mb-1.5">{phase.objective}</p>

      {/* Column headers */}
      <div className="flex items-center px-3 mb-1">
        <div className="flex-1" />
        <div className="flex gap-1.5 items-center mr-6">
          <span className="text-[8px] font-semibold text-gray-400 uppercase tracking-widest w-12 text-center">Low</span>
          <span className="text-[8px] font-semibold text-gray-400 uppercase tracking-widest w-12 text-center">Mid</span>
          <span className="text-[8px] font-semibold text-gray-400 uppercase tracking-widest w-12 text-center">High</span>
        </div>
      </div>

      <div className="space-y-1">
        {phase.deliverables.map((d) => (
          <DeliverableRow
            key={d.id}
            deliverable={d}
            rates={rates}
            onChange={handleDeliverableChange}
          />
        ))}
      </div>
    </div>
  );
}
