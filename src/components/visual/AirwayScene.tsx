"use client";

import { particleViewport } from "@/lib/motion";

import { useCallback, useEffect, useId, useRef, useState, type RefObject } from "react";
import type * as Three from "three";

type Props = {
  progress: RefObject<number>;
  value?: number;
  paused: boolean;
  labelsVisible: boolean;
  onReady?: () => void;
  onError?: () => void;
  onInspectChange?: (open: boolean, text?: string) => void;
};

const partDetails = {
  airway: { name: "Airway", role: "Carries air between your nose, mouth, and lungs." },
  tongue: { name: "Tongue", role: "Helps you taste, swallow, and speak." },
  softpalate: { name: "Soft palate", role: "Helps keep food out of your nose when you swallow." },
  lowerjaw: { name: "Lower jaw", role: "Holds your lower teeth and moves when you chew." },
  jawjoint: { name: "Jaw joint", role: "Connects your lower jaw to your skull and lets it move." },
  teeth: { name: "Teeth", role: "Bite and chew food." },
  appliance: { name: "Oral appliance", role: "Holds the lower jaw forward to help keep the airway open." },
  nose: { name: "Nose", role: "Filters, warms, and moistens the air you breathe." },
  skull: { name: "Skull", role: "Protects your brain and supports your face." },
  spine: { name: "Cervical spine", role: "Supports your head and protects your spinal cord." },
  epiglottis: { name: "Epiglottis", role: "Helps keep food out of your airway when you swallow." },
  tissue: { name: "Soft tissue", role: "Surrounds and supports the structures of your head and neck." },
} as const;
type PartId = keyof typeof partDetails;
const keyboardParts = Object.keys(partDetails) as PartId[];
const labelParts: Record<string, PartId> = { palate: "softpalate", airway: "airway", tongue: "tongue", jaw: "lowerjaw", appliance: "appliance" };
type Inspection = { id: PartId; object: Three.Object3D; anchor: Three.Vector3 };

const labels = [
  { id: "palate", name: "Soft palate", side: "left", y: 0.29 },
  { id: "airway", name: "Airway", side: "left", y: 0.6 },
  { id: "tongue", name: "Tongue", side: "right", y: 0.52 },
  { id: "jaw", name: "Lower jaw", side: "right", y: 0.78 },
  { id: "appliance", name: "Oral appliance", side: "right", y: 0.32 },
] as const;

