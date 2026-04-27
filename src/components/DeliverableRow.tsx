import { useState } from 'react';

export interface DeliverableState {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  clientService: { low: number; high: number };
  strategy: { low: number; high: number };
  design: { low: number; high: number };
  copywriter: { low: number; high: number };
}

interface Rates {
  clientService: number;
  strategy: number;
  design: number;
  copywriter: number;
}

function calcCost(
  deliverable: DeliverableState,
  rates: Rates,
  band: 'low' | 'mid' | 'high'
): number {
  const disciplines: (keyof Rates)[] = [
    'clientService',
    'strategy',
    'design',
    'copywriter',
  ];
  if (band === 'low') {
    return disciplines.reduce(
      (sum, d) => sum + deliverable[d].low * rates[d],
      0
    );
  }
  if (band === 'high') {
    return disciplines.reduce(
      (sum, d) => sum + deliverable[d].high * rates[d],
      0
    );
  }
  const low = calcCost(deliverable, rates, 'low');
  const high = calcCost(deliverable, rates, 'high');
  return (low + high) / 2;
}

interface DeliverableRowProps {
  deliverable: DeliverableState;
  rates: Rates;
  onChange: (updated: DeliverableState) => void;
}

const DISCIPLINES: { key: keyof Rates; label: string }[] = [
  { key: 'clientService', label: 'Client service' },
  { key: 'strategy', label: 'Strategy' },
  { key: 'design', label: 'Design / AD' },
  { key: 'copywriter', label: 'Copywriter' },
];

export function DeliverableRow({
  deliverable,
  rates,
  onChange,
}: DeliverableRowProps) {
  const [expanded, setExpanded] = useState(false);

  const low = calcCost(deliverable, rates, 'low');
  const mid = calcCost(deliverable, rates, 'mid');
  const high = calcCost(deliverable, rates, 'high');

  function toggleEnabled(e: React.MouseEvent) {
    e.stopPropagation();
    onChange({ ...deliverable, enabled: !deliverable.enabled });
  }

  function updateHours(
    discipline: keyof Rates,
    band: 'low' | 'high',
    value: number
  ) {
    onChange({
      ...deliverable,
      [discipline]: {
        ...deliverable[discipline],
        [band]: isNaN(value) ? 0 : value,
      },
    });
  }

  const fmt = (n: number) =>
    '$' + Math.round(n).toLocaleString();

  return (
    <div
      className={`bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden transition-opacity duration-200 ${
        deliverable.enabled ? '' : 'opacity-40'
      }`}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <button
          onClick={toggleEnabled}
          className={`relative flex-shrink-0 w-10 h-6 rounded-full transition-colors duration-200 ${
            deliverable.enabled ? 'bg-[#111]' : 'bg-gray-300'
          }`}
          aria-label={deliverable.enabled ? 'Disable' : 'Enable'}
        >
          <span
            className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-200 ${
              deliverable.enabled
                ? 'left-5 bg-[#fff230]'
                : 'left-1 bg-white'
            }`}
          />
        </button>

        <span className="flex-1 text-sm font-semibold text-black">
          {deliverable.name}
        </span>

        <div className="flex gap-2 items-center mr-2">
          <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">
            {fmt(low)}
          </span>
          <span className="bg-gray-300 text-gray-700 text-xs px-2.5 py-1 rounded-full">
            {fmt(mid)}
          </span>
          <span className="bg-gray-700 text-white text-xs px-2.5 py-1 rounded-full">
            {fmt(high)}
          </span>
        </div>

        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
            expanded ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {expanded && (
        <div className="border-t border-[#e8e8e8] px-4 pb-4 pt-4">
          <p className="text-sm text-gray-500 mb-5">{deliverable.description}</p>

          <div className="grid grid-cols-4 gap-4">
            {DISCIPLINES.map(({ key, label }) => (
              <div key={key}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {label}
                </p>
                <div className="space-y-2">
                  {(['low', 'high'] as const).map((band) => (
                    <div key={band}>
                      <label className="text-xs text-gray-400 block mb-1 capitalize">
                        {band} hrs
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={deliverable[key][band]}
                        onChange={(e) =>
                          updateHours(key, band, parseFloat(e.target.value))
                        }
                        className="w-full border border-[#e8e8e8] rounded-lg px-2.5 py-1.5 text-sm text-black focus:outline-none focus:border-gray-400"
                      />
                    </div>
                  ))}
                  <p className="text-xs text-gray-400 pt-1">
                    ${Math.round(deliverable[key].low * rates[key]).toLocaleString()} -{' '}
                    ${Math.round(deliverable[key].high * rates[key]).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export { calcCost };
export type { Rates };
