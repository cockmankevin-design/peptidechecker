"use client";

/* The hero's vial: a WebGL vial plus its ambient lighting and motes.

   Vial3D is loaded with ssr:false because three touches `window` at import time and this site
   is statically exported - importing it during the build would fail the export. Until it
   loads (and if it never does) Vial3D renders the drawn PeptideVial, so the hero always has
   something in it. */

import dynamic from "next/dynamic";

import PeptideVial from "./PeptideVial";

const Vial3D = dynamic(() => import("./Vial3D"), {
  ssr: false,
  loading: () => <PeptideVial name="BPC-157" dose="10 mg" uid="hero-loading" className="w-full h-auto" />,
});

const MOTES = [
  { left: "18%", bottom: "22%", size: 3, dur: "9s", delay: "0s", drift: "14px" },
  { left: "31%", bottom: "12%", size: 2, dur: "11s", delay: "1.4s", drift: "-10px" },
  { left: "44%", bottom: "30%", size: 4, dur: "8s", delay: "2.6s", drift: "8px" },
  { left: "58%", bottom: "16%", size: 2, dur: "12s", delay: "0.8s", drift: "-16px" },
  { left: "69%", bottom: "26%", size: 3, dur: "10s", delay: "3.2s", drift: "12px" },
  { left: "78%", bottom: "10%", size: 2, dur: "13s", delay: "2s", drift: "-6px" },
];

export default function Vial({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div
        className="pc-glow absolute left-1/2 bottom-[12%] -translate-x-1/2 w-[70%] h-[22%] rounded-[100%] bg-brand-accent/30 blur-3xl"
        aria-hidden="true"
      />

      {MOTES.map((m, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="pc-mote absolute rounded-full bg-brand-gold/70"
          style={
            {
              left: m.left,
              bottom: m.bottom,
              width: m.size,
              height: m.size,
              "--pc-mote-dur": m.dur,
              "--pc-mote-delay": m.delay,
              "--pc-mote-x": m.drift,
            } as React.CSSProperties
          }
        />
      ))}

      {/* Fixed aspect so the canvas has a height to measure before it paints - a percentage
          height inside an auto-height parent would resolve to zero and render nothing. */}
      <Vial3D name="BPC-157" dose="10 mg" className="w-full aspect-[3/4.4]" />
    </div>
  );
}
