"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Menu, X } from "lucide-react";

import { EASE_OUT_QUINT } from "@/lib/motion";

/* Navigation.

   Two deliberate choices:

   - The nav is transparent at the top of the page and only grows a ground and
     a hairline once you scroll. At rest it does not compete with the hero; in
     motion it becomes a solid surface so content never runs under bare text.

   - The mobile menu is a full panel rather than a squeezed dropdown. The brief
     asks for intentional mobile layouts, and a six-item list crammed under a
     56px bar is the definition of a shrunk desktop design. */

const LINKS = [
  { href: "/vendors", label: "Registry" },
  { href: "/methodology", label: "Methodology" },
  { href: "/results", label: "Certificates" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    // passive: this listener must never block scrolling
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // A menu that stays open while the page scrolls behind it feels broken, and
  // an open panel must not leave the page scrollable underneath.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          scrolled || open
            ? "border-b border-line bg-bg/85 backdrop-blur-md"
            : "border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 w-full max-w-[1180px] items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5" aria-label="PeptideChecker home">
            <Mark />
            <span className="text-[15px] font-semibold tracking-tight text-text">
              PeptideChecker
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-md px-3 py-2 text-[14px] text-muted transition-colors hover:text-text"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/vendors"
              className="ml-3 rounded-lg border border-line-strong px-4 py-2 text-[14px] font-medium text-text transition-colors hover:border-accent/50 hover:text-accent"
            >
              Explore the registry
            </Link>
          </nav>

          <button
            type="button"
            className="-mr-2 rounded-md p-2 text-muted transition-colors hover:text-text md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            className="fixed inset-0 top-16 z-40 bg-bg md:hidden"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <nav className="flex flex-col px-5 pt-4" aria-label="Mobile">
              {LINKS.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={reduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 * i, duration: 0.3, ease: EASE_OUT_QUINT }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block border-b border-line py-4 text-[19px] text-text"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              <Link
                href="/vendors"
                onClick={() => setOpen(false)}
                className="mt-6 rounded-lg bg-accent px-5 py-3.5 text-center text-[15px] font-medium text-white"
              >
                Explore the registry
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* The mark: a document with a lot-line bound to it. It is the product in one
   glyph - evidence tied to a specific batch - rather than an abstract logo. */
function Mark() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2.5" y="1.5" width="11" height="15" rx="1.5" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.4" className="text-muted" />
      <path d="M5.5 6h5M5.5 9h5M5.5 12h3" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.3" strokeLinecap="round" className="text-muted" />
      <circle cx="14.5" cy="13.5" r="4" className="fill-bg" />
      {/* currentColor via the utility class, so the mark follows the palette
          rather than pinning a hex that a token change would leave behind. */}
      <path
        d="M12.4 13.6l1.5 1.5 2.8-3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-accent"
      />
    </svg>
  );
}
