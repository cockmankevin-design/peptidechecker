import { describe, expect, test } from "bun:test";
import { BROKEN, LIT, NB, OW, buildMolecule } from "./build";

// Measured by evaluating the prototype (docs/superpowers/specs/assets/2026-10-09-molecule-prototype-b.html) in Chromium
// on 2026-10-12 (Playwright, ANGLE D3D11, AMD Radeon): atoms = the sum of its `self.__q.lod` bucket counts (15 + 236),
// bond halves = the instance count of its bond draw, the one `drawElementsInstanced` call with the 20-segment
// cylinder's 240 indices (556 instances).
const PROTOTYPE_ATOMS = 251;
const PROTOTYPE_BOND_HALVES = 556;

const mol = buildMolecule();
const valid = (list: Float32Array) => [...list].filter(id => id >= 0);

describe("buildMolecule", () => {
  test("atom and bond-half counts equal the prototype's", () => {
    expect(mol.atoms.length).toBe(PROTOTYPE_ATOMS);
    expect(mol.halves.length).toBe(PROTOTYPE_BOND_HALVES);
    expect(mol.residues.length).toBe(28);
    // occluders: every atom plus two hugging spheres per bond half
    expect(mol.occ.length).toBe(PROTOTYPE_ATOMS + 2 * PROTOTYPE_BOND_HALVES);
  });

  test("every neighbour list holds at most 16 valid ids, packed first, each a real occluder", () => {
    expect(NB).toBe(16);
    for (const list of [...mol.atomNbr, ...mol.bondNbr]) {
      expect(list.length).toBe(NB);
      const ids = valid(list);
      expect(ids.length).toBeGreaterThan(0);
      expect(ids.length).toBeLessThanOrEqual(16);
      expect([...list.slice(ids.length)].every(id => id === -1)).toBe(true); // -1 padding only after the ids
      for (const id of ids) {
        expect(Number.isInteger(id)).toBe(true);
        expect(id).toBeGreaterThanOrEqual(0);
        expect(id).toBeLessThan(mol.occ.length);
      }
    }
  });

  test("each atom's bonded partner atoms appear in its list", () => {
    let pairs = 0;
    for (const h of mol.halves) {
      expect(valid(mol.atomNbr[h.end])).toContain(h.far);
      pairs++;
    }
    expect(pairs).toBe(PROTOTYPE_BOND_HALVES);
  });

  test("each bond half lists the two atoms it joins first", () => {
    mol.halves.forEach((h, k) => {
      expect(mol.bondNbr[k][0]).toBe(h.end);
      expect(mol.bondNbr[k][1]).toBe(h.far);
    });
  });

  test("the neighbour texture holds the lists at 16 ids per item, atoms first, then bond halves", () => {
    const items = mol.atoms.length + mol.halves.length;
    expect(mol.nbrData.length % (OW * 4)).toBe(0);
    expect(mol.nbrData.length).toBeGreaterThanOrEqual(items * 16);
    mol.atomNbr.forEach((l, k) => expect(mol.nbrData.subarray(k * 16, k * 16 + 16)).toEqual(l));
    mol.bondNbr.forEach((l, k) => {
      const at = (mol.atoms.length + k) * 16;
      expect(mol.nbrData.subarray(at, at + 16)).toEqual(l);
    });
    expect(mol.occData.length).toBe(OW * Math.ceil(mol.occ.length / OW) * 4);
  });

  test("LIT and BROKEN are exactly as given", () => {
    expect(LIT).toEqual([6, 10, 14, 18]);
    expect(BROKEN).toEqual([21, 22, 23, 24, 25, 26]);
  });
});
