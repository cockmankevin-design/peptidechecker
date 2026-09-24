/* FDA-approved peptide medicines, the approval pipeline, and telehealth
   providers - the data behind the 2026-09-23 pivot (see the vault's
   PeptideChecker note for the decision trail).

   Every figure below is real and sourced, matching the standing rule this
   whole rebuild follows: invented data is forbidden, anything unverified is
   a visible TODO rather than a guess.

   Sources:
   - Approved: research/fda-approval-dates-verified-2026-09-23.md, read against
     the FDA's own Drugs@FDA database (api.fda.gov) on 2026-09-23. Each date is
     the ORIGINAL approval of that application - later indications were
     approved separately and are not implied by this date.
   - Pipeline: research/page-copy-pipeline-and-cost-2026-09-23.md, company
     press releases and investor materials, dated 2026-09-23.
   - Providers: same file, prices read directly from each provider's own
     pricing page on 2026-09-23. */

export type ApprovalStatus = "approved" | "discontinued";

export interface ApprovedDrug {
  brand: string;
  generic: string;
  applicationNumber: string;
  sponsor: string;
  originalApproval: string;
  status: ApprovalStatus;
  /** Set only for the two entries that need their own callout instead of a
      plain table row (Foundayo: not a peptide; Adlyxin: discontinued). */
  note?: string;
  /** True only for Foundayo - included because people search for it, but it
      must never be presented as an approved peptide. */
  isPeptide: boolean;
}

export const APPROVED_DRUGS: ApprovedDrug[] = [
  {
    brand: "Byetta",
    generic: "exenatide",
    applicationNumber: "NDA021773",
    sponsor: "AstraZeneca",
    originalApproval: "2005-04-28",
    status: "approved",
    isPeptide: true,
  },
  {
    brand: "Victoza",
    generic: "liraglutide",
    applicationNumber: "NDA022341",
    sponsor: "Novo Nordisk",
    originalApproval: "2010-01-25",
    status: "approved",
    isPeptide: true,
  },
  {
    brand: "Egrifta",
    generic: "tesamorelin",
    applicationNumber: "BLA022505",
    sponsor: "Theratechnologies",
    originalApproval: "2010-11-10",
    status: "approved",
    isPeptide: true,
  },
  {
    brand: "Bydureon",
    generic: "exenatide (extended release)",
    applicationNumber: "NDA022200",
    sponsor: "AstraZeneca",
    originalApproval: "2012-01-27",
    status: "approved",
    isPeptide: true,
  },
  {
    brand: "Trulicity",
    generic: "dulaglutide",
    applicationNumber: "BLA125469",
    sponsor: "Eli Lilly",
    originalApproval: "2014-09-18",
    status: "approved",
    isPeptide: true,
  },
  {
    brand: "Saxenda",
    generic: "liraglutide",
    applicationNumber: "NDA206321",
    sponsor: "Novo Nordisk",
    originalApproval: "2014-12-23",
    status: "approved",
    isPeptide: true,
  },
  {
    brand: "Ozempic",
    generic: "semaglutide",
    applicationNumber: "NDA209637",
    sponsor: "Novo Nordisk",
    originalApproval: "2017-12-05",
    status: "approved",
    isPeptide: true,
  },
  {
    brand: "Rybelsus",
    generic: "semaglutide (oral)",
    applicationNumber: "NDA213051",
    sponsor: "Novo Nordisk",
    originalApproval: "2019-09-20",
    status: "approved",
    isPeptide: true,
  },
  {
    brand: "Wegovy",
    generic: "semaglutide",
    applicationNumber: "NDA215256",
    sponsor: "Novo Nordisk",
    originalApproval: "2021-06-04",
    status: "approved",
    isPeptide: true,
  },
  {
    brand: "Mounjaro",
    generic: "tirzepatide",
    applicationNumber: "NDA215866",
    sponsor: "Eli Lilly",
    originalApproval: "2022-05-13",
    status: "approved",
    isPeptide: true,
  },
  {
    brand: "Zepbound",
    generic: "tirzepatide",
    applicationNumber: "NDA217806",
    sponsor: "Eli Lilly",
    originalApproval: "2023-11-08",
    status: "approved",
    isPeptide: true,
  },
  {
    brand: "Forteo",
    generic: "teriparatide",
    applicationNumber: "NDA021318",
    sponsor: "Eli Lilly",
    originalApproval: "2002-11-26",
    status: "approved",
    isPeptide: true,
  },
  {
    brand: "Foundayo",
    generic: "orforglipron calcium",
    applicationNumber: "NDA220934",
    sponsor: "Eli Lilly",
    originalApproval: "2026-04-01",
    status: "approved",
    isPeptide: false,
    note: "A small molecule, not a peptide. Listed because it is searched for alongside this list.",
  },
  {
    brand: "Adlyxin",
    generic: "lixisenatide",
    applicationNumber: "NDA208471",
    sponsor: "Sanofi",
    originalApproval: "2016-07-28",
    status: "discontinued",
    isPeptide: true,
    note: "No live record in Drugs@FDA at last check - discontinued in the US. Several published \"FDA-approved peptides\" lists still carry it as available, which is the exact kind of copied-list error this site exists to catch.",
  },
];

