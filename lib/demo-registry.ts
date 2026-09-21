import type { Status } from "@/components/site/ui";

/* Demonstration registry.
   ============================================================================

   Every vendor below is INVENTED. None corresponds to a real business.

   WHY THIS MATTERS MORE THAN IT LOOKS. A row here carries a verdict — and two
   of them carry a NEGATIVE verdict with a published reason. Attaching a
   fabricated "Delisted — certificate withdrawn" to the name of a real company
   is a false statement of fact about that company's products. That is
   defamation, not placeholder content, and no amount of "demo data" labelling
   elsewhere on the page repairs it.

   THIS FILE HAS ALREADY GOT THIS WRONG ONCE. An earlier version listed
   "Solvay Peptide Group" as delisted. Solvay is a real chemical company that
   owned Peptisyntha, a custom peptide manufacturer — a real business in this
   exact sector, carrying an invented accusation. It was caught in review and
   removed. Do not reintroduce a name without checking it.

   RULES FOR ADDING OR CHANGING A NAME:
     1. Search the name before committing it. "Sounds made up" is not a check.
     2. Avoid any surname or word associated with a chemical, pharmaceutical or
        laboratory business, however loosely.
     3. Be strictest about the delisted and under-review rows. Those carry the
        claims that can actually harm someone.
     4. The names below run A → G in order, which is a deliberate tell that the
        set is constructed rather than sampled.

   Real audit data for actual vendors lives in research/, deliberately kept out
   of the product until a second verification pass confirms it. Every surface
   rendering these rows must also show a <DemoNotice>.
   ============================================================================ */

export interface RegistryRow {
  vendor: string;
  status: Status;
  /** Lot the certificate refers to. Null where a vendor publishes no lot —
      which is itself the most common reason a listing fails. */
  lot: string | null;
  lab: string | null;
  purity: string | null;
  lastReviewed: string;
  /** Present only on delisted rows: the publishable reason for removal. */
  reason?: string;
  /** URL segment for the record page, /vendors/<slug>. */
  slug: string;
  /** The four gates in order: loads, names lab, names lot, matches page.
      A failed gate ends the run, so later gates read "not reached". */
  gates: [GateState, GateState, GateState, GateState];
  /** Present on under-review rows: what is open and why. */
  note?: string;
  /** Product slugs (content/products) the audited certificates cover. */
  products: string[];
  /** Affiliate link. Absent on every demo row: an invented vendor has no site. */
  url?: string;
}

export type GateState = "pass" | "fail" | "open";

export const GATE_NAMES = [
  "Certificate exists and loads",
  "Names the issuing laboratory",
  "Names the specific lot",
  "Matches the product page",
] as const;

export const DEMO_REGISTRY: RegistryRow[] = [
  {
    vendor: "Ashgrove Bio",
    slug: "ashgrove-bio",
    gates: ["pass","pass","pass","pass"],
    products: ["bpc-157","tb-500"],
    status: "verified",
    lot: "AG-4471-A",
    lab: "Independent Lab A",
    purity: "99.4%",
    lastReviewed: "2026-08-28",
  },
  {
    vendor: "Bellwether Compounds",
    slug: "bellwether-compounds",
    gates: ["pass","pass","pass","pass"],
    products: ["bpc-157","mots-c"],
    status: "verified",
    lot: "BW-20260711",
    lab: "Independent Lab B",
    purity: "98.9%",
    lastReviewed: "2026-08-24",
  },
  {
    vendor: "Coldharbour Research Supply",
    slug: "coldharbour-research-supply",
    gates: ["pass","pass","pass","pass"],
    products: ["tb-500","semaglutide"],
    status: "verified",
    lot: "CH-0926-14",
    lab: "Independent Lab A",
    purity: "99.1%",
    lastReviewed: "2026-08-19",
  },
  {
    vendor: "Drayton Peptide Works",
    slug: "drayton-peptide-works",
    gates: ["pass","pass","pass","fail"],
    products: ["bpc-157"],
    note: "The certificate states 5 mg; the product page sells 10 mg. The vendor has been asked which is correct.",
    status: "review",
    lot: "DP-8802",
    lab: "Independent Lab C",
    purity: "97.6%",
    lastReviewed: "2026-08-30",
  },
  {
    vendor: "Eastmark Bio",
    slug: "eastmark-bio",
    gates: ["pass","pass","fail","open"],
    products: ["mots-c","semaglutide"],
    note: "The certificate names a laboratory but no lot. The vendor has been asked for the lot-specific certificate.",
    status: "review",
    lot: null,
    lab: "Independent Lab B",
    purity: null,
    lastReviewed: "2026-08-31",
  },
  {
    vendor: "Fenwick Compound Co.",
    slug: "fenwick-compound-co",
    gates: ["pass","fail","open","open"],
    products: ["bpc-157","tb-500"],
    status: "delisted",
    lot: null,
    lab: null,
    purity: null,
    lastReviewed: "2026-08-21",
    reason: "One certificate reused across the entire catalogue — no lot reference",
  },
  {
    vendor: "Greyloch Research",
    slug: "greyloch-research",
    gates: ["pass","fail","open","open"],
    products: ["semaglutide"],
    status: "delisted",
    lot: null,
    lab: null,
    purity: null,
    lastReviewed: "2026-07-30",
    reason: "Certificate withdrawn after listing; replacement names no laboratory",
  },
];

/** Counts for the registry summary. Derived rather than hardcoded so the
    figures can never drift from the rows they describe. */
export function registryTally(rows: RegistryRow[] = DEMO_REGISTRY) {
  return {
    total: rows.length,
    verified: rows.filter((r) => r.status === "verified").length,
    review: rows.filter((r) => r.status === "review").length,
    delisted: rows.filter((r) => r.status === "delisted").length,
  };
}

/** The record behind /vendors/<slug>. */
export function registryRow(slug: string): RegistryRow | undefined {
  return DEMO_REGISTRY.find((r) => r.slug === slug);
}
