// Materials: in-material tone mapping and the atom/bond physical material with exact per-pixel contact shading.
// Ported verbatim from the B · Cinema prototype. Its review switches are gone, each keeping the path it takes
// when absent: `?tm` (neutral tone mapping, so the AgX / ACES alternatives are dropped), `?noao` (contact
// shading always on), `?nocoat` (clearcoat 1).
import * as THREE from "three";
import { N_EMIT, OW, type Molecule } from "./build";

/** Checked shader patch: a missing hook throws instead of silently rendering the old look. */
export const hook = (src: string, find: string, add: string, how: "after" | "before" | "replace" = "after") => {
  if (!src.includes(find)) throw new Error("shader hook missing: " + find);
  return src.replace(find, how === "after" ? find + "\n" + add : how === "before" ? add + "\n" + find : add);
};

export const TONE = `uniform float uExposure;
vec3 tmNeutral(vec3 color){const float StartCompression=0.8-0.04;const float Desaturation=0.15;
  float x=min(color.r,min(color.g,color.b));float offset=x<0.08?x-6.25*x*x:0.04;color-=offset;
  float peak=max(color.r,max(color.g,color.b));if(peak<StartCompression)return color;
  float d=1.-StartCompression;float newPeak=1.-d*d/(peak+d-StartCompression);color*=newPeak/peak;
  float g=1.-1./(Desaturation*(peak-newPeak)+1.);return mix(color,vec3(newPeak),g);}
vec3 toDisplay(vec3 c){c*=uExposure;
  return tmNeutral(c);
}`;

export type PatchTone = (sh: THREE.WebGLProgramParametersWithUniforms, alpha: string) => void;

export interface Materials {
  /** Live occluder positions (written by syncChain every frame) and the static neighbour lists. */
  occTex: THREE.DataTexture;
  nbrTex: THREE.DataTexture;
  U: Record<string, THREE.IUniform>;
  /** Tone-map inside the material (so MSAA resolves in display space) and write `alpha` as the glow mask. */
  patchTone: PatchTone;
  molMat: THREE.MeshPhysicalMaterial;
}

