import { useState } from 'react';
import type { PaginationPage } from '../data/scopingData';

export interface DeliverableState {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  clientService: { low: number; high: number };
  strategy: { low: number; high: number };
  design: { low: number; high: number };
  copywriter: { low: number; high: number };
  pagination?: PaginationPage[];
  fixedFee?: number;
  thirdPartyCost?: number;
  addon?: boolean;
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
  if (deliverable.fixedFee !== undefined) return deliverable.fixedFee;
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
  { key: 'design', label: 'Design / Art Direction' },
  { key: 'copywriter', label: 'Copywriter' },
];

export function DeliverableRow({
  deliverable,
  rates,
  onChange,
}: DeliverableRowProps) {
  const [expanded, setExpanded] = useState(false);

  const isFixed = deliverable.fixedFee !== undefined;
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

  function updatePaginationPage(idx: number, updated: PaginationPage) {
    onChange({
      ...deliverable,
      pagination: deliverable.pagination!.map((p, i) => (i === idx ? updated : p)),
    });
  }

  function removePaginationPage(idx: number) {
    onChange({
      ...deliverable,
      pagination: deliverable.pagination!.filter((_, i) => i !== idx),
    });
  }

  function addPaginationPage() {
    onChange({
      ...deliverable,
      pagination: [...(deliverable.pagination || []), { text: '', isHeader: false }],
    });
  }

  const fmt = (n: number) => '$' + Math.round(n).toLocaleString();

  return (
    <div
      className={`bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden transition-opacity duration-200 ${
        deliverable.enabled ? '' : 'opacity-40'
      }`}
    >
      <div
        className="flex items-center gap-3 px-4 py-1.5 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <button
          onClick={toggleEnabled}
          className={`relative flex-shrink-0 w-8 h-5 rounded-full transition-colors duration-200 ${
            deliverable.enabled ? 'bg-[#111]' : 'bg-gray-300'
          }`}
          aria-label={deliverable.enabled ? 'Disable' : 'Enable'}
        >
          <span
            className={`absolute top-0.5 w-3.5 h-3.5 rounded-full transition-all duration-200 ${
              deliverable.enabled ? 'left-4 bg-[#fff230]' : 'left-0.5 bg-white'
            }`}
          />
        </button>

        <span
          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 ${
            deliverable.addon
              ? 'bg-orange-100 text-orange-500'
              : 'bg-green-100 text-green-600'
          }`}
        >
          {deliverable.addon ? 'Add-on' : 'Core'}
        </span>

        <span className="flex-1 text-[13px] font-semibold text-black">
          {deliverable.name}
        </span>

        <div className="flex gap-2 items-center mr-2">
          {isFixed ? (
            <span className="bg-gray-300 text-gray-700 text-[11px] py-0.5 rounded-full w-20 text-center">
              {fmt(deliverable.fixedFee!)}
            </span>
          ) : (
            <>
              <span className="bg-gray-100 text-gray-600 text-[11px] py-0.5 rounded-full w-14 text-center">
                {fmt(low)}
              </span>
              <span className="bg-gray-300 text-gray-700 text-[11px] py-0.5 rounded-full w-14 text-center">
                {fmt(mid)}
              </span>
              <span className="bg-gray-700 text-white text-[11px] py-0.5 rounded-full w-14 text-center">
                {fmt(high)}
              </span>
            </>
          )}
        </div>

        <svg
          className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {expanded && (
        <div className="border-t border-[#e8e8e8] px-4 pb-2 pt-2">
          <textarea
            value={deliverable.description}
            onChange={(e) => onChange({ ...deliverable, description: e.target.value })}
            rows={1}
            className="w-full text-[12px] text-black mb-2 bg-transparent border border-transparent hover:border-[#e8e8e8] focus:border-gray-300 rounded-lg px-2 py-0.5 -mx-2 resize-none focus:outline-none transition-colors"
          />

          {isFixed ? (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Third Party Costs (Ex GST)
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-[12px] text-gray-400">$</span>
                  <input
                    type="number"
                    min={0}
                    value={deliverable.thirdPartyCost ?? ''}
                    placeholder="0"
                    onChange={(e) =>
                      onChange({
                        ...deliverable,
                        thirdPartyCost: isNaN(parseFloat(e.target.value)) ? 0 : parseFloat(e.target.value),
                      })
                    }
                    className="w-28 border border-[#e8e8e8] rounded-lg px-2 py-1 text-[12px] text-black focus:outline-none focus:border-gray-400"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  Sell
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-[12px] text-gray-400">$</span>
                  <input
                    type="number"
                    min={0}
                    value={deliverable.fixedFee ?? ''}
                    placeholder="0"
                    onChange={(e) =>
                      onChange({
                        ...deliverable,
                        fixedFee: isNaN(parseFloat(e.target.value)) ? 0 : parseFloat(e.target.value),
                      })
                    }
                    className="w-28 border border-[#e8e8e8] rounded-lg px-2 py-1 text-[12px] text-black focus:outline-none focus:border-gray-400"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex">
              {DISCIPLINES.map(({ key, label }, i) => (
                <div
                  key={key}
                  className={`flex flex-col gap-1.5 flex-1 px-5 ${i === 0 ? 'pl-0' : ''}`}
                >
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                    {label}
                  </p>
                  <div className="flex gap-2">
                    {(['low', 'high'] as const).map((band) => (
                      <div key={band}>
                        <label className="text-[11px] text-gray-400 block mb-0.5 capitalize">
                          {band}
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={deliverable[key][band]}
                          onChange={(e) =>
                            updateHours(key, band, parseFloat(e.target.value))
                          }
                          className="w-12 border border-[#e8e8e8] rounded-lg px-2 py-1 text-[12px] text-black focus:outline-none focus:border-gray-400"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    ${Math.round(deliverable[key].low * rates[key]).toLocaleString()} -{' '}
                    ${Math.round(deliverable[key].high * rates[key]).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          {deliverable.pagination && (
            <div className="mt-5 pt-5 border-t border-[#e8e8e8]">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Proposed Brand Guideline Pagination
              </p>
              <div className="space-y-1.5">
                {deliverable.pagination.map((page, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-400 w-6 text-right flex-shrink-0">
                      {idx + 1}.
                    </span>
                    <button
                      onClick={() => updatePaginationPage(idx, { ...page, isHeader: !page.isHeader })}
                      title="Toggle section header"
                      className={`text-[11px] w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border transition-colors ${
                        page.isHeader
                          ? 'border-gray-600 bg-gray-100 text-gray-700 font-bold'
                          : 'border-gray-200 text-gray-400 hover:border-gray-400'
                      }`}
                    >
                      B
                    </button>
                    <input
                      type="text"
                      value={page.text}
                      onChange={(e) => updatePaginationPage(idx, { ...page, text: e.target.value })}
                      className={`flex-1 text-[13px] border border-[#e8e8e8] rounded-lg px-2.5 py-1 focus:outline-none focus:border-gray-400 ${
                        page.isHeader ? 'font-bold text-black' : 'text-gray-700'
                      }`}
                    />
                    <button
                      onClick={() => removePaginationPage(idx)}
                      className="text-gray-300 hover:text-red-400 text-sm flex-shrink-0 leading-none"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addPaginationPage}
                className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                + Add page
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { calcCost };
export type { Rates };
