import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";

// refined brand + desaturated jewel palette for the emissive nodes
const PALETTE = [
  0x5bc4d6, 0xd6b173, 0xc386a2, 0x73bcae, 0x8c9ac6, 0x9bc084, 0xa284be,
];

function fmtStars(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1e3) return Math.round(n / 1e3) + "K";
  return "" + n;
}

export default function Hero3D({
  stats,
  onEnter,
}: {
  stats: { repos: number; cats: number; stars: number };
  onEnter: () => void;
}) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = mount.clientWidth || window.innerWidth;
    let H = mount.clientHeight || Math.round(window.innerHeight * 0.88);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H);
    renderer.setClearColor(0x0a0a0c, 1);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0a0c, 7, 19); // (4) depth fading into black

    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 100);
    camera.position.set(0, 2.4, 9);

    scene.add(new THREE.AmbientLight(0x2a3240, 0.7));
    const key = new THREE.PointLight(0x5bc4d6, 0.6, 60);
    key.position.set(5, 7, 4);
    scene.add(key);

    // (1) emissive nodes -> real bloom via UnrealBloomPass
    const group = new THREE.Group();
    scene.add(group);
    const geo = new THREE.IcosahedronGeometry(0.16, 1);
    const nodes: THREE.Mesh[] = [];
    const mats: THREE.Material[] = [];
    for (let i = 0; i < 58; i++) {
      const c = PALETTE[i % PALETTE.length];
      const mat = new THREE.MeshStandardMaterial({
        color: c,
        emissive: c,
        emissiveIntensity: 2.3,
        roughness: 0.4,
        metalness: 0.1,
      });
      mats.push(mat);
      const m = new THREE.Mesh(geo, mat);
      const r = 1.6 + Math.random() * 3.4;
      const a = Math.random() * Math.PI * 2;
      m.position.set(
        Math.cos(a) * r,
        1.0 + Math.random() * 3.6,
        Math.sin(a) * r - 1,
      );
      m.scale.setScalar(0.5 + Math.random() * 1.5);
      m.userData = {
        sp: 0.2 + Math.random() * 0.5,
        ph: Math.random() * Math.PI * 2,
        baseY: m.position.y,
      };
      group.add(m);
      nodes.push(m);
    }
    // central bright anchor
    const hubMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xa6ecf7,
      emissiveIntensity: 3.1,
      roughness: 0.2,
    });
    const hub = new THREE.Mesh(new THREE.IcosahedronGeometry(0.44, 2), hubMat);
    hub.position.set(0, 1.95, -0.4);
    group.add(hub);

    // (2) floating particle field
    const pcount = reduced ? 320 : 950;
    const pgeo = new THREE.BufferGeometry();
    const pos = new Float32Array(pcount * 3);
    for (let i = 0; i < pcount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 24;
      pos[i * 3 + 1] = Math.random() * 9;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 24 - 2;
    }
    pgeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const pmat = new THREE.PointsMaterial({
      color: 0x9fc7d6,
      size: 0.045,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const points = new THREE.Points(pgeo, pmat);
    scene.add(points);

    // (3) reflector plane = wet floor mirror
    const mirror = new Reflector(new THREE.PlaneGeometry(70, 70), {
      clipBias: 0.003,
      textureWidth: Math.round(W * dpr),
      textureHeight: Math.round(H * dpr),
      color: 0x0b0d11,
    });
    mirror.rotation.x = -Math.PI / 2;
    scene.add(mirror);
    // wet sheen: darken the reflection a touch
    const tint = new THREE.Mesh(
      new THREE.PlaneGeometry(70, 70),
      new THREE.MeshBasicMaterial({
        color: 0x0a0a0c,
        transparent: true,
        opacity: 0.5,
      }),
    );
    tint.rotation.x = -Math.PI / 2;
    tint.position.y = 0.002;
    scene.add(tint);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.95, 0.62, 0.2);
    composer.addPass(bloom);

    let mx = 0,
      my = 0;
    const onMove = (e: PointerEvent) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const clock = new THREE.Clock();
    let raf = 0,
      running = true;
    const renderFrame = () => {
      const t = clock.getElapsedTime();
      group.rotation.y = t * 0.04;
      for (const m of nodes) {
        const u = m.userData as { sp: number; ph: number; baseY: number };
        m.position.y = u.baseY + Math.sin(t * u.sp + u.ph) * 0.18;
        m.rotation.x += 0.003;
        m.rotation.y += 0.004;
      }
      hub.rotation.y += 0.006;
      points.rotation.y = t * 0.015;
      camera.position.x += (mx * 1.8 - camera.position.x) * 0.04;
      camera.position.y += (2.4 - my * 0.8 - camera.position.y) * 0.04;
      camera.lookAt(0, 1.7, -0.4);
      composer.render();
    };
    const loop = () => {
      if (!running) return;
      renderFrame();
      raf = requestAnimationFrame(loop);
    };
    if (reduced) {
      camera.lookAt(0, 1.7, -0.4);
      composer.render();
    } else raf = requestAnimationFrame(loop);

    const onVis = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!reduced && !running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    const onResize = () => {
      W = mount.clientWidth;
      H = mount.clientHeight;
      renderer.setSize(W, H);
      composer.setSize(W, H);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      geo.dispose();
      pgeo.dispose();
      pmat.dispose();
      hubMat.dispose();
      mats.forEach((m) => m.dispose());
      bloom.dispose?.();
      composer.dispose?.();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount)
        mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <section className="relative h-[88vh] min-h-[560px] w-full overflow-hidden">
      <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-2.5 rounded-[3px] border border-white/12 bg-ink/30 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-coolgray backdrop-blur-sm">
          <span className="h-1 w-1 rounded-full bg-gold" />
          ქართული AI კოლექცია
        </div>
        <h1
          className="font-serif text-6xl font-semibold leading-[1.05] tracking-[-0.02em] text-champagne sm:text-8xl"
          style={{ textShadow: "0 2px 40px rgba(0,0,0,0.55)" }}
        >
          AI&nbsp;Pulse <span className="text-brandcyan">Georgia</span>
        </h1>
        <p className="mx-auto mt-5 max-w-lg font-mono text-[13px] text-body sm:text-sm">
          {stats.repos} რეპოზიტორია · {stats.cats} კატეგორია · ~
          {fmtStars(stats.stars)} ★
        </p>
        <button
          onClick={onEnter}
          className="mt-8 rounded-md bg-champagne px-7 py-3 text-[14px] font-semibold tracking-wide text-ink transition hover:bg-white"
        >
          კოლექციის ნახვა ↓
        </button>
      </div>
    </section>
  );
}
