"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { particleViewport } from "@/lib/motion";

/**
 * Scroll-driven "break and rebuild" for the home page.
 *
 * The 3D Beyonn emblem behind Dr. Willey breaks into dots as you scroll. The
 * dots fly to the next section and rebuild something that is really there:
 * its background emblem, the protocol ring, the platform window, a card…
 * As they land, the real element fades in and the dots disappear. Keep
 * scrolling and that element breaks apart again for the next one. Scrolling
 * up plays everything backwards, back into the emblem behind Dr. Willey.
 *
 * Runs on every page (it re-scans on navigation). Targets are any elements in
 * <main> marked `data-morph-shape="emblem" | "ring" | "rect"`, in page order. `data-morph-hide` elements are only visible while the dots
 * have built them (decor such as background emblems); others stay visible.
 * One fixed, click-through WebGL layer; mounted only on desktop when motion is enabled.
 */

type Kind = "emblem" | "ring" | "rect";
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (x: number) => x * x * (3 - 2 * x);

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Unit coordinates (0..1 of the element's box) for each dot, per shape kind. */
function sampleShape(kind: Kind, n: number, emblem: HTMLImageElement | null, seed: number) {
  const r = rng(seed);
  const out = new Float32Array(n * 2);
  if (kind === "emblem" && emblem) {
    const w = 320, h = 261;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (ctx) {
      ctx.drawImage(emblem, 0, 0, w, h);
      const d = ctx.getImageData(0, 0, w, h).data;
      const inside: number[] = [];
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 140) inside.push(x, y);
      const count = inside.length / 2;
      for (let i = 0; i < n; i++) {
        const k = Math.floor(r() * count) * 2;
        out[i * 2] = (inside[k] + r()) / w;
        out[i * 2 + 1] = (inside[k + 1] + r()) / h;
      }
      return out;
    }
  }
  if (kind === "ring") {
    // ProtocolRing's SVG: viewBox 440 x 400, ring centre (220, 200), radius 120, four step nodes.
    for (let i = 0; i < n; i++) {
      let x: number, y: number;
      if (i % 4 === 0) {
        const node = Math.floor(r() * 4);
        const a = -Math.PI / 2 + (node * Math.PI) / 2;
        const rr = 17 * Math.sqrt(r());
        const b = r() * Math.PI * 2;
        x = 220 + Math.cos(a) * 120 + Math.cos(b) * rr;
        y = 200 + Math.sin(a) * 120 + Math.sin(b) * rr;
      } else {
        const a = r() * Math.PI * 2;
        const rr = 120 + (r() - 0.5) * 4;
        x = 220 + Math.cos(a) * rr;
        y = 200 + Math.sin(a) * rr;
      }
      out[i * 2] = x / 440;
      out[i * 2 + 1] = y / 400;
    }
    return out;
  }
  // rect: the element's outline (dots spread along the four edges).
  for (let i = 0; i < n; i++) {
    const p = r() * 4;
    const e = Math.floor(p);
    const f = p - e;
    const j = (r() - 0.5) * 0.006;
    const [x, y] = e === 0 ? [f, j] : e === 1 ? [1 + j, f] : e === 2 ? [1 - f, 1 + j] : [j, 1 - f];
    out[i * 2] = x;
    out[i * 2 + 1] = y;
  }
  return out;
}

/** The element that actually draws the card (border, fill or shadow), not a layout wrapper. */
function visualBox(el: HTMLElement): HTMLElement | null {
  const queue: [HTMLElement, number][] = [[el, 0]];
  while (queue.length) {
    const [n, d] = queue.shift()!;
    const cs = getComputedStyle(n);
    const bg = cs.backgroundColor.match(/[\d.]+/g)?.map(Number);
    const filled = bg && (bg[3] === undefined || bg[3] > 0.05);
    if (filled || parseFloat(cs.borderTopWidth) > 0 || cs.boxShadow !== "none") return n;
    if (d < 4) for (const c of Array.from(n.children)) queue.push([c as HTMLElement, d + 1]);
  }
  return null;
}

/**
 * Rect targets that hold several cards (grids, lists) get each card's outline,
 * so the dots draw the cards rather than one frame through them.
 */
