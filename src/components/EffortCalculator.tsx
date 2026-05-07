import { useState } from 'react';
import writeXlsxFile from 'write-excel-file/browser';
import { DEFAULT_RATE, DISCIPLINES } from '../data/effortCalculatorData';
import { Logo } from './Logo';
import { ScopeGeneratorModal } from './ScopeGeneratorModal';

interface Row {
  id: string;
  name: string;
  isCustom: boolean;
  r1: number;
  r2: number;
  r3: number;
  r4: number;
  r5: number;
  r6: number;
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
    r1: 0, r2: 0, r3: 0, r4: 0, r5: 0, r6: 0,
    meetings: 0, contingency: 0,
    rateOverride: null,
  };
}

function makeRows(): Row[] {
  return DISCIPLINES.map((name) => makeRow(name, false));
}

const HRS_FIELDS = ['r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'meetings', 'contingency'] as const;
type HrsField = (typeof HRS_FIELDS)[number];

function getHoursTotal(row: Row): number {
  return row.r1 + row.r2 + row.r3 + row.r4 + row.r5 + row.r6 + row.meetings + row.contingency;
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
  const [clientName, setClientName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [proposalDesc, setProposalDesc] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [roundNotes, setRoundNotes] = useState({ r1: '', r2: '', r3: '', r4: '', r5: '', r6: '' });
  const [isScopeGeneratorOpen, setIsScopeGeneratorOpen] = useState(false);

  function handleScopeGenerated(text: string) {
    setProposalDesc(text);
  }

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
    setClientName('');
    setProjectName('');
    setProposalDesc('');
    setInternalNotes('');
    setRoundNotes({ r1: '', r2: '', r3: '', r4: '', r5: '', r6: '' });
  }

  // Totals
  const totalR1 = rows.reduce((s, r) => s + r.r1, 0);
  const totalR2 = rows.reduce((s, r) => s + r.r2, 0);
  const totalR3 = rows.reduce((s, r) => s + r.r3, 0);
  const totalR4 = rows.reduce((s, r) => s + r.r4, 0);
  const totalR5 = rows.reduce((s, r) => s + r.r5, 0);
  const totalR6 = rows.reduce((s, r) => s + r.r6, 0);
  const totalMeetings = rows.reduce((s, r) => s + r.meetings, 0);
  const totalContingency = rows.reduce((s, r) => s + r.contingency, 0);
  const totalHrs = rows.reduce((s, r) => s + getHoursTotal(r), 0);
  const totalCost = rows.reduce((s, r) => s + getCost(r, globalRate), 0);

  async function exportXLSX() {
    const filename = [clientName, projectName].filter(Boolean).join(' ')
      ? `${[clientName, projectName].filter(Boolean).join(' ')} - Effort Calculator`
      : 'Effort Calculator';

    type Cell = {
      value?: string | number | null;
      type?: StringConstructor | NumberConstructor;
      fontWeight?: 'bold';
      fontSize?: number;
      align?: 'left' | 'center' | 'right';
      alignVertical?: 'top' | 'center' | 'bottom';
      format?: string;
      span?: number;
      wrap?: boolean;
    };

    const c = (value: number, bold = false, format?: string): Cell => ({
      value, type: Number, align: 'center',
      fontWeight: bold ? 'bold' : undefined, fontSize: 10, format,
    });
    const hdr = (value: string): Cell => ({
      value, fontWeight: 'bold', align: 'center', fontSize: 10,
    });
    const empty: Cell = { value: null };

    // ── Build notes text: R1–R6 rows + additional notes ──
    const roundLines = (['r1','r2','r3','r4','r5','r6'] as const)
      .filter((k) => roundNotes[k].trim())
      .map((k) => `${k.toUpperCase()}  ${roundNotes[k]}`);
    let notesText = roundLines.join('\n');
    if (internalNotes.trim()) {
      notesText = notesText ? `${notesText}\n\n${internalNotes}` : internalNotes;
    }

    // ── Row 1: A1:L1 merged (proposal desc) + M1 (notes) ──
    // span:12 occupies cols A–L; 11 nulls fill B–L; notesCell lands in M
    const topRow: Cell[] = [
      {
        value: proposalDesc || null,
        type: String,
        span: 12,
        wrap: true,
        align: 'left',
        alignVertical: 'top',
        fontSize: 10,
      },
      null as unknown as Cell, null as unknown as Cell, null as unknown as Cell,
      null as unknown as Cell, null as unknown as Cell, null as unknown as Cell,
      null as unknown as Cell, null as unknown as Cell, null as unknown as Cell,
      null as unknown as Cell, null as unknown as Cell, // 11 nulls (B–L)
      {
        value: notesText || null,
        type: String,
        wrap: true,
        align: 'left',
        alignVertical: 'top',
        fontSize: 10,
      },
    ];

    // ── Row 2: blank spacer ──
    const blankRow: Cell[] = Array(13).fill(empty);

    // ── Row 3: headers ──
    const headerRow: Cell[] = [
      { value: 'Service', fontWeight: 'bold', align: 'left', fontSize: 10 },
      hdr('Round 1'), hdr('Round 2'), hdr('Round 3'), hdr('Round 4'), hdr('Round 5'), hdr('Round 6'),
      hdr('Meetings'), hdr('FAT'),
      hdr('Hours Total'), hdr('$ per Hour'), hdr('Cost ($)'),
      empty,
    ];

    // ── Data rows ──
    const dataRows: Cell[][] = rows.map((r) => {
      const hrs = getHoursTotal(r);
      const rate = getEffectiveRate(r, globalRate);
      return [
        { value: r.name, type: String, align: 'left', fontSize: 10 },
        c(r.r1), c(r.r2), c(r.r3), c(r.r4), c(r.r5), c(r.r6),
        c(r.meetings), c(r.contingency),
        c(hrs), c(rate),
        c(hrs * rate, false, '$#,##0.00'),
        empty,
      ];
    });

    // ── Total row ──
    const totalRow: Cell[] = [
      { value: 'TOTAL', fontWeight: 'bold', align: 'left', fontSize: 10 },
      c(totalR1, true), c(totalR2, true), c(totalR3, true),
      c(totalR4, true), c(totalR5, true), c(totalR6, true),
      c(totalMeetings, true), c(totalContingency, true),
      c(totalHrs, true),
      empty,
      c(totalCost, true, '$#,##0.00'),
      empty,
    ];

    const sheetData = [topRow, blankRow, headerRow, ...dataRows, totalRow];
    const sheetOptions = {
      columns: [
        { width: 24 }, { width: 10 }, { width: 10 }, { width: 10 },
        { width: 10 }, { width: 10 }, { width: 10 }, { width: 14 },
        { width: 10 }, { width: 13 }, { width: 12 }, { width: 13 },
        { width: 64 }, // col M — Notes
      ],
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (writeXlsxFile as any)(sheetData, sheetOptions, { fontFamily: 'Arial', fontSize: 10 });
    await result.toFile(`${filename}.xlsx`);
  }

  const colHdr = 'py-2 px-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider';
  const sectionLabel = 'block text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-1.5';
  // All three left-column fields share the same fixed width and inner height
  const fieldWidth = 'w-52';
  const fieldInner = 'w-full bg-white border border-white/20 rounded-lg px-3 h-9 flex items-center';

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-white/10 px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo className="h-5 w-auto" onClick={onHome} />
          <span className="text-white/20 text-lg">|</span>
          <h1 className="text-white text-[15px] font-bold">Effort Calculator</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            className="text-white/50 hover:text-white text-xs border border-white/20 rounded-full px-4 py-1.5 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={exportXLSX}
            className="flex items-center gap-1.5 text-black bg-[#fff230] hover:bg-yellow-300 text-xs font-semibold rounded-full px-4 py-1.5 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Excel
          </button>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-white/50 hover:text-white text-xs border border-white/20 rounded-full px-4 py-1.5 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>
      </div>

      <div className="px-6 py-4">

        {/* ── Top: [3 stacked fields] [Internal Notes] ── */}
        <div className="flex items-stretch gap-4 mb-5">

          {/* Left column: 3 equal-width equal-height fields */}
          <div className={`flex-shrink-0 ${fieldWidth} flex flex-col gap-3`}>
            {/* Client */}
            <div>
              <label className={sectionLabel}>Client</label>
              <div className={fieldInner}>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Client name"
                  className="w-full text-[13px] text-black focus:outline-none placeholder-gray-300 bg-transparent"
                />
              </div>
            </div>

            {/* Project Name */}
            <div>
              <label className={sectionLabel}>Project Name</label>
              <div className={fieldInner}>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Project name"
                  className="w-full text-[13px] text-black focus:outline-none placeholder-gray-300 bg-transparent"
                />
              </div>
            </div>

            {/* Global Rate */}
            <div>
              <label className={sectionLabel}>Cost Rate</label>
              <div className={`${fieldInner} gap-1`}>
                <span className="text-xs text-gray-400 flex-shrink-0">$</span>
                <input
                  type="number"
                  min={0}
                  value={globalRate}
                  onChange={(e) => setGlobalRate(parseFloat(e.target.value) || 0)}
                  className="flex-1 text-[13px] text-black focus:outline-none bg-transparent"
                />
                <span className="text-xs text-gray-400 flex-shrink-0">/hr</span>
              </div>
            </div>
          </div>

          {/* Right: Internal Notes — round rows + free-form in one box */}
          <div className="flex-1 flex flex-col">
            <label className={sectionLabel}>Internal Notes</label>
            <div className="flex-1 bg-white border border-white/20 rounded-lg flex flex-row overflow-hidden">

              {/* Left: R1–R6 structured rows — takes up majority of space */}
              <div className="flex-1 px-3 pt-2.5 pb-2.5 flex flex-col gap-0.5">
                {(['r1','r2','r3','r4','r5','r6'] as const).map((key) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase w-5 flex-shrink-0">
                      {key.toUpperCase()}
                    </span>
                    <input
                      type="text"
                      value={roundNotes[key]}
                      onChange={(e) => setRoundNotes((prev) => ({ ...prev, [key]: e.target.value }))}
                      placeholder="—"
                      className="flex-1 text-[12px] text-black placeholder-gray-300 focus:outline-none bg-transparent py-0.5"
                    />
                  </div>
                ))}
              </div>

              {/* Vertical divider */}
              <div className="border-l border-gray-200 my-2.5" />

              {/* Right: Free-form notes — fixed narrower width */}
              <textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Additional notes…"
                className="w-[28rem] flex-shrink-0 px-3 py-2.5 text-[12px] text-black focus:outline-none placeholder-gray-300 resize-none bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* ── Bottom: Proposal Description (left) | Effort Calc table (right) ── */}
        <div className="flex gap-4 items-stretch">

          {/* Left: Proposal Description — stretches to match table height */}
          <div className="flex-1 flex flex-col min-w-0">
            <label className={sectionLabel}>Proposal Description</label>
            <div className="relative flex-1 flex flex-col">
              <textarea
                value={proposalDesc}
                onChange={(e) => setProposalDesc(e.target.value)}
                placeholder="Enter proposal description and terms & conditions…"
                className="flex-1 w-full bg-white border border-white/20 rounded-xl px-4 py-3 pb-10 text-[13px] text-black focus:outline-none focus:border-white/40 placeholder-gray-300 resize-none"
              />
              <button
                onClick={() => setIsScopeGeneratorOpen(true)}
                className="absolute bottom-3 right-3 text-[11px] px-3 py-1 bg-[#fff230] hover:bg-yellow-300 text-black rounded-full font-semibold transition-colors"
              >
                Generate Description
              </button>
            </div>
          </div>

          {/* Right: Effort Calculator table */}
          <div className="flex-shrink-0">
          <label className={sectionLabel}>Effort Calculator</label>
          <div className="bg-white border border-white/20 rounded-xl overflow-hidden">
            <div className="overflow-x-auto px-4 pt-3">
              {/* 150 + 9×56 + 90 + 70 + 70 + 18 = 902px */}
              <table className="border-collapse text-[12px] table-fixed" style={{ width: '902px' }}>
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className={`${colHdr} text-left pl-0`} style={{ width: '150px' }}>Service</th>
                    <th className={`${colHdr} text-center`} style={{ width: '56px' }}>R1</th>
                    <th className={`${colHdr} text-center`} style={{ width: '56px' }}>R2</th>
                    <th className={`${colHdr} text-center`} style={{ width: '56px' }}>R3</th>
                    <th className={`${colHdr} text-center`} style={{ width: '56px' }}>R4</th>
                    <th className={`${colHdr} text-center`} style={{ width: '56px' }}>R5</th>
                    <th className={`${colHdr} text-center`} style={{ width: '56px' }}>R6</th>
                    <th className={`${colHdr} text-center`} style={{ width: '56px' }}>Meetings</th>
                    <th className={`${colHdr} text-center`} style={{ width: '56px' }}>FAT</th>
                    <th className={`${colHdr} text-center`} style={{ width: '70px' }}>Hrs Total</th>
                    <th className={`${colHdr} text-center`} style={{ width: '70px' }}>$ / hr</th>
                    <th className={`${colHdr} text-right pr-0`} style={{ width: '70px' }}>Cost</th>
                    <th style={{ width: '18px' }} />
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row) => {
                    const hrs = getHoursTotal(row);
                    const cost = getCost(row, globalRate);
                    const isOverridden = row.rateOverride !== null;

                    return (
                      <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/60 group">
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

                        <td className="py-1 px-1 text-center font-bold text-black">
                          {hrs > 0 ? hrs : <span className="text-gray-300 font-normal">—</span>}
                        </td>

                        <td className="py-1 px-1 text-center">
                          <div className="flex items-center gap-0.5 border border-gray-200 rounded-md px-1 py-0.5">
                            <span className="text-[10px] text-gray-400">$</span>
                            <input
                              type="number"
                              min={0}
                              value={isOverridden ? String(row.rateOverride) : String(globalRate)}
                              onChange={(e) => updateRateOverride(row.id, e.target.value)}
                              className="w-10 text-center text-black bg-transparent focus:outline-none text-[12px]"
                            />
                          </div>
                        </td>

                        <td className="py-1 pl-1 text-right font-semibold text-black pr-0">
                          {cost > 0 ? fmt(cost) : <span className="text-gray-300">—</span>}
                        </td>

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
                    {[totalR1, totalR2, totalR3, totalR4, totalR5, totalR6, totalMeetings, totalContingency].map((v, i) => (
                      <td key={i} className="py-2 px-1 text-center font-semibold text-black">
                        {v > 0 ? v : <span className="text-gray-300">—</span>}
                      </td>
                    ))}
                    <td className="py-2 px-1 text-center font-bold text-black">
                      {totalHrs > 0 ? totalHrs : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="py-2 px-1" />
                    <td className="py-2 pl-1 text-right font-bold text-black text-[13px] pr-0">
                      {totalCost > 0 ? fmt(totalCost) : <span className="text-gray-300">—</span>}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="px-4 pb-3">
              <button
                onClick={addCustomRow}
                className="mt-2 text-xs text-gray-400 hover:text-gray-700 transition-colors"
              >
                + Add row
              </button>
            </div>
          </div>
          </div>{/* end right column */}

        </div>{/* end flex row */}

      </div>

      <ScopeGeneratorModal
        isOpen={isScopeGeneratorOpen}
        onClose={() => setIsScopeGeneratorOpen(false)}
        onInsert={handleScopeGenerated}
        clientName={clientName}
        projectName={projectName}
      />
    </div>
  );
}
