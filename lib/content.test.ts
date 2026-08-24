import { describe, expect, test } from "bun:test";
import { sortVendorOffers } from "./content";

// Regression check for the Task 4 review finding: sortVendorOffers' price/shipping
// tiebreakers must compare the leading numeric value, not every digit concatenated
// (the old `.replace(/[^0-9.]/g, "")` turned "$65/10mg" into 6510 and "$99.99/10mg"
// into 99.9910, sorting the cheaper offer as *more* expensive). Every offer in today's
// seed data (content/products/*.mdx) has a distinct trustScore, so the primary sort key
// always resolves before the tiebreak runs and this bug stays invisible there — these
// cases construct equal trustScore on purpose to force the tiebreak path.
type Offer = { trustScore: number; price: string; shippingDays: string };

describe("sortVendorOffers", () => {
  test("orders by trustScore descending first", () => {
    const offers: Offer[] = [
      { trustScore: 8.1, price: "$10/10mg", shippingDays: "1-2 days" },
      { trustScore: 9.2, price: "$99/10mg", shippingDays: "3-4 days" },
    ];
    expect(sortVendorOffers(offers).map((o) => o.trustScore)).toEqual([9.2, 8.1]);
  });

  test("cheaper price sorts first when trustScore ties, even with a real-shaped '$X/10mg' suffix", () => {
    const offers: Offer[] = [
      { trustScore: 9.0, price: "$99.99/10mg", shippingDays: "1-2 days" },
      { trustScore: 9.0, price: "$65/10mg", shippingDays: "1-2 days" },
    ];
    expect(sortVendorOffers(offers).map((o) => o.price)).toEqual(["$65/10mg", "$99.99/10mg"]);
  });

  test("cheaper price sorts first for the exact seed shapes that broke under the old parser", () => {
    // "$65/10mg" -> old parser: 6510, correct: 65. "$99.99/10mg" -> old: 99.9910, correct: 99.99.
    // Under the old parser 65 < 99.99 would have sorted *last* because 6510 > 99.9910.
    const offers: Offer[] = [
      { trustScore: 9.2, price: "$99.99/10mg", shippingDays: "2-3 days" },
      { trustScore: 9.2, price: "$65/10mg", shippingDays: "1-2 days" },
      { trustScore: 9.2, price: "$88.18/10mg", shippingDays: "1-2 days" },
    ];
    expect(sortVendorOffers(offers).map((o) => o.price)).toEqual([
      "$65/10mg",
      "$88.18/10mg",
      "$99.99/10mg",
    ]);
  });

  test("faster shipping sorts first when trustScore and price both tie", () => {
    const offers: Offer[] = [
      { trustScore: 9.0, price: "$50/10mg", shippingDays: "2-3 days" },
      { trustScore: 9.0, price: "$50/10mg", shippingDays: "1-2 days" },
    ];
    expect(sortVendorOffers(offers).map((o) => o.shippingDays)).toEqual(["1-2 days", "2-3 days"]);
  });
});
