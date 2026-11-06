"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

type Tip = { text: string; cta?: { label: string; href: string } };

const GREETING: Tip = { text: "Hi, I'm your Beyonn guide. Scroll down and I'll walk you through it. Tap me anytime." };

/** What the guide says as each home section comes into view (keys match data-guide attributes). */
const HOME_TIPS: Record<string, Tip> = {
  hero: GREETING,
  welcome: { text: "Tell me who you are and I'll point you to the right next step." },
  doctor: { text: "Meet Dr. Rodney Willey. Everything in Beyonn comes from his own OSA + TMD practices." },
  opportunity: { text: "Many of these patients are already in your chair, and most go unrecognized." },
  airway: { text: "Watch this one. Scroll slowly and see the jaw move forward and the airway open up." },
  gives: { text: "Your team runs the program. Beyonn trains them and hands them the tools for every step." },
  protocol: { text: "Four steps: Identify, Prepare, Treat, Manage. Keep scrolling and they stack up." },
  platform: { text: "One platform for learning, cases, billing and growth. Try the tabs." },
  gain: { text: "Here's what your practice gets back: revenue, impact, ownership and patients." },
  workshop: { text: "Want to see it live first? The free workshop is a relaxed place to start.", cta: { label: "Ask for the next date", href: "/#workshop" } },
  stories: { text: "These clinicians have worked with Dr. Willey. Swipe through what they say." },
  cta: { text: "Ready when you are. A discovery call is the quickest way to start.", cta: { label: "Book a Discovery Call", href: "/qualify#book" } },
};

const TAP_TIPS: Tip[] = [
  { text: "Hello again! Ask the team anything at 888-264-1981." },
  { text: "Tip: the two-minute check on the patients page helps people spot sleep and jaw signs.", cta: { label: "Open the check", href: "/patients#quick-check" } },
  { text: "Curious if your practice is a fit? It only takes a few minutes.", cta: { label: "See if you qualify", href: "/qualify" } },
];

type Gesture = "wave" | "spin" | "jump" | "nod";

/**
 * Beyonn guide: a small 3D companion (built in code, no external model) standing
 * on a glowing hover-pad in the corner. It looks toward the cursor, blinks, waves,
 * spins or hops when tapped, and explains each section of the page in a speech
 * bubble as you scroll. Three.js loads after the intro; the scene renders at
 * ~30fps only while the tab is visible. Static for reduced motion.
 */
