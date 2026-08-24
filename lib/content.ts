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

export function getProducts(): Product[] {
  return getAllContent<Product>("products");
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
  const num = (s: string) => parseFloat(String(s).replace(/[^0-9.]/g, "")) || 0;
  return [...offers].sort(
    (a, b) =>
      b.trustScore - a.trustScore ||
      num(a.price) - num(b.price) ||
      num(a.shippingDays) - num(b.shippingDays),
  );
}
