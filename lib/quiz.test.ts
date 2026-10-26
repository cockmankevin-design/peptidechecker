import { describe, expect, test } from "bun:test";
import { CLINICIAN_NOTE, QUESTIONS, matchMedicines, type Answers } from "./quiz";

const brands = (a: Answers) => matchMedicines(a).matches.map((m) => m.drug.brand);

describe("matchMedicines", () => {
  test("weight + injection: injectable weight medicines and providers", () => {
    const r = matchMedicines({ goal: "weight", format: "needle", age: "18plus" });
    expect(brands({ goal: "weight", format: "needle", age: "18plus" })).toEqual(
      expect.arrayContaining(["Wegovy", "Zepbound", "Saxenda"]),
    );
    expect(brands({ goal: "weight", format: "needle" })).not.toContain("Foundayo");
    expect(r.showProviders).toBe(true);
    expect(r.providers.length).toBeGreaterThan(0);
  });

  test("t2d + pill puts Rybelsus first, no providers", () => {
    const r = matchMedicines({ goal: "t2d", format: "pill", age: "18plus" });
    expect(r.matches[0].drug.brand).toBe("Rybelsus");
    expect(r.showProviders).toBe(false);
  });

  test("under 18 is educational only, no providers", () => {
    const r = matchMedicines({ goal: "weight", format: "either", age: "under18" });
    expect(r.educationalOnly).toBe(true);
    expect(r.showProviders).toBe(false);
    expect(r.providers).toEqual([]);
  });

  test("just researching is educational only", () => {
    const r = matchMedicines({ goal: "research", age: "18plus" });
    expect(r.educationalOnly).toBe(true);
    expect(r.matches).toEqual([]);
  });

  test("discontinued Adlyxin never appears", () => {
    for (const g of ["weight", "t2d", "bone", "hiv-lipodystrophy"]) expect(brands({ goal: g })).not.toContain("Adlyxin");
  });

  test("every answer combination: no doses, no stacking, clinician note present", () => {
    const opts = (id: string) => QUESTIONS.find((q) => q.id === id)!.options.map((o) => o.value);
    let n = 0;
    for (const goal of opts("goal"))
      for (const diagnosis of opts("diagnosis"))
        for (const format of opts("format"))
          for (const insurance of opts("insurance"))
            for (const budget of opts("budget"))
              for (const age of opts("age")) {
                const s = JSON.stringify(matchMedicines({ goal, diagnosis, format, insurance, budget, age }));
                expect(s).not.toMatch(/\d+\s?(mg|mcg|units?)\b/i);
                expect(s).not.toMatch(/stack/i);
                expect(s).not.toMatch(/best for you/i);
                expect(s).toContain(CLINICIAN_NOTE);
                n++;
              }
    expect(n).toBe(5 * 5 * 3 * 3 * 4 * 2);
  });
});