const clamp = (value: number, low = 0, high = 1) => Math.min(high, Math.max(low, value));
const ease = (a: number, b: number, value: number) => {
  const t = clamp((value - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** An illustrative sagittal model. The anatomy is real geometry, not a texture. */
export function AirwayScene({ progress, value, paused, labelsVisible, onReady, onError, onInspectChange }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const overlay = useRef<SVGSVGElement>(null);
  const bubble = useRef<HTMLDivElement>(null);
  const bubbleArrow = useRef<HTMLSpanElement>(null);
  const selected = useRef<Inspection | null>(null);
  const inspectPart = useRef<((id: PartId, keyboard?: boolean) => void) | null>(null);
  const keyboardIndex = useRef(0);
  const keyboardInspection = useRef(false);
  const lastFocus = useRef<HTMLElement | null>(null);
  const [inspected, setInspected] = useState<PartId | null>(null);
  const bubbleId = useId();
  const helpId = useId();
  const wake = useRef<(() => void) | null>(null);
  const live = useRef({ paused, labelsVisible, onReady, onError, onInspectChange });

  const closeInspection = useCallback(() => {
    if (!selected.current) return;
    selected.current = null;
    setInspected(null);
    live.current.onInspectChange?.(false);
    if (keyboardInspection.current) lastFocus.current?.focus({ preventScroll: true });
    keyboardInspection.current = false;
    wake.current?.();
  }, []);

  useEffect(() => {
    live.current = { paused, labelsVisible, onReady, onError, onInspectChange };
    wake.current?.();
  }, [value, paused, labelsVisible, onReady, onError, onInspectChange]);

  useEffect(() => {
    if (!inspected) return;
    if (keyboardInspection.current) bubble.current?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
    wake.current?.();
  }, [inspected]);

  useEffect(() => {
    const element = host.current;
    const labelRoot = overlay.current;
    if (!element || !labelRoot) return;

    let disposed = false;
    let destroy = () => {};
    // Prepare at page load, independently of the section's scroll position.
    // Short setup batches let the browser paint and process input in between.
    const nextSetupBatch = async () => {
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
      return !disposed;
    };
    void (async () => {
        const [THREE, { SVGLoader }, { RoomEnvironment }] = await Promise.all([
          import("three"),
          import("three/examples/jsm/loaders/SVGLoader.js"),
          import("three/examples/jsm/environments/RoomEnvironment.js"),
        ]);
        if (disposed) return;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.domElement.style.cssText = "width:100%;height:100%;display:block;touch-action:pan-y;cursor:grab;";
        renderer.domElement.setAttribute("aria-hidden", "true");
        element.prepend(renderer.domElement);
        destroy = () => {
          renderer.dispose();
          renderer.domElement.remove();
        };

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-450, 450, 310, -310, 1, 3000);
        camera.position.set(0, 0, 1200);
        const pmrem = new THREE.PMREMGenerator(renderer);
        const room = new RoomEnvironment();
        const environmentTarget = pmrem.fromScene(room, 0.05);
        scene.environment = environmentTarget.texture;
        room.dispose();

        const model = new THREE.Group();
        model.position.set(10, 0, 0);
        model.rotation.set(-0.025, -0.24, 0);
        scene.add(model);

        const materials = new Set<Three.Material>();
        const geometries = new Set<Three.BufferGeometry>();
        const textures = new Set<Three.Texture>();
        const releaseResources = () => {
          geometries.forEach((geometry) => geometry.dispose());
          materials.forEach((material) => material.dispose());
          textures.forEach((texture) => texture.dispose());
          scene.traverse((object) => {
            if (object instanceof THREE.DirectionalLight) object.shadow.dispose();
          });
          environmentTarget.dispose();
          pmrem.dispose();
          renderer.dispose();
          renderer.domElement.remove();
        };
        // Install a cleanup before geometry creation too: a failed renderer or
        // parser should not strand a context while the fallback is displayed.
        destroy = releaseResources;
        if (!(await nextSetupBatch())) return;
        const physical = (color: string, extra: Three.MeshPhysicalMaterialParameters = {}) => {
          const material = new THREE.MeshPhysicalMaterial({
            color, roughness: 0.44, metalness: 0, clearcoat: 0.22,
            clearcoatRoughness: 0.35, ...extra,
          });
          materials.add(material);
          return material;
        };

        const skin = physical("#b98a76", { roughness: 0.62, clearcoat: 0.07 });
        const skinEdge = physical("#8b574a", { roughness: 0.62 });
        const tissue = physical("#c8867a", { roughness: 0.5 });
        const tissueEdge = physical("#8e4d4a", { roughness: 0.55 });
        const bone = physical("#e9ddc3", { roughness: 0.62, clearcoat: 0.08 });
        const boneEdge = physical("#aa9777", { roughness: 0.58 });
        const cartilage = physical("#dfb5a3", { roughness: 0.45 });
        const enamel = physical("#fff3d9", { roughness: 0.22, clearcoat: 0.65 });
        const tongueFace = physical("#bd6669", { roughness: 0.39, sheen: 0.32, sheenColor: new THREE.Color("#fbc3b6") });
        const tongueEdge = physical("#8f3f50", { roughness: 0.42 });
        const cavityMaterial = physical("#2e4a66", { roughness: 0.85, clearcoat: 0 });
        const air = physical("#6acbd5", {
          transparent: true, opacity: 0.18, roughness: 0.12,
          emissive: "#2a9cae", emissiveIntensity: 0.24, depthWrite: false,
        });
        const applianceMaterial = physical("#70c9ed", {
          transparent: true, opacity: 0, roughness: 0.16,
          clearcoat: 1, clearcoatRoughness: 0.1, depthWrite: false,
          emissive: "#1c789c", emissiveIntensity: 0.17,
        });
        const materialParts = new Map<Three.Material, PartId>([
          [skin, "tissue"], [skinEdge, "tissue"], [enamel, "teeth"],
          [tongueFace, "tongue"], [tongueEdge, "tongue"], [air, "airway"],
          [applianceMaterial, "appliance"], [cavityMaterial, "skull"],
        ]);
        const tissueDome = (x: number, y: number) => 5 * Math.max(0, 1 - ((x - 375) / 130) ** 2 - ((y - 345) / 105) ** 2);

        // Fine material relief catches the grazing studio light. Geometry UVs
        // retain anatomical units, so the texture repeats on a physical scale.
        const textureCanvas = document.createElement("canvas");
        textureCanvas.width = textureCanvas.height = 128;
        const textureContext = textureCanvas.getContext("2d");
        if (textureContext) {
          const image = textureContext.createImageData(128, 128);
          let seed = 2147;
          for (let index = 0; index < image.data.length; index += 4) {
            seed = (seed * 16807) % 2147483647;
            const shade = 115 + Math.floor((seed / 2147483647) * 30);
            image.data[index] = image.data[index + 1] = image.data[index + 2] = shade;
            image.data[index + 3] = 255;
          }
          textureContext.putImageData(image, 0, 0);
          const texture = new THREE.CanvasTexture(textureCanvas);
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set(1 / 82, 1 / 82);
          textures.add(texture);
          tongueFace.bumpMap = texture;
          tongueFace.bumpScale = 0.5;
          skin.bumpMap = texture;
          skin.bumpScale = 0.32;
          bone.bumpMap = texture;
          bone.bumpScale = 0.24;
        }

        const loader = new SVGLoader();
        const shapesFor = (path: string) => loader.parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${path}" fill="#fff" fill-rule="evenodd"/></svg>`).paths.flatMap((p) => SVGLoader.createShapes(p));

        const anatomy = (
          path: string, depth: number, z: number, material: Three.Material,
          edge: Three.Material = material, bevel = 2.5, group: Three.Group = model,
          part?: PartId,
        ) => {
          const geometry = new THREE.ExtrudeGeometry(shapesFor(path), {
            depth, bevelEnabled: bevel > 0, bevelThickness: bevel,
            bevelSize: bevel, bevelSegments: 5, curveSegments: 42, steps: 1,
          });
          // A half turn converts SVG's downward Y without reflecting the
          // triangle winding (which would cull the entire cut face).
          geometry.rotateX(Math.PI);
          geometry.translate(-305, 283, z + depth);
          if (material === tongueFace) {
            const position = geometry.getAttribute("position");
            for (let index = 0; index < position.count; index++) {
              const front = clamp((position.getZ(index) - 45) / 20);
              position.setZ(index, position.getZ(index) + tissueDome(position.getX(index) + 305, 283 - position.getY(index)) * front);
            }
            position.needsUpdate = true;
            geometry.computeVertexNormals();
          }
          geometries.add(geometry);
          const mesh = new THREE.Mesh(geometry, [material, edge]);
          mesh.castShadow = !material.transparent;
          mesh.receiveShadow = !material.transparent;
          mesh.userData.part = part ?? materialParts.get(material) ?? group.userData.part ?? (material === bone ? "skull" : "tissue");
          group.add(mesh);
          return mesh;
        };

        const tube = (points: number[][], radius: number, material: Three.Material, group = model, part?: PartId) => {
          const curve = new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x - 305, 283 - y, z + (materialParts.get(material) === "tongue" ? tissueDome(x, y) : 0))));
          const geometry = new THREE.TubeGeometry(curve, Math.max(20, points.length * 7), radius, 8, false);
          geometries.add(geometry);
          const mesh = new THREE.Mesh(geometry, material);
          mesh.castShadow = !material.transparent;
          mesh.receiveShadow = !material.transparent;
          mesh.userData.part = part ?? materialParts.get(material) ?? group.userData.part ?? (material === bone ? "skull" : "tissue");
          group.add(mesh);
          return mesh;
        };

        // Cut edges wrap around a recessed anatomical section. The holes are
        // genuinely open, exposing cavities rather than covering the anatomy.
        const shell = "M137 35 C194 8 285 1 356 16 C420 29 459 61 472 110 C481 143 473 163 483 183 C490 197 497 211 512 228 L536 257 C542 268 534 276 520 278 L507 283 C501 287 501 294 507 297 C519 301 522 307 515 313 L507 318 C516 322 518 329 511 334 C503 340 500 347 501 356 C509 380 505 405 489 420 C469 437 427 444 399 454 C363 467 346 510 344 558 L145 558 C145 504 129 460 113 417 C88 349 76 276 79 208 C81 138 96 79 137 35 Z M149 74 C105 125 105 216 111 274 C116 342 136 398 157 451 L183 525 L316 525 C320 480 340 449 375 434 C408 421 459 421 475 399 C490 376 474 345 484 328 C487 319 490 315 491 310 C484 291 483 274 505 262 C490 235 476 214 459 190 C447 172 456 143 449 115 C438 76 409 55 359 42 C289 23 207 37 149 74 Z";
        anatomy(shell, 65, -55, skin, skinEdge, 7);

        // Back wall follows the oral/pharyngeal spaces, leaving their cutaway
        // face open; warm shadow behind the bones gives meaningful depth.
        anatomy("M144 77 C195 42 290 33 357 48 C410 59 439 88 445 124 L444 177 C417 187 365 183 320 198 C285 211 271 236 264 267 L259 362 C258 406 276 429 310 438 L319 522 L181 522 C172 474 142 402 126 337 C111 277 108 214 115 162 C121 121 129 94 144 77 Z", 22, -46, tissue, tissueEdge, 4);

        // Cranial vault: thick rounded ivory cortex. The inner chamber is left
        // unfilled so the skull reads as a clean outline.
        anatomy("M145 70 C206 29 301 26 367 45 C423 61 453 97 456 139 L447 179 L429 182 C441 142 437 112 417 88 C388 56 329 45 270 48 C213 48 175 60 158 79 C143 103 146 139 165 162 C192 194 242 201 288 190 L316 187 L312 202 C248 226 183 207 151 176 C123 149 123 100 145 70 Z", 23, -16, bone, boneEdge, 3.5);
        if (!(await nextSetupBatch())) return;

        // Frontal, nasal, and maxillary bone shape the nose and hard palate.
        anatomy("M425 151 C450 151 466 168 473 194 L503 237 L491 247 C478 222 462 204 440 194 L420 192 Z M431 164 C441 156 455 163 459 174 C456 183 439 185 429 176 Z", 36, -11, bone, boneEdge, 3);
        anatomy("M430 162 C442 155 455 162 459 174 C455 184 439 185 429 176 Z", 7, -1, cavityMaterial, cavityMaterial, 2);
        tube([[424, 161, 30], [435, 151, 32], [453, 155, 32], [465, 168, 29]], 2.5, bone);
        anatomy("M316 239 C355 230 430 232 484 244 L493 265 L475 276 L449 265 C402 254 359 257 323 258 Z", 50, -10, bone, boneEdge, 2.5);

        // The cervical spine has separate bodies, discs, and processes.
        const disc = physical("#8196a0", { roughness: 0.55 });
        materialParts.set(disc, "spine");
        for (let index = 0; index < 6; index++) {
          const x = 157 + index * 1.1;
          const y = 280 + index * 40;
          anatomy(`M${x} ${y} Q${x + 23} ${y - 10} ${x + 45} ${y} L${x + 47} ${y + 24} Q${x + 20} ${y + 34} ${x - 2} ${y + 24} Z`, 45, -9, bone, boneEdge, 3.5, model, "spine");
          anatomy(`M${x - 1} ${y + 31} Q${x + 22} ${y + 35} ${x + 47} ${y + 29} L${x + 47} ${y + 35} Q${x + 20} ${y + 41} ${x - 1} ${y + 37} Z`, 35, -5, disc, disc, 1);
          anatomy(`M${x + 5} ${y + 4} L${x - 18} ${y - 2} L${x - 27} ${y + 8} L${x - 7} ${y + 18} Z`, 32, -20, bone, boneEdge, 2, model, "spine");
        }
        anatomy("M156 259 C155 239 170 229 190 231 C212 233 225 248 222 263 L207 273 L170 273 Z", 43, -10, bone, boneEdge, 3.5, model, "spine");
        if (!(await nextSetupBatch())) return;

        // Pharyngeal recess and the translucent lumen sit behind the tongue.
        anatomy("M312 203 C286 209 264 218 254 242 C237 278 239 322 240 371 L242 548 L304 548 L300 463 C291 417 280 393 284 352 L300 275 C315 250 332 233 333 216 Z", 22, -9, cavityMaterial, cavityMaterial, 3, model, "airway");
        anatomy("M501 242 C470 214 432 203 384 204 C334 204 296 209 275 235 C251 263 249 305 252 354 L257 545 L296 545 C291 480 279 431 281 383 C284 330 290 295 312 267 C326 249 345 243 374 245 L492 256 Z", 26, 12, air, air, 3);

        // Nasal turbinates, with rounded ridges, sit inside an actual cavity.
        anatomy("M321 207 C367 182 430 181 470 210 L489 238 L480 245 C439 229 377 234 326 240 C309 235 305 219 321 207 Z", 18, -2, cavityMaterial, cavityMaterial, 3, model, "nose");
        for (let ridge = 0; ridge < 3; ridge++) {
          const y = 202 + ridge * 12;
          tube([[331 + ridge * 4, y + 7, 40], [365, y, 43], [408, y - 1, 44], [449 + ridge * 6, y + 6, 37]], 3.5 - ridge * 0.5, cartilage, model, "nose");
        }
        tube([[495, 245, 35], [485, 231, 38], [472, 219, 40]], 3, tissue, model, "nose");

        const jaw = new THREE.Group();
        jaw.userData.part = "lowerjaw";
        model.add(jaw);
        // The ramus meets the condyle at the TMJ and curves under the tongue.
        anatomy("M269 221 C275 209 288 208 294 221 C292 241 286 271 288 302 L301 377 C307 408 337 428 375 430 L449 425 C467 421 474 409 478 393 L480 365 L494 361 C504 388 501 419 481 435 C460 452 414 456 376 451 C324 447 290 429 280 390 L266 306 C263 275 263 245 269 221 Z", 48, 3, bone, boneEdge, 4, jaw);
        const joint = new THREE.Mesh(new THREE.SphereGeometry(11.5, 24, 16), bone);
        geometries.add(joint.geometry);
        joint.scale.set(1, 0.8, 1.45);
        joint.castShadow = joint.receiveShadow = true;
        joint.userData.part = "jawjoint";
        joint.position.set(277 - 305, 283 - 222, 30);
        jaw.add(joint);

        // The tongue sits in its own group so its base can sink back further
        // than the jaw when the airway collapses.
        const tongue = new THREE.Group();
        tongue.userData.part = "tongue";
        jaw.add(tongue);
        // A rounded tongue is substantially extruded, including its muscular
        // side surface, rather than represented by a floating 2D oval.
        anatomy("M473 316 C463 286 424 277 388 277 C347 275 310 283 284 310 C266 332 261 360 273 385 C283 410 310 419 346 418 C389 416 436 399 459 371 C475 350 480 332 473 316 Z", 46, 10, tongueFace, tongueEdge, 9, tongue);
        const fibreMaterial = physical("#e3a096", { transparent: true, opacity: 0.38, roughness: 0.6 });
        materialParts.set(fibreMaterial, "tongue");
        const tongueSurface = [
          [[451, 384, 66], [418, 351, 66], [394, 309, 66], [386, 288, 66]],
          [[449, 388, 66], [400, 363, 66], [351, 323, 66], [316, 298, 64]],
          [[443, 391, 66], [383, 376, 66], [329, 353, 66], [285, 326, 62]],
          [[436, 397, 66], [380, 394, 66], [324, 386, 66], [281, 369, 63]],
        ];
        tongueSurface.forEach((points) => tube(points, 0.65, fibreMaterial, tongue));
        tube([[302, 308, 65], [351, 294, 66], [409, 297, 66], [450, 312, 63]], 1.4, fibreMaterial, tongue);
        if (!(await nextSetupBatch())) return;

        // Soft palate and epiglottis curve into the pharyngeal space.
        // Hinged where it meets the hard palate, so it can fall back and flutter.
        const palateHinge = new THREE.Group();
        palateHinge.position.set(326 - 305, 283 - 243, 0);
        model.add(palateHinge);
        const palate = new THREE.Group();
        palate.position.set(-(326 - 305), -(283 - 243), 0);
        palate.userData.part = "softpalate";
        palateHinge.add(palate);
        anatomy("M328 242 C314 247 300 262 292 279 C286 293 285 309 279 315 C274 319 270 315 272 305 C275 275 288 252 312 242 Z", 41, 30, tissue, tissueEdge, 3, palate, "softpalate");
        anatomy("M289 398 C280 401 273 410 269 424 C268 433 272 433 277 423 L297 408 Z", 27, 29, cartilage, tissueEdge, 2.5, jaw, "epiglottis");

        // Individual teeth establish the scale and custom fitted tray position.
        for (let tooth = 0; tooth < 6; tooth++) {
          const x = 363 + tooth * 20;
          const y = 255 + tooth * 0.75;
          anatomy(`M${x} ${y} Q${x + 8} ${y - 3} ${x + 15} ${y + 1} L${x + 16} ${y + 17} Q${x + 13} ${y + 23} ${x + 8} ${y + 20} Q${x + 2} ${y + 23} ${x} ${y + 18} Z`, 30, 58, enamel, bone, 1.8);
          const lowerY = 302 + (5 - tooth) * 1.2;
          anatomy(`M${x + 2} ${lowerY} Q${x + 9} ${lowerY - 5} ${x + 16} ${lowerY} L${x + 15} ${lowerY + 20} Q${x + 8} ${lowerY + 24} ${x + 1} ${lowerY + 20} Z`, 30, 58, enamel, bone, 1.8, jaw);
        }
        anatomy("M482 257 C490 258 495 264 494 278 L491 294 C489 300 481 299 479 294 L477 270 C477 261 478 257 482 257 Z", 33, 59, enamel, bone, 2);
        anatomy("M482 299 C489 295 494 299 492 307 L487 326 C485 334 476 334 475 326 L476 310 C476 304 478 301 482 299 Z", 32, 59, enamel, bone, 2, jaw);
        anatomy("M355 325 C396 326 439 323 478 324 L484 338 C448 347 401 344 359 338 Z", 28, 41, bone, boneEdge, 2.5, jaw);
        tube([[356, 255, 83], [396, 255, 84], [439, 258, 84], [480, 264, 85]], 3.2, tissue);
        tube([[357, 329, 84], [398, 328, 84], [441, 326, 84], [480, 328, 85]], 3.2, tissue, jaw);

        // Two separately fitted, translucent trays move with their own arches.
        anatomy("M354 271 C399 272 447 278 479 278 L486 274 L493 277 L494 291 C483 295 477 291 472 289 C432 286 392 284 355 284 Z", 47, 54, applianceMaterial, applianceMaterial, 2);
        anatomy("M356 298 C398 297 439 298 476 296 L490 296 L490 307 L479 312 C435 309 395 309 356 312 Z", 47, 54, applianceMaterial, applianceMaterial, 2, jaw);
        // Side connector conveys the appliance's mandibular advancement.
        const connector = anatomy("M454 278 L463 278 L474 307 L465 310 Z", 7, 104, applianceMaterial, applianceMaterial, 1, jaw);
        if (!(await nextSetupBatch())) return;

        // Anatomical seam around the lips, plus a discreet nasal aperture.
        tube([[506, 302, 24], [499, 307, 29], [507, 313, 25]], 1.6, tissueEdge);
        anatomy("M504 262 C510 256 519 257 522 261 C521 266 515 270 507 270 Z", 8, 15, tissueEdge, tissueEdge, 1, model, "nose");

        // Narrowing is indicated with a soft, localized glow, never a large X.
        const warningMaterial = new THREE.MeshBasicMaterial({ color: "#ff927e", transparent: true, opacity: 0.65, depthWrite: false });
        materials.add(warningMaterial);
        const ringGeometry = new THREE.TorusGeometry(17, 0.9, 8, 64);
        geometries.add(ringGeometry);
        const narrowing = new THREE.Mesh(ringGeometry, warningMaterial);
        narrowing.position.set(261 - 305, 283 - 341, 90);
        model.add(narrowing);

        // The airway glow remains visible on phones; the travelling wisps are desktop-only.
        const particleQuery = window.matchMedia(particleViewport);
        const wispGroup = new THREE.Group();
        wispGroup.visible = particleQuery.matches;
        model.add(wispGroup);
        const wispCanvas = document.createElement("canvas");
        wispCanvas.width = wispCanvas.height = 64;
        const wctx = wispCanvas.getContext("2d");
        if (wctx) {
          const g = wctx.createRadialGradient(32, 32, 0, 32, 32, 32);
          g.addColorStop(0, "rgba(255,255,255,1)");
          g.addColorStop(0.35, "rgba(220,252,255,0.75)");
          g.addColorStop(1, "rgba(200,245,255,0)");
          wctx.fillStyle = g;
          wctx.fillRect(0, 0, 64, 64);
        }
        const wispTexture = new THREE.CanvasTexture(wispCanvas);
        wispTexture.colorSpace = THREE.SRGBColorSpace;
        textures.add(wispTexture);
        type Wisp = { sprite: Three.Sprite; mat: Three.SpriteMaterial; u: number; lane: number; speed: number; size: number; seed: number };
        const wisps: Wisp[] = [];
        const spawn = (w: Wisp, u: number) => {
          w.u = u;
          w.lane = (Math.random() * 2 - 1) * 0.85;
          w.speed = 0.75 + Math.random() * 0.5;
          w.size = 0.7 + Math.random() * 0.6;
          w.seed = Math.random() * 100;
        };
        for (let index = 0; index < 46; index++) {
          const mat = new THREE.SpriteMaterial({ map: wispTexture, color: index % 4 === 0 ? "#bff7ea" : "#d9f8ff", transparent: true, opacity: 0, depthWrite: false, depthTest: false, toneMapped: false });
          materials.add(mat);
          const sprite = new THREE.Sprite(mat);
          sprite.renderOrder = 20;
          wispGroup.add(sprite);
          const w = { sprite, mat, u: 0, lane: 0, speed: 1, size: 1, seed: 0 };
          spawn(w, index / 46);
          wisps.push(w);
        }
        const airflowCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(511 - 305, 283 - 255, 87),
          new THREE.Vector3(461 - 305, 283 - 229, 87),
          new THREE.Vector3(365 - 305, 283 - 222, 87),
          new THREE.Vector3(288 - 305, 283 - 242, 87),
          new THREE.Vector3(262 - 305, 283 - 290, 87),
          new THREE.Vector3(262 - 305, 283 - 365, 87),
          new THREE.Vector3(270 - 305, 283 - 448, 87),
          new THREE.Vector3(275 - 305, 283 - 535, 87),
        ]);

        const ambient = new THREE.AmbientLight("#ccdded", 0.7);
        const key = new THREE.DirectionalLight("#fff2df", 2.8);
        key.position.set(-180, 360, 600);
        key.castShadow = true;
        const shadowResolution = window.innerWidth < 768 ? 1024 : 2048;
        key.shadow.mapSize.set(shadowResolution, shadowResolution);
        key.shadow.camera.left = -360;
        key.shadow.camera.right = 360;
        key.shadow.camera.top = 390;
        key.shadow.camera.bottom = -390;
        key.shadow.camera.near = 1;
        key.shadow.camera.far = 1600;
        key.shadow.normalBias = 0.5;
        key.shadow.bias = -0.00015;
        key.shadow.camera.updateProjectionMatrix();
        const fill = new THREE.DirectionalLight("#b4e5f0", 1.15);
        fill.position.set(400, 20, 250);
        const rim = new THREE.DirectionalLight("#73c7dc", 2.2);
        rim.position.set(-300, 100, -300);
        scene.add(ambient, key, fill, rim);

        const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        let still = reducedQuery.matches;
        let inView = false;
        let raf = 0;
        let contextLost = false;
        let prepared = false;
        let width = 1;
        let height = 1;
        let last = 0;
        let clock = 0;
        let current = clamp(progress.current);
        let isDragging = false;
        const pointer = { x: 0, y: 0, yaw: 0, pitch: 0, lastX: 0, lastY: 0 };
        const press = { active: false, moved: false, x: 0, y: 0, scroll: 0, id: -1 };
        const raycaster = new THREE.Raycaster();
        const rayPoint = new THREE.Vector2();
        const pickableMeshes: Three.Mesh[] = [];
        model.traverse((object) => {
          if (object instanceof THREE.Mesh && object.userData.part) pickableMeshes.push(object);
        });
        const canInspect = (object: Three.Mesh) => {
          const objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
          return object.visible && objectMaterials.some((material) => !material.transparent || material.opacity > 0.08);
        };
        const openInspection = (id: PartId, object: Three.Object3D, anchor: Three.Vector3, keyboard = false) => {
          if (!selected.current) lastFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
          keyboardInspection.current = keyboard;
          selected.current = { id, object, anchor: object.worldToLocal(anchor.clone()) };
          setInspected(id);
          live.current.onInspectChange?.(true, `${partDetails[id].name}. ${partDetails[id].role}`);
          wake.current?.();
        };
        inspectPart.current = (id, keyboard = false) => {
          const mesh = pickableMeshes.find((object) => object.userData.part === id && canInspect(object));
          if (!mesh) return;
          if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
          const anchor = mesh.geometry.boundingBox!.getCenter(new THREE.Vector3());
          mesh.localToWorld(anchor);
          openInspection(id, mesh, anchor, keyboard);
        };
        const pick = (event: PointerEvent) => {
          const bounds = renderer.domElement.getBoundingClientRect();
          rayPoint.set(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -((event.clientY - bounds.top) / bounds.height) * 2 + 1);
          model.updateMatrixWorld(true);
          raycaster.setFromCamera(rayPoint, camera);
          const hit = raycaster.intersectObjects(pickableMeshes, false).find((intersection) => canInspect(intersection.object as Three.Mesh));
          if (!hit) { closeInspection(); return; }
          let id = hit.object.userData.part as PartId;
          // The continuous outer skin shell includes the external nose.
          if (id === "tissue") {
            const anatomical = model.worldToLocal(hit.point.clone());
            if (anatomical.x + 305 > 475 && 283 - anatomical.y > 185 && 283 - anatomical.y < 289) id = "nose";
          }
          openInspection(id, hit.object, hit.point);
        };
        const labelElements = labels.map((label) => ({
          ...label,
          line: labelRoot.querySelector<SVGPathElement>(`[data-leader="${label.id}"]`),
          point: labelRoot.querySelector<SVGCircleElement>(`[data-point="${label.id}"]`),
          text: labelRoot.querySelector<SVGTextElement>(`[data-text="${label.id}"]`),
          group: labelRoot.querySelector<SVGGElement>(`[data-label="${label.id}"]`),
          button: element.querySelector<HTMLButtonElement>(`[data-hotspot="${label.id}"]`),
        }));
        const anchors: Record<string, number[]> = {
          palate: [291, 283, 78], airway: [252, 342, 91],
          tongue: [360, 352, 68], jaw: [444, 436, 65], appliance: [477, 286, 110],
        };
        const projected = new THREE.Vector3();
        const point = new THREE.Vector3();
        const tangent = new THREE.Vector3();

        const projectLabels = (fitted: number) => {
          labelRoot.style.opacity = live.current.labelsVisible ? "1" : "0";
          model.updateMatrixWorld(true);
          // Follow the eased physical pose, keeping annotations with the
          // anatomy being explained rather than showing a static label map.
          const phase = current < 0.32 ? 0 : current < 0.8 ? 1 : 2;
          labelElements.forEach((label) => {
            if (!label.line || !label.point || !label.text || !label.group) return;
            const mobile = width < 460;
            const active = phase === 0
              ? label.id === "palate" || label.id === "airway"
              : phase === 1
                ? label.id === "jaw" || label.id === "tongue" || label.id === "appliance"
                : label.id === "airway";
            const show = !active ? 0 : label.id === "appliance" ? ease(0.2, 0.5, fitted) : 1;
            label.group.style.opacity = String(show);
            const anchor = anchors[label.id];
            projected.set(anchor[0] - 305, 283 - anchor[1], anchor[2]);
            if (label.id === "tongue") tongue.localToWorld(projected);
            else if (label.id === "jaw") jaw.localToWorld(projected);
            else model.localToWorld(projected);
            projected.project(camera);
            const px = (projected.x * 0.5 + 0.5) * width;
            const py = (-projected.y * 0.5 + 0.5) * height;
            const left = label.side === "left";
            const x = width * (left ? (mobile ? 0.025 : 0.055) : (mobile ? 0.975 : 0.945));
            const y = height * label.y;
            const endX = x + (left ? 14 : -14);
            const elbowX = left ? Math.min(px - 18, x + width * 0.16) : Math.max(px + 18, x - width * 0.16);
            label.line.setAttribute("d", `M${endX},${y + 7} L${elbowX},${y + 7} L${px},${py}`);
            label.point.setAttribute("cx", String(px));
            label.point.setAttribute("cy", String(py));
            label.text.setAttribute("x", String(x));
            label.text.setAttribute("y", String(y));
            label.text.setAttribute("text-anchor", left ? "start" : "end");
            label.text.style.fontSize = mobile ? "9px" : "11px";
            if (label.id === "airway") {
              label.text.textContent = phase === 2 ? "More airway space" : "Airway";
              label.group.style.color = phase === 2 ? "#246d66" : "#a36551";
            }
            if (label.button) {
              label.button.style.display = show > 0.2 && live.current.labelsVisible ? "block" : "none";
              label.button.style.left = `${x}px`;
              label.button.style.top = `${y - 12}px`;
              label.button.style.transform = left ? "translateX(-6px)" : "translateX(calc(-100% + 6px))";
              label.button.style.fontSize = mobile ? "9px" : "11px";
              label.button.textContent = label.text.textContent;
            }
          });
        };

        const positionBubble = () => {
          const inspection = selected.current;
          const card = bubble.current;
          if (!inspection || !card) return;
          projected.copy(inspection.anchor);
          inspection.object.localToWorld(projected);
          projected.project(camera);
          const x = (projected.x * 0.5 + 0.5) * width;
          const y = (-projected.y * 0.5 + 0.5) * height;
          const cardWidth = card.offsetWidth;
          const cardHeight = card.offsetHeight;
          const above = y > cardHeight + 28;
          const left = clamp(x - cardWidth / 2, 12, width - cardWidth - 12);
          const top = clamp(above ? y - cardHeight - 17 : y + 17, 12, height - cardHeight - 12);
          card.style.left = `${left}px`;
          card.style.top = `${top}px`;
          card.style.visibility = "visible";
          if (bubbleArrow.current) {
            bubbleArrow.current.style.left = `${clamp(x - left - 5, 15, cardWidth - 25)}px`;
            bubbleArrow.current.style.top = above ? "auto" : "-5px";
            bubbleArrow.current.style.bottom = above ? "-5px" : "auto";
          }
        };

        const draw = (now: number) => {
          if (contextLost || disposed || !prepared) return;
          const dt = Math.min(0.05, (now - last) / 1000 || 0);
          last = now;
          const frozen = still || live.current.paused;
          if (!frozen) clock += dt;
          current += (clamp(progress.current) - current) * (still ? 1 : 0.12);
          const fitted = ease(0.18, 0.45, current);
          const open = ease(0.35, 0.92, current);
          jaw.position.x = 24 * open - 11;
          jaw.position.y = -3 * (1 - open);
          jaw.rotation.z = -0.014 * (1 - open);
          // Breathing drives the soft tissue. When the airway is narrow, each
          // inhale pulls the tongue base and soft palate back (and the palate
          // flutters, which is what snoring is). Once open, they settle.
          const inhale = frozen ? 0 : Math.pow(Math.max(0, Math.sin(clock * 1.4)), 1.6);
          const closed = 1 - open;
          tongue.position.x = -closed * (9 + inhale * 4);
          tongue.position.y = -closed * 2;
          const flutter = frozen ? 0 : Math.sin(clock * 34) * 0.03 * inhale * closed;
          palateHinge.rotation.z = -closed * (0.1 + inhale * 0.05) - flutter;
          model.scale.setScalar(1 + (frozen ? 0 : Math.sin(clock * 1.4) * 0.0035));
          connector.scale.y = 1 - open * 0.15;
          applianceMaterial.opacity = fitted * 0.72;
          warningMaterial.opacity = (1 - open) * (0.38 + (frozen ? 0.12 : Math.sin(clock * 2.3) * 0.12));
          narrowing.scale.setScalar(1 + (frozen ? 0 : Math.sin(clock * 2.3) * 0.08));
          air.opacity = 0.12 + open * 0.15;
          const yaw = -0.24 + pointer.yaw + (still ? 0 : pointer.x * 0.055);
          const pitch = -0.025 + pointer.pitch + (still ? 0 : pointer.y * 0.035);
          model.rotation.y += (yaw - model.rotation.y) * (still ? 1 : 0.1);
          model.rotation.x += (pitch - model.rotation.x) * (still ? 1 : 0.1);
          // Breathing: gentle inhale pulses (about 4.5s each) with a slow drift between.
          const breath = 0.3 + 0.7 * Math.pow(Math.max(0, Math.sin(clock * 1.4)), 1.6);
          const NARROW = 0.56;
          for (const w of wispGroup.visible ? wisps : []) {
            // Near the narrowing, air slows and piles up unless the airway is open.
            const near = Math.exp(-Math.pow((w.u - NARROW) / 0.07, 2));
            const choke = 1 - near * (1 - open) * 0.82;
            if (!frozen) w.u += dt * 0.11 * w.speed * breath * choke;
            if (w.u >= 1) spawn(w, 0);
            const u = Math.min(0.999, w.u);
            airflowCurve.getPoint(u, point);
            airflowCurve.getTangent(u, tangent);
            // Spread across the airway; it is tighter at the narrowing when closed.
            const width = 8.5 - near * (1 - open) * 6;
            const wobble = frozen ? 0 : Math.sin(clock * 2.2 + w.seed) * (0.6 + near * (1 - open) * 2.4);
            point.x += -tangent.y * (w.lane * width + wobble);
            point.y += tangent.x * (w.lane * width + wobble);
            point.z += 2;
            w.sprite.position.copy(point);
            // Only a trickle gets past the narrowing until the airway opens.
            const past = u > NARROW + 0.05 ? 0.12 + open * 0.88 : 1;
            const fade = ease(0, 0.06, u) * (1 - ease(0.9, 1, u));
            w.mat.opacity = fade * past * (0.5 + breath * 0.5);
            // Stretch each wisp along the direction of travel.
            const stretch = 1 + breath * 1.4 * choke;
            w.mat.rotation = Math.atan2(tangent.y, tangent.x);
            w.sprite.scale.set(13 * w.size * stretch, 7.5 * w.size, 1);
          }
          projectLabels(fitted);
          positionBubble();
          renderer.render(scene, camera);
        };

        const frame = (now: number) => {
          raf = 0;
          if (!inView || document.hidden || disposed || contextLost || !prepared) return;
          draw(now);
          // Reduced motion still reacts to user controls/ref changes, without
          // continually rendering a WebGL frame or animating any particles.
          const settling = Math.abs(clamp(progress.current) - current) > 0.0002
            || Math.abs((-0.24 + pointer.yaw + pointer.x * 0.055) - model.rotation.y) > 0.0002
            || Math.abs((-0.025 + pointer.pitch + pointer.y * 0.035) - model.rotation.x) > 0.0002;
          if (!still && (!live.current.paused || settling)) raf = requestAnimationFrame(frame);
        };
        const kick = () => {
          if (!raf && inView && !document.hidden && !disposed && !contextLost) raf = requestAnimationFrame(frame);
        };
        wake.current = kick;
        const resize = () => {
          const bounds = element.getBoundingClientRect();
          width = Math.max(1, bounds.width);
          height = Math.max(1, bounds.height);
          const visibleHeight = width / height < 0.9 ? 665 : 620;
          camera.top = visibleHeight / 2;
          camera.bottom = -visibleHeight / 2;
          camera.left = -(visibleHeight * width / height) / 2;
          camera.right = -camera.left;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height, false);
          labelRoot.setAttribute("viewBox", `0 0 ${width} ${height}`);
          draw(performance.now());
          kick();
        };
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(element);
        const viewObserver = new IntersectionObserver(([entry]) => {
          inView = entry.isIntersecting;
          if (inView) { last = performance.now(); kick(); }
          else { cancelAnimationFrame(raf); raf = 0; }
        });
        viewObserver.observe(element);
        const onVisibility = () => {
          cancelAnimationFrame(raf);
          raf = 0;
          if (!document.hidden) { last = performance.now(); kick(); }
        };
        const onMotion = () => { still = reducedQuery.matches; kick(); };
        const onParticleViewport = () => { wispGroup.visible = particleQuery.matches; kick(); };
        const onControl = () => kick();
        const onDown = (event: PointerEvent) => {
          if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
          press.active = true;
          press.moved = false;
          press.x = event.clientX;
          press.y = event.clientY;
          press.scroll = window.scrollY;
          press.id = event.pointerId;
          isDragging = event.pointerType === "mouse" || event.pointerType === "pen";
          pointer.lastX = event.clientX;
          pointer.lastY = event.clientY;
          if (isDragging) {
            renderer.domElement.setPointerCapture(event.pointerId);
            renderer.domElement.style.cursor = "grabbing";
          }
        };
        const onMove = (event: PointerEvent) => {
          const bounds = element.getBoundingClientRect();
          pointer.x = clamp((event.clientX - bounds.left) / bounds.width) * 2 - 1;
          pointer.y = clamp((event.clientY - bounds.top) / bounds.height) * 2 - 1;
          if (press.active && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 5) press.moved = true;
          if (isDragging && press.moved) {
            pointer.yaw = clamp(pointer.yaw + (event.clientX - pointer.lastX) * 0.004, -0.42, 0.48);
            pointer.pitch = clamp(pointer.pitch + (event.clientY - pointer.lastY) * 0.002, -0.16, 0.16);
          }
          pointer.lastX = event.clientX;
          pointer.lastY = event.clientY;
          kick();
        };
        const releasePress = () => {
          isDragging = false;
          press.active = false;
          if (renderer.domElement.hasPointerCapture(press.id)) renderer.domElement.releasePointerCapture(press.id);
          renderer.domElement.style.cursor = "grab";
        };
        const onUp = (event: PointerEvent) => {
          const tapped = press.active && event.pointerId === press.id && !press.moved
            && Math.hypot(event.clientX - press.x, event.clientY - press.y) <= 5
            && Math.abs(window.scrollY - press.scroll) < 3;
          releasePress();
          if (tapped && !contextLost) pick(event);
        };
        const onCancel = () => releasePress();
        const onLeave = () => { pointer.x = 0; pointer.y = 0; kick(); };
        const onOutside = (event: PointerEvent) => {
          if (selected.current && event.target instanceof Node && !element.contains(event.target)) closeInspection();
        };
        const onEscape = (event: KeyboardEvent) => {
          if (event.key === "Escape" && selected.current) { event.preventDefault(); closeInspection(); }
        };
        const onContextLost = (event: Event) => {
          event.preventDefault();
          contextLost = true;
          cancelAnimationFrame(raf);
          raf = 0;
          closeInspection();
          live.current.onError?.();
        };
        document.addEventListener("visibilitychange", onVisibility);
        document.addEventListener("pointerdown", onOutside);
        document.addEventListener("keydown", onEscape);
        reducedQuery.addEventListener("change", onMotion);
        particleQuery.addEventListener("change", onParticleViewport);
        window.addEventListener("scroll", onControl, { passive: true });
        // Range and stage controls emit native input/click events, including
        // keyboard input, so reduced-motion mode redraws on demand as well.
        const controlRoot = element.closest("section") ?? element.parentElement;
        controlRoot?.addEventListener("input", onControl);
        controlRoot?.addEventListener("click", onControl);
        renderer.domElement.addEventListener("pointerdown", onDown);
        renderer.domElement.addEventListener("pointermove", onMove);
        renderer.domElement.addEventListener("pointerup", onUp);
        renderer.domElement.addEventListener("pointercancel", onCancel);
        renderer.domElement.addEventListener("pointerleave", onLeave);
        renderer.domElement.addEventListener("webglcontextlost", onContextLost);

        destroy = () => {
          wake.current = null;
          inspectPart.current = null;
          selected.current = null;
          cancelAnimationFrame(raf);
          resizeObserver.disconnect();
          viewObserver.disconnect();
          document.removeEventListener("visibilitychange", onVisibility);
          document.removeEventListener("pointerdown", onOutside);
          document.removeEventListener("keydown", onEscape);
          reducedQuery.removeEventListener("change", onMotion);
          particleQuery.removeEventListener("change", onParticleViewport);
          window.removeEventListener("scroll", onControl);
          controlRoot?.removeEventListener("input", onControl);
          controlRoot?.removeEventListener("click", onControl);
          renderer.domElement.removeEventListener("pointerdown", onDown);
          renderer.domElement.removeEventListener("pointermove", onMove);
          renderer.domElement.removeEventListener("pointerup", onUp);
          renderer.domElement.removeEventListener("pointercancel", onCancel);
          renderer.domElement.removeEventListener("pointerleave", onLeave);
          renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
          releaseResources();
        };
        await renderer.compileAsync(scene, camera);
        if (disposed || contextLost) return;
        prepared = true;
        resize();
        live.current.onReady?.();
      })().catch(() => {
        destroy();
        if (!disposed) live.current.onError?.();
      });

    return () => {
      disposed = true;
      destroy();
    };
  }, [progress, closeInspection]);

  return (
    <div ref={host} className="airway-scene" role="group" tabIndex={0} aria-label="Explore the 3D airway anatomy" aria-describedby={helpId} onKeyDown={(event) => {
      const onModel = event.target === event.currentTarget;
      const inBubble = event.target instanceof Node && bubble.current?.contains(event.target);
      if (!onModel && !(inBubble && (event.key === "ArrowRight" || event.key === "ArrowLeft"))) return;
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        keyboardIndex.current = (keyboardIndex.current + (event.key === "ArrowRight" ? 1 : -1) + keyboardParts.length) % keyboardParts.length;
        inspectPart.current?.(keyboardParts[keyboardIndex.current], true);
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        inspectPart.current?.(keyboardParts[keyboardIndex.current], true);
      }
    }}>
      <span id={helpId} className="sr-only">Select any part to learn its name and role. Use left and right arrow keys to explore parts, or Enter to inspect the airway. Drag with a mouse to rotate the model.</span>
      <svg ref={overlay} className="airway-scene-labels" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: labelsVisible ? 1 : 0, transition: "opacity 200ms" }}>
        {labels.map((label) => (
          <g key={label.id} data-label={label.id} style={{ color: "#53636b", opacity: label.id === "palate" || label.id === "airway" ? 1 : 0 }}>
            <path data-leader={label.id} fill="none" stroke="currentColor" strokeOpacity="0.4" strokeWidth="0.8" />
            <circle data-point={label.id} r="2" fill="currentColor" />
            <text data-text={label.id} fill="currentColor" fontFamily="inherit" fontSize="11" fontWeight="500" letterSpacing="0.2">{label.name}</text>
          </g>
        ))}
      </svg>
      {labels.map((label) => <button key={label.id} data-hotspot={label.id} type="button" aria-label={`Learn about ${label.name.toLowerCase()}`} onClick={(event) => inspectPart.current?.(labelParts[label.id], event.detail === 0)} onFocus={(event) => { event.currentTarget.style.opacity = "1"; }} onBlur={(event) => { event.currentTarget.style.opacity = "0"; }} onPointerEnter={(event) => { event.currentTarget.style.opacity = "1"; }} onPointerLeave={(event) => { if (document.activeElement !== event.currentTarget) event.currentTarget.style.opacity = "0"; }} style={{ display: "none", position: "absolute", zIndex: 2, opacity: 0, background: "#fff", color: "#44565c", padding: "2px 6px", borderRadius: "5px", border: 0, font: "inherit", fontWeight: 500, lineHeight: "16px", whiteSpace: "nowrap", cursor: "pointer", transition: "opacity 140ms" }}>{label.name}</button>)}
      {inspected && <div ref={bubble} role="dialog" aria-modal="false" aria-labelledby={bubbleId} style={{ position: "absolute", zIndex: 8, width: "230px", maxWidth: "calc(100% - 28px)", padding: "15px 34px 15px 16px", borderRadius: "16px", background: "#fff", color: "#33494f", boxShadow: "0 8px 35px #183b4925, 0 1px 4px #183b4914", border: "1px solid #dfe7e4", visibility: "hidden", fontSize: "12px", textAlign: "left", pointerEvents: "auto" }}>
        <span ref={bubbleArrow} aria-hidden="true" style={{ position: "absolute", width: "10px", height: "10px", background: "#fff", transform: "rotate(45deg)", borderRadius: "1px" }} />
        <button type="button" aria-label="Close anatomy detail" onClick={closeInspection} style={{ position: "absolute", right: "5px", top: "5px", display: "grid", placeItems: "center", width: "28px", height: "28px", background: "transparent", border: 0, borderRadius: "50%", color: "#7b8a8e", fontSize: "20px", lineHeight: 1, cursor: "pointer" }}>×</button>
        <p id={bubbleId} style={{ position: "relative", fontSize: "12px", fontWeight: 650, lineHeight: 1.4, margin: "0 0 5px" }}>{partDetails[inspected].name}</p>
        <p style={{ position: "relative", fontSize: "11px", lineHeight: 1.65, color: "#6c7b80", margin: 0 }}>{partDetails[inspected].role}</p>
      </div>}
    </div>
  );
}
