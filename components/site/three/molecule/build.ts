// The molecule: a real alpha-helix peptide backbone (N, CA, C, O, H + side chains), axis along X, and the
// contact-shading neighbour data. Ported verbatim from the B · Cinema prototype
// (docs/superpowers/specs/assets/2026-10-09-molecule-prototype-b.html). Needs THREE's math and Object3D only,
// no WebGL, so it runs under `bun test`.
import * as THREE from "three";

export type Element = "C" | "N" | "O" | "H";

export const S = .75, RISE = 1.5, R = 28, TURN = 2 * Math.PI / 3.6;
export const EL: Record<Element, { color: number; r: number }> = {
  C: { color: 0x3b414b, r: .34 }, N: { color: 0x2f6bff, r: .32 }, O: { color: 0xc8463c, r: .32 }, H: { color: 0xeef2f8, r: .2 },
};
export const ROUGH: Record<Element, number> = { C: .3, N: .2, O: .2, H: .22 };
export const N_EMIT = new THREE.Color(0x0a2a8a);
export const helixPt = (i: number, r: number, da: number, dz: number) => {
  const a = i * TURN + da;
  return new THREE.Vector3(((i * RISE + dz) - R * RISE / 2) * S, Math.sin(a) * r * S, Math.cos(a) * r * S);
};

/** Residues whose nitrogen glows at stop 3, and the stretch that turns grey and drifts apart at stop 4. */
export const LIT: readonly number[] = [6, 10, 14, 18], BROKEN: readonly number[] = [21, 22, 23, 24, 25, 26];
export const GREY = new THREE.Color(0x4a4f58);

/** Max neighbours per item (atom or bond half): four RGBA texels of ids. */
export const NB = 16;
/** Width of the occluder and neighbour textures. The shader addresses texels as (id & 63, id >> 6). */
export const OW = 64;

export interface Atom { o: THREE.Object3D; el: Element; r: number; res: number; emit: number }
export interface BondHalf {
  o: THREE.Object3D; el: Element; rad: number; res: number; g: THREE.Group;
  /** Atom this half is attached to, and the atom at the bond's other end. */
  end: number; far: number;
  endPos: THREE.Vector3; out: THREE.Vector3; P0: THREE.Vector3; P1: THREE.Vector3; emit: number;
}
export interface Residue {
  g: THREE.Group; nAtom: number; i: number; drift: THREE.Vector3; spin: number;
  glow: number; grey: boolean;
}
export interface Occluder { o: THREE.Object3D; r: number }

export interface Molecule {
  /** Transform graph only: atoms and bonds are drawn through InstancedMeshes that read its matrices. */
  chain: THREE.Group;
  residues: Residue[];
  atoms: Atom[];
  halves: BondHalf[];
  /** Every atom, then two spheres hugging the root of each bond half. */
  occ: Occluder[];
  /** Per item, up to NB occluder ids, padded with -1. */
  atomNbr: Float32Array<ArrayBuffer>[];
  bondNbr: Float32Array<ArrayBuffer>[];
  /** Live occluder positions + radius (RGBA float texels), rewritten every frame. */
  occData: Float32Array<ArrayBuffer>;
  occHeight: number;
  /** Static neighbour lists, 4 texels = 16 ids per item: atoms first, then bond halves. */
  nbrData: Float32Array<ArrayBuffer>;
}

