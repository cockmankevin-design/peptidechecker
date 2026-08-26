"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import TrustScoreBadge from "./TrustScoreBadge";
import SampleDataBadge from "./SampleDataBadge";
import type { Vendor } from "@/lib/types";

type SortKey = "name" | "trustScore" | "coaStatus" | "avgPrice" | "shippingSpeed" | "productsCarried";
type SortDirection = "asc" | "desc";

const columns: { key: SortKey; label: string; numeric: boolean }[] = [
  { key: "name", label: "Vendor", numeric: false },
  { key: "trustScore", label: "Trust Score", numeric: true },
  { key: "coaStatus", label: "COA Status", numeric: false },
  { key: "avgPrice", label: "Avg Price", numeric: true },
  { key: "shippingSpeed", label: "Shipping", numeric: true },
  { key: "productsCarried", label: "Products Carried", numeric: true },
];

// Leading numeric value only, e.g. "$65/10mg" -> 65, "FedEx 2-Day" -> 2. Mirrors the
// parser in lib/content.ts's sortVendorOffers, duplicated here because Vendor's field
// names (avgPrice/shippingSpeed) don't match the { price, shippingDays } shape that
// helper's generic constraint expects.
function leadingNumber(value: string): number {
  return parseFloat(value.match(/[0-9]+(\.[0-9]+)?/)?.[0] ?? "") || 0;
}

// productsCarried can list a slug with no matching content/products/*.mdx file (e.g.
// limitless-life's "pt-141"). Only count slugs that actually resolve — the same guard
// app/vendors/[slug]/page.tsx applies for its "Products Carried (N)" — so this table's
// count can't disagree with that page's count for the same vendor.
function carriedCount(vendor: Vendor, validSlugs: Set<string>): number {
  return (vendor.productsCarried ?? []).filter((slug) => validSlugs.has(slug)).length;
}

function valueFor(vendor: Vendor, key: SortKey, validSlugs: Set<string>): string | number {
  switch (key) {
    case "name":
      return vendor.name;
    case "trustScore":
      return vendor.trustScore;
    case "coaStatus":
      return vendor.coaStatus;
    case "avgPrice":
      return leadingNumber(vendor.avgPrice);
    case "shippingSpeed":
      return leadingNumber(vendor.shippingSpeed);
    case "productsCarried":
      return carriedCount(vendor, validSlugs);
  }
}

export default function CompareTable({
  vendors,
  validProductSlugs,
}: {
  vendors: Vendor[];
  validProductSlugs: string[];
}) {
  // Default view honors the site's Safety > Price > Shipping hierarchy: trust score first.
  const [sortKey, setSortKey] = useState<SortKey>("trustScore");
  const [direction, setDirection] = useState<SortDirection>("desc");

  const validSlugs = useMemo(() => new Set(validProductSlugs), [validProductSlugs]);

  const sorted = useMemo(() => {
    const withValues = vendors.map((vendor) => ({ vendor, value: valueFor(vendor, sortKey, validSlugs) }));
    withValues.sort((a, b) => {
      if (typeof a.value === "number" && typeof b.value === "number") {
        return direction === "asc" ? a.value - b.value : b.value - a.value;
      }
      const cmp = String(a.value).localeCompare(String(b.value));
      return direction === "asc" ? cmp : -cmp;
    });
    return withValues.map((w) => w.vendor);
  }, [vendors, sortKey, direction, validSlugs]);

  function handleSort(key: SortKey, numeric: boolean) {
    if (key === sortKey) {
      setDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      // Numeric columns read best sorted high-to-low by default (top trust score, priciest
      // first); text columns read best A-Z.
      setDirection(numeric ? "desc" : "asc");
    }
  }

  const hasSampleData = vendors.some((v) => v.sampleData);

  return (
    <div className="overflow-x-auto rounded-xl border border-brand-border">
      <table className="w-full text-sm border-collapse min-w-[720px]">
        <thead>
          <tr className="bg-brand-surface-2 border-b border-brand-border">
            {columns.map((col) => (
              <th key={col.key} className="text-left px-4 py-3 whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => handleSort(col.key, col.numeric)}
                  aria-sort={sortKey === col.key ? (direction === "asc" ? "ascending" : "descending") : "none"}
                  className="flex items-center gap-1 font-semibold text-xs uppercase tracking-wider text-brand-text-secondary hover:text-brand-text transition-colors"
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span className="text-brand-accent" aria-hidden="true">
                      {direction === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((vendor) => {
            // Every field on a sample-data row is an invented figure, not just the ones
            // marked *. The trailing asterisk is a per-cell hint, but the table caption
            // below (and the page-level banner above it) is what actually states the rule —
            // unmarked cells here must never read as "verified" by omission.
            const mark = vendor.sampleData ? "*" : "";
            return (
              <tr
                key={vendor.slug}
                className="border-b border-brand-border last:border-0 hover:bg-brand-surface transition-colors"
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/vendors/${vendor.slug}`}
                      className="font-heading font-semibold text-brand-text-heading hover:text-brand-accent transition-colors"
                    >
                      {vendor.name}
                    </Link>
                    {vendor.sampleData && <SampleDataBadge className="shrink-0" />}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1.5">
                    <TrustScoreBadge score={vendor.trustScore} />
                    {vendor.sampleData && <span className="text-brand-warn text-xs">*</span>}
                  </div>
                </td>
                <td className="px-4 py-4 text-brand-text">
                  {vendor.coaStatus}
                  {mark}
                </td>
                <td className="px-4 py-4 text-brand-text font-medium whitespace-nowrap">
                  {vendor.avgPrice}
                  {mark}
                </td>
                <td className="px-4 py-4 text-brand-text whitespace-nowrap">
                  {vendor.shippingSpeed}
                  {mark}
                </td>
                <td className="px-4 py-4 text-brand-text">
                  {carriedCount(vendor, validSlugs)}
                  {mark}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {hasSampleData && (
        <p className="px-4 py-3 text-[11px] text-brand-warn border-t border-brand-border bg-brand-surface-2">
          Every figure above — including COA status, shipping, and product count, not just the numbers marked *
          — is placeholder sample data seeded during development. None of it represents a verified vendor record.
        </p>
      )}
    </div>
  );
}
