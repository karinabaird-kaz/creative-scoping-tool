import { useState } from 'react';
import { DEFAULT_RATE, DISCIPLINES } from '../data/effortCalculatorData';
import { Logo } from './Logo';

interface Row {
  id: string;
  name: string;
  isCustom: boolean;
  r1: number;
  r2: number;
  r3: number;
  r4: number;
  r5: number;
  meetings: number;
  contingency: number;
  rateOverride: number | null;
}

interface EffortCalculatorProps {
  onBack: () => void;
  onHome: () => void;
}

let rowCounter = 0;
function newId() {
  return `row-${++rowCounter}`;
}

function makeRow(name: string, isCustom = false): Row {
  return {
    id: newId(), name, isCustom,
    r1: 0, r2: 0, r3: 0, r4: 0, r5: 0,
    meetings: 0, contingency: 0,
    rateOverride: null,
  };
}

function makeRows(): Row[] {
  return DISCIPLINES.map((name) => makeRow(name, false));
}

const HRS_FIELDS = ['r1', 'r2', 'r3', 'r4', 'r5', 'meetings', 'contingency'] as const;
type HrsField = (typeof HRS_FIELDS)[number];

function getHoursTotal(row: Row): number {
  return row.r1 + row.r2 + row.r3 + row.r4 + row.r5 + row.meetings + row.contingency;
}

function getEffectiveRate(row: Row, globalRate: number): number {
  return row.rateOverride ?? globalRate;
}

function getCost(row: Row, globalRate: number): number {
  return getHoursTotal(row) * getEffectiveRate(row, globalRate);
}

function fmt(n: number): string {
  return '$' + Math.round(n).toLocaleString();
}

function numDisplay(n: number): string {
  return n === 0 ? '' : String(n);
}

