const badges = [
  { label: "Third-Party Tested", icon: "🔬" },
  { label: "Named Labs", icon: "🏛️" },
  { label: "No Vendor Funding", icon: "🛡️" },
  { label: "7+ Trust Score Required", icon: "✓" },
];

export default function TrustBadges() {
  return (
    <section className="border-y border-brand-border bg-brand-surface/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
          {badges.map((badge) => (
            <div key={badge.label} className="flex items-center gap-2 text-brand-text-secondary">
              <span className="text-lg">{badge.icon}</span>
              <span className="text-sm font-medium">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
