"use client";

import Link from "next/link";

import { Container, Reveal, RevealGroup, Section } from "@/components/site/ui";

/* The four money/reference pages, indexed right under the hero - the
   pivot's own "index-first" structure (2026-09-24): the page opens on
   routes into the records, not on a pitch. Copy follows
   research/homepage-copy-2026-09-23.md sections 1-4. */

const CARDS = [
  {
    href: "/approved",
    eyebrow: "The records",
    title: "Every approved peptide medicine, with its paperwork.",
    body: "Generic name, approval date and FDA application number for every entry - so you can check it yourself.",
    link: "Open the directory",
  },
  {
    href: "/pipeline",
    eyebrow: "Coming soon",
    title: "What is waiting on a decision.",
    body: "CagriSema, retatrutide, survodutide and MariTide - where each one actually is, with a source and a last-checked date on every row.",
    link: "Open the pipeline tracker",
  },
  {
    href: "/get-started",
    eyebrow: "The legal routes",
    title: "Four ways in, and what each one costs.",
    body: "Your doctor, manufacturer direct-pay, or a licensed telehealth provider - compared on what they prescribe and how fast you're seen.",
    link: "Compare the legal routes",
  },
  {
    href: "/cost",
    eyebrow: "Cost",
    title: "The real reason people buy from a website they found on Reddit.",
    body: "What these medicines cost with insurance, without it, and through manufacturer direct-pay. If a cheaper legal route exists, it's here.",
    link: "See the prices",
  },
] as const;

export default function PivotIndex() {
  return (
    <Section id="index">
      <Container>
        <RevealGroup className="grid gap-4 sm:grid-cols-2">
          {CARDS.map((c) => (
            <Reveal key={c.href}>
              <Link
                href={c.href}
                className="group flex h-full flex-col rounded-lg border border-line bg-surface p-6 transition-colors hover:border-accent/40"
              >
                <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-dim">{c.eyebrow}</p>
                <p className="mt-3 text-[1.15rem] font-semibold leading-snug text-text">{c.title}</p>
                <p className="mt-2.5 flex-1 text-[14px] leading-relaxed text-muted">{c.body}</p>
                <p className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-accent">
                  {c.link}
                  <svg className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </p>
              </Link>
            </Reveal>
          ))}
        </RevealGroup>
      </Container>
    </Section>
  );
}
