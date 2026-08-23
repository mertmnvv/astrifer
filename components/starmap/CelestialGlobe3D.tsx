"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { ComputeSkyResult, SkyObjectPoint } from "@/lib/astronomy/computeSky";
import type { SkyPalette } from "@/components/astrolab/palettes";

const CONSTELLATION_SEGMENTS = [
  ["Dubhe", "Merak"], ["Merak", "Phecda"], ["Phecda", "Megrez"],
  ["Megrez", "Alioth"], ["Alioth", "Mizar"], ["Mizar", "Alkaid"],
  ["Megrez", "Dubhe"], ["Polaris", "Kochab"], ["Kochab", "Pherkad"],
  ["Betelgeuse", "Alnitak"], ["Alnitak", "Alnilam"], ["Alnilam", "Mintaka"],
  ["Mintaka", "Bellatrix"], ["Bellatrix", "Betelgeuse"], ["Alnitak", "Saiph"],
  ["Saiph", "Rigel"], ["Rigel", "Mintaka"], ["Deneb", "Sadr"],
  ["Sadr", "Albireo"], ["Vega", "Sheliak"], ["Sheliak", "Sulafat"],
  ["Sulafat", "Vega"], ["Castor", "Pollux"], ["Aldebaran", "Elnath"],
  ["Sirius", "Mirzam"], ["Sirius", "Adhara"], ["Adhara", "Wezen"],
] as const;

interface CelestialGlobe3DProps {
  sky: ComputeSkyResult;
  palette: SkyPalette;
  className?: string;
  label?: string;
  memoryMoments?: Array<{ url?: string | null; caption?: string | null }>;
  musicReactive?: boolean;
}

interface SelectedObject {
  name: string;
  kind: SkyObjectPoint["kind"];
  constellation: string;
  altitude: number;
  azimuth: number;
  magnitude: number;
  memory?: { url?: string | null; caption?: string | null };
}

function toVector(azimuth: number, altitude: number, radius = 4.5) {
  const theta = THREE.MathUtils.degToRad(azimuth);
  const phi = THREE.MathUtils.degToRad(90 - altitude);
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi),
    -radius * Math.sin(phi) * Math.cos(theta),
  );
}

function makeGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext("2d");
  if (!context) return new THREE.Texture();
  const glow = context.createRadialGradient(32, 32, 0, 32, 32, 32);
  glow.addColorStop(0, "rgba(255,255,255,1)");
  glow.addColorStop(0.2, "rgba(255,255,255,.92)");
  glow.addColorStop(0.55, "rgba(255,255,255,.28)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function CelestialGlobe3D({ sky, palette, className = "", label = "Etkileşimli 3D gökyüzü", memoryMoments = [], musicReactive = false }: CelestialGlobe3DProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const tourNextRef = useRef<() => void>(() => undefined);
  const [selected, setSelected] = useState<SelectedObject | null>(null);
  const [tourPosition, setTourPosition] = useState(0);
  const [webGlFailed, setWebGlFailed] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      setWebGlFailed(true);
      return;
    }

    setWebGlFailed(false);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.8, 11.5);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(new THREE.Color(palette.skyEdge), 1);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.touchAction = "none";
    host.appendChild(renderer.domElement);

    const globe = new THREE.Group();
    globe.rotation.x = -0.16;
    globe.rotation.y = 0.5;
    scene.add(globe);

    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(4.5, 48, 32),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(palette.skyCenter),
        transparent: true,
        opacity: 0.18,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    );
    globe.add(shell);

    const wire = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.SphereGeometry(4.52, 18, 12)),
      new THREE.LineBasicMaterial({ color: palette.label, transparent: true, opacity: 0.07 }),
    );
    globe.add(wire);

    const horizon = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(
        Array.from({ length: 128 }, (_, index) => {
          const angle = (index / 128) * Math.PI * 2;
          return new THREE.Vector3(Math.sin(angle) * 4.55, 0, Math.cos(angle) * 4.55);
        }),
      ),
      new THREE.LineBasicMaterial({ color: palette.sun, transparent: true, opacity: 0.72 }),
    );
    globe.add(horizon);

    const objects: SkyObjectPoint[] = [...sky.stars, ...sky.bodies];
    const positionByName = new Map<string, THREE.Vector3>();
    const positions: number[] = [];
    const colors: number[] = [];
    for (const object of objects) {
      const point = toVector(object.azimuth, object.altitude);
      positionByName.set(object.name, point);
      positions.push(point.x, point.y, point.z);
      const color = object.kind === "sun"
        ? new THREE.Color(palette.sun)
        : object.kind === "moon"
          ? new THREE.Color(palette.moonLit)
          : object.kind === "planet"
            ? new THREE.Color(palette.meteor)
            : new THREE.Color(palette.star);
      const brightness = object.kind === "star" ? THREE.MathUtils.clamp(1.12 - object.mag * 0.09, 0.38, 1) : 1;
      color.multiplyScalar(brightness);
      colors.push(color.r, color.g, color.b);
    }

    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    starGeometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    const glowTexture = makeGlowTexture();
    const starMaterial = new THREE.PointsMaterial({
      size: 0.2,
      map: glowTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.96,
      alphaTest: 0.025,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const starPoints = new THREE.Points(starGeometry, starMaterial);
    globe.add(starPoints);

    const brightObjects = objects.filter((object) => object.kind !== "star" || object.mag < 1.1);
    for (const object of brightObjects) {
      const point = positionByName.get(object.name);
      if (!point) continue;
      const marker = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTexture,
        color: object.kind === "sun" ? palette.sun : object.kind === "moon" ? palette.moonLit : palette.star,
        transparent: true,
        opacity: object.kind === "star" ? 0.52 : 0.88,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }));
      const scale = object.kind === "star" ? Math.max(0.35, 0.65 - object.mag * 0.12) : 0.82;
      marker.scale.setScalar(scale);
      marker.position.copy(point);
      globe.add(marker);
    }

    const linePositions: number[] = [];
    for (const [from, to] of CONSTELLATION_SEGMENTS) {
      const start = positionByName.get(from);
      const end = positionByName.get(to);
      if (!start || !end) continue;
      linePositions.push(start.x, start.y, start.z, end.x, end.y, end.z);
    }
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
    const constellations = new THREE.LineSegments(
      lineGeometry,
      new THREE.LineBasicMaterial({ color: palette.label, transparent: true, opacity: 0.34 }),
    );
    globe.add(constellations);

    const raycaster = new THREE.Raycaster();
    raycaster.params.Points = { threshold: 0.24 };
    const pointer = new THREE.Vector2();
    let dragging = false;
    let moved = false;
    let lastX = 0;
    let lastY = 0;
    let velocityX = 0;
    let velocityY = 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tourObjects = [...brightObjects]
      .sort((a, b) => a.mag - b.mag)
      .slice(0, Math.max(6, memoryMoments.length));
    let tourIndex = 0;

    const selectObject = (object: SkyObjectPoint, index = objects.indexOf(object)) => {
      const memoryIndex = tourObjects.indexOf(object);
      setSelected({
        name: object.name,
        kind: object.kind,
        constellation: object.constellation,
        altitude: object.altitude,
        azimuth: object.azimuth,
        magnitude: object.mag,
        memory: memoryIndex >= 0 ? memoryMoments[memoryIndex] : memoryMoments[index],
      });
    };

    tourNextRef.current = () => {
      if (!tourObjects.length) return;
      const object = tourObjects[tourIndex % tourObjects.length];
      selectObject(object);
      tourIndex = (tourIndex + 1) % tourObjects.length;
      setTourPosition(tourIndex || tourObjects.length);
      velocityY = 0.035;
    };

    const resize = () => {
      const width = Math.max(host.clientWidth, 1);
      const height = Math.max(host.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      moved = false;
      lastX = event.clientX;
      lastY = event.clientY;
      renderer.domElement.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
      velocityY = dx * 0.005;
      velocityX = dy * 0.005;
      globe.rotation.y += velocityY;
      globe.rotation.x = THREE.MathUtils.clamp(globe.rotation.x + velocityX, -1.15, 1.15);
      lastX = event.clientX;
      lastY = event.clientY;
    };
    const onPointerUp = (event: PointerEvent) => {
      dragging = false;
      if (renderer.domElement.hasPointerCapture(event.pointerId)) renderer.domElement.releasePointerCapture(event.pointerId);
      if (moved) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObject(starPoints, false)[0];
      const object = typeof hit?.index === "number" ? objects[hit.index] : null;
      if (object) selectObject(object, hit.index);
      else setSelected(null);
    };
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      camera.position.z = THREE.MathUtils.clamp(camera.position.z + event.deltaY * 0.008, 8.2, 15);
    };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointercancel", onPointerUp);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });

    let frame = 0;
    const clock = new THREE.Clock();
    const render = () => {
      frame = window.requestAnimationFrame(render);
      const elapsed = clock.getElapsedTime();
      if (!dragging) {
        velocityX *= 0.94;
        velocityY *= 0.94;
        globe.rotation.x = THREE.MathUtils.clamp(globe.rotation.x + velocityX, -1.15, 1.15);
        globe.rotation.y += velocityY + (reduceMotion ? 0 : 0.00065);
      }
      const musicPulse = musicReactive && !reduceMotion
        ? (Math.sin(elapsed * 3.1) + Math.sin(elapsed * 6.2) * 0.45 + 1.45) / 2.9
        : 0;
      starMaterial.size = 0.2 + musicPulse * 0.075;
      starMaterial.opacity = reduceMotion ? 0.96 : 0.86 + Math.sin(elapsed * 1.4) * 0.07 + musicPulse * 0.07;
      renderer.render(scene, camera);
    };
    render();

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointercancel", onPointerUp);
      renderer.domElement.removeEventListener("wheel", onWheel);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points || object instanceof THREE.Line || object instanceof THREE.LineSegments || object instanceof THREE.Sprite) {
          object.geometry?.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      glowTexture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      tourNextRef.current = () => undefined;
    };
  }, [memoryMoments, musicReactive, palette, sky]);

  return (
    <div className={`relative isolate overflow-hidden bg-[#050910] ${className}`} aria-label={label}>
      <div ref={hostRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-3 p-4 sm:p-5">
        <span className="archive-kicker text-[#5eead4]">Canlı 3D gök küresi</span>
        <div className="pointer-events-auto flex items-center gap-2">
          <span className="hidden archive-kicker text-[#7890a8] lg:inline">Sürükle · Yakınlaştır · Seç</span>
          <button type="button" onClick={() => tourNextRef.current()} className="border border-[#5eead4]/35 bg-[#020711]/80 px-3 py-2 archive-kicker text-[#5eead4] backdrop-blur transition hover:bg-[#5eead4]/10">
            Rehberli tur {tourPosition ? `· ${tourPosition}` : ""}
          </button>
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4 sm:bottom-5 sm:left-5 sm:right-5">
        <div className="archive-kicker leading-5 text-[#7890a8]">Ufuk üstü ve altı<br />gerçek konumlarıyla</div>
        {selected && (
          <div className="pointer-events-auto max-w-[260px] border border-[#5eead4]/45 bg-[#020711]/95 p-4 text-right shadow-2xl backdrop-blur">
            <button type="button" onClick={() => setSelected(null)} className="absolute right-2 top-1 text-[#7890a8]" aria-label="Seçimi kapat">×</button>
            <p className="archive-kicker text-[#5eead4]">{selected.kind === "star" ? selected.constellation : "Gök cismi"}</p>
            <p className="mt-2 font-display text-2xl text-white">{selected.name}</p>
            <p className="mt-2 font-mono text-[10px] leading-5 text-[#9fb4ca]">ALT {selected.altitude.toFixed(1)}° · AZ {selected.azimuth.toFixed(1)}°<br />MAG {selected.magnitude.toFixed(2)}</p>
            {selected.memory?.url && (
              <div className="mt-3 overflow-hidden border border-white/10 text-left">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selected.memory.url} alt={selected.memory.caption ?? `${selected.name} yıldızına bağlı anı`} className="h-24 w-full object-cover" />
                <p className="bg-[#071426] px-3 py-2 text-xs text-[#d9e8f5]">{selected.memory.caption ?? "Bu yıldıza bağlı anı"}</p>
              </div>
            )}
          </div>
        )}
      </div>
      {webGlFailed && <div className="absolute inset-0 grid place-items-center p-8 text-center text-sm text-[#9fb4ca]">Bu cihazda 3D görünüm başlatılamadı.</div>}
    </div>
  );
}