function cardOutlines(node: HTMLElement, n: number, seed: number): Float32Array | null {
  const box = node.getBoundingClientRect();
  if (!box.width || !box.height) return null;
  const kids = Array.from(node.children)
    .map((c) => visualBox(c as HTMLElement)?.getBoundingClientRect())
    .filter((r): r is DOMRect => !!r)
    .filter((r) => r.width > 40 && r.height > 30);
  if (kids.length < 2) return null;
  const boxes = kids.map((r) => [(r.left - box.left) / box.width, (r.top - box.top) / box.height, (r.right - box.left) / box.width, (r.bottom - box.top) / box.height]);
  const per = boxes.map(([x0, y0, x1, y1]) => (x1 - x0) * box.width + (y1 - y0) * box.height);
  const total = per.reduce((a, b) => a + b, 0);
  const r = rng(seed);
  const out = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) {
    let pick = r() * total;
    let k = 0;
    while (k < boxes.length - 1 && pick > per[k]) pick -= per[k++];
    const [x0, y0, x1, y1] = boxes[k];
    const w = x1 - x0, h = y1 - y0;
    const pw = w * box.width, ph = h * box.height;
    let d = r() * (pw + ph) * 2;
    const j = (r() - 0.5) * 2;
    let x: number, y: number;
    if (d < pw) { x = x0 + (d / pw) * w; y = y0 + j / box.height; }
    else if ((d -= pw) < ph) { x = x1 + j / box.width; y = y0 + (d / ph) * h; }
    else if ((d -= ph) < pw) { x = x1 - (d / pw) * w; y = y1 + j / box.height; }
    else { d -= pw; x = x0 + j / box.width; y = y1 - (d / ph) * h; }
    out[i * 2] = x;
    out[i * 2 + 1] = y;
  }
  return out;
}

/** Shapes the travelling swarm can take: all about sleep, breath, teeth and care. */
const SWARM_ICONS = ["tooth", "moon", "zzz", "pulse", "breath", "lungs", "heart", "sunrise", "emblem"] as const;
type Icon = (typeof SWARM_ICONS)[number];

