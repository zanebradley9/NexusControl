export default function SeverityBadge({ severity, size = 'sm' }) {
  const map = {
    low:      { label: 'LOW',      classes: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
    medium:   { label: 'MEDIUM',   classes: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
    high:     { label: 'HIGH',     classes: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
    critical: { label: 'CRITICAL', classes: 'bg-red-500/10 text-red-400 border-red-500/30' },
  };
  const { label, classes } = map[severity] || map.medium;
  const padding = size === 'lg' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[10px]';
  return (
    <span className={`inline-flex items-center rounded border font-mono font-semibold tracking-wider ${padding} ${classes}`}>
      {label}
    </span>
  );
}