export const APPROVED_LAST_CHECKED = "2026-09-23";

export type PipelineStatus = "filed" | "phase-3" | "trials-complete";

export interface PipelineDrug {
  drug: string;
  company: string;
  status: PipelineStatus;
  statusDetail: string;
  trialResult: string;
  source: string;
  lastChecked: string;
}

export const PIPELINE_DRUGS: PipelineDrug[] = [
  {
    drug: "CagriSema",
    company: "Novo Nordisk",
    status: "filed",
    statusDetail:
      "NDA submitted 2025-12-18. A decision is expected late 2026. No PDUFA date has been made public.",
    trialResult:
      "REDEFINE 1: average 23% body weight reduction, on the estimand where all patients stayed on treatment.",
    source: "Novo Nordisk press release, 2025-12-18 (filing). The decision window is company guidance, not an FDA date.",
    lastChecked: "2026-09-23",
  },
  {
    drug: "Retatrutide",
    company: "Eli Lilly",
    status: "trials-complete",
    statusDetail: "Phase 3 complete, not yet filed. Lilly plans to submit a BLA in Q1 2027.",
    trialResult: "TRIUMPH-1: up to 30.3% average weight loss at 104 weeks.",
    source: "Eli Lilly investor release",
    lastChecked: "2026-09-23",
  },
  {
    drug: "Survodutide",
    company: "Boehringer Ingelheim with Zealand Pharma",
    status: "phase-3",
    statusDetail: "In phase 3. No filing date announced.",
    trialResult: "SYNCHRONIZE-1, reported 2026-04-28: 16.6% average weight loss at 76 weeks.",
    source: "Company releases",
    lastChecked: "2026-09-23",
  },
  {
    drug: "MariTide",
    company: "Amgen",
    status: "phase-3",
    statusDetail:
      "In phase 3. MARITIME programme running, three phase 3 diabetes studies starting 2026. No filing date announced.",
    trialResult: "Phase 2: about 20% average weight loss at 52 weeks.",
    source: "Amgen",
    lastChecked: "2026-09-23",
  },
];

export interface TelehealthProvider {
  name: string;
  slug: string;
  url: string;
  dispensesBranded: boolean;
  fee: string;
  medicineNote: string;
  source: string;
}

/** Direct links to each provider's own site, not affiliate tracking links -
    the applications haven't been approved yet (see the vault: "Real affiliate
    rates unknown until the programmes approve an application, which needs
    the new site live first"). Swap in tracking URLs once each is confirmed. */
export const TELEHEALTH_PROVIDERS: TelehealthProvider[] = [
  {
    name: "Ro",
    slug: "ro",
    url: "https://ro.co",
    dispensesBranded: true,
    fee: "$39 first month, then $149/mo, or as low as $74/mo prepaid annually",
    medicineNote: "Dispenses branded Wegovy under Ro's 2025 Novo Nordisk partnership.",
    source: "ro.co, read 2026-09-23",
  },
  {
    name: "Hims",
    slug: "hims",
    url: "https://www.hims.com",
    dispensesBranded: true,
    fee: "$39 first month, then $149/mo",
    medicineNote: "Dispenses branded Wegovy under Hims's 2025 Novo Nordisk partnership.",
    source: "hims.com, read 2026-09-23",
  },
  {
    name: "LifeMD",
    slug: "lifemd",
    url: "https://lifemd.com",
    dispensesBranded: true,
    fee: "$39 first month, then $149/mo programme fee (a lower tier starts at $75/mo)",
    medicineNote:
      "Dispenses branded Wegovy under LifeMD's 2025 Novo Nordisk partnership. Wegovy pen from $199, Wegovy pill from $149 for eligible self-pay patients.",
    source: "lifemd.com, read 2026-09-23",
  },
  {
    name: "Noom",
    slug: "noom",
    url: "https://www.noom.com",
    dispensesBranded: false,
    fee: "Microdose GLP-1 Rx from $79; a lower tier runs $79 then $199/mo",
    medicineNote:
      "Access to brand-name Ozempic or Zepbound starts at $39 plus the cost of the medicine itself.",
    source: "noom.com, read 2026-09-23",
  },
  {
    name: "PlushCare",
    slug: "plushcare",
    url: "https://plushcare.com",
    dispensesBranded: false,
    fee: "$19.99/mo membership, first month free; initial visit $129 without insurance",
    medicineNote:
      "PlushCare's own page notes these medicines \"usually cost about $1,000/month out of pocket\" before a direct-pay programme - worth contrasting with manufacturer prices.",
    source: "plushcare.com, read 2026-09-23",
  },
];
