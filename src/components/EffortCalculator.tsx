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
  return { id: newId(), name, isCustom, r1: 0, r2: 0, r3: 0, meetings: 0, contingency: 0, rateOverride: null };
}

function makeRows(): Row[] {
  return [
    ...DISCIPLINES.map((name) => makeRow(name, false)),
    makeRow('', true),
    makeRow('', true),
  ];
}

const HRS_FIELDS = ['r1', 'r2', 'r3', 'meetings', 'contingency'] as const;
type HrsField = (typeof HRS_FIELDS)[number];

function getHoursTotal(row: Row): number {
  return row.r1 + row.r2 + row.r3 + row.meetings + row.contingency;
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
  const [notes, setNotes] = useState(['', '', '']);

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

  function updateNote(i: number, val: string) {
    setNotes((prev) => prev.map((n, idx) => (idx === i ? val : n)));
  }

  function reset() {
    setRows(makeRows());
    setGlobalRate(DEFAULT_RATE);
    setProjectName('');
    setScopeText('');
    setNotes(['', '', '']);
  }

  // Totals
  const totalR1 = rows.reduce((s, r) => s + r.r1, 0);
  const totalR2 = rows.reduce((s, r) => s + r.r2, 0);
  const totalR3 = rows.reduce((s, r) => s + r.r3, 0);
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
      'Discipline', 'Round 1', 'Round 2', 'Round 3',
      'Meetings / Admin', 'Contingency', 'Hours Total', '$ per Hour', 'Cost ($)',
    ];

    const dataRows = rows.map((r) => [
      r.name,
      r.r1, r.r2, r.r3,
      r.meetings, r.contingency,
      getHoursTotal(r),
      getEffectiveRate(r, globalRate),
      Math.round(getCost(r, globalRate)),
    ]);

    const summary = [
      'TOTAL', totalR1, totalR2, totalR3, totalMeetings,
      totalContingency, totalHrs, '', Math.round(totalCost),
    ];

    const noteRows: (string | number)[][] = [];
    const filledNotes = notes.filter((n) => n.trim());
    if (filledNotes.length) {
      noteRows.push(['']);
      noteRows.push(['Notes']);
      filledNotes.forEach((n) => noteRows.push([n]));
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

  const colHdr = 'py-2.5 px-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider';
  const inputBase = 'w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-[13px] text-black focus:outline-none focus:border-gray-400 placeholder-gray-300';

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-8 py-3 flex items-center justify-between">
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

      <div className="px-8 py-5 max-w-6xl">

        {/* ── Project / scope section ── */}
        <div className="mb-5 grid grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Client / Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. Acme Co — Brand Campaign 2026"
              className={inputBase}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Scope / Description
            </label>
            <input
              type="text"
              value={scopeText}
              onChange={(e) => setScopeText(e.target.value)}
              placeholder="Brief description of scope or assumptions…"
              className={inputBase}
            />
          </div>
        </div>

        {/* ── Global rate ── */}
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
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
          <span className="text-[11px] text-gray-400">
            Default for all rows — edit any $/hr cell to override individually
          </span>
        </div>

        {/* ── Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[12px]" style={{ minWidth: '900px' }}>
            <thead>
              <tr className="border-b-2 border-gray-100">
                <th className={`${colHdr} text-left pl-0 w-44`}>Discipline</th>
                <th className={`${colHdr} text-center w-16`}>Round 1</th>
                <th className={`${colHdr} text-center w-16`}>Round 2</th>
                <th className={`${colHdr} text-center w-16`}>Round 3</th>
                <th className={`${colHdr} text-center w-24`}>Meetings / Admin</th>
                <th className={`${colHdr} text-center w-20`}>Contingency</th>
                <th className={`${colHdr} text-center w-16`}>Hrs Total</th>
                <th className={`${colHdr} text-center w-24`}>$ / hr</th>
                <th className={`${colHdr} text-right w-24 pr-0`}>Cost</th>
                <th className="w-6" />
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
                    <td className="py-1.5 pr-3 pl-0">
                      {row.isCustom ? (
                        <input
                          type="text"
                          value={row.name}
                          placeholder="Custom discipline…"
                          onChange={(e) => updateRowName(row.id, e.target.value)}
                          className="w-full border border-transparent focus:border-gray-300 rounded-md px-1.5 py-0.5 text-black focus:outline-none text-[12px] placeholder-gray-300 bg-transparent"
                        />
                      ) : (
                        <span className="font-medium text-black whitespace-nowrap">{row.name}</span>
                      )}
                    </td>

                    {/* Hour inputs */}
                    {HRS_FIELDS.map((field) => (
                      <td key={field} className="py-1.5 px-1.5 text-center">
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
                    <td className="py-1.5 px-1.5 text-center font-semibold text-black">
                      {hrs > 0 ? hrs : <span className="text-gray-300">—</span>}
                    </td>

                    {/* Rate */}
                    <td className="py-1.5 px-1.5 text-center">
                      <div
                        className={`flex items-center gap-0.5 border rounded-md px-1.5 py-0.5 transition-colors ${
                          isOverridden ? 'border-[#d4b800] bg-[#fffde7]' : 'border-gray-200'
                        }`}
                      >
                        <span className="text-[10px] text-gray-400">$</span>
                        <input
                          type="number"
                          min={0}
                          value={isOverridden ? String(row.rateOverride) : String(globalRate)}
                          onChange={(e) => updateRateOverride(row.id, e.target.value)}
                          className="w-14 text-center text-black bg-transparent focus:outline-none text-[12px]"
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
                    <td className="py-1.5 pl-3 text-right font-semibold text-black pr-0">
                      {cost > 0 ? fmt(cost) : <span className="text-gray-300">—</span>}
                    </td>

                    {/* Remove */}
                    <td className="py-1.5 pl-2 pr-0">
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
                <td className="py-2.5 pr-3 text-[10px] font-bold text-gray-600 uppercase tracking-wider pl-0">
                  Total
                </td>
                {[totalR1, totalR2, totalR3, totalMeetings, totalContingency].map((v, i) => (
                  <td key={i} className="py-2.5 px-1.5 text-center font-semibold text-black">
                    {v > 0 ? v : <span className="text-gray-300">—</span>}
                  </td>
                ))}
                <td className="py-2.5 px-1.5 text-center font-bold text-black">
                  {totalHrs > 0 ? totalHrs : <span className="text-gray-300">—</span>}
                </td>
                <td className="py-2.5 px-1.5" />
                <td className="py-2.5 pl-3 text-right font-bold text-black text-[14px] pr-0">
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
          className="mt-3 text-xs text-gray-400 hover:text-gray-700 transition-colors"
        >
          + Add row
        </button>

        {/* ── Notes section ── */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Notes
          </p>
          <div className="space-y-2">
            {notes.map((note, i) => (
              <input
                key={i}
                type="text"
                value={note}
                onChange={(e) => updateNote(i, e.target.value)}
                placeholder={`Note ${i + 1}…`}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-[13px] text-black focus:outline-none focus:border-gray-400 placeholder-gray-300"
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
