export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-24">
      <p className="font-body text-sm uppercase tracking-[0.2em] text-brand-accent">
        Independently verified
      </p>
      <h1 className="mt-4 font-heading text-5xl font-bold text-brand-text-heading">
        Peptides you can trust.
      </h1>
      <p className="mt-6 max-w-2xl font-body text-lg text-brand-text-secondary">
        We do not sell peptides. We test who does, and publish what the labs find.
      </p>

      {/* Task 1 scaffold check: proves every @theme token resolves. Replaced in Task 3. */}
      <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          ["bg-brand-surface", "surface"],
          ["bg-brand-surface-2", "surface-2"],
          ["bg-brand-accent", "accent"],
          ["bg-brand-safe", "safe"],
          ["bg-brand-warn", "warn"],
          ["bg-brand-fail", "fail"],
        ].map(([cls, label]) => (
          <div
            key={label}
            className={`${cls} rounded-lg border border-brand-border p-4 font-body text-xs text-brand-bg`}
          >
            {label}
          </div>
        ))}
      </div>
    </main>
  );
}
