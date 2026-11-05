"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * The Beyonn emblem as a real 3D object: two interlocking double rings, split by
 * the horizontal band, extruded with a soft bevel and lit with studio reflections.
 * It tilts toward the pointer and turns slowly as the page scrolls, and only
 * renders while it is actually moving.
 *
 * Kept light on purpose:
 * - three.js is loaded on demand after the intro, so it never touches first paint;
 * - it renders only while on screen and while the tab is visible;
 * - `fallback` (the flat emblem) shows without WebGL or until the scene is ready;
 * - with reduced motion it draws one still frame and stops.
 */
export function Emblem3D({ className, fallback, distance = 12.5 }: { className?: string; fallback?: ReactNode; distance?: number }) {
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "ready" | "failed">("idle");

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    // Hidden at this screen size (e.g. display:none on mobile): don't spend a WebGL context.
    if (el.getClientRects().length === 0) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let disposed = false;
    let teardown = () => {};

    (async () => {
      // A full page load opens with the ~2s intro; start the 3D after it so the
      // two never compete for the main thread. (Client navigations skip the intro.)
      if (!still && performance.now() < 3000) {
        await new Promise((r) => setTimeout(r, Math.max(0, 2100 - performance.now())));
        if (disposed) return;
      }
      const THREE = await import("three");
      const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
      if (disposed) return;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      } catch {
        setState("failed");
        return;
      }
      // Phones get a sharper ratio (their canvas is small); big desktop canvases stay light.
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 1024 ? 1.75 : 1.25));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.92;
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = env;

      const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
      camera.position.set(0, 0, distance);

      // ---- Emblem geometry -------------------------------------------------
      // Two circles side by side; each has an outer ring and a smaller inner
      // ring nudged toward the middle. A horizontal band cuts them in half.
      const R = 1.6; // outer ring radius
      const W = 0.22; // ring thickness
      const C = 0.78; // distance of each circle's centre from the middle
      const GAP = 0.34; // half-height of the horizontal band
      const shapes: import("three").Shape[] = [];
      const band = (cx: number, ro: number, ri: number) => {
        const ao = Math.asin(Math.min(GAP / ro, 0.99));
        const ai = Math.asin(Math.min(GAP / ri, 0.99));
        const s = new THREE.Shape();
        s.moveTo(cx + ro * Math.cos(ao), GAP);
        s.absarc(cx, 0, ro, ao, Math.PI - ao, false);
        s.lineTo(cx + ri * Math.cos(Math.PI - ai), GAP);
        s.absarc(cx, 0, ri, Math.PI - ai, ai, true);
        s.closePath();
        shapes.push(s);
      };
      for (const side of [-1, 1]) {
        band(side * C, R, R - W);
        band(side * (C - 0.42), R * 0.74, R * 0.74 - W * 0.85);
      }
      const geo = new THREE.ExtrudeGeometry(shapes, {
        depth: 0.26,
        bevelEnabled: true,
        bevelThickness: 0.07,
        bevelSize: 0.045,
        bevelSegments: 5,
        curveSegments: 72,
      });
      geo.translate(0, 0, -0.13);

      const material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#3f6fae"),
        metalness: 0.55,
        roughness: 0.3,
        clearcoat: 1,
        clearcoatRoughness: 0.12,
        sheen: 0.4,
        sheenColor: new THREE.Color("#72cfb7"),
      });

      const group = new THREE.Group();
      const top = new THREE.Mesh(geo, material);
      const bottom = new THREE.Mesh(geo, material);
      bottom.scale.y = -1; // mirror: the lower half of the emblem
      group.add(top, bottom);
      scene.add(group);

      // Studio-ish lighting: white key, mint rim from below, soft fill.
      const key = new THREE.DirectionalLight("#ffffff", 1.7);
      key.position.set(3, 4, 6);
      const rim = new THREE.PointLight("#72cfb7", 30, 20);
      rim.position.set(-4, -3, 3);
      const fill = new THREE.AmbientLight("#c5daf2", 0.35);
      scene.add(key, rim, fill);

      // ---- Sizing ----------------------------------------------------------
      const resize = () => {
        const { width, height } = el.getBoundingClientRect();
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(el);

      // ---- Motion ----------------------------------------------------------
      // ---- Motion (render on demand) ---------------------------------------
      // Frames are drawn only while something is changing: the entrance, the
      // pointer moving, or the page scrolling. Once the emblem settles the loop
      // stops, so an idle page costs nothing.
      const pointer = { x: 0, y: 0 };
      const start = performance.now();
      let raf = 0;
      let running = false;
      let inView = false;

      const frame = (now: number) => {
        const t = (now - start) / 1000;
        const scroll = Math.min(1, Math.max(0, window.scrollY / Math.max(1, el.offsetHeight)));
        const intro = Math.min(1, t / 1.4);
        const ease = 1 - Math.pow(1 - intro, 3);
        const ty = -0.35 + pointer.x * 0.22 + scroll * 0.9;
        const tx = 0.12 + pointer.y * 0.12 + scroll * 0.25;
        const dy = ty - group.rotation.y;
        const dx = tx - group.rotation.x;
        group.rotation.y += dy * 0.08;
        group.rotation.x += dx * 0.08;
        group.scale.setScalar(0.88 + 0.12 * ease);
        renderer.render(scene, camera);
        const moving = Math.abs(dy) + Math.abs(dx) > 0.0008 || intro < 1;
        if (moving && inView && !document.hidden) raf = requestAnimationFrame(frame);
        else running = false;
      };
      const kick = () => {
        if (running || still || !inView || document.hidden) return;
        running = true;
        raf = requestAnimationFrame(frame);
      };
      const pause = () => {
        running = false;
        cancelAnimationFrame(raf);
      };

      const onPointer = (e: PointerEvent) => {
        pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
        kick();
      };
      window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("scroll", kick, { passive: true });

      const io = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        if (inView) kick();
        else pause();
      });
      io.observe(el);
      const onVis = () => (document.hidden ? pause() : kick());
      document.addEventListener("visibilitychange", onVis);

      // Draw one frame right away so the canvas is never blank when the fallback fades out.
      group.rotation.set(0.12, -0.35, 0);
      group.scale.setScalar(still ? 1 : 0.88);
      renderer.render(scene, camera);
      setState("ready");

      teardown = () => {
        pause();
        io.disconnect();
        ro.disconnect();
        window.removeEventListener("pointermove", onPointer);
        window.removeEventListener("scroll", kick);
        document.removeEventListener("visibilitychange", onVis);
        geo.dispose();
        material.dispose();
        env.dispose();
        pmrem.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })().catch(() => setState("failed"));

    return () => {
      disposed = true;
      teardown();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the scene is built once per mount
  }, []);

  return (
    <div className={cn(!/\b(absolute|fixed|sticky)\b/.test(className ?? "") && "relative", className)}>
      {fallback && <div className={cn("absolute inset-0 transition-opacity duration-1000", state === "ready" ? "opacity-0" : "opacity-100")}>{fallback}</div>}
      <div ref={host} className={cn("absolute inset-0 transition-opacity duration-1000", state === "ready" ? "opacity-100" : "opacity-0")} aria-hidden />
    </div>
  );
}
