import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Vendor, Product, TestResult, BlogPost } from "./types";

const contentDir = path.join(process.cwd(), "content");

function getContentFiles(type: string): string[] {
  const dir = path.join(contentDir, type);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));
}

export function getAllContent<T>(type: string): T[] {
  return getContentFiles(type).map((filename) => {
    const fileContents = fs.readFileSync(path.join(contentDir, type, filename), "utf8");
    const { data } = matter(fileContents);
    return { ...data, slug: filename.replace(".mdx", "") } as T;
  });
}

export function getContentBySlug(type: string, slug: string) {
  const filePath = path.join(contentDir, type, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const { data, content } = matter(fs.readFileSync(filePath, "utf8"));
  return { frontmatter: { ...data, slug }, content };
}

/** Vendors, best-trusted first. The spec's listing rule is absolute: below 7 is not shown,
    so the filter lives here rather than in each page that might forget it. */
export function getVendors(): Vendor[] {
  return getAllContent<Vendor>("vendors")
    .filter((v) => v.trustScore >= 7)
    .sort((a, b) => b.trustScore - a.trustScore);
}

/** Products, with each product's vendor offers filtered by the same 7+ trust rule as
    getVendors(). The spec's listing rule is absolute, so this can't be left to each page
    that reads product.vendors to remember on its own. */
export function getProducts(): Product[] {
  return getAllContent<Product>("products").map((product) => ({
    ...product,
    vendors: (product.vendors ?? []).filter((v) => v.trustScore >= 7),
  }));
}

export function getTestResults(): TestResult[] {
  return getAllContent<TestResult>("tests").sort((a, b) =>
    (b.dateTested || "").localeCompare(a.dateTested || ""),
  );
}

export function getBlogPosts(): BlogPost[] {
  return getAllContent<BlogPost>("blog").sort((a, b) =>
    (b.date || "").localeCompare(a.date || ""),
  );
}

/** Safety > Price > Shipping, the spec's display hierarchy, applied in one place so every
    listing sorts identically. Trust score first, then cheapest, then fastest. */
export function sortVendorOffers<T extends { trustScore: number; price: string; shippingDays: string }>(
  offers: T[],
): T[] {
  // Read only the leading numeric value (e.g. "65" out of "$65/10mg", "1" out of "1-2 days").
  // Stripping every non-digit and concatenating (the previous approach) turned "$65/10mg"
  // into 6510 and "$99.99/10mg" into 99.9910, sorting the cheaper offer as more expensive.
  const num = (s: string) => parseFloat(String(s).match(/[0-9]+(\.[0-9]+)?/)?.[0] ?? "") || 0;
  return [...offers].sort(
    (a, b) =>
      b.trustScore - a.trustScore ||
      num(a.price) - num(b.price) ||
      num(a.shippingDays) - num(b.shippingDays),
  );
}