/** Draw an icon on a square canvas and sample dots inside it (unit 0..1 coordinates). */
function sampleIcon(icon: Icon, n: number, emblem: HTMLImageElement | null, seed: number) {
  const S = 320;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  const out = new Float32Array(n * 2);
  if (!ctx) return out;
  ctx.fillStyle = ctx.strokeStyle = "#fff";
  ctx.lineCap = ctx.lineJoin = "round";
  const scaled = (d: string, k: number, dx: number, dy: number) => {
    ctx.save();
    ctx.translate(dx, dy);
    ctx.scale(k, k);
    ctx.fill(new Path2D(d));
    ctx.restore();
  };
  switch (icon) {
    case "emblem":
      if (emblem) ctx.drawImage(emblem, 0, (S - 261) / 2, S, 261);
      break;
    case "tooth":
      scaled("M40 62 C40 20 80 14 100 36 C120 14 160 20 160 62 C160 96 146 112 141 142 C137 176 129 196 118 196 C105 196 108 152 100 152 C92 152 95 196 82 196 C71 196 63 176 59 142 C54 112 40 96 40 62 Z", 1.45, 15, 20);
      break;
    case "heart":
      scaled("M100 180 C40 135 12 104 12 66 C12 36 36 16 62 16 C80 16 93 26 100 40 C107 26 120 16 138 16 C164 16 188 36 188 66 C188 104 160 135 100 180 Z", 1.5, 10, 20);
      break;
    case "moon":
      ctx.beginPath();
      ctx.arc(145, 175, 112, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(205, 125, 98, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      for (const [x, y, r] of [[262, 70, 13], [290, 150, 8], [235, 28, 7]]) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case "zzz":
      ctx.font = "800 150px Montserrat, Arial, sans-serif";
      ctx.fillText("Z", 18, 300);
      ctx.font = "800 104px Montserrat, Arial, sans-serif";
      ctx.fillText("z", 140, 205);
      ctx.font = "800 70px Montserrat, Arial, sans-serif";
      ctx.fillText("z", 235, 118);
      break;
    case "pulse":
      ctx.lineWidth = 15;
      ctx.beginPath();
      ctx.moveTo(10, 170);
      for (const [x, y] of [[88, 170], [112, 128], [138, 214], [168, 58], [198, 262], [224, 170], [310, 170]]) ctx.lineTo(x, y);
      ctx.stroke();
      break;
    case "breath":
      ctx.lineWidth = 14;
      for (const [y, x0, x1, ph] of [[100, 30, 290, 0], [165, 15, 305, 1.4], [230, 55, 265, 2.6]]) {
        ctx.beginPath();
        for (let x = x0; x <= x1; x += 4) {
          const yy = y + Math.sin((x / 290) * Math.PI * 3 + ph) * 16;
          if (x === x0) ctx.moveTo(x, yy);
          else ctx.lineTo(x, yy);
        }
        ctx.stroke();
      }
      break;
    case "lungs":
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(160, 22);
      ctx.lineTo(160, 128);
      ctx.moveTo(160, 120);
      ctx.quadraticCurveTo(160, 140, 132, 150);
      ctx.moveTo(160, 120);
      ctx.quadraticCurveTo(160, 140, 188, 150);
      ctx.stroke();
      scaled("M128 108 C92 92 44 140 40 214 C37 268 72 300 112 288 C134 281 140 262 140 238 L140 122 C140 112 136 110 128 108 Z", 1, 0, 0);
      scaled("M192 108 C228 92 276 140 280 214 C283 268 248 300 208 288 C186 281 180 262 180 238 L180 122 C180 112 184 110 192 108 Z", 1, 0, 0);
      break;
    case "sunrise":
      ctx.beginPath();
      ctx.arc(160, 232, 82, Math.PI, 0);
      ctx.fill();
      ctx.lineWidth = 13;
      ctx.beginPath();
      ctx.moveTo(18, 250);
      ctx.lineTo(302, 250);
      for (let i = 0; i < 7; i++) {
        const a = Math.PI + (i / 6) * Math.PI;
        ctx.moveTo(160 + Math.cos(a) * 110, 232 + Math.sin(a) * 110);
        ctx.lineTo(160 + Math.cos(a) * 140, 232 + Math.sin(a) * 140);
      }
      ctx.stroke();
      break;
  }
  const d = ctx.getImageData(0, 0, S, S).data;
  const inside: number[] = [];
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) if (d[(y * S + x) * 4 + 3] > 140) inside.push(x, y);
  const r = rng(seed);
  const count = inside.length / 2;
  if (!count) return out;
  for (let i = 0; i < n; i++) {
    const k = Math.floor(r() * count) * 2;
    out[i * 2] = (inside[k] + r()) / S;
    out[i * 2 + 1] = (inside[k + 1] + r()) / S;
  }
  return out;
}

/**
 * Each travelling shape is alive: returns an offset (unit space), a size
 * multiplier and an alpha multiplier for one dot at centred coords (ex, ey).
 */
const anim = [0, 0, 1, 1];
function animateIcon(icon: Icon, ex: number, ey: number, t: number, rnd: number) {
  let dx = 0, dy = 0, size = 1, alpha = 1;
  const u = ex + 0.5;
  switch (icon) {
    case "pulse": {
      // A heart-monitor sweep: the bright head draws the line, the trail fades.
      const head = ((t * 0.42) % 1.35) - 0.15;
      const behind = head - u;
      alpha = behind >= 0 ? 0.12 + 0.88 * Math.max(0, 1 - behind / 0.85) : 0.12;
      size = 1 + 1.4 * Math.exp(-Math.pow(behind * 14, 2));
      break;
    }
    case "heart": {
      // Lub-dub.
      const ph = (t * 1.15) % 1;
      const beat = Math.exp(-Math.pow((ph - 0.1) * 13, 2)) * 0.11 + Math.exp(-Math.pow((ph - 0.3) * 13, 2)) * 0.065;
      dx = ex * beat;
      dy = ey * beat;
      size = 1 + beat * 3;
      break;
    }
    case "lungs": {
      // Breathe in and out (the windpipe stays put).
      const br = Math.sin(t * 1.25) * 0.07;
      const lobe = Math.abs(ex) > 0.05 ? 1 : 0.2;
      dx = ex * br * 1.3 * lobe;
      dy = (ey + 0.1) * br * 0.45 * lobe;
      alpha = 0.75 + 0.25 * (br / 0.07 * 0.5 + 0.5);
      break;
    }
    case "breath": {
      // Air flowing: the waves ripple and travel.
      dy = Math.sin(u * 13 - t * 3.2) * 0.028;
      alpha = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(u * 9 - t * 3.2));
      break;
    }
    case "zzz": {
      // Each letter drifts up and fades, one after another.
      const ph = (t * 0.32 + (1 - u) * 0.55) % 1;
      dy = 0.05 - ph * 0.14;
      dx = Math.sin(ph * Math.PI * 2) * 0.012;
      alpha = Math.sin(ph * Math.PI);
      break;
    }
    case "moon": {
      // Gentle rocking; the stars twinkle.
      const a = Math.sin(t * 0.6) * 0.1;
      dx = ex * Math.cos(a) - ey * Math.sin(a) - ex;
      dy = ex * Math.sin(a) + ey * Math.cos(a) - ey;
      if (ex > 0.2 && ey < -0.05) alpha = 0.3 + 0.7 * Math.abs(Math.sin(t * 2.6 + rnd * 20));
      break;
    }
    case "tooth": {
      // A shine sweeps across.
      const band = ((t * 0.32) % 1.7) - 0.35;
      const g = Math.exp(-Math.pow(((ex + ey + 1) / 2 - band) * 9, 2));
      size = 1 + 1.3 * g;
      alpha = 0.7 + 0.3 * g;
      break;
    }
    case "sunrise": {
      // The sun rises a little and the rays pulse.
      const rise = (Math.sin(t * 0.55) * 0.5 + 0.5) * 0.05;
      const r = Math.hypot(ex, ey - 0.225);
      if (ey < 0.26 && r < 0.27) dy = -rise;
      else if (ey < 0.26) alpha = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 2.2 - r * 10));
      break;
    }
    default:
      break;
  }
  anim[0] = dx;
  anim[1] = dy;
  anim[2] = size;
  anim[3] = alpha;
  return anim;
}

