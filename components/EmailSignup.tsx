"use client";

import { useState } from "react";
import PeptideVial from "./PeptideVial";

export default function EmailSignup() {
  // There is no mailing-list backend wired up yet. The previous version called
  // preventDefault() and dropped the address, which looks exactly like a successful
  // signup to the person typing it. Saying so is the only honest option until a
  // provider is connected - a verification site cannot quietly discard submissions.
  const [submitted, setSubmitted] = useState(false);

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

          <form
            className="mt-7 flex flex-col sm:flex-row gap-3 max-w-md"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
          >
            <label htmlFor="signup-email" className="sr-only">
              Email address
            </label>
            <input
              id="signup-email"
              type="email"
              required
              placeholder="Email address"
              className="flex-1 bg-white/90 border border-white/60 rounded-full px-5 py-3 text-sm text-[#0a0c0f] placeholder:text-[#5a6472] focus:outline-none focus:ring-2 focus:ring-[#0a0c0f]/30"
            />
            <button
              type="submit"
              className="bg-[#0a0c0f] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#23282f] transition-colors text-sm"
            >
              Subscribe
            </button>
          </form>

          {submitted && (
            <p className="mt-3 text-sm text-[#0a0c0f] font-medium max-w-md" role="status">
              Signups aren&apos;t connected yet &mdash; your address was not stored or sent
              anywhere. Check back once the list is live.
            </p>
          )}
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
