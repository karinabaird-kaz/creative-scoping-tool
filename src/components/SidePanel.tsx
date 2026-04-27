import type { Package } from '../data/scopingData';
import { Logo } from './Logo';
import type { Rates } from './DeliverableRow';

interface SidePanelProps {
  pkg: Package;
  rates: Rates;
  onRateChange: (key: keyof Rates, value: number) => void;
  onBack: () => void;
}

const RATE_FIELDS: { key: keyof Rates; label: string }[] = [
  { key: 'clientService', label: 'Client service' },
  { key: 'strategy', label: 'Strategy' },
  { key: 'design', label: 'Design / AD' },
  { key: 'copywriter', label: 'Copywriter' },
];

export function SidePanel({ pkg, rates, onRateChange, onBack }: SidePanelProps) {
  return (
    <div className="w-[220px] flex-shrink-0 bg-[#0e0e0e] flex flex-col h-screen sticky top-0 px-5 py-6">
      <div className="mb-6">
        <Logo className="h-6 w-auto" />
      </div>

      <button
        onClick={onBack}
        className="flex items-center gap-2 text-white/40 hover:text-white/80 text-xs mb-8 transition-colors"
      >
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to packages
      </button>

      <div className="mb-8">
        <p className="text-white/30 text-[10px] tracking-widest uppercase mb-1">
          {pkg.label}
        </p>
        <h2 className="text-white text-base font-semibold leading-snug mb-1">
          {pkg.name}
        </h2>
        <p className="text-white/30 text-[10px] tracking-wider uppercase mb-4">
          {pkg.phases}
        </p>
        <p className="text-white/40 text-xs leading-relaxed">{pkg.narrative}</p>
      </div>

      <div className="mt-auto">
        <p className="text-white/30 text-[10px] tracking-widest uppercase mb-4 font-medium">
          Discipline rates ($/hr)
        </p>
        <div className="space-y-3">
          {RATE_FIELDS.map(({ key, label }) => (
            <div key={key}>
              <label className="text-white/40 text-xs block mb-1">{label}</label>
              <div className="flex items-center gap-1">
                <span className="text-white/30 text-xs">$</span>
                <input
                  type="number"
                  min={0}
                  value={rates[key]}
                  onChange={(e) =>
                    onRateChange(key, parseFloat(e.target.value) || 0)
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-sm focus:outline-none focus:border-white/30"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
