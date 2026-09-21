/* ---------------------------------------------------------------------------
   The audit layer.

   The site's claim is that it verifies published certificates of analysis. That
   claim is only checkable if the verification is DATA rather than prose - which
   is why `coaUrl` below is required while the old free-text `coaStatus` is not.
   A sentence saying "public COA library" is exactly the kind of unverifiable
   marketing assertion this venture exists to distrust.
   --------------------------------------------------------------------------- */

/** A gate is checked, failed, or UNCHECKABLE. The third state is not optional.
    Vendors sit behind Cloudflare and 403 automated requests; recording "we
    could not look" as "they failed" would fabricate a result and defame a real
    company. Never collapse `blocked` into `fail`. */
export type GateResult = "pass" | "fail" | "blocked";

/** The original four gates. The site now applies seven (GATE_NAMES in
    lib/demo-registry.ts); this audit-layer type records the first four. */
export interface CoaGates {
  /** Published and reachable. "Available on request" is a fail. */
  loads: GateResult;
  /** Names the issuing laboratory. Unattributed results are assertions. */
  namesLab: GateResult;
  /** Names a specific lot. One generic PDF per catalogue proves nothing. */
  namesLot: GateResult;
  /** Compound, strength and date agree with the product page. */
  matchesPage: GateResult;
}

/** One audit of one product's COA. This is the evidence behind a listing. */
export interface CoaAudit {
  /** Which product was audited - a vendor is judged on a real example. */
  productSlug: string;
  /** REQUIRED. The document itself. A listing with no link is not evidence. */
  coaUrl: string;
  gates: CoaGates;
  /** `blocked` where any gate was uncheckable - never silently a fail. */
  verdict: GateResult;
  /** Why it failed, in plain language, for publication. Empty on a pass. */
  failureReason?: string;

  /* Extracted verbatim from the COA. Absent when a gate blocked before reading. */
  lab?: string;
  /** In-house is NOT third-party, and that distinction decides gate 2. */
  labIsThirdParty?: boolean;
  lotNumber?: string;
  purity?: number;
  method?: string;
  analysisDate?: string;

  /** When WE checked. A score with no audit date is untrustworthy the moment a
      certificate is withdrawn. */
  auditedOn: string;
}

/** The published rubric, broken out so the arithmetic is checkable.

    The methodology page promises the formula is "published, not proprietary".
    A single opaque trustScore cannot honour that - these are the components it
    is built from. Each is scored 0-10. */
export interface TrustScoreBreakdown {
  purity: number;
  coaTransparency: number;
  consistency: number;
  price: number;
  shipping: number;
}

/** Rubric weights. One definition, so the methodology page and the arithmetic
    cannot drift apart. */
export const TRUST_WEIGHTS = {
  purity: 0.4,
  coaTransparency: 0.2,
  consistency: 0.2,
  price: 0.1,
  shipping: 0.1,
} as const;

/** The floor. Below this a source is not listed - no exceptions, no paid tier. */
export const TRUST_FLOOR = 7.0;

/** Derive the score from its components, rounded to one decimal.
    Exported so a reader could reproduce it from the published numbers. */
export function computeTrustScore(b: TrustScoreBreakdown): number {
  const total =
    b.purity * TRUST_WEIGHTS.purity +
    b.coaTransparency * TRUST_WEIGHTS.coaTransparency +
    b.consistency * TRUST_WEIGHTS.consistency +
    b.price * TRUST_WEIGHTS.price +
    b.shipping * TRUST_WEIGHTS.shipping;
  return Math.round(total * 10) / 10;
}

/** A removed listing, kept as a record rather than deleted.

    The product of this venture is the exclusion. A delisting that leaves no
    trace is indistinguishable from a vendor that was never listed, which makes
    the central claim unprovable. These are meant to be published. */
export interface Delisting {
  vendorSlug: string;
  vendorName: string;
  /** ISO date the listing was pulled. */
  date: string;
  /** Publishable reason, e.g. "COA withdrawn" or "lot number no longer matches". */
  reason: string;
  /** What it scored immediately before removal. */
  previousScore: number;
  /** The audit that triggered removal, so the evidence survives the delisting. */
  audit?: CoaAudit;
}

export interface Vendor {
  slug: string;
  name: string;
  description: string;
  trustScore: number;
  coaStatus: string;
  testingMethod: string;
  shippingSpeed: string;
  avgPrice: string;
  affiliateUrl: string;
  productsCarried: string[];
  founded: string;
  location: string;
  /** True until an independent lab result actually backs this vendor's numbers.
      Nothing marked sample may be presented to a reader as a real test result. */
  sampleData?: boolean;

  /* ---- audit layer (absent on the placeholder seed data) ---- */

  /** `listed` only after a passing audit. `unverified` means we could not check,
      which is a different thing from failing and must read differently. */
  status?: "listed" | "delisted" | "unverified";
  /** The evidence behind the listing. */
  audit?: CoaAudit;
  /** Component scores, so the total can be checked rather than trusted. */
  scoreBreakdown?: TrustScoreBreakdown;
  /** Whether the vendor runs an affiliate programme - half of the business model. */
  hasAffiliateProgram?: boolean;
  /** Terms that forbid a publisher from criticising the vendor. A vendor that
      contractually bars negative coverage cannot be listed here at any rate. */
  forbidsNegativeCoverage?: boolean;
}

export interface ProductVendor {
  vendorSlug: string;
  vendorName: string;
  price: string;
  purity: number;
  shippingDays: string;
  trustScore: number;
  testSlug?: string;
  affiliateUrl: string;
}

export interface Product {
  slug: string;
  name: string;
  category: string;
  description: string;
  commonUses: string[];
  startingPrice: string;
  image?: string;
  vendors: ProductVendor[];
  sampleData?: boolean;
}

export interface TestResult {
  slug: string;
  vendor: string;
  vendorSlug: string;
  peptide: string;
  peptideSlug: string;
  lab: string;
  hplcPurity: number;
  massSpecConfirmed: boolean;
  endotoxinTested: boolean;
  lotNumber: string;
  dateTested: string;
  passed: boolean;
  /** The vendor's published COA. Optional only because the seeded sample data
      predates the audit layer - every REAL entry must carry one, since without
      the document there is nothing to have verified. */
  reportPdf?: string;
  /** Whether the issuing lab is independent of the seller. An in-house report
      is not third-party evidence, and the difference must never be implied away. */
  labIsThirdParty?: boolean;
  sampleData?: boolean;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
}
