// Scene content, ported verbatim from the B · Cinema prototype: the background, the studio environment and lights,
// the instanced atoms/bonds with their LOD buckets, the far molecule, dust and light shafts.
// The prototype's `?hdri` (no runtime HDRI download), `?nopoint` (rim lights on), `?basic` / `?plainphys` /
// `?plainstd` (molMat) and `?hide` switches are gone, each keeping the path it takes when absent.
import * as THREE from "three";
import { EL, GREY, ROUGH, type Atom, type BondHalf, type Molecule, type Residue } from "./build";
import type { PatchTone } from "./materials";

/** Background: the deep navy radial, computed per pixel in float (a 512px canvas gradient stretched to full screen bands). */
export function addBackground(scene: THREE.Scene): THREE.Mesh {
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    depthTest: false, depthWrite: false,
    vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,1.,1.);}`,
    fragmentShader: `varying vec2 vUv;
  vec3 lin(vec3 c){return pow(c,vec3(2.2));}
  void main(){float t=clamp(length(vUv-vec2(.56,.53))/.76,0.,1.);
    vec3 c0=vec3(16.,36.,77.)/255.,c1=vec3(7.,16.,34.)/255.,c2=vec3(2.,4.,10.)/255.;
    vec3 c=mix(mix(c0,c1,smoothstep(0.,.45,t)),c2,smoothstep(.3,1.,t));
    gl_FragColor=vec4(lin(c),0.);}`,
  }));
  bg.frustumCulled = false; bg.renderOrder = -1; scene.add(bg);
  scene.fog = new THREE.FogExp2(0x040916, .028);
  return bg;
}

/**
 * Lighting: a studio built to match the palette (big key softbox on the key light's axis, cobalt rim strips behind),
 * so every glossy atom reflects real light shapes instead of a grey wash. Returns the environment render target and
 * the studio scene, which the caller disposes.
 */
export function studio(pmrem: THREE.PMREMGenerator): { env: THREE.WebGLRenderTarget; room: THREE.Scene } {
  const s = new THREE.Scene();
  s.add(new THREE.Mesh(new THREE.SphereGeometry(40, 48, 24), new THREE.MeshBasicMaterial({ color: 0x050b1a, side: THREE.BackSide })));
  const box = (w: number, h: number, col: number, k: number, x: number, y: number, z: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m);
  };
  box(15, 10, 0xffffff, 7, 12, 18, 16);      // key softbox, same axis as the key light (6,9,8)
  box(9, 13, 0xcfdcff, 1.4, -20, 4, 12);     // soft cool fill, left
  box(2.2, 26, 0x2f6bff, 7, -15, -2, -12);   // cobalt rim strip, back left (rim light side)
  box(2.2, 26, 0x7aa8ff, 4, 17, 3, -10);     // pale rim strip, back right
  box(30, 3, 0xbfd0ff, .8, 0, 24, -4);       // faint overhead edge
  return { env: pmrem.fromScene(s, 0), room: s };
}

/** Key light plus the cobalt and pale rim point lights. */
export function addLights(scene: THREE.Scene): THREE.DirectionalLight {
  const key = new THREE.DirectionalLight(0xdfe8ff, 2.0); key.position.set(6, 9, 8); scene.add(key);
  const rim = new THREE.PointLight(0x3a78ff, 90, 40, 1.6); rim.position.set(-8, -3, -6); scene.add(rim);
  const rim2 = new THREE.PointLight(0x7aa8ff, 40, 30, 1.6); rim2.position.set(10, 4, -5); scene.add(rim2);
  return key;
}

// Atoms are re-bucketed every frame into four sphere tessellations by on-screen radius, so triangles stay several pixels wide
// (sub-pixel triangles made the GPU shade each 2x2 pixel quad many times) and silhouettes stay within ~0.3 px of a true circle.
// Every bucket and the bonds are sorted near-to-far so hidden surfaces are rejected before shading.
export const LOD = [{ seg: 16, rpx: 10 }, { seg: 28, rpx: 36 }, { seg: 52, rpx: 120 }, { seg: 100, rpx: 1e9 }];

type Item = Atom | BondHalf;
interface Master { list: Item[]; id0: number; col: Float32Array; look: Float32Array }
interface Bucket {
  IM: THREE.InstancedMesh;
  col: THREE.InstancedBufferAttribute; look: THREE.InstancedBufferAttribute; id: THREE.InstancedBufferAttribute;
}

export interface ChainMeshes {
  atomB: Bucket[];
  bondB: Bucket;
  /** Atom count per LOD bucket after the last sync. */
  lodLists: number[][];
  /** Set one atom's emissive intensity. */
  setAtomEmit(k: number, v: number): void;
  /** Paint a residue matte grey (stop-4 break-apart) or back to its element colours. */
  setGrey(r: Residue, on: boolean): void;
  /** Push the chain's live transforms into the instanced meshes and the occluder texture. `H` is the drawing-buffer height in px. */
  syncChain(camera: THREE.PerspectiveCamera, H: number): void;
}

export function addChain(scene: THREE.Scene, mol: Molecule, molMat: THREE.Material, occTex: THREE.DataTexture): ChainMeshes {
  const { chain, atoms, halves, residues, occ, occData } = mol;
  const NA = atoms.length, NH = halves.length;
  const tmpC = new THREE.Color();
  function paint(D: Master, k: number, grey: boolean) {
    const x = D.list[k]; tmpC.set(grey ? GREY : EL[x.el].color); D.col[k * 3] = tmpC.r; D.col[k * 3 + 1] = tmpC.g; D.col[k * 3 + 2] = tmpC.b;
    D.look[k * 4] = grey ? 0 : x.emit; D.look[k * 4 + 1] = grey ? .7 : ROUGH[x.el]; D.look[k * 4 + 2] = grey ? 0 : 1;
  }
  const master = (list: Item[], id0: number) => {
    const n = list.length, D: Master = { list, id0, col: new Float32Array(n * 3), look: new Float32Array(n * 4) }; list.forEach((x, k) => paint(D, k, false)); return D;
  };
  const AD = master(atoms, 0), BD = master(halves, atoms.length);
  const bucket = (geo: THREE.BufferGeometry, max: number, order: number): Bucket => {
    const IM = new THREE.InstancedMesh(geo, molMat, max), I = (a: number) => new THREE.InstancedBufferAttribute(new Float32Array(max * a), a);
    const col = I(3); IM.instanceColor = col; const B: Bucket = { IM, col, look: I(4), id: I(1) }; geo.setAttribute("aLook", B.look); geo.setAttribute("aId", B.id);
    [IM.instanceMatrix, B.col, B.look, B.id].forEach(a => a.setUsage(THREE.DynamicDrawUsage));
    IM.frustumCulled = false; IM.renderOrder = order; IM.count = 0; scene.add(IM); return B;
  };
  const atomB = LOD.map((l, j) => bucket(new THREE.SphereGeometry(1, l.seg, Math.round(l.seg * .625)), NA, LOD.length - 1 - j)); // finest (nearest) first
  const bondB = bucket(new THREE.CylinderGeometry(1, 1, 1, 20, 1), NH, LOD.length);
  function fill(B: Bucket, D: Master, order: number[]) {
    const m = B.IM.instanceMatrix.array, c = B.col.array, l = B.look.array, d = B.id.array;
    order.forEach((k, j) => { m.set(D.list[k].o.matrixWorld.elements, j * 16); c.set(D.col.subarray(k * 3, k * 3 + 3), j * 3); l.set(D.look.subarray(k * 4, k * 4 + 4), j * 4); d[j] = D.id0 + k; });
    B.IM.count = order.length; [B.IM.instanceMatrix, B.col, B.look, B.id].forEach(a => a.needsUpdate = true);
  }
  const byRes = residues.map(() => ({ a: [] as number[], h: [] as number[] })); atoms.forEach((x, k) => byRes[x.res].a.push(k)); halves.forEach((x, k) => byRes[x.res].h.push(k));
  function setGrey(r: Residue, on: boolean) { if (r.grey === on) return; r.grey = on; byRes[r.i].a.forEach(k => paint(AD, k, on)); byRes[r.i].h.forEach(k => paint(BD, k, on)); }
  const aDist = new Float32Array(NA), hDist = new Float32Array(NH), aIdx = [...Array(NA).keys()], hIdx = [...Array(NH).keys()], lodLists: number[][] = LOD.map(() => []);
  function syncChain(camera: THREE.PerspectiveCamera, H: number) {
    chain.updateMatrixWorld(true); const cp = camera.position, pxU = H / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    for (let k = 0; k < NA; k++) { const e = atoms[k].o.matrixWorld.elements; aDist[k] = Math.hypot(e[12] - cp.x, e[13] - cp.y, e[14] - cp.z); }
    for (let k = 0; k < NH; k++) { const e = halves[k].o.matrixWorld.elements; hDist[k] = Math.hypot(e[12] - cp.x, e[13] - cp.y, e[14] - cp.z); }
    aIdx.sort((a, b) => aDist[a] - aDist[b]); hIdx.sort((a, b) => hDist[a] - hDist[b]);
    lodLists.forEach(l => l.length = 0);
    for (const k of aIdx) { const rpx = atoms[k].r * pxU / Math.max(aDist[k], .01); let j = 0; while (rpx > LOD[j].rpx) j++; lodLists[j].push(k); }
    atomB.forEach((B, j) => fill(B, AD, lodLists[j])); fill(bondB, BD, hIdx);
    for (let k = 0; k < occ.length; k++) { const e = occ[k].o.matrixWorld.elements; occData[k * 4] = e[12]; occData[k * 4 + 1] = e[13]; occData[k * 4 + 2] = e[14]; occData[k * 4 + 3] = occ[k].r; }
    occTex.needsUpdate = true;
  }
  return { atomB, bondB, lodLists, setAtomEmit: (k, v) => { AD.look[k * 4] = v; }, setGrey, syncChain };
}

/** Depth: a second molecule far behind. Kept sharp (no blur) but sunk into the atmosphere so it reads as distance. */
export function addFarMolecule(scene: THREE.Scene, patchTone: PatchTone): THREE.InstancedMesh {
  const n = 240, mat = new THREE.MeshStandardMaterial({ color: 0x2a4fa8, roughness: .4, emissive: 0x0b2466, emissiveIntensity: .45 });
  mat.onBeforeCompile = sh => patchTone(sh, "0.");
  const im = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 16, 10), mat, n); // ~10-18 px on screen: 16 segments is sub-pixel exact
  const m = new THREE.Matrix4();
  for (let k = 0; k < n; k++) { const a = k * .62, x = (k / n - .5) * 70; m.compose(new THREE.Vector3(x, Math.sin(a) * 2.2 + 6, Math.cos(a) * 2.2 - 26), new THREE.Quaternion(), new THREE.Vector3(.38, .38, .38)); im.setMatrixAt(k, m); }
  im.rotation.z = -.12; scene.add(im);
  return im;
}

// Additive into colour, leaving the glow mask in alpha untouched.
const keepAlpha = { blending: THREE.CustomBlending, blendSrc: THREE.SrcAlphaFactor, blendDst: THREE.OneFactor, blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor };

/** Dust: fine, crisp motes that fade near the lens. `px` is the pixel ratio. */
export function addDust(scene: THREE.Scene, small: boolean, px: number): { points: THREE.Points; dustM: THREE.ShaderMaterial } {
  const dustCount = small ? 500 : 1100, dp = new Float32Array(dustCount * 3), ds = new Float32Array(dustCount);
  for (let k = 0; k < dustCount; k++) { dp[k * 3] = (Math.random() - .5) * 70; dp[k * 3 + 1] = (Math.random() - .5) * 40; dp[k * 3 + 2] = (Math.random() - .5) * 50 - 4; ds[k] = Math.random(); }
  const dustG = new THREE.BufferGeometry(); dustG.setAttribute("position", new THREE.BufferAttribute(dp, 3)); dustG.setAttribute("seed", new THREE.BufferAttribute(ds, 1));
  const dustM = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, ...keepAlpha, uniforms: { t: { value: 0 }, px: { value: px } },
    vertexShader: `attribute float seed;uniform float t;uniform float px;varying float a;void main(){vec3 p=position;p.y+=sin(t*.2+seed*30.)*.6;p.x+=cos(t*.15+seed*20.)*.4;
    vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;float d=-mv.z;gl_PointSize=clamp(px*(1.2+seed*2.2)*(14./d),px*1.2,px*3.2);
    a=(.25+.6*seed)*smoothstep(60.,10.,d)*smoothstep(2.5,7.,d);}`,
    fragmentShader: `varying float a;void main(){float r=length(gl_PointCoord-.5)*2.;float s=1.-smoothstep(.5,1.,r);gl_FragColor=vec4(.6,.75,1.,s*a*.5);}`,
  });
  const points = new THREE.Points(dustG, dustM); scene.add(points);
  return { points, dustM };
}

/** Soft light shafts. Their opacity flickers in the engine's frame loop (not under reduced motion). */
export function addShafts(scene: THREE.Scene): { shafts: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[]; shaftTex: THREE.CanvasTexture } {
  const shaftTex = (() => {
    const c = document.createElement("canvas"); c.width = 64; c.height = 512; const x = c.getContext("2d")!; const g = x.createLinearGradient(0, 0, 64, 0);
    g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(.5, "rgba(120,170,255,1)"); g.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = g; x.fillRect(0, 0, 64, 512);
    const v = x.createLinearGradient(0, 0, 0, 512); v.addColorStop(0, "rgba(0,0,0,1)"); v.addColorStop(.3, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,1)"); x.globalCompositeOperation = "destination-out"; x.fillStyle = v; x.fillRect(0, 0, 64, 512);
    return new THREE.CanvasTexture(c);
  })();
  const shafts: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[] = [];
  for (let k = 0; k < 5; k++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(6 + k * 2, 60), new THREE.MeshBasicMaterial({ map: shaftTex, transparent: true, opacity: .05 + k * .01, ...keepAlpha, depthWrite: false }));
    m.position.set(-18 + k * 10, 6, -22 - k * 3); m.rotation.z = .42; scene.add(m); shafts.push(m);
  }
  return { shafts, shaftTex };
}

/** Free every geometry, material and material map under `root` (instance buffers included). */
export function disposeTree(root: THREE.Object3D) {
  root.traverse(o => {
    const m = o as THREE.Mesh;
    if (!m.isMesh && !(o as THREE.Points).isPoints) return;
    m.geometry.dispose();
    for (const mat of Array.isArray(m.material) ? m.material : [m.material]) {
      (mat as THREE.MeshBasicMaterial).map?.dispose();
      mat.dispose();
    }
    if ((o as THREE.InstancedMesh).isInstancedMesh) (o as THREE.InstancedMesh).dispose();
  });
}
