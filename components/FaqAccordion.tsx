"use client";

import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "Are the peptides in powder form?",
    answer:
      "Yes. The vendors we track sell lyophilized (freeze-dried) peptide powder that requires reconstitution with bacteriostatic water before use. PeptideChecker doesn't sell peptides ourselves — we verify the vendors who do.",
  },
  {
    question: "Are peptides legal?",
    answer:
      "Research peptides are legally sold for laboratory and research use only in most jurisdictions, and are not approved for human consumption. PeptideChecker does not provide medical or legal advice — check your local regulations before ordering anything.",
  },
  {
    question: "How does PeptideChecker verify vendors?",
    answer:
      "We commission independent third-party lab testing — HPLC purity analysis and mass spec confirmation — on products from every vendor we list, then compute a trust score from purity, COA transparency, batch-to-batch consistency, pricing, and shipping reliability. See our Methodology page for the full formula.",
  },
  {
    question: "Do you sell peptides directly?",
    answer:
      "No. PeptideChecker is an independent verification service. We never sell peptides ourselves, and no vendor can pay for placement — every vendor listed has scored 7 or higher out of 10 on our trust score after independent lab testing.",
  },
  {
    question: "What happens if a vendor fails testing?",
    answer:
      "Any vendor whose trust score drops below 7 is removed from our listings immediately. Failed or inconsistent batches are flagged on the vendor's profile, and we retest before a vendor can be reinstated.",
  },
  {
    question: "How do I store peptides?",
    answer:
      "Reconstituted peptides should be refrigerated (2-8°C / 36-46°F) and used within the timeframe recommended by the manufacturer, typically 2-4 weeks. Unreconstituted lyophilized powder should be kept frozen and protected from light until use.",
  },
  {
    question: "Do you offer shipping?",
    answer:
      "No — PeptideChecker doesn't ship anything. Each vendor listing links directly to that vendor's own site, where their shipping policies apply. We track and display each vendor's typical shipping speed so you can compare before you order.",
  },
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-brand-border border border-brand-border rounded-xl bg-brand-surface overflow-hidden">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        const panelId = `faq-panel-${index}`;

        return (
          <div key={faq.question}>
            <h3>
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
              >
                <span className="font-heading font-semibold text-brand-text-heading">{faq.question}</span>
                <span
                  aria-hidden="true"
                  className={`shrink-0 text-brand-accent text-xl leading-none transition-transform duration-200 ${
                    isOpen ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              className={`grid transition-all duration-200 ease-in-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-5 text-sm text-brand-text-secondary leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
