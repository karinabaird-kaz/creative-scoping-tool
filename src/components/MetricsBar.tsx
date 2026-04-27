interface MetricsBarProps {
  lowFee: number;
  midFee: number;
  highFee: number;
  lowHrs: number;
  highHrs: number;
}

export function MetricsBar({
  lowFee,
  midFee,
  highFee,
  lowHrs,
  highHrs,
}: MetricsBarProps) {
  const fmt = (n: number) => '$' + Math.round(n).toLocaleString();

  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      <MetricCard label="Low estimate" value={fmt(lowFee)} />
      <MetricCard label="Mid estimate" value={fmt(midFee)} />
      <MetricCard label="High estimate" value={fmt(highFee)} />
      <MetricCard
        label="Total hours"
        value={`${lowHrs} / ${highHrs}`}
        highlight
      />
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function MetricCard({ label, value, highlight }: MetricCardProps) {
  return (
    <div className="bg-white border border-[#e8e8e8] rounded-2xl px-5 py-4">
      <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-2">
        {label}
      </p>
      <p
        className={`text-xl font-bold ${
          highlight ? 'text-[#111]' : 'text-black'
        }`}
      >
        {highlight ? (
          <span className="text-[#fff230] bg-[#111] px-2 py-0.5 rounded-lg">
            {value}
          </span>
        ) : (
          value
        )}
      </p>
    </div>
  );
}
