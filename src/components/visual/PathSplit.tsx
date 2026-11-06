"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

type Side = "practice" | "patients";

const sides = {
  practice: {
    word: "practice",
    line: ["OSA + TMD care your", "whole team can run."],
    tags: [["Protocols", "Training", "Platform"], ["Medical billing", "Case support"]],
    cta: { label: "See if you qualify", href: "/qualify" },
    gradient: "from-white via-[#d8ecff] to-[#7fb8f0]",
  },
  patients: {
    word: "patients",
    line: ["Sleep deeper. Wake up", "without the jaw pain."],
    tags: [["Snoring", "Sleep apnea", "TMJ"], ["Headaches", "Find a provider"]],
    cta: { label: "Start here", href: "/patients" },
    gradient: "from-white via-[#d9f6ee] to-[#72cfb7]",
  },
} as const;

const clamp = (x: number) => Math.min(1, Math.max(0, x));

/**
 * Closing split: two paths side by side. Hovering (or, on phones, scrolling to)
 * one half brings it to life while the other dims. The practice side is a
 * field of soft merging light blobs (WebGL metaballs); the patient side is a
 * fountain of light rising from one point (canvas particles).
 */
export function PathSplit() {
  const root = useRef<HTMLElement>(null);
  const blobs = useRef<HTMLCanvasElement>(null);
  const streams = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState<Side>("practice");
  const activeRef = useRef<Side>("practice");
  const redraw = useRef<() => void>(() => {});
  useEffect(() => {
    activeRef.current = active;
    redraw.current();
  }, [active]);

  // Phones and tablets: the half nearest the middle of the screen is active.
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(hover: hover) and (min-width: 1024px)").matches) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive((e.target as HTMLElement).dataset.side as Side);
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    el.querySelectorAll<HTMLElement>("[data-side]").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = root.current;
    const blobCanvas = blobs.current;
    const streamCanvas = streams.current;
    if (!el || !blobCanvas || !streamCanvas) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    // ---- Practice: WebGL metaballs ----------------------------------------
    const gl = blobCanvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
    const BALLS = 12;
    let program: WebGLProgram | null = null;
    let uRes: WebGLUniformLocation | null = null;
    let uBalls: WebGLUniformLocation | null = null;
    let uK: WebGLUniformLocation | null = null;
    if (gl) {
      const vs = "attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }";
      const fs = `precision mediump float;
        uniform vec2 res; uniform float k; uniform vec3 balls[${BALLS}];
        void main(){
          vec2 p = gl_FragCoord.xy / res.y;
          float f = 0.0; float core = 0.0;
          for (int i = 0; i < ${BALLS}; i++) {
            vec2 d = p - balls[i].xy; float r = balls[i].z; float dd = dot(d, d);
            f += r * r / dd;
            core += exp(-dd / (r * r * 0.18));
          }
          float body = smoothstep(0.85, 1.25, f);
          float rim = smoothstep(0.55, 1.0, f) - body;
          vec3 deep = vec3(0.07, 0.19, 0.42);
          vec3 blue = vec3(0.19, 0.47, 0.82);
          vec3 mint = vec3(0.50, 0.88, 0.78);
          vec3 col = mix(deep, blue, clamp(f * 0.35, 0.0, 1.0));
          col += mint * clamp(core, 0.0, 1.0) * 0.55;
          float a = (body + rim * 0.35) * (0.1 + 0.9 * k);
          gl_FragColor = vec4(col * a, a);
        }`;
      const compile = (type: number, src: string) => {
        const s = gl.createShader(type)!;
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
      };
      program = gl.createProgram()!;
      gl.attachShader(program, compile(gl.VERTEX_SHADER, vs));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) program = null;
      if (program) {
        gl.useProgram(program);
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(program, "p");
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        uRes = gl.getUniformLocation(program, "res");
        uBalls = gl.getUniformLocation(program, "balls");
        uK = gl.getUniformLocation(program, "k");
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      }
    }
    const seeds = Array.from({ length: BALLS }, (_, i) => ({
      ax: 0.15 + ((i * 37) % 70) / 100,
      ay: 0.12 + ((i * 53) % 76) / 100,
      sx: 0.12 + (i % 5) * 0.05,
      sy: 0.1 + (i % 4) * 0.06,
      ph: i * 1.7,
      r: 0.05 + (i % 4) * 0.018,
    }));
    const ballData = new Float32Array(BALLS * 3);
    const pointer = { x: 0.5, y: 0.5, on: false };

    // ---- Patients: rising light fountain -----------------------------------
    const ctx = streamCanvas.getContext("2d");
    type P = { x: number; y: number; vx: number; vy: number; life: number; max: number };
    const parts: P[] = [];

    let wB = 1, hB = 1, wS = 1, hS = 1;
    const resize = () => {
      const rb = blobCanvas.getBoundingClientRect();
      wB = Math.max(1, rb.width);
      hB = Math.max(1, rb.height);
      blobCanvas.width = Math.round(wB * dpr * 0.6); // metaballs are soft; render lighter
      blobCanvas.height = Math.round(hB * dpr * 0.6);
      const rs = streamCanvas.getBoundingClientRect();
      wS = Math.max(1, rs.width);
      hS = Math.max(1, rs.height);
      streamCanvas.width = Math.round(wS * dpr);
      streamCanvas.height = Math.round(hS * dpr);
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(blobCanvas);
    ro.observe(streamCanvas);

    const onMove = (e: PointerEvent) => {
      const r = blobCanvas.getBoundingClientRect();
      pointer.x = (e.clientX - r.left) / r.height;
      pointer.y = 1 - (e.clientY - r.top) / r.height;
      pointer.on = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    };
    el.addEventListener("pointermove", onMove, { passive: true });

    const k = { practice: 1, patients: 0.25 };
    let raf = 0;
    let last = performance.now();
    let t = 0;
    let onScreen = false;

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!still) t += dt;
      const a = activeRef.current;
      k.practice += ((a === "practice" ? 1 : 0.15) - k.practice) * (still ? 1 : 0.06);
      k.patients += ((a === "patients" ? 1 : 0.18) - k.patients) * (still ? 1 : 0.06);

      // metaballs
      if (gl && program) {
        gl.viewport(0, 0, blobCanvas.width, blobCanvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        const aspect = wB / hB;
        const speed = 0.35 + k.practice * 0.65;
        seeds.forEach((s, i) => {
          let x = (s.ax + Math.sin(t * s.sx * speed + s.ph) * 0.16) * aspect;
          let y = s.ay + Math.cos(t * s.sy * speed + s.ph * 1.3) * 0.14;
          if (i === 0 && pointer.on) {
            x = pointer.x;
            y = pointer.y;
          }
          ballData[i * 3] = x;
          ballData[i * 3 + 1] = y;
          ballData[i * 3 + 2] = s.r * (0.85 + k.practice * 0.25);
        });
        gl.uniform2f(uRes, blobCanvas.width, blobCanvas.height);
        gl.uniform3fv(uBalls, ballData);
        gl.uniform1f(uK, k.practice);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }

      // fountain
      if (ctx) {
        ctx.globalCompositeOperation = "source-over";
        ctx.clearRect(0, 0, wS, hS);
        const ox = wS / 2;
        const oy = hS * 0.94;
        const kp = k.patients;
        const glow = ctx.createRadialGradient(ox, oy, 0, ox, oy, hS * 0.55);
        glow.addColorStop(0, `rgba(114,207,183,${0.32 * kp})`);
        glow.addColorStop(0.4, `rgba(49,119,191,${0.14 * kp})`);
        glow.addColorStop(1, "rgba(19,37,62,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, wS, hS);
        if (!still) {
          const spawn = Math.round(2 + kp * 9);
          for (let i = 0; i < spawn && parts.length < 520; i++) {
            const ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.92;
            const sp = (hS * (0.35 + Math.random() * 0.55)) * (0.6 + kp * 0.6);
            parts.push({ x: ox, y: oy, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 0, max: 1.4 + Math.random() * 1.6 });
          }
        }
        ctx.globalCompositeOperation = "lighter";
        ctx.lineCap = "round";
        for (let i = parts.length - 1; i >= 0; i--) {
          const p = parts[i];
          p.life += dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vx *= 0.995;
          if (p.life > p.max || p.y < -20 || p.x < -20 || p.x > wS + 20) {
            parts.splice(i, 1);
            continue;
          }
          const lifeK = 1 - p.life / p.max;
          const alpha = Math.min(1, p.life * 4) * lifeK * (0.25 + kp * 0.75);
          const len = 0.035 + 0.03 * kp;
          const mix = clamp((oy - p.y) / hS);
          ctx.strokeStyle = `rgba(${Math.round(114 + 120 * mix)},${Math.round(207 + 40 * mix)},${Math.round(183 + 60 * mix)},${alpha.toFixed(3)})`;
          ctx.lineWidth = 0.7 + lifeK * 0.8;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * len, p.y - p.vy * len);
          ctx.stroke();
        }
      }
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      draw(now);
    };
    const run = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      if (onScreen && !document.hidden) {
        if (still) draw(last);
        else raf = requestAnimationFrame(frame);
      }
    };
    // Reduced motion: no loop, just redraw when the active side changes.
    redraw.current = () => {
      if (still && onScreen) draw(performance.now());
    };
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      run();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", run);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      el.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", run);
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <section ref={root} id="paths" className="relative isolate overflow-hidden bg-[#050d1a] text-paper" aria-label="Two paths: dental teams and patients">
      <div className="relative grid lg:grid-cols-2">
        {(["practice", "patients"] as const).map((side) => {
          const s = sides[side];
          const on = active === side;
          return (
            <div
              key={side}
              data-side={side}
              onPointerEnter={() => setActive(side)}
              className="relative flex min-h-[78svh] flex-col items-center justify-center overflow-hidden px-6 py-20 text-center lg:min-h-[88svh]"
            >
              <canvas
                ref={side === "practice" ? blobs : streams}
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
              />
              <p className={cn("text-[0.72rem] font-medium uppercase tracking-[0.55em] transition-colors duration-700", on ? "text-paper/80" : "text-paper/30")}>
                {side === "practice" ? "For dental teams" : "For patients"}
              </p>
              <h2
                className={cn(
                  "mt-5 bg-gradient-to-br bg-clip-text pb-3 font-display text-[clamp(3.6rem,8.5vw,8.25rem)] font-semibold leading-[0.95] tracking-[-0.055em] text-transparent transition-[opacity,filter] duration-700",
                  s.gradient,
                  on ? "opacity-100" : "opacity-35 saturate-0",
                )}
              >
                {s.word}
              </h2>
              <p className={cn("mt-6 font-display text-[clamp(1.15rem,1.7vw,1.55rem)] leading-snug transition-colors duration-700", on ? "text-paper" : "text-paper/35")}>
                {s.line[0]}
                <br />
                {s.line[1]}
              </p>
              <div className={cn("mt-8 space-y-2 text-[0.72rem] uppercase tracking-[0.32em] transition-colors duration-700", on ? "text-paper/75" : "text-paper/25")}>
                {s.tags.map((row) => (
                  <p key={row.join()} className="flex flex-wrap justify-center gap-x-5 gap-y-1">
                    {row.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-2">
                        <span className={cn("size-1 rounded-full", side === "practice" ? "bg-[#7fb8f0]" : "bg-breath")} />
                        {tag}
                      </span>
                    ))}
                  </p>
                ))}
              </div>
              <Link
                href={s.cta.href}
                onFocus={() => setActive(side)}
                className={cn(
                  "group mt-10 inline-flex items-center gap-3 rounded-full px-8 py-3.5 text-[1.05rem] font-medium ring-1 backdrop-blur-sm transition-all duration-500",
                  on ? "bg-paper/[0.08] text-paper ring-paper/40 hover:bg-paper/[0.14]" : "text-paper/45 ring-paper/15",
                )}
              >
                {s.cta.label}
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
              </Link>
            </div>
          );
        })}

        {/* Divider with the emblem; its glowing arc turns toward the active side */}
        <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-paper/20 to-transparent lg:block" aria-hidden />
        <div className="pointer-events-none absolute left-1/2 top-1/2 hidden size-28 -translate-x-1/2 -translate-y-1/2 lg:block" aria-hidden>
          <div className="absolute inset-0 rounded-full bg-[#050d1a] ring-1 ring-paper/15" />
          <div
            className="absolute -inset-px rounded-full transition-transform duration-[900ms] ease-[var(--ease-out-expo)] [background:conic-gradient(from_0deg,transparent_0deg,transparent_200deg,rgb(114_207_183/0.9)_300deg,transparent_360deg)] [mask:radial-gradient(closest-side,transparent_calc(100%-2px),#000_calc(100%-1.5px))]"
            style={{ transform: `rotate(${active === "practice" ? 0 : 180}deg)` }}
          />
          <div className="absolute inset-7 bg-paper/85 [mask:url(/assets/site/beyonn-emblem.png)_center/contain_no-repeat] [-webkit-mask:url(/assets/site/beyonn-emblem.png)_center/contain_no-repeat]" />
        </div>
      </div>
    </section>
  );
}
