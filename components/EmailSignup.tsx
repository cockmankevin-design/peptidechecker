"use client";

import { useState } from "react";
import PeptideVial from "./PeptideVial";

/* Signup posts to a third-party form endpoint.

   This site is a static export with no server runtime, so there is nowhere to run a handler
   that could hold an API key. The endpoint therefore has to be one that is safe to publish:
   a form URL, not an authenticated API. NEXT_PUBLIC_* values are inlined into the shipped
   JavaScript at build time and readable by anyone viewing source, so a provider token must
   never be put here.

   With no endpoint configured the form says so instead of accepting addresses it cannot
   store. That is the whole point: the failure mode this replaces was a preventDefault() that
   looked exactly like a successful subscription. */

const ENDPOINT = process.env.NEXT_PUBLIC_SIGNUP_ENDPOINT ?? "";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "ok" }
  | { kind: "error"; message: string };

export default function EmailSignup() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!ENDPOINT) return;

    const form = e.currentTarget;
    setStatus({ kind: "sending" });

    try {
      // Send the FormData itself, per Formspree's documented AJAX pattern - the browser
      // sets the multipart Content-Type, and any extra fields (the honeypot below) ride
      // along without needing to be listed here.
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });

      if (res.ok) {
        setStatus({ kind: "ok" });
        form.reset();
        return;
      }

      // A rejected submission and an unreachable server are different problems and the
      // person typing deserves to know which one happened.
      let detail = `The signup service rejected that (${res.status}).`;
      try {
        const body = await res.json();
        const first = body?.errors?.[0]?.message ?? body?.message;
        if (typeof first === "string" && first) detail = first;
      } catch {
        // no JSON body - keep the status-code message
      }
      setStatus({ kind: "error", message: detail });
    } catch {
      setStatus({
        kind: "error",
        message: "Couldn't reach the signup service. Your address was not stored.",
      });
    }
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#8f9bab] via-[#aab4c2] to-[#7e8a9a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#0a0c0f] tracking-tight leading-tight">
            Get new test results first
          </h2>
          <p className="mt-3 text-[#2b3038] max-w-md">
            Updates when we publish new independent lab results and vendor reviews. No vendor
            promotions.
          </p>

          <form className="mt-7 flex flex-col sm:flex-row gap-3 max-w-md" onSubmit={onSubmit}>
            <label htmlFor="signup-email" className="sr-only">
              Email address
            </label>
            <input
              id="signup-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              disabled={!ENDPOINT || status.kind === "sending"}
              placeholder="Email address"
              className="flex-1 bg-white/90 border border-white/60 rounded-full px-5 py-3 text-sm text-[#0a0c0f] placeholder:text-[#5a6472] focus:outline-none focus:ring-2 focus:ring-[#0a0c0f]/30 disabled:opacity-60"
            />
            {/* Formspree's honeypot: bots fill every field they find, so anything arriving
                with this one populated is discarded. Hidden from people and from screen
                readers, never focusable by tab. */}
            <input
              type="text"
              name="_gotcha"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
            />
            <button
              type="submit"
              disabled={!ENDPOINT || status.kind === "sending"}
              className="bg-[#0a0c0f] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#23282f] transition-colors text-sm disabled:opacity-60 disabled:hover:bg-[#0a0c0f]"
            >
              {status.kind === "sending" ? "Subscribing…" : "Subscribe"}
            </button>
          </form>

          {/* One live region for every outcome, so a screen reader announces the result
              whichever way it went. */}
          <p className="mt-3 text-sm font-medium max-w-md min-h-[1.25rem]" role="status" aria-live="polite">
            {!ENDPOINT && (
              <span className="text-[#0a0c0f]">
                Signups aren&apos;t connected yet &mdash; nothing typed here is stored or sent.
              </span>
            )}
            {ENDPOINT && status.kind === "ok" && (
              <span className="text-[#0a0c0f]">Subscribed. Check your inbox to confirm.</span>
            )}
            {ENDPOINT && status.kind === "error" && (
              <span className="text-[#7f1d1d]">{status.message}</span>
            )}
          </p>
        </div>

        <div className="hidden md:flex justify-center">
          <PeptideVial
            name="MOTS-C"
            dose="10 mg"
            uid="signup"
            className="pc-float w-[190px] h-auto drop-shadow-[0_25px_50px_rgba(10,12,15,0.35)]"
          />
        </div>
      </div>
    </section>
  );
}
