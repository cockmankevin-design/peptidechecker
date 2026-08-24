# PeptideChecker MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a curated peptide marketplace MVP — a dark, premium Next.js static site that connects buyers to independently verified peptide vendors, displaying safety scores, pricing, and shipping for each product.

**Architecture:** Next.js App Router with static export. Content lives in MDX files (vendors, products, test results, blog posts) loaded at build time via a shared content utility. Tailwind CSS with a custom dark theme inspired by FloxAmino's design. All pages are statically generated — no server-side runtime needed.

**Tech Stack:** Next.js **16.x** (App Router), **Tailwind 4**, React 19, MDX (gray-matter + next-mdx-remote), TypeScript — installed and run with **Bun** (this machine has no node/npm/npx).

> **Toolchain note (2026-08-24):** verified working on this machine — `bun create next-app` and `bun run build` both exit 0. Versions are what Bun actually installs: Next 16.3.2, Tailwind 4.3.3, React 19.2.8. This plan was originally written for Next 14 + Tailwind 3; do not "restore" those. The consequential difference is that **Tailwind 4 has no `tailwind.config.ts`** — theme tokens live in `app/globals.css` under `@theme`.

## Global Constraints

- Dark theme default (navy-black backgrounds, teal/cyan accent)
- Display priority on all product listings: Safety > Price > Shipping
- "For research purposes only" disclaimer in footer on every page
- No vendor pays for placement — trust score determines listing eligibility (7+ only)
- Static export — no server runtime, all pages built at build time
- All content in MDX with frontmatter metadata
- Design reference: FloxAmino screenshots (dark premium, 3D vial imagery, clean product grid)

---

### Task 1: Project Scaffold + Tailwind + MDX Config

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `app/globals.css` (theme tokens live HERE — Tailwind 4 has no `tailwind.config.ts`)
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `lib/types.ts`
- Create: `lib/content.ts`

**Interfaces:**
- Produces: Next.js app shell, Tailwind theme tokens, content loading functions (`getVendors()`, `getProducts()`, `getTestResults()`, `getBlogPosts()`, `getContentBySlug(type, slug)`)

- [ ] **Step 1: Initialize Next.js project**

```bash
cd C:\Users\cockm\Documents\PeptideChecker
bun create next-app . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --yes
```

- [ ] **Step 2: Install MDX dependencies**

```bash
bun add gray-matter next-mdx-remote reading-time
```

- [ ] **Step 3: Configure Tailwind theme**

**Tailwind 4 — there is no `tailwind.config.ts`.** `bun create next-app` installs Tailwind
4.x, which declares theme tokens in CSS via `@theme`, not in a JS/TS config. A
`tailwind.config.ts` file would be silently ignored and every colour below would fall back to
Tailwind's defaults — a failure that looks like "the design just came out wrong" rather than
an error. Content paths are auto-detected in v4; `@source` only needs declaring for files
outside the project root.

Put the palette at the top of `app/globals.css`, immediately after the `@import`. The token
names are chosen so the generated utility classes (`bg-brand-bg`, `text-brand-accent`,
`border-brand-border`, `font-heading`, …) are **identical** to what Tasks 2–7 already
reference — do not rename them.

```css
@import "tailwindcss";

@theme {
  /* surfaces */
  --color-brand-bg: #0A0F1C;
  --color-brand-surface: #111827;
  --color-brand-surface-2: #1A2332;
  --color-brand-border: #1E2D3D;

  /* accent */
  --color-brand-accent: #00D4AA;
  --color-brand-accent-hover: #00F0C0;
  --color-brand-accent-dim: rgba(0, 212, 170, 0.12);

  /* type */
  --color-brand-text: #E2E8F0;
  --color-brand-text-secondary: #7B89A1;
  --color-brand-text-heading: #F1F5F9;

  /* trust-score semantics — safe deliberately equals accent */
  --color-brand-safe: #00D4AA;
  --color-brand-warn: #F59E0B;
  --color-brand-fail: #EF4444;

  --font-heading: var(--font-heading-src), system-ui, sans-serif;
  --font-body: var(--font-body-src), system-ui, sans-serif;
}
```

Note the font indirection: `next/font` injects its own CSS variable, and pointing
`--font-heading` at a variable of the same name would be self-referential. Have `layout.tsx`
expose the loaded fonts as `--font-heading-src` / `--font-body-src`.

- [ ] **Step 4: Set up global styles**

Append to `app/globals.css`, below the `@theme` block from Step 3. **Do not add
`@tailwind base/components/utilities`** — those are Tailwind 3 directives; v4 replaces all
three with the single `@import "tailwindcss"` already at the top of the file.

```css
@layer base {
  body {
    @apply bg-brand-bg text-brand-text antialiased;
  }
}
```

- [ ] **Step 5: Create TypeScript types**

