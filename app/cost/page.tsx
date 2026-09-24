import Link from "next/link";

import { Container, PageHeader, Prose, Section } from "@/components/site/ui";

/* Cost - the other money page. Copy follows
   research/page-copy-pipeline-and-cost-2026-09-23.md closely; prices are
   real, sourced and dated, TODOs stay TODOs rather than invented numbers. */

export const metadata = {
  title: "What peptide medicines cost, with and without insurance",
  description:
    "The price of Wegovy, Zepbound, Ozempic and Mounjaro through insurance, manufacturer direct-pay and telehealth, with the cheapest legal route for each.",
};

const COMPARISON = [
  {
    medicine: "Wegovy pen",
    insurance: "As low as $25/mo (max $100 saving)",
    directPay: "$199/mo intro, then $349/mo",
    telehealth: "$149/mo (Ro, Hims, LifeMD)",
    cheapest: "Insurance if covered, otherwise NovoCare direct",
  },
  {
    medicine: "Wegovy pill",
    insurance: "As low as $25/mo",
    directPay: "$149 to $299/mo by dose",
    telehealth: "$149/mo",
    cheapest: "NovoCare direct, 1.5 mg at $149",
  },
  {
    medicine: "Ozempic",
    insurance: "Plan dependent",
    directPay: "$349/mo, $499/mo at 2 mg",
    telehealth: "$149/mo",
    cheapest: "NovoCare direct",
  },
  {
    medicine: "Zepbound",
    insurance: "Plan dependent",
    directPay: "$299 to $449/mo, refill within 45 days",
    telehealth: "$149/mo",
    cheapest: "LillyDirect direct",
  },
  {
    medicine: "Mounjaro",
    insurance: "Plan dependent",
    directPay: "$499/mo, every dose",
    telehealth: "$149/mo",
    cheapest: "LillyDirect direct",
  },
] as const;

