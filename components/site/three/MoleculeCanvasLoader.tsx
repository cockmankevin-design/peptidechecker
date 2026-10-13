"use client";

import dynamic from "next/dynamic";

// ssr:false is only allowed from a client component; this keeps WebGL out of the static export's server render.
const MoleculeCanvas = dynamic(() => import("./MoleculeCanvas"), { ssr: false });

export default MoleculeCanvas;