In `lib/types.ts`:

```ts
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
  reportPdf?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
}
```

- [ ] **Step 6: Create content loading utility**

In `lib/content.ts`:

```ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const contentDir = path.join(process.cwd(), "content");

function getContentFiles(type: string): string[] {
  const dir = path.join(contentDir, type);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));
}

export function getAllContent<T>(type: string): T[] {
  const files = getContentFiles(type);
  return files.map((filename) => {
    const filePath = path.join(contentDir, type, filename);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data } = matter(fileContents);
    return { ...data, slug: filename.replace(".mdx", "") } as T;
  });
}

export function getContentBySlug(type: string, slug: string) {
  const filePath = path.join(contentDir, type, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);
  return { frontmatter: { ...data, slug }, content };
}

export function getVendors() {
  return getAllContent<import("./types").Vendor>("vendors");
}

export function getProducts() {
  return getAllContent<import("./types").Product>("products");
}

export function getTestResults() {
  return getAllContent<import("./types").TestResult>("tests");
}

export function getBlogPosts() {
  return getAllContent<import("./types").BlogPost>("blog");
}
```

- [ ] **Step 7: Set up root layout with fonts**

In `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const heading = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading-src",   // consumed by --font-heading in @theme
  weight: ["600", "700"],
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body-src",      // consumed by --font-body in @theme
});

export const metadata: Metadata = {
  title: "PeptideChecker — Independently Verified Peptide Sources",
  description:
    "The most trusted source for independently verified peptide vendors. Third-party lab tested. No vendor funding. Safety first.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body className="font-body">{children}</body>
    </html>
  );
}
```

- [ ] **Step 8: Create placeholder homepage**

In `app/page.tsx`:

```tsx
export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <h1 className="font-heading text-4xl font-bold text-brand-text-heading">
        Peptide<span className="text-brand-accent">Checker</span>
      </h1>
    </main>
  );
}
```

- [ ] **Step 9: Verify dev server runs**

```bash
cd C:\Users\cockm\Documents\PeptideChecker
bun run dev
```

Open http://localhost:3000 — should see "PeptideChecker" centered on a dark background with teal accent.

- [ ] **Step 10: Create content directories with sample data**

Create `content/vendors/protide-health.mdx`:

```mdx
---
name: "Protide Health"
description: "US-based peptide supplier with public HPLC + LC-MS COA library. 99.5%+ average batch purity independently confirmed."
trustScore: 9.2
coaStatus: "HPLC + LC-MS per batch, public COA library"
testingMethod: "Third-party (Janoshik, Colmaric)"
shippingSpeed: "1-2 day tracked"
avgPrice: "$65/10mg"
affiliateUrl: "https://protidehealth.com"
productsCarried: ["bpc-157", "tb-500", "mots-c", "semaglutide"]
founded: "2023"
location: "United States"
---

Protide Health has built its reputation on radical transparency. Every batch ships with HPLC and LC-MS certificates from named third-party labs. Their public COA library lets buyers verify any lot number before purchasing.
```

Create `content/vendors/limitless-life.mdx`:

```mdx
---
name: "Limitless Life Nootropics"
description: "Wide catalog with HPLC + LC-MS testing included with every order. FedEx 2-Day shipping."
trustScore: 8.5
coaStatus: "HPLC + LC-MS per batch, included with order"
testingMethod: "Third-party"
shippingSpeed: "FedEx 2-Day"
avgPrice: "$99.99/10mg"
affiliateUrl: "https://limitlesslifenootropics.com"
productsCarried: ["bpc-157", "tb-500", "semaglutide", "pt-141"]
founded: "2021"
location: "United States"
---

Limitless Life Nootropics offers one of the widest peptide catalogs with comprehensive testing documentation included with every order.
```

Create `content/vendors/umbrella-labs.mdx`:

```mdx
---
name: "Umbrella Labs"
description: "HPLC + LC/GC-MS testing by named credentialed analytical chemists. Multiple format options."
trustScore: 8.1
coaStatus: "HPLC + LC/GC-MS, public COAs"
testingMethod: "Third-party (named chemists)"
shippingSpeed: "Same-day before 1PM PST"
avgPrice: "$88.18/10mg"
affiliateUrl: "https://umbrellalabs.is"
productsCarried: ["bpc-157", "tb-500", "mots-c"]
founded: "2019"
location: "United States"
---

Umbrella Labs differentiates with named credentialed analytical chemists conducting their HPLC and LC/GC-MS testing, offering same-day dispatch for orders placed before 1 PM PST.
```

Create `content/products/bpc-157.mdx`:

```mdx
---
name: "BPC-157"
category: "Recovery & Repair"
description: "Body Protection Compound-157 is a pentadecapeptide studied for tissue repair, gut healing, and recovery support."
commonUses: ["Tissue repair", "Gut healing", "Joint recovery", "Tendon support"]
startingPrice: "$65"
vendors:
  - vendorSlug: "protide-health"
    vendorName: "Protide Health"
    price: "$65/10mg"
    purity: 99.5
    shippingDays: "1-2 days"
    trustScore: 9.2
    testSlug: "2026-08-bpc157-protide"
    affiliateUrl: "https://protidehealth.com/bpc-157"
  - vendorSlug: "limitless-life"
    vendorName: "Limitless Life"
    price: "$99.99/10mg"
    purity: 99.1
    shippingDays: "2-3 days"
    trustScore: 8.5
    testSlug: "2026-08-bpc157-limitless"
    affiliateUrl: "https://limitlesslifenootropics.com/bpc-157"
  - vendorSlug: "umbrella-labs"
    vendorName: "Umbrella Labs"
    price: "$88.18/10mg"
    purity: 98.7
    shippingDays: "1-2 days"
    trustScore: 8.1
    affiliateUrl: "https://umbrellalabs.is/bpc-157"
---

BPC-157 (Body Protection Compound-157) is one of the most widely researched peptides for tissue repair and recovery.
```

Create `content/products/tb-500.mdx`:

```mdx
---
name: "TB-500"
category: "Recovery & Repair"
description: "Thymosin Beta-4 fragment studied for wound healing, flexibility, and recovery from muscle and connective tissue injuries."
commonUses: ["Wound healing", "Muscle recovery", "Flexibility", "Hair growth"]
startingPrice: "$70"
vendors:
  - vendorSlug: "protide-health"
    vendorName: "Protide Health"
    price: "$70/10mg"
    purity: 99.3
    shippingDays: "1-2 days"
    trustScore: 9.2
    affiliateUrl: "https://protidehealth.com/tb-500"
  - vendorSlug: "umbrella-labs"
    vendorName: "Umbrella Labs"
    price: "$85/10mg"
    purity: 98.9
    shippingDays: "1-2 days"
    trustScore: 8.1
    affiliateUrl: "https://umbrellalabs.is/tb-500"
---

TB-500 is a synthetic version of Thymosin Beta-4, a naturally occurring peptide involved in tissue repair and regeneration.
```

Create `content/products/mots-c.mdx`:

```mdx
---
name: "MOTS-C"
category: "Metabolic"
description: "Mitochondrial-derived peptide studied for metabolic regulation, exercise performance, and fat metabolism."
commonUses: ["Fat metabolism", "Exercise performance", "Metabolic health", "Insulin sensitivity"]
startingPrice: "$50"
vendors:
  - vendorSlug: "protide-health"
    vendorName: "Protide Health"
    price: "$50/10mg"
    purity: 99.2
    shippingDays: "1-2 days"
    trustScore: 9.2
    affiliateUrl: "https://protidehealth.com/mots-c"
---

MOTS-C is a mitochondrial-derived peptide that has shown promise in research related to metabolic regulation and exercise mimicry.
```

Create `content/products/semaglutide.mdx`:

```mdx
---
name: "Semaglutide"
category: "Fat Loss"
description: "GLP-1 receptor agonist widely studied for weight management and metabolic health."
commonUses: ["Weight management", "Appetite regulation", "Blood sugar control"]
startingPrice: "$89"
vendors:
  - vendorSlug: "protide-health"
    vendorName: "Protide Health"
    price: "$89/5mg"
    purity: 99.4
    shippingDays: "1-2 days"
    trustScore: 9.2
    affiliateUrl: "https://protidehealth.com/semaglutide"
  - vendorSlug: "limitless-life"
    vendorName: "Limitless Life"
    price: "$109/5mg"
    purity: 99.0
    shippingDays: "2-3 days"
    trustScore: 8.5
    affiliateUrl: "https://limitlesslifenootropics.com/semaglutide"
---

Semaglutide is a GLP-1 receptor agonist that has become one of the most sought-after peptides for weight management research.
```

Create `content/tests/2026-08-bpc157-protide.mdx`:

```mdx
---
vendor: "Protide Health"
vendorSlug: "protide-health"
peptide: "BPC-157"
peptideSlug: "bpc-157"
lab: "Janoshik Analytical"
hplcPurity: 99.53
massSpecConfirmed: true
endotoxinTested: true
lotNumber: "PH-BPC-2026-0814"
dateTested: "2026-08-14"
passed: true
---

Independent HPLC analysis confirmed 99.53% purity. Mass spectrometry verified correct molecular weight of 1419.53 Da. Bacterial endotoxin (LAL) testing passed below detection limits.
```

Create `content/tests/2026-08-bpc157-limitless.mdx`:

```mdx
---
vendor: "Limitless Life"
vendorSlug: "limitless-life"
peptide: "BPC-157"
peptideSlug: "bpc-157"
lab: "Colmaric Analyticals"
hplcPurity: 99.12
massSpecConfirmed: true
endotoxinTested: false
lotNumber: "LL-BPC-2026-0801"
dateTested: "2026-08-10"
passed: true
---

HPLC analysis confirmed 99.12% purity. Mass spectrometry verified correct molecular identity. Endotoxin testing was not included in this batch report.
```

Create `content/blog/how-to-read-a-coa.mdx`:

```mdx
---
title: "How to Read a Certificate of Analysis (COA)"
excerpt: "A COA is your first line of defense against fake peptides. Here's exactly what to look for and what the numbers mean."
date: "2026-08-20"
readingTime: "5 min read"
---

A Certificate of Analysis (COA) is the document that proves a peptide is what it claims to be. But not all COAs are created equal.
```

- [ ] **Step 11: Initialize git repo and commit**

```bash
cd C:\Users\cockm\Documents\PeptideChecker
git init
git add -A
git commit -m "feat: scaffold Next.js project with Tailwind, MDX config, content layer, and sample data"
```

---

### Task 2: Header, Footer, and Layout Shell

**Files:**
- Create: `components/Header.tsx`
- Create: `components/Footer.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: Tailwind theme tokens from Task 1
- Produces: `<Header />` and `<Footer />` components used in root layout

- [ ] **Step 1: Build Header component**

Create `components/Header.tsx` — dark nav bar with logo, nav links (Home, Products, Vendors, Lab Results, Blog), and user/cart icons matching FloxAmino's top nav:

```tsx
"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/peptides", label: "Products" },
  { href: "/vendors", label: "Vendors" },
  { href: "/results", label: "Lab Results" },
  { href: "/compare", label: "Compare" },
  { href: "/blog", label: "Blog" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-brand-bg/80 backdrop-blur-md border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-heading text-xl font-bold text-brand-text-heading">
              Peptide<span className="text-brand-accent">Checker</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm text-brand-text-secondary hover:text-brand-text transition-colors rounded-md hover:bg-brand-surface"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            className="md:hidden p-2 text-brand-text-secondary"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-brand-border bg-brand-bg px-4 py-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-3 py-2 text-sm text-brand-text-secondary hover:text-brand-text"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
```

- [ ] **Step 2: Build Footer component**

Create `components/Footer.tsx`:

```tsx
import Link from "next/link";

const menuLinks = [
  { href: "/", label: "Home" },
  { href: "/peptides", label: "Products" },
  { href: "/vendors", label: "Vendors" },
  { href: "/results", label: "Lab Results" },
  { href: "/faq", label: "FAQ" },
];

const quickLinks = [
  { href: "/about", label: "About" },
  { href: "/methodology", label: "Methodology" },
  { href: "/compare", label: "Compare Vendors" },
  { href: "/blog", label: "Blog" },
];

export default function Footer() {
  return (
    <footer className="border-t border-brand-border bg-brand-surface mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <span className="font-heading text-lg font-bold text-brand-text-heading">
              Peptide<span className="text-brand-accent">Checker</span>
            </span>
            <p className="mt-3 text-sm text-brand-text-secondary leading-relaxed">
              Independent peptide verification. We don&apos;t sell peptides — we verify who does.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-text-secondary mb-4">Menu</h3>
            <ul className="space-y-2">
              {menuLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-brand-text-secondary hover:text-brand-text transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-text-secondary mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-brand-text-secondary hover:text-brand-text transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-text-secondary mb-4">Contact</h3>
            <p className="text-sm text-brand-text-secondary">info@peptidechecker.com</p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-brand-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-brand-text-secondary">
            &copy; {new Date().getFullYear()} PeptideChecker. All rights reserved.
          </p>
          <p className="text-xs text-brand-text-secondary">
            For research purposes only. Not for human consumption.
          </p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Wire Header and Footer into root layout**

Update `app/layout.tsx` to import and render both components, with `pt-16` on main to offset the fixed header.

- [ ] **Step 4: Verify in browser**

Run `bun run dev`, confirm header nav and footer render on the dark background. Test mobile hamburger menu.

- [ ] **Step 5: Commit**

```bash
git add components/Header.tsx components/Footer.tsx app/layout.tsx
git commit -m "feat: add Header with mobile nav and Footer with research disclaimer"
```

---

### Task 3: Homepage (Hero, Trust Badges, Product Grid, How It Works, Email Signup)

**Files:**
- Create: `components/Hero.tsx`
- Create: `components/TrustBadges.tsx`
- Create: `components/ProductGrid.tsx`
- Create: `components/ProductCard.tsx`
- Create: `components/HowItWorks.tsx`
- Create: `components/EmailSignup.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `getProducts()` from `lib/content.ts`, `Product` type from `lib/types.ts`
- Produces: Complete homepage matching FloxAmino design reference

- [ ] **Step 1: Build Hero component**

Create `components/Hero.tsx` — large typography hero with value prop, "Open Shop" CTA button, and a "View Lab Reports" badge in the bottom right, matching the FloxAmino hero layout:

```tsx
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-bg via-brand-surface to-brand-bg" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="max-w-2xl">
          <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-brand-text-heading leading-[1.1]">
            Verified
            <br />
            <span className="text-brand-accent">Peptides</span>
          </h1>
          <p className="mt-6 text-lg text-brand-text-secondary max-w-md">
            Explore independently tested peptide sources. Every vendor verified by third-party labs — trusted by researchers worldwide.
          </p>
          <Link
            href="/peptides"
            className="mt-8 inline-flex items-center gap-2 bg-brand-accent text-brand-bg font-semibold px-6 py-3 rounded-full hover:bg-brand-accent-hover transition-colors"
          >
            Browse Products
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        <div className="absolute bottom-8 right-8 hidden lg:flex items-center gap-3 bg-white/95 text-gray-900 rounded-lg px-4 py-3 shadow-lg">
          <div className="w-8 h-8 bg-brand-accent/20 rounded flex items-center justify-center">
            <svg className="w-5 h-5 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-sm">View Lab Reports</p>
            <p className="text-xs text-gray-500">All products undergo rigorous third-party lab testing for purity, potency, and safety.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Build TrustBadges component**

Create `components/TrustBadges.tsx`:

```tsx
const badges = [
  { label: "Third-Party Tested", icon: "🔬" },
  { label: "Named Labs", icon: "🏛️" },
  { label: "No Vendor Funding", icon: "🛡️" },
  { label: "7+ Trust Score Required", icon: "✓" },
];

export default function TrustBadges() {
  return (
    <section className="border-y border-brand-border bg-brand-surface/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
          {badges.map((badge) => (
            <div key={badge.label} className="flex items-center gap-2 text-brand-text-secondary">
              <span className="text-lg">{badge.icon}</span>
              <span className="text-sm font-medium">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Build ProductCard component**

Create `components/ProductCard.tsx` — dark card with vial-style image area, product name, price, and trust indicator matching FloxAmino's product grid:

```tsx
import Link from "next/link";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  const topVendor = product.vendors?.[0];
  const purity = topVendor?.purity;

  return (
    <Link href={`/peptides/${product.slug}`} className="group">
      <div className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden hover:border-brand-accent/30 transition-all duration-300">
        <div className="aspect-square bg-gradient-to-br from-brand-surface-2 to-brand-surface flex items-center justify-center p-6 relative">
          <div className="w-24 h-32 bg-gradient-to-b from-gray-300 to-gray-400 rounded-lg shadow-lg relative">
            <div className="absolute inset-x-2 top-2 bottom-4 bg-white/90 rounded-sm flex items-center justify-center">
              <span className="text-[10px] font-bold text-gray-600 text-center leading-tight px-1">{product.name}</span>
            </div>
            <div className="absolute bottom-1 inset-x-2 h-2 bg-brand-accent/30 rounded-sm" />
          </div>
          {purity && purity >= 99 && (
            <span className="absolute top-3 right-3 bg-brand-safe/20 text-brand-safe text-xs font-semibold px-2 py-1 rounded">
              {purity}% pure
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-heading font-bold text-brand-text-heading group-hover:text-brand-accent transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-brand-text-secondary mt-1">{product.category}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-brand-text font-semibold">
              From {product.startingPrice}
            </span>
            {topVendor && (
              <span className="text-xs text-brand-text-secondary">
                {topVendor.shippingDays}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 4: Build ProductGrid component**

Create `components/ProductGrid.tsx`:

```tsx
import ProductCard from "./ProductCard";
import type { Product } from "@/lib/types";

export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent mb-2">Products</p>
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-brand-text-heading">
          Verified Purity & Potency
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Build HowItWorks component**

Create `components/HowItWorks.tsx`:

```tsx
const steps = [
  {
    number: "01",
    title: "We Test",
    description: "We buy peptides from vendors and send them to independent, named third-party labs for HPLC and mass spectrometry analysis.",
  },
  {
    number: "02",
    title: "We Verify",
    description: "Only vendors whose products pass rigorous purity testing and score 7+ on our trust system get listed.",
  },
  {
    number: "03",
    title: "You Buy Safe",
    description: "Browse verified products sorted by safety, price, and shipping. Every listing backed by real lab data.",
  },
];

export default function HowItWorks() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent mb-2">How It Works</p>
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-brand-text-heading">
          Trust, Transparency, Results
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step) => (
          <div key={step.number} className="bg-brand-surface border border-brand-border rounded-xl p-6">
            <span className="font-heading text-3xl font-bold text-brand-accent/30">{step.number}</span>
            <h3 className="font-heading text-xl font-bold text-brand-text-heading mt-3">{step.title}</h3>
            <p className="text-sm text-brand-text-secondary mt-2 leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Build EmailSignup component**

Create `components/EmailSignup.tsx`:

```tsx
export default function EmailSignup() {
  return (
    <section className="bg-gradient-to-r from-brand-surface to-brand-surface-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-xl">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-brand-text-heading">
            Get New Test Results First
          </h2>
          <p className="mt-3 text-brand-text-secondary">
            Subscribe for updates when we publish new independent lab results and vendor reviews.
          </p>
          <form className="mt-6 flex gap-3" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="*Email address"
              className="flex-1 bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-sm text-brand-text placeholder:text-brand-text-secondary focus:outline-none focus:border-brand-accent"
            />
            <button
              type="submit"
              className="bg-brand-accent text-brand-bg font-semibold px-6 py-3 rounded-lg hover:bg-brand-accent-hover transition-colors text-sm"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Assemble homepage**

Update `app/page.tsx`:

```tsx
import Hero from "@/components/Hero";
import TrustBadges from "@/components/TrustBadges";
import ProductGrid from "@/components/ProductGrid";
import HowItWorks from "@/components/HowItWorks";
import EmailSignup from "@/components/EmailSignup";
import { getProducts } from "@/lib/content";

export default function Home() {
  const products = getProducts();

  return (
    <main className="pt-16">
      <Hero />
      <TrustBadges />
      <ProductGrid products={products} />
      <HowItWorks />
      <EmailSignup />
    </main>
  );
}
```

- [ ] **Step 8: Verify in browser**

Run dev server. Confirm all homepage sections render: hero, trust badges, product grid with 4 products from MDX, how it works cards, email signup. Test responsive layout.

- [ ] **Step 9: Commit**

```bash
git add components/ app/page.tsx
git commit -m "feat: build homepage with hero, product grid, how-it-works, and email signup"
```

---

### Task 4: Peptide Product Pages (List + Detail)

**Files:**
- Create: `app/peptides/page.tsx`
- Create: `app/peptides/[slug]/page.tsx`
- Create: `components/VendorCard.tsx`
- Create: `components/TrustScoreBadge.tsx`

**Interfaces:**
- Consumes: `getProducts()`, `getContentBySlug()` from `lib/content.ts`
- Produces: `/peptides` list page, `/peptides/[slug]` detail pages with vendor cards sorted by Safety > Price > Shipping

- [ ] **Step 1: Build TrustScoreBadge component**

Create `components/TrustScoreBadge.tsx`:

```tsx
export default function TrustScoreBadge({ score }: { score: number }) {
  const color =
    score >= 9 ? "text-brand-safe bg-brand-safe/15" :
    score >= 7 ? "text-brand-accent bg-brand-accent-dim" :
    score >= 5 ? "text-brand-warn bg-yellow-500/15" :
    "text-brand-fail bg-red-500/15";

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-sm font-bold ${color}`}>
      {score.toFixed(1)}
    </span>
  );
}
```

- [ ] **Step 2: Build VendorCard component**

Create `components/VendorCard.tsx` — displays one vendor's offering for a specific peptide, with safety score largest, then price, then shipping:

```tsx
import Link from "next/link";
import TrustScoreBadge from "./TrustScoreBadge";
import type { ProductVendor } from "@/lib/types";

export default function VendorCard({ vendor }: { vendor: ProductVendor }) {
  return (
    <div className="bg-brand-surface border border-brand-border rounded-xl p-5 hover:border-brand-accent/30 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <Link href={`/vendors/${vendor.vendorSlug}`} className="font-heading font-bold text-brand-text-heading hover:text-brand-accent transition-colors">
            {vendor.vendorName}
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <TrustScoreBadge score={vendor.trustScore} />
            <span className="text-sm font-semibold text-brand-safe">{vendor.purity}% purity</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-brand-text-secondary uppercase tracking-wider">Price</p>
          <p className="text-lg font-bold text-brand-text-heading">{vendor.price}</p>
        </div>
        <div>
          <p className="text-xs text-brand-text-secondary uppercase tracking-wider">Shipping</p>
          <p className="text-sm font-medium text-brand-text">{vendor.shippingDays}</p>
        </div>
      </div>

      <div className="flex gap-3">
        {vendor.testSlug && (
          <Link
            href={`/results/${vendor.testSlug}`}
            className="flex-1 text-center border border-brand-accent text-brand-accent text-sm font-semibold py-2.5 rounded-lg hover:bg-brand-accent-dim transition-colors"
          >
            View Lab Report
          </Link>
        )}
        <a
          href={vendor.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center bg-brand-accent text-brand-bg text-sm font-semibold py-2.5 rounded-lg hover:bg-brand-accent-hover transition-colors"
        >
          Buy Now
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Build peptide list page**

Create `app/peptides/page.tsx`:

```tsx
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/content";

export default function PeptidesPage() {
  const products = getProducts();

  return (
    <main className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent mb-2">All Products</p>
          <h1 className="font-heading text-4xl font-bold text-brand-text-heading">Verified Peptides</h1>
          <p className="mt-3 text-brand-text-secondary max-w-xl">
            Every product listed has been independently tested by a named third-party lab. Sorted by safety score.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products
            .sort((a, b) => (b.vendors?.[0]?.trustScore ?? 0) - (a.vendors?.[0]?.trustScore ?? 0))
            .map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Build peptide detail page**

Create `app/peptides/[slug]/page.tsx`:

```tsx
import { getProducts, getContentBySlug } from "@/lib/content";
import VendorCard from "@/components/VendorCard";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const products = getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export default function PeptideDetailPage({ params }: { params: { slug: string } }) {
  const data = getContentBySlug("products", params.slug);
  if (!data) notFound();

  const { frontmatter } = data;
  const vendors = (frontmatter.vendors ?? []).sort(
    (a: any, b: any) => b.trustScore - a.trustScore || a.price.localeCompare(b.price)
  );

  return (
    <main className="pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent mb-2">
          {frontmatter.category}
        </p>
        <h1 className="font-heading text-4xl font-bold text-brand-text-heading">
          {frontmatter.name}
        </h1>
        <p className="mt-4 text-brand-text-secondary max-w-xl leading-relaxed">
          {frontmatter.description}
        </p>

        {frontmatter.commonUses && (
          <div className="flex flex-wrap gap-2 mt-4">
            {frontmatter.commonUses.map((use: string) => (
              <span key={use} className="text-xs bg-brand-accent-dim text-brand-accent px-3 py-1 rounded-full font-medium">
                {use}
              </span>
            ))}
          </div>
        )}

        <section className="mt-12">
          <h2 className="font-heading text-xl font-bold text-brand-text-heading mb-6">
            Verified Vendors ({vendors.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vendors.map((vendor: any) => (
              <VendorCard key={vendor.vendorSlug} vendor={vendor} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
```

- [ ] **Step 5: Verify in browser**

Navigate to `/peptides` — should show all 4 products. Click into BPC-157 — should show 3 vendor cards sorted by trust score, each with safety badge, price, shipping, "View Lab Report" and "Buy Now" buttons.

- [ ] **Step 6: Commit**

```bash
git add app/peptides/ components/VendorCard.tsx components/TrustScoreBadge.tsx
git commit -m "feat: add peptide list and detail pages with vendor comparison cards"
```

---

### Task 5: Vendor Profiles + Test Results Pages

**Files:**
- Create: `app/vendors/page.tsx`
- Create: `app/vendors/[slug]/page.tsx`
- Create: `app/results/page.tsx`
- Create: `app/results/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getVendors()`, `getTestResults()`, `getContentBySlug()` from `lib/content.ts`
- Produces: `/vendors`, `/vendors/[slug]`, `/results`, `/results/[slug]` pages

- [ ] **Step 1: Build vendor list page**

Create `app/vendors/page.tsx` — grid of vendor cards sorted by trust score:

```tsx
import Link from "next/link";
import TrustScoreBadge from "@/components/TrustScoreBadge";
import { getVendors } from "@/lib/content";

export default function VendorsPage() {
  const vendors = getVendors().sort((a, b) => b.trustScore - a.trustScore);

  return (
    <main className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent mb-2">Vendors</p>
          <h1 className="font-heading text-4xl font-bold text-brand-text-heading">Verified Vendors</h1>
          <p className="mt-3 text-brand-text-secondary">Only vendors scoring 7+ after independent testing are listed.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <Link key={vendor.slug} href={`/vendors/${vendor.slug}`} className="group">
              <div className="bg-brand-surface border border-brand-border rounded-xl p-6 hover:border-brand-accent/30 transition-colors h-full">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading font-bold text-brand-text-heading group-hover:text-brand-accent transition-colors">{vendor.name}</h3>
                  <TrustScoreBadge score={vendor.trustScore} />
                </div>
                <p className="text-sm text-brand-text-secondary mb-4 line-clamp-2">{vendor.description}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-brand-text-secondary">Avg Price:</span> <span className="text-brand-text font-medium">{vendor.avgPrice}</span></div>
                  <div><span className="text-brand-text-secondary">Shipping:</span> <span className="text-brand-text font-medium">{vendor.shippingSpeed}</span></div>
                  <div className="col-span-2"><span className="text-brand-text-secondary">Testing:</span> <span className="text-brand-text font-medium">{vendor.testingMethod}</span></div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Build vendor detail page**

Create `app/vendors/[slug]/page.tsx` with trust score breakdown, test history, and affiliate link. Use `generateStaticParams` to pre-render all vendor pages.

- [ ] **Step 3: Build test results list page**

Create `app/results/page.tsx` — list of all lab reports with pass/fail badges, sorted by date.

- [ ] **Step 4: Build test result detail page**

Create `app/results/[slug]/page.tsx` — shows vendor, peptide, lab name, HPLC purity %, mass spec confirmation, lot number, date, pass/fail badge. Large, prominent display of the purity percentage.

- [ ] **Step 5: Verify vendor and results pages in browser**

Check `/vendors`, `/vendors/protide-health`, `/results`, `/results/2026-08-bpc157-protide`. Confirm all data renders correctly and links between pages work.

- [ ] **Step 6: Commit**

```bash
git add app/vendors/ app/results/
git commit -m "feat: add vendor profiles and lab results pages"
```

---

### Task 6: Comparison Table + FAQ + Static Pages

**Files:**
- Create: `app/compare/page.tsx`
- Create: `app/faq/page.tsx`
- Create: `components/FaqAccordion.tsx`
- Create: `app/about/page.tsx`
- Create: `app/methodology/page.tsx`

**Interfaces:**
- Consumes: `getVendors()` from `lib/content.ts`
- Produces: `/compare`, `/faq`, `/about`, `/methodology` pages

- [ ] **Step 1: Build comparison table page**

Create `app/compare/page.tsx` — sortable table of all vendors with columns: Vendor, Trust Score, COA Status, Avg Price, Shipping, Products Tested. Default sort by trust score descending. Use client-side state for sort toggling.

- [ ] **Step 2: Build FAQ accordion component**

Create `components/FaqAccordion.tsx` — dark-themed accordion matching FloxAmino's FAQ section. Items: "Are the peptides in powder form?", "Are peptides legal?", "How does PeptideChecker verify vendors?", "Do you sell peptides directly?", "What happens if a vendor fails testing?", "How do I store peptides?", "Do you offer shipping?"

- [ ] **Step 3: Build FAQ page**

Create `app/faq/page.tsx` using the FaqAccordion with a "Still need help? Contact us" section on the left side, matching the FloxAmino layout.

- [ ] **Step 4: Build About page**

Create `app/about/page.tsx` — founder story section (personal frustration with unsafe peptide sources, friend getting sick), mission statement, methodology link.

- [ ] **Step 5: Build Methodology page**

Create `app/methodology/page.tsx` — explains exactly how testing works, names the labs (Janoshik Analytical, Colmaric Analyticals, MZ Biolabs), explains the trust score formula (purity 40%, COA transparency 20%, consistency 20%, pricing 10%, shipping 10%), explains the 7+ threshold rule.

- [ ] **Step 6: Verify all pages in browser**

Check `/compare`, `/faq`, `/about`, `/methodology`. Confirm table sorting works, FAQ accordion opens/closes, all content renders.

- [ ] **Step 7: Commit**

```bash
git add app/compare/ app/faq/ app/about/ app/methodology/ components/FaqAccordion.tsx
git commit -m "feat: add comparison table, FAQ, about, and methodology pages"
```

---

### Task 7: Blog + Final Polish + Deploy

**Files:**
- Create: `app/blog/page.tsx`
- Create: `app/blog/[slug]/page.tsx`
- Modify: `next.config.ts` (static export config)

**Interfaces:**
- Consumes: `getBlogPosts()`, `getContentBySlug()` from `lib/content.ts`
- Produces: `/blog` list, `/blog/[slug]` detail, production-ready static export

- [ ] **Step 1: Build blog list page**

Create `app/blog/page.tsx` — grid of blog post cards with title, excerpt, date, and reading time.

- [ ] **Step 2: Build blog detail page**

Create `app/blog/[slug]/page.tsx` — renders MDX content with proper typography styling. Use `next-mdx-remote` to render the markdown body.

- [ ] **Step 3: Add static export config**

Update `next.config.ts` (the TypeScript scaffold generates `.ts`, not `.mjs`; it starts
empty apart from a placeholder comment):

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,   // required: the default image optimizer needs a server runtime
  },
};

export default nextConfig;
```

- [ ] **Step 4: Build and verify static export**

```bash
bun run build
```

Fix any build errors. Verify all pages generate successfully.

- [ ] **Step 5: Test full site navigation**

Run `bunx serve out` to serve the static export locally. Click through every page: Home → Products → BPC-157 → Vendor Card → Protide Health → Lab Report → Compare → FAQ → Blog → About → Methodology. Verify all links work, all data renders, responsive layout works on mobile.

- [ ] **Step 6: Commit and push**

```bash
git add -A
git commit -m "feat: add blog, static export config, and final polish"
```

- [ ] **Step 7: Deploy to Vercel**

```bash
bunx vercel --prod
```

Or connect the GitHub repo to Vercel for automatic deploys.