export default function CostPage() {
  return (
    <>
      <PageHeader
        eyebrow="Cost"
        title="Price is the reason people buy from a stranger's website."
        lede="So here is the honest answer. These are the ways to pay for an approved peptide medicine in the United States, what each one costs, and which is cheapest for the drug you are looking at. If a legal route beats the grey market on price, it is on this page."
      />

      <Section className="!pt-10 sm:!pt-14">
        <Container>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-dim">
            Prices checked 2026-09-23
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-line bg-surface p-5">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-dim">1 · Insurance</p>
              <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
                With commercial insurance, Novo Nordisk&rsquo;s savings offer puts Wegovy as low as{" "}
                <strong className="text-text">$25 a month</strong>, capped at $100 of savings per
                month. Eligible Medicare patients pay <strong className="text-text">$50 a month</strong>{" "}
                for Wegovy through the Medicare GLP-1 Bridge programme, from 1 July. Whether your
                plan covers weight management at all is the real variable, and many do not.
              </p>
              <p className="mt-3 font-mono text-[11px] text-dim">Source: novocare.com, read 2026-09-23</p>
            </div>

            <div className="rounded-lg border border-line bg-surface p-5">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-dim">
                2 · Manufacturer direct-pay
              </p>
              <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
                <strong className="text-text">NovoCare Pharmacy:</strong> Wegovy pen $199/mo for the
                first two fills through 2026-12-31, then $349/mo; Wegovy HD from $399/mo; Wegovy
                pill $149 to $299 by dose; Ozempic $349/mo ($499 at 2 mg).
              </p>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
                <strong className="text-text">LillyDirect:</strong> Zepbound self-pay $299 (2.5 mg),
                $399 (5 mg), $449 (7.5 mg through 15 mg) when refilled within 45 days. Miss that
                window and the higher doses revert to $499 (7.5 mg) and $699 (10 mg, 12.5 mg and
                15 mg). Mounjaro is a flat $499 a month at every dose. Self-pay only, no insurance
                applies, and Lilly defines a month as 28 days.
              </p>
              <p className="mt-3 font-mono text-[11px] text-dim">
                Sources: novocare.com read 2026-09-23; lilly.com/lillydirect/zepbound and
                /mounjaro read 2026-09-24
              </p>
            </div>

            <div className="rounded-lg border border-line bg-surface p-5">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-dim">
                3 · Licensed telehealth
              </p>
              <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
                These charge a membership or programme fee, and the medicine is usually extra -
                read the two numbers separately or the comparison is meaningless.
              </p>
              <ul className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-muted">
                <li>
                  <strong className="text-text">Ro:</strong> $39 first month, then $149/mo (as low as
                  $74/mo prepaid annually)
                </li>
                <li>
                  <strong className="text-text">Hims:</strong> $39 first month, then $149/mo
                </li>
                <li>
                  <strong className="text-text">LifeMD:</strong> $39 first month, then $149/mo, with
                  Wegovy from $149 to $199 for eligible self-pay patients
                </li>
                <li>
                  <strong className="text-text">Noom:</strong> Microdose GLP-1 Rx from $79; access to
                  brand-name Ozempic or Zepbound from $39 plus the medicine
                </li>
                <li>
                  <strong className="text-text">PlushCare:</strong> $19.99/mo, first month free; $129
                  initial visit without insurance
                </li>
              </ul>
              <p className="mt-3 text-[13px] leading-relaxed text-dim">
                Ro, Hims and LifeMD dispense branded Wegovy under their 2025 Novo Nordisk
                partnership. See the full comparison on{" "}
                <Link href="/get-started" className="text-accent hover:underline">
                  how to get one legally
                </Link>
                .
              </p>
            </div>

            <div className="rounded-lg border border-line bg-surface p-5">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-dim">
                4 · Your own doctor plus a pharmacy
              </p>
              <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
                The ordinary route, and worth pricing: a manufacturer self-pay price plus a normal
                prescription can beat a telehealth bundle once the membership fee is counted.
              </p>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
                A discount card at a retail pharmacy is the expensive way to do this. SingleCare
                puts Mounjaro&rsquo;s average retail price at $1,519.21 for a month of 5 mg pens and
                its own coupon price at $874.25; GoodRx lists Mounjaro from $1,096.38. Every one of
                those is roughly double the $499 Lilly charges direct. Discount cards earn their
                keep on older generics, not on these.
              </p>
              <p className="mt-3 font-mono text-[11px] text-dim">
                Sources: singlecare.com and goodrx.com, read 2026-09-24
              </p>
            </div>
          </div>

          {/* ---- comparison table ---- */}
          <div className="mt-10 hidden overflow-x-auto rounded-lg border border-line md:block">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <caption className="sr-only">
                Cost comparison for common peptide medicines across insurance, direct-pay and
                telehealth.
              </caption>
              <thead>
                <tr className="border-b border-line bg-surface">
                  <th scope="col" className="px-5 py-3 text-left font-mono text-[10.5px] font-normal uppercase tracking-[0.14em] text-dim">Medicine</th>
                  <th scope="col" className="px-4 py-3 text-left font-mono text-[10.5px] font-normal uppercase tracking-[0.14em] text-dim">With insurance</th>
                  <th scope="col" className="px-4 py-3 text-left font-mono text-[10.5px] font-normal uppercase tracking-[0.14em] text-dim">Manufacturer direct-pay</th>
                  <th scope="col" className="px-4 py-3 text-left font-mono text-[10.5px] font-normal uppercase tracking-[0.14em] text-dim">Telehealth fee, on top</th>
                  <th scope="col" className="px-5 py-3 text-left font-mono text-[10.5px] font-normal uppercase tracking-[0.14em] text-dim">Cheapest legal route</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={row.medicine} className={i === COMPARISON.length - 1 ? "" : "border-b border-line"}>
                    <td className="px-5 py-3.5 text-[14px] font-medium text-text">{row.medicine}</td>
                    <td className="px-4 py-3.5 text-[13.5px] text-muted">{row.insurance}</td>
                    <td className="px-4 py-3.5 text-[13.5px] text-muted">{row.directPay}</td>
                    <td className="px-4 py-3.5 text-[13.5px] text-muted">{row.telehealth}</td>
                    <td className="px-5 py-3.5 text-[13.5px] text-muted">{row.cheapest}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mt-8 space-y-3 md:hidden">
            {COMPARISON.map((row) => (
              <li key={row.medicine} className="rounded-lg border border-line bg-surface p-4">
                <p className="text-[15px] font-medium text-text">{row.medicine}</p>
                <dl className="mt-3 space-y-2 text-[13px]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-dim">Insurance</dt>
                    <dd className="text-right text-muted">{row.insurance}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-dim">Direct-pay</dt>
                    <dd className="text-right text-muted">{row.directPay}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-dim">Telehealth</dt>
                    <dd className="text-right text-muted">{row.telehealth}</dd>
                  </div>
                  <div className="flex justify-between gap-3 border-t border-line pt-2">
                    <dt className="text-dim">Cheapest</dt>
                    <dd className="text-right text-text">{row.cheapest}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>

          <p className="mt-6 max-w-[68ch] text-[14px] leading-relaxed text-dim">
            Adding a telehealth membership to a manufacturer self-pay price costs roughly $149 a
            month more than getting the same prescription from your own doctor. What it buys is
            speed and convenience - a fair trade for some people, a waste for others, worth seeing
            as its own number rather than buried in a bundle.
          </p>

          <Prose className="mt-10">
            <h2>What the cheap vial actually costs</h2>
            <p>
              A month of an approved medicine costs more than a vial bought online. That is true,
              and pretending otherwise would be insulting.
            </p>
            <p>
              What the lower price buys you: no prescription, no clinician, no pharmacy, and no one
              accountable if the contents are wrong. A peer-reviewed test purchase of semaglutide
              from illegal online pharmacies (JMIR, 2024) found purity between 7.7 and 14.4 percent,
              with endotoxin present in every sample. Those sellers were not outliers at the time of
              the study, and nobody refunded anyone.
            </p>
            <p>
              The legal routes above are not always expensive. Manufacturer direct-pay in
              particular has moved a long way, and for some people it is the cheapest option on
              this page.
            </p>
          </Prose>

          <p className="mt-8 rounded-md border border-line bg-surface-2 px-4 py-3 font-mono text-[11.5px] leading-relaxed text-dim">
            We earn nothing from anything on this page. No provider or manufacturer listed here
            pays us, and we are not in any affiliate programme. If that changes we intend to join
            some, and this notice will say so plainly, name who pays us, and stay on the page - it
            will not change the prices published above or the order they appear in. Manufacturer
            pricing changes often; every figure here shows when it was last checked.
          </p>
        </Container>
      </Section>
    </>
  );
}
