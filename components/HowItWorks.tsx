const steps = [
  {
    number: "01",
    title: "We Test",
    description: "We buy peptides from vendors and send them to independent, named third-party labs for HPLC and mass spectrometry analysis.",
  },
  {
    number: "02",
    title: "We Verify",
    description: "Only vendors whose products pass rigorous purity testing and score 7+ on our trust system get listed.",
  },
  {
    number: "03",
    title: "You Buy Safe",
    description: "Browse verified products sorted by safety, price, and shipping. Every listing backed by real lab data.",
  },
];

export default function HowItWorks() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent mb-2">How It Works</p>
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-brand-text-heading">
          Trust, Transparency, Results
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step) => (
          <div key={step.number} className="bg-brand-surface border border-brand-border rounded-xl p-6">
            <span className="font-heading text-3xl font-bold text-brand-accent/30">{step.number}</span>
            <h3 className="font-heading text-xl font-bold text-brand-text-heading mt-3">{step.title}</h3>
            <p className="text-sm text-brand-text-secondary mt-2 leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
