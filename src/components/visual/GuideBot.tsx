"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ArrowUpRight, Phone, X } from "lucide-react";
import type * as Three from "three";
import { site } from "@/content/site";
import styles from "./GuideBot.module.css";

const contexts: Record<string, string> = {
  hero: "Find the program for your practice, or find care for yourself.",
  welcome: "Practitioner or patient? There’s a place to start for each.",
  doctor: "Meet Dr. Rodney Willey and the clinical approach behind Beyonn.",
  opportunity: "Explore how sleep and jaw care can fit into your practice.",
  airway: "The model shows how jaw position can affect the space behind the tongue.",
  gives: "Explore the training, tools and support available to your team.",
  protocol: "Identify, Prepare, Treat, Manage: the four steps of the Beyonn system.",
  platform: "Explore the learning, case and practice tools in the platform.",
  gain: "See what adding sleep and jaw care could mean for your practice.",
  workshop: "The free workshop is a way to meet the approach before you commit.",
  stories: "Read perspectives from clinicians who have worked with Dr. Willey.",
  cta: "A discovery call can help you decide whether Beyonn fits your practice.",
};

const practiceLinks = [
  { href: "/the-beyonn-system", title: "Explore the program", detail: "The clinical workflow and team support" },
  { href: "/patients/find-a-provider", title: "Find patient care", detail: "Connect with a Beyonn provider" },
  { href: "/qualify#book", title: "Book a discovery call", detail: "Talk through your practice’s needs" },
];
const patientLinks = [
  { href: "/patients/find-a-provider", title: "Find a provider", detail: "Start with a clinician near you" },
  { href: "/patients#treatment", title: "Understand treatment", detail: "Sleep apnea and jaw care, explained" },
  { href: "/contact", title: "Contact the team", detail: "Get help finding your next step" },
];

