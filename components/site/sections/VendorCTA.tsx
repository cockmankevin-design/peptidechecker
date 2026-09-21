"use client";

/* Vendor CTA.

   Addressed to sellers, not buyers. The one structural idea: the invitation is
   printed as the listing condition itself - an IF / THEN / ELSE record set in
   mono - rather than as an offer. A vendor reads the bar, not a pitch, and the
   only thing on offer is the check everyone else already passed or failed.

   Deliberately no contact form. This is a static export with no backend, and a
   form that quietly drops submissions is precisely the kind of dishonesty the
   site exists to catch. A mailto and the methodology link are the whole ask. */

import { CTA, Container, Eyebrow, Hairline, Reveal, Section, SectionHeader } from "@/components/site/ui";

/** The three conditions, in the order a reviewer checks them. Kept lowercase
    and mono so they read as record fields rather than marketing bullets. */
const CONDITIONS = [
  "the certificate names the laboratory that ran it",
  "the certificate names the lot you are shipping",
  "the result matches the claim on the product page",
];

export default function VendorCTA() {
  return (
    <Section id="for-vendors" className="border-t border-line">
      <Container>
        <div className="grid gap-y-12 lg:grid-cols-12 lg:gap-x-16">
          {/* ---- the address to vendors ------------------------------------ */}
          <div className="lg:col-span-7">
            <SectionHeader
              eyebrow="For vendors"
              title="Listing is passed, not bought."
              lede={
                <>
                  There is no placement fee, no priority tier and no arrangement that puts a seller
                  on the record. Every vendor meets the same check, and it is the only route in.
                </>
              }
            />

            <Reveal delay={0.18}>
              <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-muted">
                Publish a certificate from a named third-party laboratory, tied to the lot you are
                actually shipping, with results that match what your product page claims &mdash; and
                you will pass. Publish anything less and no amount of money changes the outcome.
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <CTA href="mailto:info@peptidechecker.com?subject=Listing%20review">
                  Submit a lot for review
                </CTA>
                <CTA href="/methodology" variant="secondary">
                  Read the methodology
                </CTA>
              </div>
            </Reveal>

            <Reveal delay={0.3}>
              <p className="mt-6 font-mono text-[11.5px] leading-relaxed text-dim">
                Send the product page and a direct link to the certificate. Nothing else is read.
              </p>
            </Reveal>

            <Reveal delay={0.36}>
              <p className="mt-6 max-w-xl text-[13.5px] leading-relaxed text-dim">
                PeptideChecker earns affiliate commission on some listed vendors. That is disclosed
                wherever it applies, and it buys nothing: not a listing, not a verdict, not a second
                look at one that has already been made.
              </p>
            </Reveal>
          </div>

          {/* ---- the bar, stated as a condition ---------------------------- */}
          <Reveal delay={0.12} className="lg:col-span-5 lg:self-start">
            <div className="rounded-lg border border-line bg-surface p-6 sm:p-7">
              <Eyebrow>Listing condition</Eyebrow>
              <Hairline className="mt-4" />

              <dl className="mt-5 font-mono text-[12.5px] leading-relaxed">
                <div className="grid grid-cols-[2.5rem_1fr] gap-x-4">
                  <dt className="pt-0.5 text-[10.5px] uppercase tracking-[0.12em] text-dim">If</dt>
                  <dd>
                    <ul className="space-y-2.5">
                      {CONDITIONS.map((condition, i) => (
                        <li key={condition} className="flex gap-3">
                          <span className="tabular text-dim" aria-hidden="true">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="text-text">{condition}</span>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>

                <Hairline className="my-5" />

                <div className="grid grid-cols-[2.5rem_1fr] gap-x-4">
                  <dt className="pt-0.5 text-[10.5px] uppercase tracking-[0.12em] text-dim">Then</dt>
                  <dd className="text-verified">Listed on the public record.</dd>
                </div>

                <div className="mt-3 grid grid-cols-[2.5rem_1fr] gap-x-4">
                  <dt className="pt-0.5 text-[10.5px] uppercase tracking-[0.12em] text-dim">Else</dt>
                  <dd className="text-muted">
                    Not listed &mdash; and there is no fee that changes it.
                  </dd>
                </div>
              </dl>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
