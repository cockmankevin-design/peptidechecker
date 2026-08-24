export default function TrustScoreBadge({ score }: { score: number }) {
  const color =
    score >= 9 ? "text-brand-safe bg-brand-safe/15" :
    score >= 7 ? "text-brand-accent bg-brand-accent-dim" :
    score >= 5 ? "text-brand-warn bg-yellow-500/15" :
    "text-brand-fail bg-red-500/15";

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-sm font-bold ${color}`}>
      {score.toFixed(1)}
    </span>
  );
}
