import Image from "next/image";

import { asset } from "@/lib/basePath";

const steps = [
  {
    number: "01",
    title: "We verify the paperwork",
    description:
      "A listing only qualifies if the seller publishes a certificate of analysis from a named third-party lab. We check the document is real, says which lab ran it, and ties to a specific lot rather than being one generic PDF reused across every batch.",
  },
  {
    number: "02",
    title: "We score what is checkable",
    description:
      "Purity from the published results, COA transparency, consistency across lots, price and shipping, weighted into one score. Anything we cannot verify earns nothing \u2014 an unevidenced claim is not a point in a vendor\u2019s favour.",
  },
  {
    number: "03",
    title: "You compare in one place",
    description:
      "Every listing shows its score, links to the lab report behind it, and shows where the number came from. If a report stops checking out, the listing goes \u2014 it is not grandfathered in.",
  },
];

export default function HowItWorks() {
  return (
    <section className="border-y border-brand-border bg-brand-surface/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold mb-3">How it works</p>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-text-heading tracking-tight">
              Trust, transparency, results
            </h2>
            <p className="mt-4 text-brand-text-secondary leading-relaxed">
              The same checks for every seller, whether they are a five-year incumbent or a listing
              added last week. We are not a lab &mdash; we are the filter that reads the lab reports
              so you don&apos;t have to.
            </p>
          </div>
          {/* Generic laboratory photography - illustrative of the category, not a depiction of
              our own testing. */}
          <div className="relative aspect-[4/3] lg:aspect-[3/2] rounded-2xl overflow-hidden border border-brand-border">
            <Image
              src={asset("/images/pipette-vial.jpg")}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-bg/70 via-transparent to-transparent" />
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-px bg-brand-border rounded-2xl overflow-hidden border border-brand-border">
          {steps.map((step) => (
            <div
              key={step.number}
              className="group bg-brand-bg p-8 transition-colors duration-300 hover:bg-brand-surface"
            >
              <span className="font-heading text-5xl font-bold text-brand-gold/35 transition-colors duration-300 group-hover:text-brand-gold/70">
                {step.number}
              </span>
              <h3 className="font-heading text-xl font-bold text-brand-text-heading mt-4">{step.title}</h3>
              <p className="text-sm text-brand-text-secondary mt-3 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