export function GuideBot() {
  const pathname = usePathname();
  const host = useRef<HTMLDivElement>(null);
  const play = useRef<(g: Gesture) => void>(() => {});
  const [tip, setTip] = useState<Tip>(GREETING);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const dismissed = useRef(false);
  const taps = useRef(0);
  const hideTimer = useRef(0);

  const show = useCallback((next: Tip, gesture: Gesture = "nod") => {
    setTip(next);
    if (!dismissed.current) setOpen(true);
    play.current(gesture);
    // On small screens the bubble steps aside on its own after a while.
    window.clearTimeout(hideTimer.current);
    if (window.innerWidth < 768) hideTimer.current = window.setTimeout(() => setOpen(false), 7000);
  }, []);

  // ---- 3D scene --------------------------------------------------------------
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let disposed = false;
    let teardown = () => {};

    (async () => {
      await new Promise((r) => setTimeout(r, Math.max(0, 2200 - performance.now())));
      if (disposed) return;
      const THREE = await import("three");
      const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
      if (disposed) return;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = env;
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
      camera.position.set(0, 0.3, 5.6);
      camera.lookAt(0, -0.1, 0);

      const white = new THREE.MeshPhysicalMaterial({ color: "#f3f6fb", roughness: 0.32, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.15 });
      const visorMat = new THREE.MeshPhysicalMaterial({ color: "#0c1a2e", roughness: 0.05, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.02 });
      const navy = new THREE.MeshPhysicalMaterial({ color: "#1c395e", roughness: 0.25, metalness: 0.3, clearcoat: 1 });
      const glow = new THREE.MeshStandardMaterial({ color: "#72cfb7", emissive: "#72cfb7", emissiveIntensity: 2.2 });
      const blue = new THREE.MeshStandardMaterial({ color: "#3177bf", transparent: true });

      const bot = new THREE.Group();
      scene.add(bot);

      // hover-pad
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.86, 0.1, 48), navy);
      pad.position.y = -1.32;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.028, 12, 72), glow);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -1.27;
      const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.012, 8, 72), glow);
      ring2.rotation.x = Math.PI / 2;
      ring2.position.y = -1.3;
      scene.add(pad, ring, ring2);

      // torso + emblem badge
      const body = new THREE.Group();
      bot.add(body);
      const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.36, 0.3, 12, 32), white);
      torso.position.y = -0.5;
      torso.scale.set(1, 1, 0.9);
      body.add(torso);
      const tex = await new THREE.TextureLoader().loadAsync("/assets/site/beyonn-emblem.png").catch(() => null);
      if (tex) {
        blue.alphaMap = tex;
        const badge = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.34), blue);
        badge.scale.setScalar(0.8);
        badge.position.set(0, -0.44, 0.33);
        body.add(badge);
      }

      // arms (pivot at the shoulder)
      const arm = (side: 1 | -1) => {
        const pivot = new THREE.Group();
        pivot.position.set(side * 0.42, -0.3, 0);
        const limb = new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 0.32, 8, 16), white);
        limb.position.y = -0.24;
        const hand = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 16), navy);
        hand.position.y = -0.48;
        pivot.add(limb, hand);
        pivot.rotation.z = side * 0.18;
        body.add(pivot);
        return pivot;
      };
      const armL = arm(-1);
      const armR = arm(1);

      // head
      const head = new THREE.Group();
      head.position.y = 0.3;
      body.add(head);
      const skull = new THREE.Mesh(new THREE.SphereGeometry(0.52, 48, 32), white);
      skull.scale.set(1.12, 0.9, 0.98);
      head.add(skull);
      // ear pods
      for (const side of [-1, 1]) {
        const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 28), navy);
        ear.rotation.z = Math.PI / 2;
        ear.position.x = side * 0.59;
        const earGlow = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.018, 8, 28), glow);
        earGlow.rotation.y = Math.PI / 2;
        earGlow.position.x = side * 0.64;
        head.add(ear, earGlow);
      }
      const visor = new THREE.Mesh(new THREE.SphereGeometry(0.42, 40, 28), visorMat);
      visor.scale.set(1.12, 0.68, 0.6);
      visor.position.set(0, -0.02, 0.26);
      head.add(visor);
      const eyeGeo = new THREE.CapsuleGeometry(0.055, 0.09, 8, 16);
      const eyeL = new THREE.Mesh(eyeGeo, glow);
      const eyeR = new THREE.Mesh(eyeGeo, glow);
      eyeL.position.set(-0.15, 0, 0.5);
      eyeR.position.set(0.15, 0, 0.5);
      head.add(eyeL, eyeR);
      const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.22, 8), navy);
      stalk.position.y = 0.54;
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), glow);
      bulb.position.y = 0.67;
      head.add(stalk, bulb);

      const key = new THREE.DirectionalLight("#ffffff", 2);
      key.position.set(2, 3, 4);
      scene.add(key, new THREE.AmbientLight("#c5daf2", 0.5));

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

      // ---- behaviour ----
      const look = { x: 0, y: 0 };
      const onPointer = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        look.x = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth * 0.5)));
        look.y = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (window.innerHeight * 0.5)));
      };
      window.addEventListener("pointermove", onPointer, { passive: true });

      let gesture: { type: Gesture; t0: number } | null = null;
      play.current = (g) => {
        if (!still) gesture = { type: g, t0: performance.now() };
      };
      let nextBlink = performance.now() + 2500;
      let raf = 0;
      let last = 0;
      const t0 = performance.now();

      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        if (now - last < 33) return; // ~30fps is plenty for a small companion
        last = now;
        const t = (now - t0) / 1000;

        bot.position.y = Math.sin(t * 2) * 0.05;
        ring.rotation.z = t * 0.6;
        ring2.rotation.z = -t * 0.35;
        (glow as import("three").MeshStandardMaterial).emissiveIntensity = 1.8 + Math.sin(t * 3) * 0.5;

        head.rotation.y += (look.x * 0.7 - head.rotation.y) * 0.12;
        head.rotation.x += (look.y * 0.35 - head.rotation.x) * 0.12;
        armL.rotation.x = Math.sin(t * 2) * 0.08;
        armR.rotation.x = -Math.sin(t * 2) * 0.08;
        armR.rotation.z = 0.18;
        body.rotation.y *= 0.9;

        // blink
        const blink = now > nextBlink ? Math.min(1, (now - nextBlink) / 140) : 0;
        const lid = blink > 0 ? 1 - Math.sin(blink * Math.PI) * 0.9 : 1;
        eyeL.scale.y = eyeR.scale.y = lid;
        if (blink >= 1) nextBlink = now + 2500 + Math.random() * 3000;

        if (gesture) {
          const p = (now - gesture.t0) / 1000;
          if (gesture.type === "wave") {
            armR.rotation.z = 0.18 + Math.min(1, p * 4) * 2.4 * (p < 1.6 ? 1 : Math.max(0, 1 - (p - 1.6) * 4));
            armR.rotation.x = Math.sin(p * 14) * 0.35 * (p < 1.6 ? 1 : 0);
            if (p > 1.85) gesture = null;
          } else if (gesture.type === "spin") {
            const e = Math.min(1, p / 0.9);
            body.rotation.y = (1 - Math.pow(1 - e, 3)) * Math.PI * 2;
            if (e >= 1) {
              body.rotation.y = 0;
              gesture = null;
            }
          } else if (gesture.type === "jump") {
            const e = Math.min(1, p / 0.7);
            bot.position.y += Math.sin(e * Math.PI) * 0.45;
            if (e >= 1) gesture = null;
          } else {
            head.rotation.x += Math.sin(Math.min(1, p / 0.5) * Math.PI) * 0.35;
            if (p > 0.5) gesture = null;
          }
        }
        renderer.render(scene, camera);
      };

      const start = () => {
        cancelAnimationFrame(raf);
        if (still) renderer.render(scene, camera);
        else raf = requestAnimationFrame(frame);
      };
      const onVis = () => (document.hidden ? cancelAnimationFrame(raf) : start());
      document.addEventListener("visibilitychange", onVis);
      start();
      setReady(true);
      play.current("wave");

      teardown = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        window.removeEventListener("pointermove", onPointer);
        document.removeEventListener("visibilitychange", onVis);
        scene.traverse((o) => {
          const m = o as import("three").Mesh;
          m.geometry?.dispose?.();
        });
        [white, navy, glow, blue, visorMat].forEach((m) => m.dispose());
        tex?.dispose();
        env.dispose();
        pmrem.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })().catch(() => {});

    return () => {
      disposed = true;
      teardown();
    };
  }, []);

  // ---- Greeting once the guide appears ----
  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => show(GREETING, "wave"), 300);
    return () => window.clearTimeout(t);
  }, [ready, show]);

  // ---- Section-aware tips (home page) ----
  useEffect(() => {
    if (!ready) return;
    if (pathname !== "/") {
      const t = window.setTimeout(() => show({ text: "Questions about this page? The team is happy to help.", cta: { label: "Contact Beyonn", href: "/contact" } }), 600);
      return () => window.clearTimeout(t);
    }
    let current = "";
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const key = (entry.target as HTMLElement).dataset.guide ?? "";
          if (key && key !== current && HOME_TIPS[key]) {
            current = key;
            show(HOME_TIPS[key]);
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    document.querySelectorAll<HTMLElement>("[data-guide]").forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [ready, pathname, show]);

  const onTap = () => {
    dismissed.current = false;
    const gestures: Gesture[] = ["wave", "spin", "jump"];
    show(TAP_TIPS[taps.current % TAP_TIPS.length], gestures[taps.current % gestures.length]);
    taps.current += 1;
  };

  return (
    <div className={cn("pointer-events-none fixed bottom-[4.25rem] right-1 z-40 flex flex-row-reverse items-end gap-1 transition-opacity duration-700 sm:bottom-[5.25rem] sm:right-3", ready ? "opacity-100" : "opacity-0")}>
      <button type="button" onClick={onTap} aria-label="Beyonn guide: show a tip" className="pointer-events-auto relative size-[84px] flex-none cursor-pointer rounded-full sm:size-[116px]">
        <div ref={host} className="absolute inset-0" aria-hidden />
      </button>

      <div
        aria-live="polite"
        className={cn(
          "relative mb-12 w-[min(15rem,calc(100vw-7.5rem))] origin-bottom-right rounded-2xl rounded-br-md bg-white p-3.5 pr-8 text-[0.88rem] leading-snug text-ink shadow-[0_20px_44px_-20px_rgb(19_37_62/0.55)] ring-1 ring-ink/10 transition-[opacity,transform] duration-300 ease-[var(--ease-out-expo)] sm:mb-16 sm:w-64",
          open && ready ? "pointer-events-auto scale-100 opacity-100" : "scale-90 opacity-0",
        )}
      >
        <p key={tip.text} className="animate-fade-up">
          {tip.text}
        </p>
        {tip.cta && (
          <Link href={tip.cta.href} className="mt-2 inline-flex text-[0.85rem] font-semibold text-dawn hover:underline">
            {tip.cta.label} →
          </Link>
        )}
        <button
          type="button"
          onClick={() => {
            dismissed.current = true;
            setOpen(false);
          }}
          aria-label="Hide tip"
          className="absolute right-2 top-2 grid size-6 place-items-center rounded-full text-muted hover:bg-ink/[0.06] hover:text-ink"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
