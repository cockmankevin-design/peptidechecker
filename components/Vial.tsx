/* The hero's peptide vial, drawn rather than photographed.

   Deliberately vector and unbranded: a rendered bottle would need a label, and a label needs
   a name, a concentration and a lot number - all of which would be invented. A drawn vial
   carries the visual weight without asserting anything about a real product. It also animates
   on the compositor and adds no image weight to the page. */

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
    <div className={`relative ${className}`} aria-hidden="true">
      {/* pooled light under the vial, pulsing out of step with the float */}
      <div className="pc-glow absolute left-1/2 bottom-[12%] -translate-x-1/2 w-[70%] h-[22%] rounded-[100%] bg-brand-accent/30 blur-3xl" />

      {MOTES.map((m, i) => (
        <span
          key={i}
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

      <div className="pc-sway">
        <svg
          viewBox="0 0 220 380"
          className="pc-float w-full h-auto drop-shadow-[0_25px_60px_rgba(41,197,246,0.18)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="pc-glass" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.20" />
              <stop offset="28%" stopColor="#ffffff" stopOpacity="0.05" />
              <stop offset="72%" stopColor="#ffffff" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.22" />
            </linearGradient>
            <linearGradient id="pc-cap" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2b3038" />
              <stop offset="22%" stopColor="#8b95a5" />
              <stop offset="52%" stopColor="#3a4049" />
              <stop offset="78%" stopColor="#767f8d" />
              <stop offset="100%" stopColor="#22262c" />
            </linearGradient>
            <linearGradient id="pc-powder" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.92" />
              <stop offset="100%" stopColor="#c8d2de" stopOpacity="0.75" />
            </linearGradient>
            <linearGradient id="pc-label" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f7f9fb" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#f7f9fb" stopOpacity="0.04" />
            </linearGradient>
          </defs>

          {/* body */}
          <rect x="42" y="78" width="136" height="268" rx="26" fill="url(#pc-glass)" />
          <rect
            x="42"
            y="78"
            width="136"
            height="268"
            rx="26"
            stroke="#ffffff"
            strokeOpacity="0.28"
            strokeWidth="1.5"
          />

          {/* lyophilised powder settled in the base */}
          <path
            d="M52 300c22-16 40-24 58-24s36 8 58 24v20a26 26 0 0 1-26 26H78a26 26 0 0 1-26-26z"
            fill="url(#pc-powder)"
          />

          {/* label band, intentionally blank - no product name, no concentration */}
          <rect x="42" y="176" width="136" height="86" fill="url(#pc-label)" />
          <line x1="42" y1="176" x2="178" y2="176" stroke="#29c5f6" strokeOpacity="0.55" strokeWidth="2" />
          <line x1="42" y1="262" x2="178" y2="262" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="1" />

          {/* neck and crimp */}
          <rect x="78" y="48" width="64" height="34" rx="8" fill="url(#pc-glass)" />
          <rect x="78" y="48" width="64" height="34" rx="8" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="1.5" />

          {/* cap */}
          <rect x="70" y="14" width="80" height="46" rx="12" fill="url(#pc-cap)" />
          <rect x="70" y="30" width="80" height="4" fill="#ffffff" fillOpacity="0.14" />
          <rect x="70" y="42" width="80" height="3" fill="#000000" fillOpacity="0.22" />

          {/* specular highlight down the left wall */}
          <rect x="58" y="98" width="10" height="212" rx="5" fill="#ffffff" fillOpacity="0.16" />
          <rect x="152" y="120" width="5" height="160" rx="3" fill="#ffffff" fillOpacity="0.09" />
        </svg>
      </div>
    </div>
  );
}