export function buildMolecule(): Molecule {
  const chain = new THREE.Group();
  const residues: Residue[] = [];
  const atoms: Atom[] = [], halves: BondHalf[] = [], atomAt = new Map<THREE.Vector3, number>();
  let curRes = 0;
  function atom(el: Element, pos: THREE.Vector3, g: THREE.Group, scale = 1) {
    const o = new THREE.Object3D(); o.scale.setScalar(EL[el].r * scale); o.position.copy(pos); g.add(o);
    atomAt.set(pos, atoms.length); atoms.push({ o, el, r: EL[el].r * scale, res: curRes, emit: el === "N" ? .35 : 0 }); return atoms.length - 1;
  }
  function bond(a: THREE.Vector3, ea: Element, b: THREE.Vector3, eb: Element, g: THREE.Group, rad = .075, off: THREE.Vector3 | null = null) { // split-colour bond, half per atom
    const mid = a.clone().lerp(b, .5);
    const parts: [THREE.Vector3, THREE.Vector3, Element, THREE.Vector3, THREE.Vector3][] = [[a, mid, ea, a, b], [mid, b, eb, b, a]];
    parts.forEach(([p, q, e, end, far]) => {
      const d = new THREE.Vector3().subVectors(q, p), o = new THREE.Object3D();
      o.scale.set(rad, d.length(), rad); o.position.copy(p).addScaledVector(d, .5); if (off) o.position.add(off);
      o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()); g.add(o);
      const sh = off || new THREE.Vector3();
      halves.push({
        o, el: e, rad, res: curRes, g, end: atomAt.get(end)!, far: atomAt.get(far)!, endPos: end.clone().add(sh),
        out: new THREE.Vector3().subVectors(mid, end).normalize(), P0: p.clone().add(sh), P1: q.clone().add(sh), emit: e === "N" ? .35 : 0,
      });
    });
  }
  let prevC: THREE.Vector3 | null = null;
  for (let i = 0; i < R; i++) {
    curRes = i;
    const g = new THREE.Group(); chain.add(g);
    const N = helixPt(i, 1.55, -.45, -.5), CA = helixPt(i, 2.3, 0, 0), C = helixPt(i, 1.65, .5, .5);
    const radial = new THREE.Vector3(0, CA.y, CA.z).normalize();
    const O = C.clone().add(new THREE.Vector3(1.2 * S, 0, 0)).addScaledVector(new THREE.Vector3(0, C.y, C.z).normalize(), .35 * S);
    const H = N.clone().add(new THREE.Vector3(-.95 * S, 0, 0)).addScaledVector(new THREE.Vector3(0, N.y, N.z).normalize(), .2 * S);
    const CB = CA.clone().addScaledVector(radial, 1.5 * S).add(new THREE.Vector3(.25 * S, 0, 0));
    const HA = CA.clone().addScaledVector(radial, -.4 * S).add(new THREE.Vector3(-.6 * S, .0, 0)).addScaledVector(new THREE.Vector3(0, -CA.z, CA.y).normalize(), .7 * S);
    const nAtom = atom("N", N, g); atom("C", CA, g); atom("C", C, g); atom("O", O, g); atom("H", H, g); atom("C", CB, g); atom("H", HA, g);
    bond(N, "N", CA, "C", g); bond(CA, "C", C, "C", g); bond(N, "N", H, "H", g, .055); bond(CA, "C", CB, "C", g); bond(CA, "C", HA, "H", g, .05);
    // C=O double bond
    const perp = new THREE.Vector3(0, -C.z, C.y).normalize().multiplyScalar(.09);
    bond(C, "C", O, "O", g, .05, perp); bond(C, "C", O, "O", g, .05, perp.clone().negate());
    if (prevC) bond(prevC, "C", N, "N", g);
    // varied side chains so it reads as a real sequence
    const kind = [0, 1, 2, 1, 3, 0, 2, 1][i % 8], tan = new THREE.Vector3(0, -radial.z, radial.y);
    if (kind >= 1) {
      const CG = CB.clone().addScaledVector(radial, 1.3 * S).addScaledVector(tan, .6 * S); atom("C", CG, g); bond(CB, "C", CG, "C", g);
      if (kind === 2) { const OG = CG.clone().addScaledVector(radial, 1.1 * S).add(new THREE.Vector3(.5 * S, 0, 0)); atom("O", OG, g); bond(CG, "C", OG, "O", g); }
      if (kind === 3) {
        const NZ = CG.clone().addScaledVector(radial, 1.2 * S).addScaledVector(tan, -.5 * S); atom("N", NZ, g); bond(CG, "C", NZ, "N", g);
        const H2 = NZ.clone().addScaledVector(radial, .8 * S); atom("H", H2, g); bond(NZ, "N", H2, "H", g, .05);
      }
      const HB = CB.clone().addScaledVector(tan, -.9 * S); atom("H", HB, g); bond(CB, "C", HB, "H", g, .05);
    }
    prevC = C;
    residues.push({
      g, nAtom, i, drift: new THREE.Vector3((Math.random() - .5) * 2.4, (Math.random() - .4) * -2.2, (Math.random() - .5) * 2.4), spin: (Math.random() - .5) * 1.4,
      glow: 0, grey: false,
    });
  }

  // ---- contact shading data. Occluders = every atom + two spheres hugging the root of each bond. Their live world positions go
  // to a float texture each frame; each atom / bond half carries a fixed list of up to 16 neighbours that can shade it.
  const occ: Occluder[] = []; atoms.forEach(a => occ.push({ o: a.o, r: a.r }));
  const hug: number[][] = atoms.map(() => []);
  halves.forEach(h => [.5, 2.2].forEach(s => {
    const p = new THREE.Object3D(); p.position.copy(h.endPos).addScaledVector(h.out, atoms[h.end].r + s * h.rad); h.g.add(p);
    hug[h.end].push(occ.length); occ.push({ o: p, r: h.rad });
  }));
  chain.updateMatrixWorld(true);
  const occPos = occ.map(c => new THREE.Vector3().setFromMatrixPosition(c.o.matrixWorld));
  type Cand = { id: number; s: number };
  const pick = (L: Cand[]) => { L.sort((a, b) => b.s - a.s); const out = new Float32Array(NB).fill(-1); L.slice(0, NB).forEach((c, k) => out[k] = c.id); return out; };
  const atomNbr = atoms.map((a, i) => {
    const L: Cand[] = hug[i].map(id => ({ id, s: 1e3 }));
    atoms.forEach((b, j) => { if (j === i) return; const d = occPos[i].distanceTo(occPos[j]); if (d - a.r - b.r < .9) L.push({ id: j, s: (b.r / Math.max(d - a.r, .05)) ** 2 }); });
    return pick(L);
  });
  const segD = (p: THREE.Vector3, a: THREE.Vector3, b: THREE.Vector3) => {
    const ab = b.clone().sub(a), t = THREE.MathUtils.clamp(p.clone().sub(a).dot(ab) / ab.lengthSq(), 0, 1); return p.distanceTo(a.clone().addScaledVector(ab, t));
  };
  const bondNbr = halves.map(h => {
    const L: Cand[] = [{ id: h.end, s: 1e3 }, { id: h.far, s: 1e2 }];
    atoms.forEach((b, j) => { if (j === h.end || j === h.far) return; const d = segD(occPos[j], h.P0, h.P1); if (d - h.rad - b.r < .8) L.push({ id: j, s: (b.r / Math.max(d - h.rad, .05)) ** 2 }); });
    return pick(L);
  });
  const occHeight = Math.ceil(occ.length / OW), occData = new Float32Array(OW * occHeight * 4);
  // neighbour lists live in a static texture (4 texels = 16 ids per item; atoms first, then bond halves), so each vertex carries
  // one id instead of 16 (fat per-vertex outputs were the single biggest GPU cost on this class of hardware)
  const nItems = atoms.length + halves.length, nbrData = new Float32Array(OW * Math.ceil(nItems * 4 / OW) * 4);
  atomNbr.forEach((l, k) => nbrData.set(l, k * 16)); bondNbr.forEach((l, k) => nbrData.set(l, (atoms.length + k) * 16));

  return { chain, residues, atoms, halves, occ, atomNbr, bondNbr, occData, occHeight, nbrData };
}
