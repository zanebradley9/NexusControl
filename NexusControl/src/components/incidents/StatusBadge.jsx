export default function StatusBadge({ status }) {
  const map = {
    open:          { label: 'OPEN',          dot: 'bg-red-400',    classes: 'text-red-400 border-red-400/30 bg-red-400/10' },
    investigating: { label: 'INVESTIGATING', dot: 'bg-yellow-400', classes: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10' },
    resolved:      { label: 'RESOLVED',      dot: 'bg-green-400',  classes: 'text-green-400 border-green-400/30 bg-green-400/10' },
    closed:        { label: 'CLOSED',        dot: 'bg-gray-400',   classes: 'text-gray-400 border-gray-400/30 bg-gray-400/10' },
  };
  const { label, dot, classes } = map[status] || map.open;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-mono font-semibold tracking-wider ${classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}