export function EffortCalculator({ onBack, onHome }: EffortCalculatorProps) {
  const [rows, setRows] = useState<Row[]>(makeRows);
  const [globalRate, setGlobalRate] = useState(DEFAULT_RATE);
  const [projectName, setProjectName] = useState('');
  const [scopeText, setScopeText] = useState('');
  const [notes, setNotes] = useState('');

  function updateHours(id: string, field: HrsField, raw: string) {
    const value = raw === '' ? 0 : parseFloat(raw);
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: isNaN(value) ? 0 : value } : r))
    );
  }

  function updateRateOverride(id: string, raw: string) {
    const value = raw === '' ? null : parseFloat(raw);
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, rateOverride: value === null || isNaN(value) ? null : value } : r
      )
    );
  }

  function clearRateOverride(id: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, rateOverride: null } : r)));
  }

  function updateRowName(id: string, name: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, name } : r)));
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function addCustomRow() {
    setRows((prev) => [...prev, makeRow('', true)]);
  }

  function reset() {
    setRows(makeRows());
    setGlobalRate(DEFAULT_RATE);
    setProjectName('');
    setScopeText('');
    setNotes('');
  }

  // Totals
  const totalR1 = rows.reduce((s, r) => s + r.r1, 0);
  const totalR2 = rows.reduce((s, r) => s + r.r2, 0);
  const totalR3 = rows.reduce((s, r) => s + r.r3, 0);
  const totalR4 = rows.reduce((s, r) => s + r.r4, 0);
  const totalR5 = rows.reduce((s, r) => s + r.r5, 0);
  const totalMeetings = rows.reduce((s, r) => s + r.meetings, 0);
  const totalContingency = rows.reduce((s, r) => s + r.contingency, 0);
  const totalHrs = rows.reduce((s, r) => s + getHoursTotal(r), 0);
  const totalCost = rows.reduce((s, r) => s + getCost(r, globalRate), 0);

  function exportCSV() {
    const meta: (string | number)[][] = [];
    if (projectName) meta.push([`Client / Project: ${projectName}`]);
    if (scopeText) meta.push([scopeText]);
    if (meta.length) meta.push(['']);

    const headers = [
      'Discipline', 'Round 1', 'Round 2', 'Round 3', 'Round 4', 'Round 5',
      'Meetings / Admin', 'Contingency', 'Hours Total', '$ per Hour', 'Cost ($)',
    ];

    const dataRows = rows.map((r) => [
      r.name,
      r.r1, r.r2, r.r3, r.r4, r.r5,
      r.meetings, r.contingency,
      getHoursTotal(r),
      getEffectiveRate(r, globalRate),
      Math.round(getCost(r, globalRate)),
    ]);

    const summary = [
      'TOTAL', totalR1, totalR2, totalR3, totalR4, totalR5,
      totalMeetings, totalContingency, totalHrs, '', Math.round(totalCost),
    ];

    const noteRows: (string | number)[][] = [];
    if (notes.trim()) {
      noteRows.push(['']);
      noteRows.push(['Notes']);
      notes.split('\n').forEach((line) => noteRows.push([line]));
    }

    const allRows = [...meta, headers, ...dataRows, summary, ...noteRows];
    const csv = allRows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const filename = projectName ? `${projectName} - Effort Calculator.csv` : 'Effort Calculator.csv';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const colHdr = 'py-2 px-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider';

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo className="h-5 w-auto brightness-0" onClick={onHome} />
          <span className="text-gray-200 text-lg">|</span>
          <h1 className="text-black text-[15px] font-bold">Effort Calculator</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            className="text-gray-500 hover:text-black text-xs border border-gray-200 rounded-full px-4 py-1.5 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 text-black bg-[#fff230] hover:bg-yellow-300 text-xs font-semibold rounded-full px-4 py-1.5 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-gray-500 hover:text-black text-xs border border-gray-200 rounded-full px-4 py-1.5 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>
      </div>

      <div className="px-6 py-4">

        {/* ── Project name + scope ── */}
        <div className="flex items-start gap-4 mb-4">
          {/* Client / Project name — compact, same width as global rate area */}
          <div className="flex-shrink-0">
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Client / Project Name
            </label>
            <div className="flex items-center border border-gray-200 rounded-lg px-2.5 py-1.5">
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Client — Project"
                className="w-44 text-[13px] text-black focus:outline-none placeholder-gray-300"
              />
            </div>
          </div>

          {/* Scope / Description — grows, 10-line textarea */}
          <div className="flex-1">
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Scope / Description
            </label>
            <textarea
              value={scopeText}
              onChange={(e) => setScopeText(e.target.value)}
              placeholder="Brief description of scope or assumptions…"
              rows={10}
              className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-[13px] text-black focus:outline-none focus:border-gray-400 placeholder-gray-300 resize-none"
            />
          </div>
        </div>

        {/* ── Global rate ── */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
            Global rate
          </span>
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg px-2.5 py-1">
            <span className="text-xs text-gray-400">$</span>
            <input
              type="number"
              min={0}
              value={globalRate}
              onChange={(e) => setGlobalRate(parseFloat(e.target.value) || 0)}
              className="w-16 text-sm text-black focus:outline-none"
            />
            <span className="text-xs text-gray-400">/hr</span>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[12px]" style={{ minWidth: '1060px' }}>
            <thead>
              <tr className="border-b-2 border-gray-100">
                <th className={`${colHdr} text-left pl-0 w-36`}>Discipline</th>
                <th className={`${colHdr} text-center w-14`}>Round 1</th>
                <th className={`${colHdr} text-center w-14`}>Round 2</th>
                <th className={`${colHdr} text-center w-14`}>Round 3</th>
                <th className={`${colHdr} text-center w-14`}>Round 4</th>
                <th className={`${colHdr} text-center w-14`}>Round 5</th>
                <th className={`${colHdr} text-center w-20`}>Meetings / Admin</th>
                <th className={`${colHdr} text-center w-18`}>Contingency</th>
                <th className={`${colHdr} text-center w-14`}>Hrs Total</th>
                <th className={`${colHdr} text-center w-20`}>$ / hr</th>
                <th className={`${colHdr} text-right w-20 pr-0`}>Cost</th>
                <th className="w-5" />
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => {
                const hrs = getHoursTotal(row);
                const cost = getCost(row, globalRate);
                const isOverridden = row.rateOverride !== null;

                return (
                  <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/60 group">
                    {/* Discipline name */}
                    <td className="py-1 pr-2 pl-0">
                      {row.isCustom ? (
                        <input
                          type="text"
                          value={row.name}
                          placeholder="Custom…"
                          onChange={(e) => updateRowName(row.id, e.target.value)}
                          className="w-full border border-transparent focus:border-gray-300 rounded-md px-1.5 py-0.5 text-black focus:outline-none text-[12px] placeholder-gray-300 bg-transparent"
                        />
                      ) : (
                        <span className="font-medium text-black whitespace-nowrap">{row.name}</span>
                      )}
                    </td>

                    {/* Hour inputs */}
                    {HRS_FIELDS.map((field) => (
                      <td key={field} className="py-1 px-1 text-center">
                        <input
                          type="number"
                          min={0}
                          step={0.5}
                          value={numDisplay(row[field])}
                          placeholder="—"
                          onChange={(e) => updateHours(row.id, field, e.target.value)}
                          className="w-full text-center border border-transparent group-hover:border-gray-200 rounded-md px-1 py-0.5 text-black focus:outline-none focus:border-gray-300 bg-transparent placeholder-gray-300 transition-colors"
                        />
                      </td>
                    ))}

                    {/* Hours total */}
                    <td className="py-1 px-1 text-center font-semibold text-black">
                      {hrs > 0 ? hrs : <span className="text-gray-300">—</span>}
                    </td>

                    {/* Rate */}
                    <td className="py-1 px-1 text-center">
                      <div className="flex items-center gap-0.5 border border-gray-200 rounded-md px-1.5 py-0.5">
                        <span className="text-[10px] text-gray-400">$</span>
                        <input
                          type="number"
                          min={0}
                          value={isOverridden ? String(row.rateOverride) : String(globalRate)}
                          onChange={(e) => updateRateOverride(row.id, e.target.value)}
                          className="w-12 text-center text-black bg-transparent focus:outline-none text-[12px]"
                        />
                      </div>
                      {isOverridden && (
                        <button
                          onClick={() => clearRateOverride(row.id)}
                          className="text-[9px] text-gray-400 hover:text-red-400 transition-colors mt-0.5 block mx-auto"
                        >
                          reset
                        </button>
                      )}
                    </td>

                    {/* Cost */}
                    <td className="py-1 pl-2 text-right font-semibold text-black pr-0">
                      {cost > 0 ? fmt(cost) : <span className="text-gray-300">—</span>}
                    </td>

                    {/* Remove */}
                    <td className="py-1 pl-1.5 pr-0">
                      <button
                        onClick={() => removeRow(row.id)}
                        title="Remove row"
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all leading-none text-sm"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            <tfoot>
              <tr className="border-t-2 border-gray-200 bg-gray-50">
                <td className="py-2 pr-2 text-[10px] font-bold text-gray-600 uppercase tracking-wider pl-0">
                  Total
                </td>
                {[totalR1, totalR2, totalR3, totalR4, totalR5, totalMeetings, totalContingency].map((v, i) => (
                  <td key={i} className="py-2 px-1 text-center font-semibold text-black">
                    {v > 0 ? v : <span className="text-gray-300">—</span>}
                  </td>
                ))}
                <td className="py-2 px-1 text-center font-bold text-black">
                  {totalHrs > 0 ? totalHrs : <span className="text-gray-300">—</span>}
                </td>
                <td className="py-2 px-1" />
                <td className="py-2 pl-2 text-right font-bold text-black text-[13px] pr-0">
                  {totalCost > 0 ? fmt(totalCost) : <span className="text-gray-300">—</span>}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Add row */}
        <button
          onClick={addCustomRow}
          className="mt-2.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
        >
          + Add row
        </button>

        {/* ── Notes section ── */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Notes
          </p>
          <textarea
            value={notes}
            onChange={(e) => {
              // Allow max 3 lines
              const lines = e.target.value.split('\n');
              if (lines.length <= 3) setNotes(e.target.value);
            }}
            placeholder="Add notes here (up to 3 lines)…"
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-black focus:outline-none focus:border-gray-400 placeholder-gray-300 resize-none"
          />
        </div>

      </div>
    </div>
  );
}
