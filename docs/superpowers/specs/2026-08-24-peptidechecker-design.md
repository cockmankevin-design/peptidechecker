# PeptideChecker — Design Spec

## What It Is

A curated peptide marketplace that connects buyers with independently verified vendors. Not another vendor selling product — a trust layer that vets suppliers so buyers never have to wonder if what they're injecting is real, safe, and fairly priced.

## The Problem

Men exploring peptide therapy can't trust what they're buying online. A friend of the founder got sick from a Russian-sourced peptide. Chinese products with fake lab tests flood the market. Existing review sites just copy vendor-provided COAs. No one independently verifies.

## How It's Different

- We don't sell peptides. We vet who does.
- Every listed vendor's products are independently tested by named third-party labs.
- Vendors that fail testing get removed. No pay-to-play.
- Display priority: Safety > Price > Shipping speed.

## Business Model

Curated marketplace with affiliate/referral revenue. Vendors fulfill orders directly to buyers. PeptideChecker earns commission on click-throughs to verified vendors only.

## Design Direction

Dark, premium aesthetic inspired by FloxAmino. Scientific, trustworthy feel. 3D product imagery where possible. "Independently Verified" trust badges prominent throughout.

## Site Structure

### Homepage
- Hero: bold value prop ("Peptides you can trust. Independently verified.")
- Trust badges: "Third-party tested", "Named labs", "No vendor funding"
- Featured products grid — sorted by safety score, showing price + shipping
- "How it works" section (We test > We verify > You buy safe)
- Email signup for new test results
- Latest blog posts

### Product Pages
Each peptide (BPC-157, TB-500, etc.) gets a page showing:
- What it is (short description)
- Verified vendors selling it, displayed as cards sorted by:
  1. Safety score (pass/fail + purity %)
  2. Price (lowest first among verified)
  3. Shipping speed
- Each vendor card shows: vendor name, price, purity %, shipping time, "View Lab Report" link, "Buy" affiliate button
- Only vendors scoring 7+ on trust get listed

### Vendor Profiles
One page per approved vendor showing:
- Trust score (1-10)
- All independent test results we've run on their products
- COA transparency rating
- Pricing comparison vs market average
- Shipping speed and reliability
- Link to their store (affiliate)

### Test Results / Lab Reports
- One page per test batch
- Raw data: vendor, peptide, lab used, HPLC purity %, mass spec confirmation, lot number, date
- Downloadable PDF of the actual lab report
- Pass/fail badge

### Comparison Table
- Sortable table of all vendors side-by-side
- Columns: Vendor, Trust Score, COA Status, Avg Price, Shipping Speed, Products Tested
- Default sort: Trust Score descending

### Blog / Education
- "How to read a COA"
- "Peptide scams to avoid in 2026"
- "What HPLC purity actually means"
- "How to reconstitute peptides safely"
- SEO-driven content for organic traffic

### Methodology Page
- Exactly how we test, who tests it, how we fund it
- Full transparency on independence
- Named labs (Janoshik, Colmaric, MZ Biolabs)

### FAQ
Accordion style, covering:
- Are peptides in powder form?
- Are peptides legal?
- How do I store peptides?
- How does PeptideChecker verify vendors?
- Do you sell peptides directly?
- What happens if a vendor fails testing?

### About
- Founder story (personal frustration with unsafe sources)
- Mission: make peptide sourcing safe and transparent
- Contact info

### Footer
- Menu links (Home, Shop, Blog, COAs, FAQ)
- Quick links (Login, Register, Contact, Privacy)
- Email/social

## Trust Score System

| Factor | Weight | What We Measure |
|--------|--------|-----------------|
| Purity verified | 40% | Independent HPLC + MS results match labeled content |
| COA transparency | 20% | Public COAs, named lab, batch-specific |
| Consistency | 20% | Repeat tests over time stay consistent |
| Pricing fairness | 10% | Price vs market average |
| Shipping reliability | 10% | Speed, packaging, cold chain |

Vendors below 7/10 are not listed. Period.

## Product Display Hierarchy

Every product listing sorts and displays in this order:
1. **Safety** — trust score and purity % (largest, most prominent)
2. **Price** — clear per-unit pricing (second prominence)
3. **Shipping** — estimated delivery time (third)

## Tech Stack

- **Framework:** Next.js 16.x (App Router, static export) — installed and run with **Bun**;
  this machine has no node/npm/npx. Brings Tailwind 4 (CSS `@theme`, no config file) and React 19.
- **Content:** MDX files for vendors, products, test results, blog
- **Styling:** Tailwind CSS (dark theme default)
- **Hosting:** Vercel (free tier)
- **Email list:** ConvertKit or Buttondown (free tier)
- **Analytics:** Plausible or Vercel Analytics
- **Domain:** PeptideChecker (working name)

## Content File Structure

```
content/
  vendors/
    protide-health.mdx
    limitless-life.mdx
    umbrella-labs.mdx
    ...
  products/
    bpc-157.mdx
    tb-500.mdx
    semaglutide.mdx
    mots-c.mdx
    glp-3.mdx
    ...
  tests/
    2026-08-bpc157-protide.mdx
    2026-08-bpc157-limitless.mdx
    ...
  blog/
    how-to-read-a-coa.mdx
    peptide-scams-2026.mdx
    ...
```

## MVP Milestones

1. **Week 1-2:** Site scaffold, homepage, product grid, vendor profiles (populated with research data from our competitive analysis)
2. **Week 2-3:** Order BPC-157 from 3-4 top vendors, send to Janoshik for testing
3. **Week 3-4:** Publish real test results on site, post to Reddit for validation
4. **Month 2:** Establish affiliate relationships with vendors that passed, activate revenue
5. **Month 3:** Expand testing to 10+ peptides, grow organic traffic via blog content

## What This Is NOT

- Not a vendor — we never touch or ship product
- Not medical advice — "for research purposes" disclaimer on every page
- Not vendor-funded — independence is the entire value prop
- Not a forum — that's Reddit's job