const particleMedia = `${particleViewport} and (prefers-reduced-motion: no-preference)`;

function subscribeToParticleMedia(onChange: () => void) {
  const media = window.matchMedia(particleMedia);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

export function ParticleMorph() {
  const enabled = useSyncExternalStore(
    subscribeToParticleMedia,
    () => window.matchMedia(particleMedia).matches,
    () => false,
  );
  return enabled ? <ParticleCanvas /> : null;
}

function ParticleCanvas() {
  const host = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    let teardown = () => {};

    (async () => {
      // Let the new page lay out (and its AOS reveals settle) before measuring.
      await new Promise((r) => setTimeout(r, 450));
      if (disposed) return;
      const THREE = await import("three");
      const emblemImg = await new Promise<HTMLImageElement | null>((res) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = () => res(null);
        i.src = "/assets/site/beyonn-emblem.png";
      });
      if (disposed) return;

      const N = 2400;

      // ---- Targets ----------------------------------------------------------
      type Target = { node: HTMLElement; kind: Kind; hide: boolean; decor: boolean; dark: boolean; pts: Float32Array; sweep: Float32Array };
      const darkness = (node: HTMLElement) => {
        for (let p: HTMLElement | null = node; p; p = p.parentElement) {
          const cs = getComputedStyle(p);
          const m = cs.backgroundColor.match(/[\d.]+/g)?.map(Number);
          if (m && (m[3] === undefined || m[3] > 0.5)) return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255 < 0.4;
          if (cs.backgroundImage && cs.backgroundImage !== "none" && p.tagName === "SECTION") return true;
        }
        return false;
      };
      const shapeFor = (node: HTMLElement, kind: Kind, i: number) => {
        const pts = (kind === "rect" && cardOutlines(node, N, 31 + i * 7)) || sampleShape(kind, N, emblemImg, 31 + i * 7);
        // Order in which dots leave / arrive: a diagonal wave across the shape.
        const sweep = new Float32Array(N);
        const r = rng(91 + i);
        for (let j = 0; j < N; j++) sweep[j] = clamp(pts[j * 2] * 0.62 + pts[j * 2 + 1] * 0.38 + (r() - 0.5) * 0.18);
        return { pts, sweep };
      };
      const all: Target[] = Array.from(document.querySelectorAll<HTMLElement>("main [data-morph-shape]")).map((node, i) => {
        const kind = (node.dataset.morphShape as Kind) ?? "rect";
        return { node, kind, hide: true, decor: node.hasAttribute("data-morph-hide"), dark: darkness(node), ...shapeFor(node, kind, i) };
      });
      if (all.length < 2) return;
      // Shape the travelling swarm takes: the Beyonn emblem.
      // The travelling swarm takes a different on-theme shape on each leg, in a
      // fresh random order every visit.
      const swarmShapes = SWARM_ICONS.map((icon, i) => sampleIcon(icon, N, emblemImg, 700 + i * 13));
      // `?swarm=<icon>` pins the shape (handy for checking each animation).
      const pinned = SWARM_ICONS.indexOf(new URLSearchParams(window.location.search).get("swarm") as Icon);
      const swarmOffset = Math.floor(Math.random() * swarmShapes.length);

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" });
      } catch {
        return;
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      renderer.setPixelRatio(dpr);
      // Always transparent: some GPUs otherwise clear the full-screen layer to black.
      renderer.setClearColor(0x000000, 0);
      renderer.setClearAlpha(0);
      renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;background:transparent;";
      renderer.domElement.setAttribute("aria-hidden", "true");
      el.appendChild(renderer.domElement);

      // ---- Dots: head + two trail echoes + soft halo -----------------------
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
      const size = new Float32Array(N);
      const rnd = new Float32Array(N);
      const lane = new Float32Array(N);
      const depth = new Float32Array(N);
      const dir = new Float32Array(N * 2);
      const r = rng(7);
      for (let i = 0; i < N; i++) {
        size[i] = 0.55 + Math.pow(r(), 2) * 1.35;
        rnd[i] = r();
        lane[i] = (r() - 0.5) * 2;
        depth[i] = (r() - 0.5) * 2;
        const a = r() * Math.PI * 2;
        dir[i * 2] = Math.cos(a);
        dir[i * 2 + 1] = Math.sin(a);
      }
      const cur = new Float32Array(N * 3);
      const prev1 = new Float32Array(N * 3);
      const prev2 = new Float32Array(N * 3);
      const scl = new Float32Array(N);
      const fade = new Float32Array(N).fill(1);
      const makeGeo = (positions: Float32Array) => {
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
        g.setAttribute("aRnd", new THREE.BufferAttribute(rnd, 1));
        g.setAttribute("aScale", new THREE.BufferAttribute(scl, 1));
        g.setAttribute("aFade", new THREE.BufferAttribute(fade, 1));
        return g;
      };
      const vertexShader = `
        attribute float aSize; attribute float aRnd; attribute float aScale; attribute float aFade;
        uniform float uSize; uniform float uTime; varying float vRnd; varying float vTw; varying float vFade;
        void main(){
          vRnd = aRnd;
          vFade = aFade;
          vTw = 0.72 + 0.28 * sin(uTime * (2.0 + aRnd * 3.0) + aRnd * 60.0);
          gl_PointSize = uSize * aSize * aScale;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`;
      const fragmentShader = `
        uniform float uAlpha; uniform vec3 uColorA; uniform vec3 uColorB; uniform float uSoft;
        varying float vRnd; varying float vTw; varying float vFade;
        void main(){
          float d = length(gl_PointCoord - 0.5) * 2.0;
          if (d > 1.0) discard;
          float a = pow(1.0 - d, uSoft);
          gl_FragColor = vec4(mix(uColorA, uColorB, vRnd * 0.8), a * uAlpha * vTw * vFade);
        }`;
      const makeMat = (soft: number, additive: boolean) =>
        new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          depthTest: false,
          blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
          uniforms: {
            uSize: { value: 1 },
            uAlpha: { value: 0 },
            uTime: { value: 0 },
            uSoft: { value: soft },
            uColorA: { value: new THREE.Color() },
            uColorB: { value: new THREE.Color() },
          },
          vertexShader,
          fragmentShader,
        });
      const headGeo = makeGeo(cur);
      const trail1Geo = makeGeo(prev1);
      const trail2Geo = makeGeo(prev2);
      const halo = makeMat(3.2, true);
      const head = makeMat(1.4, false);
      const t1 = makeMat(1.6, false);
      const t2 = makeMat(1.8, false);
      const layers: [import("three").BufferGeometry, import("three").ShaderMaterial, number][] = [
        [headGeo, halo, 3.4],
        [trail2Geo, t2, 0.7],
        [trail1Geo, t1, 0.85],
        [headGeo, head, 1],
      ];
      for (const [g, m] of layers) {
        const p = new THREE.Points(g, m);
        p.frustumCulled = false;
        scene.add(p);
      }

      const onLight = [new THREE.Color("#2b74d1"), new THREE.Color("#1f9e80")];
      const onDark = [new THREE.Color("#e2f1ff"), new THREE.Color("#8fe6cf")];
      const glowDark = new THREE.Color("#5fc8ff");

      let vw = 1, vh = 1;
      const resize = () => {
        vw = window.innerWidth;
        vh = window.innerHeight;
        renderer.setSize(vw, vh, false);
        camera.left = 0;
        camera.right = vw;
        camera.top = 0;
        camera.bottom = -vh;
        camera.updateProjectionMatrix();
      };
      resize();
      let remeasure = 0;
      const onResize = () => {
        resize();
        window.clearTimeout(remeasure);
        remeasure = window.setTimeout(() => {
          all.forEach((t, i) => {
            if (t.kind === "rect") Object.assign(t, shapeFor(t.node, t.kind, i));
          });
        }, 250);
      };
      window.addEventListener("resize", onResize);

      const pointer = { x: -9999, y: -9999 };
      const onPointer = (e: PointerEvent) => {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
      };
      const onLeave = () => {
        pointer.x = pointer.y = -9999;
      };
      window.addEventListener("pointermove", onPointer, { passive: true });
      document.addEventListener("pointerleave", onLeave);

      /** Show / hide decor targets, and give a target a short glow + settle as it is rebuilt. */
      const style = (t: Target, opacity: number, pulse: number, dark: boolean) => {
        const n = t.node.style;
        if (t.hide) {
          const o = opacity >= 0.999 ? "" : opacity.toFixed(3);
          if (n.opacity !== o) n.opacity = o;
          const s = opacity >= 0.999 || opacity <= 0.001 ? "" : (1.05 - 0.05 * opacity).toFixed(4);
          if (n.scale !== s) n.scale = s;
        }
        const f = pulse < 0.01 ? "" : `drop-shadow(0 0 ${(18 * pulse).toFixed(1)}px rgb(${dark ? "114 207 183" : "49 119 191"} / ${(0.55 * pulse).toFixed(2)}))`;
        if (n.filter !== f) n.filter = f;
      };

      let raf = 0;
      let pairA: Target | null = null;
      let pairB: Target | null = null;
      let dShown = 0;
      let rShown = 0;
      let time = 0;
      let last = performance.now();
      let visible = false;
      let warm = 0; // frames since trails were last valid

      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        if (document.hidden) return;
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        time += dt;

        // Visible targets only (some exist only on desktop), in page order.
        const live: { t: Target; rc: DOMRect }[] = [];
        for (const t of all) {
          const rc = t.node.getBoundingClientRect();
          if (rc.width > 0 && rc.height > 0) live.push({ t, rc });
        }
        if (live.length < 2) return;

        // Which two targets the viewport is between, and how far along.
        const mid = vh * 0.62;
        let k = 0;
        // Reference point: a little below each element's top, so a target is
        // finished as it comes into view rather than when it reaches the middle.
        const refOf = (rc: DOMRect) => rc.top + Math.min(rc.height, vh) * 0.28;
        for (let i = 0; i < live.length; i++) if (refOf(live[i].rc) <= mid) k = i;
        const a = live[k];
        const b = live[Math.min(live.length - 1, k + 1)];
        const cb = refOf(b.rc);
        // Two phases, each tied to what is on screen:
        //  D (departure): the source has started scrolling away, so it breaks and
        //    the dots gather into a small swarm at the side of the screen;
        //  R (arrival): the target is coming into view, so the swarm streams in
        //    and builds it. Long gaps between targets: the swarm travels along at
        //    the screen edge, always visible. Short gaps: both phases overlap.
        let D = 0;
        let R = 0;
        if (a !== b) {
          const left = k === 0 ? window.scrollY : Math.max(0, vh * 0.5 - a.rc.bottom);
          D = clamp(left / (vh * 0.55));
          const arrive = cb - mid;
          R = arrive <= 0 ? 1 : clamp(1 - arrive / (vh * 0.6));
          D = Math.max(D, R);
        }
        if (pairA !== a.t || pairB !== b.t) {
          pairA = a.t;
          pairB = b.t;
          dShown = D;
          rShown = R;
        } else {
          // Follow the scroll with a little easing so fast flicks stay fluid.
          const f = 1 - Math.exp(-dt * 9);
          dShown += (D - dShown) * f;
          rShown += (R - rShown) * f;
        }
        const dp = dShown, rp = rShown;

        const pulseB = Math.sin(Math.PI * clamp((rp - 0.75) / 0.25));
        // Background emblems break away and move on: only the one the dots are on shows.
        // Content (cards, ring, window) stays hidden until built, then stays built;
        // scrolling back up un-builds it in reverse.
        const kIndex = live.findIndex((l) => l.t === a.t);
        live.forEach((l, i) => {
          const t = l.t;
          if (t === a.t || t === b.t) return;
          style(t, t.decor ? 0 : i < kIndex ? 1 : 0, 0, t.dark);
        });
        for (const t of all) if (!live.some((l) => l.t === t)) style(t, 1, 0, t.dark);
        if (a === b) style(a.t, 1, 0, a.t.dark);
        else {
          style(a.t, a.t.decor ? 1 - smooth(clamp(dp / 0.15)) : 1, 0, a.t.dark);
          style(b.t, smooth(clamp((rp - 0.8) / 0.2)), pulseB, b.t.dark);
        }

        // Dots show from the moment the source starts breaking until the target is built.
        const alpha = a === b ? 0 : smooth(clamp(dp / 0.05)) * (1 - smooth(clamp((rp - 0.9) / 0.1)));
        if (alpha < 0.005) {
          if (visible) {
            el.style.visibility = "hidden";
            visible = false;
          }
          warm = 0;
          return;
        }
        if (!visible) {
          el.style.visibility = "visible";
          visible = true;
        }

        const darkMix = (a.t.dark ? 1 - rp : 0) + (b.t.dark ? rp : 0);
        const flight = clamp(Math.sin(Math.min(dp, 0.5) * Math.PI) * (1 - rp) + Math.sin(rp * Math.PI) * 0.6);
        for (const [, mat, sz] of layers) {
          mat.uniforms.uTime.value = time;
          mat.uniforms.uSize.value = 3.8 * dpr * sz;
          const A = mat.uniforms.uColorA.value as import("three").Color;
          const B = mat.uniforms.uColorB.value as import("three").Color;
          A.copy(onLight[0]).lerp(onDark[0], darkMix);
          B.copy(onLight[1]).lerp(onDark[1], darkMix);
        }
        (halo.uniforms.uColorA.value as import("three").Color).copy(glowDark);
        (halo.uniforms.uColorB.value as import("three").Color).copy(onDark[1]);
        const base = alpha;
        head.uniforms.uAlpha.value = base;
        t1.uniforms.uAlpha.value = base * 0.42 * flight;
        t2.uniforms.uAlpha.value = base * 0.2 * flight;
        halo.uniforms.uAlpha.value = base * (0.08 + 0.16 * flight) * (0.35 + 0.65 * darkMix) * (1 - 0.65 * clamp(dp * (1 - rp)));

        // The cruising swarm sits at a screen edge (alternating left / right).
        const side = k % 2 === 0 ? 1 : -1;
        const edgeX = side > 0 ? vw * 0.9 : vw * 0.1;
        const swarmY = vh * 0.5 + Math.sin(time * 0.4) * 24;
        const swarmW = 300;
        const turn = Math.sin(time * 0.55) * 0.32;
        const turnC = Math.cos(turn), turnS = Math.sin(turn);
        const twist = flight * 0.9 * side;
        const ct = Math.cos(twist), st = Math.sin(twist);
        const pa = a.t.pts, pb = b.t.pts, sa = a.t.sweep, sb = b.t.sweep;
        const swarmIndex = pinned >= 0 ? pinned : (k + swarmOffset) % swarmShapes.length;
        const swarmPts = swarmShapes[swarmIndex];
        const swarmIcon = SWARM_ICONS[swarmIndex];

        prev2.set(prev1);
        prev1.set(cur);

        for (let i = 0; i < N; i++) {
          // Leave in a wave across the source, arrive in a wave across the target.
          const du = smooth(clamp((dp - 0.3 * sa[i]) / 0.7));
          const ru = smooth(clamp((rp - 0.3 * sb[i]) / 0.7));
          const ax = a.rc.left + pa[i * 2] * a.rc.width;
          const ay = a.rc.top + pa[i * 2 + 1] * a.rc.height;
          const bx = b.rc.left + pb[i * 2] * b.rc.width;
          const by = b.rc.top + pb[i * 2 + 1] * b.rc.height;
          // The swarm holds the Beyonn emblem while it travels, slowly turning in 3D.
          const ex = swarmPts[i * 2] - 0.5;
          const ey = swarmPts[i * 2 + 1] - 0.5;

          const [adx, ady, aSize, aAlpha] = animateIcon(swarmIcon, ex, ey, time, rnd[i]);
          const tilt = swarmIcon === "emblem" ? turnC : 1;
          const sx = edgeX + (ex + adx) * swarmW * tilt + depth[i] * 6 * turnS;
          const sy = swarmY + (ey + ady) * swarmW * 0.92;
          // Source -> swarm, then swarm -> target, each along a gentle curve.
          const bendA = Math.sin(du * Math.PI) * lane[i] * 40;
          const bendB = Math.sin(ru * Math.PI) * lane[i] * 40;
          const mx = ax + (sx - ax) * du + bendA;
          const my = ay + (sy - ay) * du - bendA * 0.5;
          let x = mx + (bx - mx) * ru + bendB;
          let y = my + (by - my) * ru - bendB * 0.5;
          // In the air: a soft peel-off burst and a sway that moves the swarm as one body.
          const fly = clamp(Math.sin(du * Math.PI) * 0.6 + du * (1 - ru)) * (1 - ru * ru);
          const loose = (Math.sin(du * Math.PI) + Math.sin(ru * Math.PI)) * (6 + rnd[i] * 20);
          x += dir[i * 2] * loose + (Math.sin(time * 0.9 + rnd[i] * 4) * 6 + Math.sin(time * 1.7 + rnd[i] * 14) * 3) * fly * (1 - 0.8 * du * (1 - ru));
          y += dir[i * 2 + 1] * loose + (Math.cos(time * 0.7 + rnd[i] * 3) * 5 + Math.cos(time * 1.5 + rnd[i] * 9) * 3) * fly * (1 - 0.8 * du * (1 - ru));
          // 3D twist.
          const z = depth[i] * 36 * fly * (1 - 0.8 * du * (1 - ru));
          x += z * st;
          const zs = z * ct;
          // Formed shapes breathe a little.
          const rest = 1 - fly;
          x += Math.sin(time * 1.6 + rnd[i] * 30) * 0.8 * rest;
          y += Math.cos(time * 1.4 + rnd[i] * 25) * 0.8 * rest;
          // Dots move aside for the cursor.
          const dx = x - pointer.x, dy = y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 120 * 120) {
            const d = Math.sqrt(d2) || 1;
            const push = (1 - d / 120) * 34;
            x += (dx / d) * push;
            y += (dy / d) * push;
          }
          // Over the reading column, a stream in flight thins out so copy stays readable.
          const dc = Math.abs(x - vw / 2) / (Math.min(vw, 1312) / 2);
          const cruiseA = du * (1 - ru);
          fade[i] = (1 - 0.55 * fly * (1 - smooth(clamp((dc - 0.5) / 0.45)))) * (1 + (aAlpha - 1) * cruiseA);
          cur[i * 3] = x;
          cur[i * 3 + 1] = -y;
          cur[i * 3 + 2] = 0;
          // While cruising as the emblem, dots are finer so the logo reads crisply.
          const cruise = du * (1 - ru);
          scl[i] = (1 + (zs / 36) * 0.3 * fly) * (1 - 0.42 * cruise) * (1 + (aSize - 1) * cruise);
        }
        if (warm < 2) {
          prev1.set(cur);
          prev2.set(cur);
        }
        warm++;
        headGeo.attributes.position.needsUpdate = true;
        headGeo.attributes.aScale.needsUpdate = true;
        headGeo.attributes.aFade.needsUpdate = true;
        trail1Geo.attributes.aFade.needsUpdate = true;
        trail2Geo.attributes.aFade.needsUpdate = true;
        trail1Geo.attributes.position.needsUpdate = true;
        trail2Geo.attributes.position.needsUpdate = true;
        renderer.render(scene, camera);
      };
      raf = requestAnimationFrame(frame);

      teardown = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", onResize);
        window.clearTimeout(remeasure);
        window.removeEventListener("pointermove", onPointer);
        document.removeEventListener("pointerleave", onLeave);
        for (const t of all) {
          t.node.style.opacity = "";
          t.node.style.scale = "";
          t.node.style.filter = "";
        }
        el.style.visibility = "hidden";
        [headGeo, trail1Geo, trail2Geo].forEach((g) => g.dispose());
        [halo, head, t1, t2].forEach((m) => m.dispose());
        renderer.dispose();
        renderer.domElement.remove();
      };
    })().catch(() => {});

    return () => {
      disposed = true;
      teardown();
    };
  }, [pathname]);

  return <div ref={host} data-particle-morph className="pointer-events-none fixed inset-0 z-[35]" style={{ visibility: "hidden" }} aria-hidden />;
}
