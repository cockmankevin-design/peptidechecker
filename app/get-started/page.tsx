import Link from "next/link";

import { Container, PageHeader, Prose, Section } from "@/components/site/ui";
import { TELEHEALTH_PROVIDERS } from "@/lib/fda-registry";

/* How to get one legally - the money page (2026-09-24 pivot build).

   This is the one page on the site that carries outbound "get started"
   buttons - Kevin's explicit call: buttons belong here, on the licensed
   telehealth providers, and nowhere near the grey-market vendor evidence
   section. Links go straight to each provider's own site rather than a
   tracking URL, because the affiliate applications haven't been approved
   yet (see the vault: the site needs to be live first) - swap in real
   tracking links once each program confirms. */

export const metadata = {
  title: "How to get an approved peptide medicine legally",
  description:
    "Compare licensed telehealth providers for FDA-approved peptide medicines: what they dispense, what they cost, and how to start.",
};

export default function GetStartedPage() {
  return (
    <>
      <PageHeader
        eyebrow="How to get one legally"
        title="Four ways in, and what each one costs."
        lede="Your own doctor and your insurance. The manufacturer's direct-pay programme. A licensed telehealth provider. Below, the providers compared on what they prescribe, whether it's the branded product or a compounded one, what it costs, and how quickly someone is seen."
      />

      <Section className="!pt-10 sm:!pt-14">
        <Container>
          <p className="rounded-md border border-line bg-surface-2 px-4 py-3 font-mono text-[11.5px] leading-relaxed text-dim">
            We earn a commission if you sign up with some of the providers below. It never changes
            what we publish, and every provider we know of is shown, not only the ones that pay.
          </p>

          <Prose className="mt-8">
            <h2>Before telehealth: your own doctor, and manufacturer direct-pay</h2>
            <p>
              The two routes that don&rsquo;t involve a subscription. Your own doctor, billed
              through insurance where it&rsquo;s covered, is usually the cheapest path if your plan
              covers weight management. Failing that, both Novo Nordisk (NovoCare) and Eli Lilly
              (LillyDirect) run self-pay programmes directly - no telehealth membership fee at all.
              See the exact prices on the <Link href="/cost">cost page</Link>.
            </p>
          </Prose>

          <h2 className="mt-12 text-[1.5rem] font-semibold text-text">Licensed telehealth providers</h2>

          <ul className="mt-6 space-y-4">
            {TELEHEALTH_PROVIDERS.map((p) => (
              <li key={p.slug} className="rounded-lg border border-line bg-surface p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[17px] font-semibold text-text">{p.name}</p>
                    <p className="mt-1 font-mono text-[12.5px] text-accent">{p.fee}</p>
                    <p className="mt-2 max-w-[58ch] text-[14px] leading-relaxed text-muted">
                      {p.medicineNote}
                    </p>
                    <p className="mt-2 font-mono text-[10.5px] text-dim">Source: {p.source}</p>
                  </div>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    className="group inline-flex shrink-0 items-center gap-2 rounded-lg bg-accent px-5 py-3 text-[14px] font-medium text-bg transition-colors duration-200 hover:bg-accent-hover"
                  >
                    Get started with {p.name}
                    <svg
                      className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </div>
                <p className="mt-4 border-t border-line pt-3 font-mono text-[10px] uppercase tracking-[0.1em] text-dim">
                  Affiliate link · rel=sponsored
                </p>
              </li>
            ))}
          </ul>

          <Prose className="mt-12">
            <h2>What this page is not</h2>
            <p>
              Not medical advice, not a claim that any provider or medicine is right for you, and
              not a ranking - the order above is not a recommendation. A licensed clinician, not
              this page, decides whether treatment is appropriate. See the real prices on the{" "}
              <Link href="/cost">cost page</Link> and what&rsquo;s approved on the{" "}
              <Link href="/approved">approved directory</Link>.
            </p>
          </Prose>
        </Container>
      </Section>
    </>
  );
}
