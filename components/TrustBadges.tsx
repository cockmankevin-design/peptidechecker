/* Inline SVG rather than emoji: emoji render as a different glyph on every platform and as a
   tofu box where the font is missing, which is not something to hang the site's credibility row
   on. These are stroke icons that inherit currentColor, so they follow the theme. */

const badges = [
  {
    label: "Third-party tested",
    path: "M9 3h6M10 3v5.2a2 2 0 0 1-.3 1L5 18a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-4.7-8.8a2 2 0 0 1-.3-1V3",
  },
  { label: "Named labs", path: "M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6" },
  { label: "No vendor funding", path: "M12 3l8 3v6c0 4.4-3.1 8.3-8 9-4.9-.7-8-4.6-8-9V6l8-3z" },
  { label: "7+ trust score required", path: "M9 12l2 2 4-4M12 3l7.5 4v5c0 4.4-3.1 8.3-7.5 9-4.4-.7-7.5-4.6-7.5-9V7L12 3z" },
];

export default function TrustBadges() {
  return (
    <section className="border-y border-brand-border bg-brand-surface/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
          {badges.map((badge) => (
            <div key={badge.label} className="flex items-center gap-2.5 text-brand-text-secondary">
              <svg
                className="w-[18px] h-[18px] text-brand-accent shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d={badge.path} />
              </svg>
              <span className="text-sm font-medium tracking-tight">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
