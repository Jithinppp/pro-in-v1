interface StatsCardProps {
  label: string;
  value: string | number;
  subtext?: string;
}

export function StatsCard({ label, value, subtext }: StatsCardProps) {
  return (
    <div className="bg-white border border-[#e4e4e7] rounded-lg p-6">
      <p className="text-xs font-medium uppercase tracking-wider text-[#898989] mb-2">
        {label}
      </p>
      <p className="text-3xl font-semibold text-[#242424]">{value}</p>
      {subtext && (
        <p className="text-xs text-[#a1a1aa] mt-1">{subtext}</p>
      )}
    </div>
  );
}