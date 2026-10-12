// The molecule engine: the B · Cinema prototype's scene, pipeline, governor and camera journey behind a small API.
// It adds no window or document listeners and reads no globals (location, innerWidth, matchMedia): the host
// passes everything in through `opts` and the methods. Task 4 mounts it; nothing imports it yet.
import * as THREE from "three";
import { BROKEN, LIT, buildMolecule } from "./build";
import { Governor } from "./governor";
import { STOPS, cameraAt, stepProgress } from "./journey";
import { createMaterials } from "./materials";
import { createPipeline } from "./pipeline";
import { addBackground, addChain, addDust, addFarMolecule, addLights, addShafts, disposeTree, studio } from "./scene";

export type MoleculeMode = "journey" | "ambient";

export interface MoleculeEngine {
  setScrollTarget(f: number): void;          // 0..1, clamped
  setPointer(x: number, y: number): void;    // each -0.5..0.5 (same as the prototype's mouse vector)
  setMode(m: MoleculeMode): void;            // ambient = camera held at stop 1, no journey; rotation continues
  resize(width: number, height: number): void;
  start(): void; stop(): void;               // RAF loop control
  dispose(): void;                           // cancels RAF; frees every geometry, material, texture, render target and the renderer
  /**
   * fps: smoothed frame rate the governor sees. level: governor level, an index into LEVELS (0 = no supersampling,
   * 2 = 4x). pixelRatio: the current (possibly stepped-down) ratio. atoms / bonds: instanced atoms and bond halves.
   */
  stats(): { fps: number; level: number; pixelRatio: number; atoms: number; bonds: number };
}

export interface MoleculeEngineOptions {
  /** Phone-sized screen: 500 dust motes, no supersampling, pixel ratio capped at 1.5. */
  small: boolean;
  /**
   * prefers-reduced-motion: hold stop 1 whatever the scroll target or pointer, no chain rotation, dust motion or shaft
   * flicker. One settled, fully supersampled frame is rendered (again after a resize), then no more frames are requested.
   */
  reducedMotion: boolean;
  width: number;
  height: number;
  devicePixelRatio: number;
}

export function createMoleculeEngine(canvas: HTMLCanvasElement, opts: MoleculeEngineOptions): MoleculeEngine {
  const { small, reducedMotion: reduce } = opts;
  let width = opts.width, height = opts.height;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" }); // AA happens in the scene target
  let pr = Math.min(opts.devicePixelRatio, small ? 1.5 : 2);
  renderer.setPixelRatio(pr);
  renderer.setSize(width, height);
  renderer.autoClear = false; renderer.setClearColor(0x000000, 0);
  let W = Math.round(width * pr), H = Math.round(height * pr);

  // Built in the prototype's order.
  const scene = new THREE.Scene();
  addBackground(scene);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const { env, room } = studio(pmrem);
  scene.environment = env.texture;
  scene.environmentIntensity = 1;
  const key = addLights(scene);
  const camera = new THREE.PerspectiveCamera(36, width / height, .1, 300);
  const mol = buildMolecule();
  const { occTex, nbrTex, patchTone, molMat } = createMaterials(mol, camera, key);
  const chainMeshes = addChain(scene, mol, molMat, occTex);
  addFarMolecule(scene, patchTone);
  const { dustM } = addDust(scene, small, pr);
  const { shafts } = addShafts(scene);
  const pipeline = createPipeline(renderer, scene, camera, W, H);
  const gov = new Governor({ small, pixelRatio: pr, now: performance.now() });

  const clock = new THREE.Clock(), pose = cameraAt(0), shift = new THREE.Vector3(), look = new THREE.Vector3(), mouse = new THREE.Vector2();
  let target = 0, prog = 0, mode: MoleculeMode = "journey", raf = 0, running = false, disposed = false;

  function applySize() {
    renderer.setPixelRatio(pr); renderer.setSize(width, height); W = Math.round(width * pr); H = Math.round(height * pr);
    pipeline.setSize(W, H); dustM.uniforms.px.value = pr; camera.aspect = width / height; camera.updateProjectionMatrix();
  }

  function tick(now: number) {
    raf = 0;
    const t = clock.getElapsedTime();
    const goal = reduce || mode === "ambient" ? 0 : target;
    prog = stepProgress(prog, goal);
    const f = prog * (STOPS.length - 1);
    cameraAt(prog, pose);
    camera.position.set(...pose.pos).add(shift.set(mouse.x * 1.2, -mouse.y * .8, 0)); camera.lookAt(look.set(...pose.look));
    if (!reduce) mol.chain.rotation.x = t * .1;
    const w3 = Math.max(0, 1 - Math.abs(f - 2)), b4 = Math.max(0, 1 - Math.abs(f - 3) * 1.1);
    mol.residues.forEach(r => {
      r.glow = .35 + (LIT.includes(r.i) ? w3 * 4 : 0);
      if (BROKEN.includes(r.i)) { r.g.position.copy(r.drift).multiplyScalar(b4 * 1.7); r.g.rotation.z = b4 * r.spin * .5; chainMeshes.setGrey(r, b4 > .05); }
      chainMeshes.setAtomEmit(r.nAtom, r.grey ? 0 : r.glow);
    });
    chainMeshes.syncChain(camera, H);
    if (!reduce) { shafts.forEach((s, n) => s.material.opacity = (.045 + n * .01) * (.75 + .25 * Math.sin(t * .3 + n))); dustM.uniforms.t.value = t; }
    pipeline.bloom.strength = .5 + w3 * .55;
    const moving = Math.abs(goal - prog) > 1.5e-3;
    if (gov.govern(now, moving)) { pr = gov.pixelRatio; applySize(); }
    pipeline.renderFrame(gov.samples(moving));
    if (running && !(reduce && !moving)) raf = requestAnimationFrame(tick); // reduced motion: a settled frame is the final still
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  return {
    setScrollTarget(f) { target = Math.min(1, Math.max(0, f)); },
    setPointer(x, y) { if (!reduce) mouse.set(x, y); },
    setMode(m) { mode = m; },
    resize(w, h) {
      if (disposed) return;
      width = w; height = h; applySize();
      if (running && !raf) raf = requestAnimationFrame(tick); // a stopped still must be redrawn at the new size
    },
    start() {
      if (disposed) return;
      running = true;
      if (!raf) raf = requestAnimationFrame(tick);
    },
    stop,
    dispose() {
      if (disposed) return;
      disposed = true;
      stop();
      scene.environment = null;
      disposeTree(scene); disposeTree(room);
      occTex.dispose(); nbrTex.dispose(); env.dispose(); pmrem.dispose(); pipeline.dispose();
      renderer.dispose();
    },
    stats() {
      return { fps: gov.fps, level: gov.level, pixelRatio: pr, atoms: mol.atoms.length, bonds: mol.halves.length };
    },
  };
}
