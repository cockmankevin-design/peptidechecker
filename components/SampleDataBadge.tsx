/** The amber "Sample data" pill used everywhere an invented figure needs unmistakable
    visible marking. Previously duplicated inline 7x across vendor/results pages and cards
    (Task 4/5 deferred minor) — extracted here so a new usage never becomes an 8th copy.
    Pass `className` to override the default absolute top-right placement, e.g. "shrink-0"
    for a badge sitting inline in a flex row, or "absolute top-3 left-3" to move corners. */
export default function SampleDataBadge({ className = "absolute top-3 right-3" }: { className?: string }) {
  return (
    <span className={`${className} bg-brand-warn/20 text-brand-warn text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded`}>
      Sample data
    </span>
  );
}
