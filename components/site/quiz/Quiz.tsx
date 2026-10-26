"use client";

import Link from "next/link";
import { useState } from "react";

import { QUESTIONS, matchMedicines, type Answers } from "@/lib/quiz";

/* Six questions, one per screen, then the matching FDA-approved medicines.
   Everything stays in component state: nothing is sent or stored. */

export default function Quiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const done = step >= QUESTIONS.length;

  if (done) return <Result answers={answers} onRestart={() => { setAnswers({}); setStep(0); }} />;

  const q = QUESTIONS[step];
  const pick = (value: string) => {
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    // Under 18 ends the quiz early: the result is educational only.
    setStep(q.id === "age" ? QUESTIONS.length : step + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.1em] text-dim">
        <span>
          Question {step + 1} of {QUESTIONS.length}
        </span>
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="rounded px-2 py-1 text-muted underline-offset-4 hover:text-text hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            Back
          </button>
        )}
      </div>
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
        <div className="h-full bg-accent transition-all duration-300" style={{ width: `${(step / QUESTIONS.length) * 100}%` }} />
      </div>

      <fieldset className="mt-8">
        <legend className="text-[1.4rem] font-semibold text-text">{q.prompt}</legend>
        <div className="mt-6 grid gap-3">
          {q.options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => pick(o.value)}
              aria-pressed={answers[q.id] === o.value}
              className="rounded-lg border border-line bg-surface px-5 py-4 text-left text-[15px] text-text transition-colors duration-200 hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent aria-pressed:border-accent"
            >
              {o.label}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

function Result({ answers, onRestart }: { answers: Answers; onRestart: () => void }) {
  const r = matchMedicines(answers);

  return (
    <div>
      <h2 className="text-[1.5rem] font-semibold text-text">
        {r.educationalOnly ? "Here's what's FDA-approved for that" : "FDA-approved options to discuss with a clinician"}
      </h2>

      {r.matches.length > 0 && (
        <ul className="mt-6 space-y-3">
          {r.matches.map(({ drug, reason }) => (
            <li key={drug.brand} className="rounded-lg border border-line bg-surface p-5">
              <p className="text-[17px] font-semibold text-text">
                {drug.brand} <span className="font-mono text-[12.5px] font-normal text-muted">({drug.generic})</span>
              </p>
              <p className="mt-1 text-[14px] leading-relaxed text-muted">{reason}</p>
              <p className="mt-2 font-mono text-[10.5px] text-dim">
                {drug.sponsor} · first approved {drug.originalApproval} · {drug.applicationNumber}
              </p>
            </li>
          ))}
        </ul>
      )}

      <ul className="mt-6 space-y-2">
        {r.notes.map((n) => (
          <li key={n} className="rounded-md border border-line bg-surface-2 px-4 py-3 font-mono text-[11.5px] leading-relaxed text-dim">
            {n}
          </li>
        ))}
      </ul>

      {r.showProviders && (
        <>
          <h3 className="mt-10 text-[1.2rem] font-semibold text-text">Licensed telehealth providers that prescribe them</h3>
          <ul className="mt-4 space-y-3">
            {r.providers.map((p) => (
              <li key={p.slug} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-line bg-surface p-5">
                <div className="min-w-0">
                  <p className="text-[16px] font-semibold text-text">{p.name}</p>
                  <p className="mt-1 font-mono text-[12px] text-accent">{p.fee}</p>
                </div>
                <a
                  href={p.url}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  className="inline-flex shrink-0 items-center rounded-lg bg-accent px-4 py-2.5 text-[14px] font-medium text-bg hover:bg-accent-hover"
                >
                  Visit {p.name}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-3 font-mono text-[10.5px] text-dim">Order is not a recommendation · direct links, nobody pays us for these clicks</p>
        </>
      )}

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/approved" className="rounded-lg border border-line px-4 py-2.5 text-[14px] text-text hover:border-accent">
          See all approved medicines
        </Link>
        <Link href="/cost" className="rounded-lg border border-line px-4 py-2.5 text-[14px] text-text hover:border-accent">
          Compare costs
        </Link>
        <button type="button" onClick={onRestart} className="rounded-lg px-4 py-2.5 text-[14px] text-muted hover:text-text">
          Start over
        </button>
      </div>
    </div>
  );
}