/** A quiet, on-demand navigation companion. It never opens itself on scroll. */
export function GuideBot() {
  const pathname = usePathname();
  const panelId = useId();
  const root = useRef<HTMLDivElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const appearance = useRef({ open: false, hover: false });
  const wake = useRef<(() => void) | null>(null);
  const greet = useRef<(() => void) | null>(null);
  const hoverReact = useRef<(() => void) | null>(null);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [section, setSection] = useState("hero");
  const patient = pathname.startsWith("/patients") || pathname === "/portal";
  const links = patient ? patientLinks : practiceLinks;
  const context = patient
    ? "Looking for care? A Beyonn provider can help you take the next step."
    : pathname === "/"
      ? contexts[section] ?? contexts.hero
      : "Find the program for your practice, patient care, or a person to speak with.";

  const close = useCallback((returnFocus = false) => {
    setOpen(false);
    if (returnFocus) launcher.current?.focus();
  }, []);

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    appearance.current.open = open;
    wake.current?.();
    if (!open) return;
    const frame = requestAnimationFrame(() => closeButton.current?.focus());
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); close(true); }
    };
    const onOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onOutside);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onOutside);
    };
  }, [open, close]);

  // Context changes quietly. Reading a section never opens a speech bubble.
  useEffect(() => {
    if (pathname !== "/") return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting);
      const entry = visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      const key = (entry?.target as HTMLElement | undefined)?.dataset.guide;
      if (key && contexts[key]) setSection(key);
    }, { rootMargin: "-30% 0px -45% 0px", threshold: [0, 0.1, 0.5] });
    document.querySelectorAll<HTMLElement>("[data-guide]").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let disposed = false;
    let teardown = () => {};
    // Prepare the character immediately, before a visitor reaches later sections.
    void (async () => {
        const [THREE, { RoomEnvironment }, { RoundedBoxGeometry }] = await Promise.all([
          import("three"),
          import("three/examples/jsm/environments/RoomEnvironment.js"),
          import("three/examples/jsm/geometries/RoundedBoxGeometry.js"),
        ]);
        if (disposed) return;
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.12;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.domElement.style.cssText = "width:100%;height:100%;display:block;";
        renderer.domElement.setAttribute("aria-hidden", "true");
        element.appendChild(renderer.domElement);
        teardown = () => { renderer.dispose(); renderer.domElement.remove(); };

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 30);
        camera.position.set(0.1, 0.18, 5.05);
        camera.lookAt(0, -0.025, 0);
        const pmrem = new THREE.PMREMGenerator(renderer);
        const room = new RoomEnvironment();
        const environment = pmrem.fromScene(room, 0.05);
        scene.environment = environment.texture;
        room.dispose();
        const geometries = new Set<Three.BufferGeometry>();
        const materials = new Set<Three.Material>();
        let shadow: Three.DirectionalLightShadow | undefined;
        let released = false;
        const release = () => {
          if (released) return;
          released = true;
          geometries.forEach((geometry) => geometry.dispose());
          materials.forEach((surface) => surface.dispose());
          shadow?.dispose();
          environment.dispose(); pmrem.dispose(); renderer.dispose();
          renderer.domElement.remove();
        };
        // Also release partially built scenes if a geometry constructor fails.
        teardown = release;
        const material = (color: string, options: Three.MeshPhysicalMaterialParameters = {}) => {
          const result = new THREE.MeshPhysicalMaterial({ color, roughness: 0.36, metalness: 0.04, clearcoat: 0.65, clearcoatRoughness: 0.22, ...options });
          materials.add(result);
          return result;
        };
        const ceramic = material("#f0f4f7", { roughness: 0.29, sheen: 0.15 });
        const pearl = material("#d7e5ef", { roughness: 0.4 });
        const blue = material("#3a78b0", { roughness: 0.31, metalness: 0.32 });
        const navy = material("#17344f", { roughness: 0.33, metalness: 0.22 });
        const chrome = material("#c2d5dd", { roughness: 0.22, metalness: 0.7 });
        const glass = material("#102838", { roughness: 0.12, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05 });
        const mint = material("#b8eadb", { roughness: 0.3, emissive: "#72c7ab", emissiveIntensity: 0.25 });
        const eyeHighlight = material("#ffffff", { roughness: .15, emissive: "#ffffff", emissiveIntensity: .15 });
        const blush = material("#e6b8ac", { roughness: .7, transparent: true, opacity: .58 });
        const mesh = (geometry: Three.BufferGeometry, surface: Three.Material, parent: Three.Object3D) => {
          geometries.add(geometry);
          const object = new THREE.Mesh(geometry, surface);
          object.castShadow = surface !== mint;
          object.receiveShadow = true;
          parent.add(object);
          return object;
        };
        const round = (w: number, h: number, d: number, radius: number) => new RoundedBoxGeometry(w, h, d, 5, radius);
        const bot = new THREE.Group();
        bot.rotation.y = -0.12;
        scene.add(bot);

        // A small, rounded body leaves the expressive head as the focal point.
        const body = new THREE.Group();
        body.position.y = -0.36;
        bot.add(body);
        const profile = [[0, -.46], [.24, -.44], [.34, -.34], [.39, -.15], [.36, .04], [.27, .18], [.14, .21], [0, .21]];
        const torso = mesh(new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), 48), ceramic, body);
        torso.scale.z = 0.88;
        const chestInset = mesh(round(.32, .2, .035, .065), pearl, body);
        chestInset.position.set(0, -.11, .337);
        const chestLight = mesh(round(.15, .025, .012, .012), blue, body);
        chestLight.position.set(0, -.09, .36);
        const indicator = mesh(new THREE.SphereGeometry(.024, 12, 8), mint, body);
        indicator.position.set(0, -.18, .36);
        const waist = mesh(new THREE.TorusGeometry(.267, .018, 8, 48), pearl, body);
        waist.rotation.x = Math.PI / 2;
        waist.scale.y = .8;
        waist.position.y = -.37;
        const neck = mesh(new THREE.CylinderGeometry(.13, .16, .2, 28), chrome, bot);
        neck.position.y = -.055;

        // Generous rounded cheeks and wide eyes make the face readable at icon size.
        const head = new THREE.Group();
        head.position.y = .47;
        bot.add(head);
        mesh(round(1.34, 1.01, .84, .35), ceramic, head);
        const forehead = mesh(round(.59, .019, .018, .009), pearl, head);
        forehead.position.set(0, .382, .347);
        const visorFrame = mesh(new THREE.SphereGeometry(1, 44, 28), pearl, head);
        visorFrame.scale.set(.605, .36, .145);
        visorFrame.position.set(0, -.025, .427);
        const visor = mesh(new THREE.SphereGeometry(1, 44, 28), glass, head);
        visor.scale.set(.578, .33, .14);
        visor.position.set(0, -.025, .45);
        const eyes = new THREE.Group();
        eyes.position.set(0, .025, .593);
        head.add(eyes);
        const eyeGeometry = new THREE.SphereGeometry(.085, 24, 18);
        const eyeL = mesh(eyeGeometry, mint, eyes);
        const eyeR = mesh(eyeGeometry, mint, eyes);
        eyeL.position.x = -.215;
        eyeR.position.x = .215;
        eyeL.scale.set(1, 1.17, .25);
        eyeR.scale.set(1, 1.17, .25);
        for (const eye of [eyeL, eyeR]) {
          const glint = mesh(new THREE.SphereGeometry(.018, 12, 8), eyeHighlight, eye);
          glint.position.set(-.025, .034, .099);
          glint.castShadow = false;
        }
        for (const side of [-1, 1]) {
          const cheek = mesh(new THREE.SphereGeometry(.055, 20, 14), blush, head);
          cheek.scale.set(1.15, .55, .18);
          cheek.position.set(side * .34, -.13, .559);
          cheek.castShadow = false;
        }
        const smileCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(-.07, -.12, .602), new THREE.Vector3(0, -.155, .611), new THREE.Vector3(.07, -.12, .602)]);
        const smile = mesh(new THREE.TubeGeometry(smileCurve, 20, .01, 7, false), mint, head);
        for (const side of [-1, 1]) {
          const earpiece = mesh(new THREE.CylinderGeometry(.135, .135, .07, 28), blue, head);
          earpiece.rotation.z = Math.PI / 2;
          earpiece.position.set(side * .67, -.025, 0);
          const cap = mesh(new THREE.CylinderGeometry(.097, .097, .012, 28), pearl, head);
          cap.rotation.z = Math.PI / 2;
          cap.position.set(side * .713, -.025, 0);
          const screw = mesh(new THREE.CylinderGeometry(.022, .022, .018, 16), chrome, head);
          screw.rotation.z = Math.PI / 2;
          screw.position.set(side * .725, -.025, 0);
        }
        const fin = mesh(round(.07, .11, .13, .035), blue, head);
        fin.position.set(.36, .515, -.04);

        // Separate upper arms, elbow joints, forearms and little open palms.
        const makeArm = (side: number) => {
          const shoulder = new THREE.Group();
          shoulder.position.set(side * .37, -.2, 0);
          shoulder.rotation.z = side * .12;
          bot.add(shoulder);
          const socket = mesh(new THREE.SphereGeometry(.09, 20, 14), navy, shoulder);
          socket.scale.z = .9;
          const upper = mesh(new THREE.CapsuleGeometry(.073, .12, 8, 18), ceramic, shoulder);
          upper.position.y = -.115;
          const elbow = new THREE.Group();
          elbow.position.y = -.24;
          shoulder.add(elbow);
          mesh(new THREE.SphereGeometry(.065, 18, 12), chrome, elbow);
          const forearm = mesh(new THREE.CapsuleGeometry(.078, .1, 8, 18), ceramic, elbow);
          forearm.position.y = -.1;
          const cuff = mesh(new THREE.CylinderGeometry(.071, .071, .045, 20), blue, elbow);
          cuff.position.y = -.185;
          const hand = mesh(round(.145, .14, .09, .045), pearl, elbow);
          hand.position.set(0, -.25, .005);
          const thumb = mesh(new THREE.CapsuleGeometry(.025, .035, 6, 12), pearl, elbow);
          thumb.position.set(-side * .075, -.235, .025);
          thumb.rotation.z = side * -.65;
          return { shoulder, elbow };
        };
        const left = makeArm(-1);
        const right = makeArm(1);
        const shoes: Three.Mesh[] = [];
        for (const side of [-1, 1]) {
          const hip = mesh(new THREE.SphereGeometry(.07, 16, 12), navy, bot);
          hip.position.set(side * .17, -.81, 0);
          const shin = mesh(new THREE.CapsuleGeometry(.077, .075, 8, 18), pearl, bot);
          shin.position.set(side * .17, -.89, 0);
          const shoe = mesh(round(.24, .145, .34, .07), blue, bot);
          shoe.position.set(side * .17, -1.015, .055);
          shoes.push(shoe);
          const sole = mesh(round(.25, .028, .35, .013), navy, bot);
          sole.position.set(side * .17, -1.085, .055);
        }

        const key = new THREE.DirectionalLight("#fff7ee", 3.1);
        key.position.set(-2, 4, 5);
        key.castShadow = true;
        shadow = key.shadow;
        key.shadow.mapSize.set(512, 512);
        key.shadow.camera.left = key.shadow.camera.bottom = -2;
        key.shadow.camera.right = key.shadow.camera.top = 2;
        key.shadow.camera.near = 1;
        key.shadow.camera.far = 12;
        key.shadow.normalBias = .02;
        const fill = new THREE.DirectionalLight("#b3d9f3", 1.1);
        fill.position.set(3, 1, 3);
        const rim = new THREE.DirectionalLight("#a4decf", 1.3);
        rim.position.set(2, 3, -3);
        scene.add(key, fill, rim, new THREE.AmbientLight("#d6e7f2", .45));
        const shadowMaterial = new THREE.ShadowMaterial({ opacity: .13 });
        materials.add(shadowMaterial);
        const floor = mesh(new THREE.PlaneGeometry(4, 4), shadowMaterial, scene);
        floor.castShadow = false;
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -1.103;

        const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
        let reduced = motion.matches;
        let inView = false;
        let raf = 0;
        let lastFrame = 0;
        let blinkTimer = 0;
        let gestureTimer = 0;
        let gestureIndex = 0;
        let lastHover = 0;
        let blinkAt = -1;
        type Gesture = "curious" | "wave" | "hop" | "wink";
        let gesture: { kind: Gesture; at: number } | null = null;
        let contextLost = false;
        const gaze = { x: -.12, y: -.04 };
        const draw = (now: number) => {
          const state = appearance.current;
          const kind = !reduced ? gesture?.kind : undefined;
          const duration = kind === "curious" ? 2.6 : kind === "wave" ? 1.8 : kind === "hop" ? 1.05 : 1.5;
          const age = gesture && !reduced ? (now - gesture.at) / 1000 : duration;
          const q = Math.max(0, Math.min(1, age / duration));
          const active = !!kind && q < 1;
          const pulse = active ? Math.sin(q * Math.PI) : 0;
          const curiosity = kind === "curious" ? pulse : 0;
          const wave = kind === "wave" && active ? Math.min(1, age / .22) * Math.min(1, (duration - age) / .3) : 0;
          const wink = kind === "wink" ? Math.pow(pulse, 3) : 0;
          const flight = kind === "hop" && q > .18 && q < .77 ? Math.sin((q - .18) / .59 * Math.PI) : 0;
          const squash = kind === "hop" && q < .18 ? Math.sin(q / .18 * Math.PI) : kind === "hop" && q > .77 ? Math.sin((q - .77) / .23 * Math.PI) : 0;
          const targetY = reduced ? -.08 : (state.open ? -.32 : gaze.x * .35) + (kind === "curious" ? Math.sin(q * Math.PI * 2) * .28 : 0);
          const targetX = reduced ? 0 : (state.open ? -.08 : gaze.y * .2) - curiosity * .1;
          const targetZ = reduced ? .012 : (state.hover ? .055 : .012) + curiosity * .16 - wink * .1;
          const bodyY = !reduced && state.open ? -.1 : 0;
          const response = reduced ? 1 : .14;
          head.rotation.y += (targetY - head.rotation.y) * response;
          head.rotation.x += (targetX - head.rotation.x) * response;
          head.rotation.z += (targetZ - head.rotation.z) * response;
          body.rotation.y += (bodyY - body.rotation.y) * response;
          eyes.position.x += ((reduced ? 0 : state.open ? -.028 : gaze.x * .025) - eyes.position.x) * response;
          const blink = blinkAt < 0 || reduced ? 0 : Math.min(1, (now - blinkAt) / 230);
          const blinkScale = blink > 0 && blink < 1 ? 1 - Math.sin(blink * Math.PI) * .95 : 1;
          eyeL.scale.y = 1.17 * blinkScale * (1 - wink * .92 - wave * .13);
          eyeR.scale.y = 1.17 * blinkScale * (1 + wink * .06 - wave * .13);
          eyeL.scale.x = eyeR.scale.x = 1 + wave * .04;
          smile.scale.x = 1 + pulse * .18;
          right.shoulder.rotation.z = .12 + wave * 2.15 + flight * .26;
          right.shoulder.rotation.x = -.12 * wave;
          right.elbow.rotation.z = -wave * (.35 + Math.sin(age * 13) * .19);
          left.shoulder.rotation.z += ((!reduced && state.open ? -.24 : -.12) - curiosity * .7 - flight * .26 - left.shoulder.rotation.z) * response;
          left.elbow.rotation.x += ((!reduced && state.open ? -.28 : -.05) - curiosity * .35 - left.elbow.rotation.x) * response;
          bot.scale.y = 1 - squash * .045 + flight * .025;
          bot.scale.x = 1 + squash * .025 - flight * .012;
          bot.position.y = flight * .18 + wave * .012 + (bot.scale.y - 1) * 1.103;
          bot.rotation.z = kind === "hop" ? Math.sin(q * Math.PI * 2) * pulse * .025 : 0;
          shoes[0].rotation.y = curiosity * -.16;
          shoes[1].rotation.y = curiosity * .1;
          shadowMaterial.opacity = .13 - flight * .05;
          if (gesture && q >= 1) gesture = null;
          renderer.render(scene, camera);
          return Math.abs(targetY - head.rotation.y) + Math.abs(targetX - head.rotation.x) > .001
            || Math.abs(targetZ - head.rotation.z) > .001
            || Math.abs(bodyY - body.rotation.y) > .001
            || active || (blink > 0 && blink < 1);
        };
        const frame = (now: number) => {
          raf = 0;
          if (disposed || contextLost || !inView || document.hidden) return;
          if (now - lastFrame < 30) { raf = requestAnimationFrame(frame); return; }
          lastFrame = now;
          const moving = draw(now);
          if (!reduced && moving) raf = requestAnimationFrame(frame);
        };
        const kick = () => {
          if (!raf && inView && !document.hidden && !disposed && !contextLost) raf = requestAnimationFrame(frame);
        };
        wake.current = kick;
        const startGesture = (kind: Gesture) => {
          if (reduced || document.hidden || contextLost || disposed) return;
          gesture = { kind, at: performance.now() };
          kick();
        };
        greet.current = () => startGesture("wave");
        hoverReact.current = () => {
          const now = performance.now();
          if (now - lastHover < 1700) return;
          lastHover = now;
          startGesture("hop");
        };
        const scheduleGesture = () => {
          window.clearTimeout(gestureTimer);
          if (reduced || !inView || document.hidden || contextLost) return;
          const gestures: Gesture[] = ["curious", "wink", "wave", "hop"];
          const delays = [8800, 12300, 10600, 13700];
          gestureTimer = window.setTimeout(() => {
            if (!appearance.current.open && !appearance.current.hover) {
              startGesture(gestures[gestureIndex % gestures.length]);
              gestureIndex++;
            }
            scheduleGesture();
          }, delays[gestureIndex % delays.length]);
        };
        const scheduleBlink = () => {
          window.clearTimeout(blinkTimer);
          if (reduced || !inView || document.hidden || contextLost) return;
          blinkTimer = window.setTimeout(() => { blinkAt = performance.now(); kick(); scheduleBlink(); }, 5200);
        };
        const onPointer = (event: PointerEvent) => {
          if (event.pointerType !== "mouse" || reduced) return;
          const bounds = element.getBoundingClientRect();
          gaze.x = Math.max(-1, Math.min(1, (event.clientX - bounds.left - bounds.width / 2) / 550));
          gaze.y = Math.max(-1, Math.min(1, (event.clientY - bounds.top - bounds.height / 2) / 550));
          kick();
        };
        const resize = () => {
          const bounds = element.getBoundingClientRect();
          if (!bounds.width || !bounds.height || contextLost) return;
          renderer.setSize(bounds.width, bounds.height, false);
          camera.aspect = bounds.width / bounds.height;
          camera.updateProjectionMatrix();
          draw(performance.now());
          kick();
        };
        const onVisibility = () => {
          cancelAnimationFrame(raf); raf = 0;
          window.clearTimeout(blinkTimer);
          window.clearTimeout(gestureTimer);
          gesture = null; blinkAt = -1;
          if (!document.hidden) { kick(); scheduleBlink(); scheduleGesture(); }
        };
        const onMotion = () => {
          reduced = motion.matches;
          gesture = null; blinkAt = -1;
          scheduleBlink(); scheduleGesture(); kick();
        };
        const onContextLost = (event: Event) => {
          event.preventDefault(); contextLost = true;
          cancelAnimationFrame(raf); raf = 0;
          window.clearTimeout(blinkTimer);
          window.clearTimeout(gestureTimer);
          setReady(false);
        };
        const observer = new IntersectionObserver(([entry]) => {
          inView = entry.isIntersecting;
          if (inView) { kick(); scheduleBlink(); scheduleGesture(); }
          else { cancelAnimationFrame(raf); raf = 0; window.clearTimeout(blinkTimer); window.clearTimeout(gestureTimer); gesture = null; }
        });
        observer.observe(element);
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(element);
        document.addEventListener("visibilitychange", onVisibility);
        window.addEventListener("pointermove", onPointer, { passive: true });
        motion.addEventListener("change", onMotion);
        renderer.domElement.addEventListener("webglcontextlost", onContextLost);
        resize();
        setReady(true);
        startGesture("wave");

        teardown = () => {
          wake.current = null; greet.current = null; hoverReact.current = null;
          cancelAnimationFrame(raf);
          window.clearTimeout(blinkTimer);
          window.clearTimeout(gestureTimer);
          observer.disconnect(); resizeObserver.disconnect();
          document.removeEventListener("visibilitychange", onVisibility);
          window.removeEventListener("pointermove", onPointer);
          motion.removeEventListener("change", onMotion);
          renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
          release();
        };
      })().catch(() => {
        teardown();
        if (!disposed) setReady(false);
      });
    return () => { disposed = true; teardown(); };
  }, []);

  const toggle = () => {
    if (open) close();
    else { setOpen(true); greet.current?.(); }
  };
  const hover = (value: boolean) => { appearance.current.hover = value; if (value) hoverReact.current?.(); wake.current?.(); };

  return (
    <div ref={root} className={styles.root}>
      {open && (
        <section className={styles.panel} id={panelId} role="dialog" aria-labelledby={`${panelId}-title`}>
          <header className={styles.panelHeader}>
            <span className={styles.brandMark} aria-hidden><span /><span /></span>
            <h2 id={`${panelId}-title`}>Beyonn guide</h2>
            <button ref={closeButton} type="button" onClick={() => close(true)} aria-label="Close guide" className={styles.close}><X size={16} aria-hidden /></button>
          </header>
          <p className={styles.context}>{context}</p>
          <nav aria-label="Beyonn guide shortcuts" className={styles.links}>
            {links.map((link) => <Link key={link.href} href={link.href} onClick={() => close()} className={styles.link}><span><span className={styles.linkTitle}>{link.title}</span><span className={styles.linkDetail}>{link.detail}</span></span><ArrowUpRight size={16} aria-hidden /></Link>)}
          </nav>
          <a className={styles.phone} href={site.phoneHref}><Phone size={13} aria-hidden /><span>Prefer to talk? {site.phone}</span></a>
        </section>
      )}
      <button ref={launcher} type="button" onClick={toggle} onPointerEnter={() => hover(true)} onPointerLeave={() => hover(false)} onFocus={() => hover(true)} onBlur={() => hover(false)} className={styles.launcher} aria-label={open ? "Close Beyonn guide" : "Open Beyonn guide"} aria-expanded={open} aria-haspopup="dialog" aria-controls={open ? panelId : undefined}>
        <span className={styles.launcherHint}>Need a hand?</span>
        <span className={styles.character}>
          <span ref={host} className={styles.canvas} style={{ opacity: ready ? 1 : 0 }} aria-hidden />
          {!ready && <svg viewBox="0 0 80 95" className={styles.fallback} aria-hidden><rect x="24" y="49" width="32" height="28" rx="15" fill="#e2ecf3" /><rect x="8" y="9" width="64" height="49" rx="22" fill="#f0f4f7" stroke="#bdcdd8" /><rect x="14" y="23" width="52" height="28" rx="13" fill="#17344f" /><ellipse cx="29" cy="35" rx="5" ry="6" fill="#b8eadb" /><ellipse cx="51" cy="35" rx="5" ry="6" fill="#b8eadb" /><circle cx="27.5" cy="33" r="1.2" fill="#fff" /><circle cx="49.5" cy="33" r="1.2" fill="#fff" /><ellipse cx="21" cy="43" rx="3" ry="1.5" fill="#e6b8ac" /><ellipse cx="59" cy="43" rx="3" ry="1.5" fill="#e6b8ac" /><path d="M36 43Q40 47 44 43" fill="none" stroke="#b8eadb" strokeWidth="1.2" strokeLinecap="round" /><rect x="23" y="77" width="14" height="7" rx="3.5" fill="#3a78b0" /><rect x="43" y="77" width="14" height="7" rx="3.5" fill="#3a78b0" /></svg>}
        </span>
        <span className={styles.launcherLabel}>{open ? "Close guide" : "Guide"}</span>
      </button>
    </div>
  );
}
