"use client";

/* A real WebGL peptide vial for the hero.

   Why WebGL and not a nicer SVG: what makes reference product renders read as expensive is
   refraction - the way the powder and the background bend and invert through the curved glass.
   That cannot be faked convincingly in flat vector art. MeshPhysicalMaterial's `transmission`
   does it properly.

   Falls back to the drawn PeptideVial - not to nothing - when WebGL is unavailable, when the
   viewer prefers reduced motion, or if three fails to load at all. The hero must never render
   an empty box.

   Loaded via next/dynamic with ssr:false by the caller: three touches `window` on import, and
   this site is statically exported, so it must never run during the build. */

import { useEffect, useRef, useState } from "react";
// Type-only: erased at compile time, so this does NOT pull three into the server build.
import type * as THREE from "three";

import PeptideVial from "./PeptideVial";

function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function Vial3D({
  name,
  dose,
  className = "",
}: {
  name: string;
  dose?: string;
  className?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  // Start in fallback and only switch once the scene is genuinely running. The reverse -
  // assuming success and hiding the fallback - would leave a blank hero whenever anything here
  // failed, which is the exact failure mode worth avoiding.
  const [live, setLive] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !webglAvailable() || !host.current) return;

    const el = host.current;
    let raf = 0;
    let disposed = false;
    // Everything that must be released on unmount, collected as it is created. A hot reload
    // without this leaks a GL context per edit, and browsers cap them at ~16.
    let cleanup: (() => void) | null = null;

    (async () => {
      const THREE = await import("three");
      if (disposed) return;

      const width = el.clientWidth || 320;
      const height = el.clientHeight || 460;

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(width, height);
      // Cap DPR at 2: past that the transmission pass costs a lot for no visible gain.
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
      camera.position.set(0, 0.1, 7.4);

      /* Transmission needs something to refract. Rather than fetch an HDRI (an external asset
         the CSP would block anyway), build a tiny gradient environment in a render target - it
         gives the glass edges something to bend and is a fraction of the weight. */
      const envScene = new THREE.Scene();
      const envGeo = new THREE.SphereGeometry(50, 32, 32);
      const envMat = new THREE.ShaderMaterial({
        side: THREE.BackSide,
        uniforms: {
          top: { value: new THREE.Color("#2b3947") },
          bottom: { value: new THREE.Color("#05070a") },
          accent: { value: new THREE.Color("#29c5f6") },
        },
        vertexShader: `
          varying vec3 vPos;
          void main() {
            vPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: `
          uniform vec3 top; uniform vec3 bottom; uniform vec3 accent;
          varying vec3 vPos;
          void main() {
            float h = normalize(vPos).y * 0.5 + 0.5;
            vec3 c = mix(bottom, top, smoothstep(0.0, 1.0, h));
            // a soft cyan band so the glass picks up a coloured highlight down one side
            c += accent * smoothstep(0.62, 0.98, normalize(vPos).x) * 0.55;
            gl_FragColor = vec4(c, 1.0);
          }`,
      });
      envScene.add(new THREE.Mesh(envGeo, envMat));

      const pmrem = new THREE.PMREMGenerator(renderer);
      const envRT = pmrem.fromScene(envScene, 0.04);
      scene.environment = envRT.texture;

      scene.add(new THREE.AmbientLight(0xffffff, 0.5));
      const key = new THREE.DirectionalLight(0xffffff, 2.4);
      key.position.set(4, 6, 5);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0x29c5f6, 3.0);
      rim.position.set(-5, 1, -3);
      scene.add(rim);

      const group = new THREE.Group();
      scene.add(group);

      const glass = new THREE.MeshPhysicalMaterial({
        transmission: 1,
        thickness: 0.65,
        roughness: 0.06,
        ior: 1.5,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        transparent: true,
        color: new THREE.Color("#eaf6ff"),
      });

      // body
      const body = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 3.3, 64, 1, false), glass);
      group.add(body);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(1, 0.94, 0.14, 64), glass);
      base.position.y = -1.72;
      group.add(base);

      // lyophilised powder - a slightly domed puck sitting in the bottom
      const powder = new THREE.Mesh(
        new THREE.CylinderGeometry(0.9, 0.92, 0.62, 48),
        new THREE.MeshStandardMaterial({ color: 0xf3f7fb, roughness: 0.95 })
      );
      powder.position.y = -1.3;
      group.add(powder);

      // neck, crimp, cap
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.62, 0.5, 48), glass);
      neck.position.y = 1.85;
      group.add(neck);

      const metal = new THREE.MeshStandardMaterial({ color: 0x9aa6b4, metalness: 1, roughness: 0.24 });
      const crimp = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.34, 48), metal);
      crimp.position.y = 2.16;
      group.add(crimp);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.3, 48), metal);
      cap.position.y = 2.44;
      group.add(cap);

      /* Label drawn to a canvas and wrapped on a cylinder. Same rule as the SVG vial: compound
         name, size, research-use warning. No vendor mark, no lot number, no purity figure. */
      const cvs = document.createElement("canvas");
      cvs.width = 1024;
      cvs.height = 512;
      const ctx = cvs.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#f7fafc";
        ctx.fillRect(0, 0, 1024, 512);
        ctx.fillStyle = "#29c5f6";
        ctx.fillRect(0, 0, 1024, 26);
        ctx.textAlign = "center";
        ctx.fillStyle = "#12161b";
        ctx.font = "bold 120px system-ui, sans-serif";
        ctx.fillText(name, 512, 210);
        if (dose) {
          ctx.fillStyle = "#3a4049";
          ctx.font = "600 62px system-ui, sans-serif";
          ctx.fillText(dose, 512, 300);
        }
        ctx.fillStyle = "#5a6472";
        ctx.font = "40px system-ui, sans-serif";
        ctx.fillText("For research use only.", 512, 380);
        ctx.fillText("Not for human consumption.", 512, 430);
      }
      const labelTex = new THREE.CanvasTexture(cvs);
      labelTex.colorSpace = THREE.SRGBColorSpace;
      const label = new THREE.Mesh(
        new THREE.CylinderGeometry(1.005, 1.005, 1.5, 64, 1, true),
        new THREE.MeshStandardMaterial({ map: labelTex, roughness: 0.65, side: THREE.DoubleSide })
      );
      label.position.y = -0.25;
      group.add(label);

      group.rotation.x = 0.06;

      let t = 0;
      const tick = () => {
        raf = requestAnimationFrame(tick);
        t += 0.0045;
        group.rotation.y = Math.sin(t) * 0.55;      // gentle turn, never a full spin
        group.position.y = Math.sin(t * 1.7) * 0.12; // slow float, out of step with the turn
        renderer.render(scene, camera);
      };
      tick();

      const onResize = () => {
        const w = el.clientWidth || width;
        const h = el.clientHeight || height;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      window.addEventListener("resize", onResize);

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", onResize);
        renderer.domElement.remove();
        renderer.dispose();
        envRT.dispose();
        pmrem.dispose();
        envGeo.dispose();
        envMat.dispose();
        labelTex.dispose();
        scene.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.geometry) m.geometry.dispose();
          const mat = m.material as THREE.Material | THREE.Material[] | undefined;
          if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
          else mat?.dispose();
        });
      };

      setLive(true);
    })().catch(() => {
      // Any failure at all leaves `live` false, so the drawn vial stays on screen.
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [name, dose]);

  return (
    <div className={`relative ${className}`}>
      <div ref={host} className="absolute inset-0" aria-hidden="true" />
      {!live && (
        <PeptideVial name={name} dose={dose} uid="hero3d-fallback" className="w-full h-auto" />
      )}
    </div>
  );
}
