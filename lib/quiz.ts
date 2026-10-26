/* "Find your match" quiz - pure logic, no UI.

   Inside the 2026-09-23 pivot: it only ever matches FDA-approved medicines
   from APPROVED_DRUGS, never suggests combining them, never mentions doses,
   and always hands the decision to a licensed clinician. */

import {
  APPROVED_DRUGS,
  TELEHEALTH_PROVIDERS,
  type ApprovedDrug,
  type TelehealthProvider,
} from "./fda-registry";

export const CLINICIAN_NOTE = "A licensed clinician decides. This is not medical advice.";

export type Goal = "weight" | "t2d" | "bone" | "hiv-lipodystrophy" | "research";

export interface QuizOption {
  value: string;
  label: string;
}

export interface QuizQuestion {
  id: "goal" | "diagnosis" | "format" | "insurance" | "budget" | "age";
  prompt: string;
  options: QuizOption[];
}

export const QUESTIONS: QuizQuestion[] = [
  {
    id: "goal",
    prompt: "What are you looking into?",
    options: [
      { value: "weight", label: "Weight loss" },
      { value: "t2d", label: "Type 2 diabetes" },
      { value: "bone", label: "Bone density (osteoporosis)" },
      { value: "hiv-lipodystrophy", label: "HIV-related belly fat" },
      { value: "research", label: "Just researching" },
    ],
  },
  {
    id: "diagnosis",
    prompt: "Which of these applies to you?",
    options: [
      { value: "t2d-diagnosed", label: "I've been diagnosed with type 2 diabetes" },
      { value: "bmi-30plus", label: "My BMI is 30 or higher" },
      { value: "bmi-27-with-condition", label: "My BMI is 27+ with a weight-related condition" },
      { value: "none", label: "None of these" },
      { value: "unsure", label: "Not sure" },
    ],
  },
  {
    id: "format",
    prompt: "Injection or pill?",
    options: [
      { value: "needle", label: "Injection is fine" },
      { value: "pill", label: "I'd prefer a pill" },
      { value: "either", label: "Either" },
    ],
  },
  {
    id: "insurance",
    prompt: "Do you have health insurance that might cover it?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "unsure", label: "Not sure" },
    ],
  },
  {
    id: "budget",
    prompt: "What could you spend per month out of pocket?",
    options: [
      { value: "under-100", label: "Under $100" },
      { value: "100-300", label: "$100 to $300" },
      { value: "300-plus", label: "$300+" },
      { value: "unsure", label: "Not sure" },
    ],
  },
  {
    id: "age",
    prompt: "How old are you?",
    options: [
      { value: "18plus", label: "18 or older" },
      { value: "under18", label: "Under 18" },
    ],
  },
];

export type Answers = Partial<Record<QuizQuestion["id"], string>>;

/** What each approved medicine is FDA-approved for, at the level of detail the
    quiz needs. APPROVED_DRUGS has no indication field, so it lives here. */
export const INDICATIONS: Record<string, { goal: Exclude<Goal, "research">; reason: string }> = {
  Wegovy: { goal: "weight", reason: "FDA-approved for chronic weight management" },
  Zepbound: { goal: "weight", reason: "FDA-approved for chronic weight management" },
  Saxenda: { goal: "weight", reason: "FDA-approved for chronic weight management" },
  Foundayo: { goal: "weight", reason: "FDA-approved for chronic weight management, taken as a pill (a small molecule, not a peptide)" },
  Ozempic: { goal: "t2d", reason: "FDA-approved for type 2 diabetes" },
  Mounjaro: { goal: "t2d", reason: "FDA-approved for type 2 diabetes" },
  Trulicity: { goal: "t2d", reason: "FDA-approved for type 2 diabetes" },
  Victoza: { goal: "t2d", reason: "FDA-approved for type 2 diabetes" },
  Byetta: { goal: "t2d", reason: "FDA-approved for type 2 diabetes" },
  Bydureon: { goal: "t2d", reason: "FDA-approved for type 2 diabetes" },
  Rybelsus: { goal: "t2d", reason: "FDA-approved for type 2 diabetes, taken as a pill" },
  Forteo: { goal: "bone", reason: "FDA-approved for osteoporosis at high risk of fracture" },
  Egrifta: { goal: "hiv-lipodystrophy", reason: "FDA-approved to reduce excess belly fat in HIV lipodystrophy" },
};

export const PILL_BRANDS = ["Rybelsus", "Foundayo"];

export interface MatchResult {
  matches: { drug: ApprovedDrug; reason: string }[];
  providers: TelehealthProvider[];
  showProviders: boolean;
  educationalOnly: boolean;
  notes: string[];
}

export function matchMedicines(a: Answers): MatchResult {
  const goal = a.goal as Goal | undefined;
  const educationalOnly = a.age === "under18" || goal === "research";

  let matches = APPROVED_DRUGS.filter(
    (d) => d.status === "approved" && goal && goal !== "research" && INDICATIONS[d.brand]?.goal === goal,
  ).map((drug) => ({ drug, reason: INDICATIONS[drug.brand].reason }));

  const isPill = (m: { drug: ApprovedDrug }) => PILL_BRANDS.includes(m.drug.brand);
  if (a.format === "needle") matches = matches.filter((m) => !isPill(m));
  else if (a.format === "pill") matches = [...matches.filter(isPill), ...matches.filter((m) => !isPill(m))];

  const showProviders = !educationalOnly && goal === "weight" && matches.length > 0;

  const notes = [CLINICIAN_NOTE];
  if (a.age === "under18") notes.push("These medicines are prescribed to adults in most cases; talk to a parent and your doctor.");
  if (a.insurance === "yes") notes.push("Insurance coverage varies; ask your plan.");
  if (a.budget === "under-100")
    notes.push("Cash prices for these are often well above $100/month; providers' current fees are listed.");
  if (matches.length === 0 && !educationalOnly)
    notes.push("No FDA-approved medicine on our list matches that combination. A clinician can talk through other options.");

  return {
    matches,
    providers: showProviders ? TELEHEALTH_PROVIDERS : [],
    showProviders,
    educationalOnly,
    notes,
  };
}
