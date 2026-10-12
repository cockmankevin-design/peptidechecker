import { describe, expect, test } from "bun:test";
import * as THREE from "three";
import { buildMolecule } from "./build";
import { createMaterials, hook } from "./materials";

// onBeforeCompile receives the raw ShaderLib source (includes unresolved), so the hooks can be checked against
// three r169's real shaders without WebGL.
const shader = (id: "physical" | "standard") =>
  ({ vertexShader: THREE.ShaderLib[id].vertexShader, fragmentShader: THREE.ShaderLib[id].fragmentShader, uniforms: {} }) as unknown as THREE.WebGLProgramParametersWithUniforms;
const noRenderer = null as unknown as THREE.WebGLRenderer;

describe("hook", () => {
  test("throws when the hook is missing, instead of silently rendering the old look", () => {
    expect(() => hook("void main(){}", "#include <common>", "x")).toThrow("shader hook missing: #include <common>");
  });

  test("inserts after, before, or replaces", () => {
    expect(hook("a\nB\nc", "B", "x")).toBe("a\nB\nx\nc");
    expect(hook("a\nB\nc", "B", "x", "before")).toBe("a\nx\nB\nc");
    expect(hook("a\nB\nc", "B", "x", "replace")).toBe("a\nx\nc");
  });
});

describe("createMaterials", () => {
  const key = new THREE.DirectionalLight(0xdfe8ff, 2);
  key.position.set(6, 9, 8);
  const m = createMaterials(buildMolecule(), new THREE.PerspectiveCamera(), key);

  test("every molMat hook finds its target in three r169's physical shader", () => {
    const sh = shader("physical");
    m.molMat.onBeforeCompile(sh, noRenderer);
    expect(sh.vertexShader).toContain("vLook=aLook;vId=aId;");
    for (const piece of ["gl_FragColor.rgb=toDisplay(gl_FragColor.rgb);", "vec3 totalEmissiveRadiance = uNEmit*vLook.x;",
      "roughnessFactor=vLook.y;", "material.clearcoat = clearcoat*vLook.z;", "directLight.color*=cKey;",
      "cAcc(ids.x,cP,cN,cAO,cKey)", "reflectedLight.directDiffuse*=mix(1.,cAO,uAODirect);", "gl_FragColor.a=smoothstep(.12,.75,uNEmit.b*vLook.x);"]) {
      expect(sh.fragmentShader).toContain(piece);
    }
    expect(sh.fragmentShader).not.toContain("#include <tonemapping_fragment>");
    expect(Object.keys(sh.uniforms).sort()).toEqual(["tNbr", "tOcc", "uAO", "uAODirect", "uCamWorld", "uExposure", "uKey", "uNEmit", "uShK"]);
  });

  test("patchTone finds its targets in three r169's standard shader (the far molecule)", () => {
    const sh = shader("standard");
    m.patchTone(sh, "0.");
    expect(sh.fragmentShader).toContain("gl_FragColor.rgb=toDisplay(gl_FragColor.rgb);");
    expect(sh.fragmentShader).toContain("gl_FragColor.a=0.;");
  });

  test("uniforms carry the prototype's values", () => {
    expect(m.U.uKey.value.toArray()).toEqual(new THREE.Vector3(6, 9, 8).normalize().toArray());
    expect([m.U.uShK.value, m.U.uAO.value, m.U.uAODirect.value, m.U.uExposure.value]).toEqual([5, 1.25, .55, 1]);
    expect(m.molMat.clearcoat).toBe(1);
    expect(m.molMat.clearcoatRoughness).toBe(.045);
  });
});