export function createMaterials(mol: Molecule, camera: THREE.Camera, key: THREE.DirectionalLight): Materials {
  const occTex = new THREE.DataTexture(mol.occData, OW, mol.occHeight, THREE.RGBAFormat, THREE.FloatType); occTex.minFilter = occTex.magFilter = THREE.NearestFilter;
  const nbrTex = new THREE.DataTexture(mol.nbrData, OW, mol.nbrData.length / 4 / OW, THREE.RGBAFormat, THREE.FloatType); nbrTex.minFilter = nbrTex.magFilter = THREE.NearestFilter; nbrTex.needsUpdate = true;

  const U: Record<string, THREE.IUniform> = {
    uExposure: { value: 1 }, tOcc: { value: occTex }, tNbr: { value: nbrTex }, uCamWorld: { value: camera.matrixWorld }, uNEmit: { value: new THREE.Vector3(N_EMIT.r, N_EMIT.g, N_EMIT.b) },
    uKey: { value: key.position.clone().normalize() }, uShK: { value: 5 }, uAO: { value: 1.25 }, uAODirect: { value: .55 },
  };
  const patchTone: PatchTone = (sh, alpha) => {
    Object.assign(sh.uniforms, U);
    sh.fragmentShader = hook(sh.fragmentShader, "#include <common>", TONE);
    sh.fragmentShader = hook(sh.fragmentShader, "#include <tonemapping_fragment>", "gl_FragColor.rgb=toDisplay(gl_FragColor.rgb);", "replace");
    sh.fragmentShader = hook(sh.fragmentShader, "#include <dithering_fragment>", "gl_FragColor.a=" + alpha + ";");
  };

  // atoms + bonds: one physical material, per-instance colour / roughness / clearcoat / emissive, exact contact shading
  const molMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 1, metalness: 0, clearcoat: 1, clearcoatRoughness: .045 });
  molMat.onBeforeCompile = sh => {
    // per instance: aLook = (emissive intensity, roughness, clearcoat, -), aId = item id into the neighbour texture
    sh.vertexShader = hook(sh.vertexShader, "#include <common>", "attribute vec4 aLook;attribute float aId;varying vec4 vLook;varying float vId;");
    sh.vertexShader = hook(sh.vertexShader, "#include <project_vertex>", "vLook=aLook;vId=aId;");
    patchTone(sh, "smoothstep(.12,.75,uNEmit.b*vLook.x)"); // alpha = glow mask: only the lit residues feed the bloom
    let f = sh.fragmentShader;
    f = hook(f, "#include <common>", `varying vec4 vLook;varying float vId;
uniform highp sampler2D tOcc,tNbr;uniform mat4 uCamWorld;uniform vec3 uKey,uNEmit;uniform float uShK,uAO,uAODirect;
// sphere ambient occlusion, exact incl. horizon clipping (Quilez)
float cOcc(vec3 p,vec3 n,vec4 s){vec3 di=s.xyz-p;float l=length(di);float nl=dot(n,di)/l;float h=max(l/s.w,1.001);float hn=h*nl;
  if(hn<=-1.)return 0.;                                    // wholly below the horizon
  float h2=h*h;if(hn>=1.||h>8.)return max(0.,nl)/h2;        // wholly above (or far): exact closed form
  float k2=1.-hn*hn;float a=clamp(-nl*sqrt((h2-1.)/max(1.-nl*nl,1e-4)),-1.,1.);
  return clamp(((nl*acos(a)-sqrt(k2*(h2-1.)))/h2+atan(sqrt(k2/(h2-1.))))/3.14159265,0.,1.);}
// soft shadow of a sphere toward the key light (penumbra from the angular gap)
float cShd(vec3 ro,vec3 rd,vec4 s){vec3 oc=ro-s.xyz;float b=dot(oc,rd);float c=dot(oc,oc)-s.w*s.w;float h=b*b-c;
  float d=sqrt(max(0.,s.w*s.w-h))-s.w;float t=-b-sqrt(max(h,0.));return t<0.?1.:smoothstep(0.,1.,uShK*d/t);}
void cAcc(float id,vec3 p,vec3 n,inout float ao,inout float sh){if(id<0.)return;int ii=int(id+.5);vec4 s=texelFetch(tOcc,ivec2(ii&63,ii>>6),0);
  ao*=1.-cOcc(p,n,s);sh*=cShd(p,uKey,s);}`);
    f = hook(f, "vec3 totalEmissiveRadiance = emissive;", "vec3 totalEmissiveRadiance = uNEmit*vLook.x;", "replace");
    f = hook(f, "#include <roughnessmap_fragment>", "roughnessFactor=vLook.y;");
    f = hook(f, "#include <lights_physical_fragment>", hook(THREE.ShaderChunk.lights_physical_fragment, "material.clearcoat = clearcoat;", "material.clearcoat = clearcoat*vLook.z;", "replace"), "replace");
    f = hook(f, "#include <normal_fragment_maps>", `float cAO=1.,cKey=1.;
{vec3 cN=normalize((vec4(normal,0.)*viewMatrix).xyz),cP=(uCamWorld*vec4(-vViewPosition,1.)).xyz;int base=int(vId+.5)*4;
 for(int q=0;q<4;q++){int t=base+q;vec4 ids=texelFetch(tNbr,ivec2(t&63,t>>6),0);if(ids.x<0.)break;
   cAcc(ids.x,cP,cN,cAO,cKey);cAcc(ids.y,cP,cN,cAO,cKey);cAcc(ids.z,cP,cN,cAO,cKey);cAcc(ids.w,cP,cN,cAO,cKey);}
 cAO=pow(cAO,uAO);}`);
    f = hook(f, "#include <lights_fragment_begin>", hook(THREE.ShaderChunk.lights_fragment_begin, "getDirectionalLightInfo( directionalLight, directLight );", "directLight.color*=cKey;"), "replace");
    f = hook(f, "#include <aomap_fragment>", `reflectedLight.indirectDiffuse*=cAO;
{float dNV=saturate(dot(geometryNormal,geometryViewDir));
 reflectedLight.indirectSpecular*=computeSpecularOcclusion(dNV,cAO,material.roughness);

#ifdef USE_CLEARCOAT
 clearcoatSpecularIndirect*=computeSpecularOcclusion(saturate(dot(geometryClearcoatNormal,geometryViewDir)),cAO,material.clearcoatRoughness);
#endif
}
reflectedLight.directDiffuse*=mix(1.,cAO,uAODirect);`, "replace");
    sh.fragmentShader = f;
  };

  return { occTex, nbrTex, U, patchTone, molMat };
}
