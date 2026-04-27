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
    <div className="mb-8">
      <h3 className="text-base font-bold text-black mb-1">{phase.title}</h3>
      <p className="text-xs text-gray-500 mb-4">{phase.objective}</p>
      <div className="space-y-3">
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
