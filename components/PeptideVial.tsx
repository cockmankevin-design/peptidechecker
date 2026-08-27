/* A labelled peptide vial, drawn rather than photographed.

   Vector on purpose: there is no licensed product photography for this site, and a generated
   render would still need a label. Drawing it keeps the artwork sharp at any size, adds no
   image weight, and lets the label say exactly what it should.

   What goes on the label is deliberately limited to the compound name, the vial size, and the
   research-use warning. Those are properties of the compound and of the product format, not
   claims about any company's goods. No vendor mark, no lot number, no purity figure - those
   are the things that would be fabricated.

   `uid` is required and must be unique per rendered instance. SVG gradient ids are global to
   the document, so two vials sharing an id would both paint with whichever definition parsed
   first, and the second vial would silently inherit the wrong fills. */

export type PeptideVialProps = {
  /** Compound name printed on the label, e.g. "BPC-157". */
  name: string;
  /** Vial size, e.g. "10 mg". Omitted from the label when absent. */
  dose?: string;
  /** Unique per instance - see the note above about gradient id collisions. */
  uid: string;
  className?: string;
};

export default function PeptideVial({ name, dose, uid, className = "" }: PeptideVialProps) {
  const glass = `pv-glass-${uid}`;
  const cap = `pv-cap-${uid}`;
  const powder = `pv-powder-${uid}`;
  const label = `pv-label-${uid}`;

  // Long names would overrun the label band; drop a step rather than clip.
  const nameSize = name.length > 11 ? 15 : name.length > 8 ? 18 : 22;

  return (
    <svg
      viewBox="0 0 220 380"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Illustration of a ${name} research vial`}
    >
      <defs>
        <linearGradient id={glass} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.20" />
          <stop offset="28%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="72%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.22" />
        </linearGradient>
        <linearGradient id={cap} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2b3038" />
          <stop offset="22%" stopColor="#8b95a5" />
          <stop offset="52%" stopColor="#3a4049" />
          <stop offset="78%" stopColor="#767f8d" />
          <stop offset="100%" stopColor="#22262c" />
        </linearGradient>
        <linearGradient id={powder} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.94" />
          <stop offset="100%" stopColor="#c8d2de" stopOpacity="0.78" />
        </linearGradient>
        <linearGradient id={label} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fdfefe" />
          <stop offset="100%" stopColor="#e8edf3" />
        </linearGradient>
      </defs>

      {/* body */}
      <rect x="42" y="78" width="136" height="268" rx="26" fill={`url(#${glass})`} />
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
        fill={`url(#${powder})`}
      />

      {/* label */}
      <rect x="42" y="168" width="136" height="104" fill={`url(#${label})`} />
      <rect x="42" y="168" width="136" height="5" fill="#29c5f6" />

      <text
        x="110"
        y={dose ? 206 : 214}
        textAnchor="middle"
        fontSize={nameSize}
        fontWeight="700"
        fill="#12161b"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        {name}
      </text>

      {dose && (
        <>
          <rect x="86" y="216" width="48" height="18" rx="4" fill="#12161b" fillOpacity="0.08" />
          <text
            x="110"
            y="229"
            textAnchor="middle"
            fontSize="11"
            fontWeight="600"
            fill="#3a4049"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {dose}
          </text>
        </>
      )}

      <text
        x="110"
        y="250"
        textAnchor="middle"
        fontSize="7.5"
        fill="#5a6472"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        For research use only.
      </text>
      <text
        x="110"
        y="261"
        textAnchor="middle"
        fontSize="7.5"
        fill="#5a6472"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        Not for human consumption.
      </text>

      {/* neck and crimp */}
      <rect x="78" y="48" width="64" height="34" rx="8" fill={`url(#${glass})`} />
      <rect x="78" y="48" width="64" height="34" rx="8" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="1.5" />

      {/* cap */}
      <rect x="70" y="14" width="80" height="46" rx="12" fill={`url(#${cap})`} />
      <rect x="70" y="30" width="80" height="4" fill="#ffffff" fillOpacity="0.14" />
      <rect x="70" y="42" width="80" height="3" fill="#000000" fillOpacity="0.22" />

      {/* specular highlights */}
      <rect x="58" y="98" width="10" height="212" rx="5" fill="#ffffff" fillOpacity="0.14" />
      <rect x="152" y="120" width="5" height="160" rx="3" fill="#ffffff" fillOpacity="0.08" />
    </svg>
  );
}

/* Standard research vial sizes, used only as label artwork so the vials read as real product
   rather than blank glass. These are conventional presentation sizes for the compound, not a
   claim about what any listed vendor ships. */
export const VIAL_DOSE: Record<string, string> = {
  "bpc-157": "10 mg",
  "tb-500": "10 mg",
  "mots-c": "10 mg",
  semaglutide: "5 mg",
};
