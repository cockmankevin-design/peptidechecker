// Image pipeline, ported verbatim from the B · Cinema prototype:
// scene -> 4x MSAA sRGB8 target (already tone-mapped, so edges resolve in display space)
// -> when settled, N jittered renders averaged in a float target (supersampling) -> glow-only bloom -> vignette + 1-LSB dither.
// The prototype's `?rt` / `?msaa` switches are gone (4x MSAA, sRGB8) and so is `?nobloom` (bloom always on).
import * as THREE from "three";
import { FullScreenQuad } from "three/examples/jsm/postprocessing/Pass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

const VS = `varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;

// UnrealBloomPass's blur directions are static fields its type declarations leave out.
const BLUR = UnrealBloomPass as unknown as { BlurDirectionX: THREE.Vector2; BlurDirectionY: THREE.Vector2 };

/** Bloom fed only by the glow mask in the scene's alpha (plus a faint share of near-white speculars). */
export class GlowBloom extends UnrealBloomPass {
  private readonly stockHighPass: THREE.ShaderMaterial;
  constructor(w: number, h: number) {
    super(new THREE.Vector2(w, h), .5, .35, 0);
    this.stockHighPass = this.materialHighPassFilter;
    this.materialHighPassFilter = new THREE.ShaderMaterial({
      uniforms: { tDiffuse: { value: null }, uSpec: { value: .92 } }, vertexShader: VS,
      fragmentShader: `uniform sampler2D tDiffuse;uniform float uSpec;varying vec2 vUv;
      void main(){vec4 c=texture2D(tDiffuse,vUv);float l=dot(c.rgb,vec3(.2126,.7152,.0722));gl_FragColor=vec4(c.rgb*max(c.a,.2*smoothstep(uSpec,1.,l)),1.);}`,
    });
  }
  /** UnrealBloomPass.render minus its blend-back; returns the bloom texture for the final composite. */
  renderFrom(renderer: THREE.WebGLRenderer, tex: THREE.Texture): THREE.Texture {
    renderer.setClearColor(this.clearColor, 0);
    this.materialHighPassFilter.uniforms.tDiffuse.value = tex; this.fsQuad.material = this.materialHighPassFilter;
    renderer.setRenderTarget(this.renderTargetBright); renderer.clear(); this.fsQuad.render(renderer);
    let input = this.renderTargetBright;
    for (let i = 0; i < this.nMips; i++) {
      const m = this.separableBlurMaterials[i]; this.fsQuad.material = m;
      m.uniforms.colorTexture.value = input.texture; m.uniforms.direction.value = BLUR.BlurDirectionX;
      renderer.setRenderTarget(this.renderTargetsHorizontal[i]); renderer.clear(); this.fsQuad.render(renderer);
      m.uniforms.colorTexture.value = this.renderTargetsHorizontal[i].texture; m.uniforms.direction.value = BLUR.BlurDirectionY;
      renderer.setRenderTarget(this.renderTargetsVertical[i]); renderer.clear(); this.fsQuad.render(renderer); input = this.renderTargetsVertical[i];
    }
    const u = this.compositeMaterial.uniforms; u.bloomStrength.value = this.strength; u.bloomRadius.value = this.radius; u.bloomTintColors.value = this.bloomTintColors;
    this.fsQuad.material = this.compositeMaterial; renderer.setRenderTarget(this.renderTargetsHorizontal[0]); renderer.clear(); this.fsQuad.render(renderer);
    return this.renderTargetsHorizontal[0].texture;
  }
  dispose() {
    super.dispose(); // leaves both high-pass materials alone
    this.materialHighPassFilter.dispose();
    this.stockHighPass.dispose();
  }
}

/** Jitter patterns in pixels (rotated grids); combined with the 4x MSAA pattern inside each render. */
export const JIT: Record<number, readonly (readonly [number, number])[]> = {
  1: [[0, 0]], 2: [[.25, .25], [-.25, -.25]], 4: [[-.125, -.375], [.375, -.125], [-.375, .125], [.125, .375]],
};

export interface Pipeline {
  bloom: GlowBloom;
  /** Render one displayed frame from `n` jittered scene renders (1, 2 or 4). */
  renderFrame(n: number): void;
  /** Resize every target to the drawing-buffer size in device pixels. */
  setSize(W: number, H: number): void;
  dispose(): void;
}

export function createPipeline(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera, W: number, H: number): Pipeline {
  const rtMS = new THREE.WebGLRenderTarget(W, H, { samples: 4, type: THREE.UnsignedByteType, colorSpace: THREE.SRGBColorSpace });
  const rtAcc = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, depthBuffer: false });
  const accMat = new THREE.ShaderMaterial({
    uniforms: { t: { value: null }, w: { value: 1 } }, vertexShader: VS, depthTest: false, depthWrite: false, transparent: true,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneFactor,
    fragmentShader: `uniform sampler2D t;uniform float w;varying vec2 vUv;void main(){gl_FragColor=texture2D(t,vUv)*w;}`,
  });
  const accQ = new FullScreenQuad(accMat);
  const bloom = new GlowBloom(W, H);
  const outMat = new THREE.ShaderMaterial({
    uniforms: { tScene: { value: null }, tBloom: { value: null } }, vertexShader: VS, depthTest: false, depthWrite: false,
    fragmentShader: `uniform sampler2D tScene,tBloom;varying vec2 vUv;
  vec3 oetf(vec3 c){return mix(c*12.92,1.055*pow(c,vec3(1./2.4))-.055,step(.0031308,c));}
  float hash(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
  void main(){vec3 c=texture2D(tScene,vUv).rgb+texture2D(tBloom,vUv).rgb;
    vec2 q=vUv-.5;c*=mix(1.,.38,smoothstep(.12,.6,dot(q,q)));            // vignette (v2 strength, applied in linear light)
    c=oetf(clamp(c,0.,1.));
    c+=(hash(gl_FragCoord.xy)+hash(gl_FragCoord.xy+71.3)-1.)/255.;       // static sub-LSB dither: kills banding, invisible as grain
    gl_FragColor=vec4(c,1.);}`,
  });
  const outQ = new FullScreenQuad(outMat);

  function renderFrame(n: number) {
    if (n === 1) { renderer.setRenderTarget(rtMS); renderer.clear(); renderer.render(scene, camera); }
    else {
      for (let s = 0; s < n; s++) {
        const j = JIT[n][s]; camera.setViewOffset(W, H, j[0], j[1], W, H);
        renderer.setRenderTarget(rtMS); renderer.clear(); renderer.render(scene, camera);
        accMat.uniforms.t.value = rtMS.texture; accMat.uniforms.w.value = 1 / n; renderer.setRenderTarget(rtAcc); if (s === 0) renderer.clear(); accQ.render(renderer);
      }
      camera.clearViewOffset();
    }
    const src = n === 1 ? rtMS.texture : rtAcc.texture;
    outMat.uniforms.tScene.value = src; outMat.uniforms.tBloom.value = bloom.renderFrom(renderer, src);
    renderer.setRenderTarget(null); outQ.render(renderer);
  }

  function setSize(w: number, h: number) {
    W = w; H = h;
    rtMS.setSize(W, H); rtAcc.setSize(W, H); bloom.setSize(W, H);
  }

  function dispose() {
    rtMS.dispose(); rtAcc.dispose(); bloom.dispose();
    accMat.dispose(); outMat.dispose(); accQ.dispose(); outQ.dispose();
  }

  return { bloom, renderFrame, setSize, dispose };
}
