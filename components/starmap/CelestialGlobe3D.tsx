"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { ComputeSkyResult } from "@/lib/astronomy/computeSky";
import type { SkyPalette } from "@/components/astrolab/palettes";
import { useMusic } from "@/components/journal/MusicContext";

export interface CelestialGlobe3DProps {
  sky: ComputeSkyResult | null;
  palette: SkyPalette;
  className?: string;
}

const CONSTELLATION_LINES = [
  ["Dubhe", "Merak"],
  ["Merak", "Phecda"],
  ["Phecda", "Megrez"],
  ["Megrez", "Alioth"],
  ["Alioth", "Mizar"],
  ["Mizar", "Alkaid"],
  ["Megrez", "Dubhe"],
  ["Polaris", "Kochab"],
  ["Kochab", "Pherkad"],
  ["Betelgeuse", "Alnitak"],
  ["Rigel", "Saiph"],
  ["Rigel", "Mintaka"],
  ["Betelgeuse", "Bellatrix"],
  ["Alnitak", "Alnilam"],
  ["Alnilam", "Mintaka"],
  ["Alnitak", "Saiph"],
  ["Mintaka", "Bellatrix"],
  ["Caph", "Schedar"],
  ["Schedar", "Navi"],
  ["Navi", "Ruchbah"],
  ["Ruchbah", "Segin"],
  ["Acrux", "Gacrux"],
  ["Mimosa", "Imai"],
  ["Deneb", "Sadr"],
  ["Sadr", "Albireo"],
  ["Sadr", "Aljanah"],
  ["Vega", "Sheliak"],
  ["Sheliak", "Sulafat"],
  ["Sulafat", "Vega"],
  ["Castor", "Pollux"],
  ["Castor", "Mebsuta"],
  ["Pollux", "Alhena"],
  ["Mebsuta", "Tejat"],
  ["Aldebaran", "Elnath"],
  ["Sirius", "Adhara"],
  ["Sirius", "Mirzam"],
  ["Adhara", "Wezen"],
  ["Wezen", "Aludra"],
  ["Rigil Kentaurus", "Hadar"],
];

export function CelestialGlobe3D({ sky, palette, className = "" }: CelestialGlobe3DProps) {
  const music = useMusic();
  const getFrequenciesRef = useRef(music.getFrequencies);

  useEffect(() => {
    getFrequenciesRef.current = music.getFrequencies;
  }, [music.getFrequencies]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Audio reactive refs
  const starsMaterialRef = useRef<THREE.PointsMaterial | null>(null);
  const constellationLinesRef = useRef<THREE.LineSegments | null>(null);

  // Drag states
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const rotationVelocity = useRef({ x: 0.002, y: 0 }); // Autospin start
  const globeGroupRef = useRef<THREE.Group | null>(null);

  // Soft cream/parchment colors for Gravür, cosmic darks for night palettes
  const isGravur = palette.id === "gravur-atlas";
  const colors = {
    bg: isGravur ? 0xe4dfcd : 0x07050a,
    star: isGravur ? 0x8a5a3b : 0xffffff,
    constellation: isGravur ? 0x5c7a6b : 0x7e5bef,
    horizon: isGravur ? 0x241f19 : 0xe6a35c,
    text: isGravur ? "#241F19" : "#e6a35c",
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!sky || !container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 450;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(colors.bg);
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(0, 4, 8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Create Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // Create a circular glow point texture in memory (CanvasTexture)
    const createStarTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.6)");
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 16, 16);
      }
      return new THREE.CanvasTexture(canvas);
    };
    const starTexture = createStarTexture();

    // R = Radius of the celestial sphere
    const R = 5;

    // Convert Azimuth and Altitude to XYZ local coordinates
    const toXYZ = (az: number, alt: number, radius: number = R) => {
      const theta = az * (Math.PI / 180); // Clockwise from North
      const phi = (90 - alt) * (Math.PI / 180); // Down from Zenith

      return new THREE.Vector3(
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi),
        -radius * Math.sin(phi) * Math.cos(theta)
      );
    };

    // 5. Populate Stars
    const starPositions: number[] = [];
    const starColors: number[] = [];
    const starSizes: number[] = [];
    
    // Star coordinates map
    const starNameToPos = new Map<string, THREE.Vector3>();

    sky.stars.forEach((star) => {
      const pos = toXYZ(star.azimuth, star.altitude);
      starPositions.push(pos.x, pos.y, pos.z);

      if (star.name) {
        starNameToPos.set(star.name, pos);
      }

      // Map star magnitude (mag) to scale sizing and color intensities
      // Brighter stars (lower magnitude) get larger and more intense colors
      const starColor = new THREE.Color(colors.star);
      if (!isGravur) {
        // Add slightly blue or yellow tints based on magnitude for cosmetic style
        if (star.mag < 1.0) starColor.setHSL(0.6, 0.2, 1.0); // Bright white-blue
        else if (star.mag > 4.0) starColor.multiplyScalar(0.4); // Dim stars
        else starColor.multiplyScalar(0.85);
      } else {
        if (star.mag > 4.0) starColor.multiplyScalar(0.5);
      }
      starColors.push(starColor.r, starColor.g, starColor.b);

      const size = Math.max(0.04, (6.5 - star.mag) * 0.035);
      starSizes.push(size);
    });

    // Also populate Sun, Moon, and Planets
    sky.bodies.forEach((body) => {
      const pos = toXYZ(body.azimuth, body.altitude);
      starPositions.push(pos.x, pos.y, pos.z);

      if (body.name) {
        starNameToPos.set(body.name, pos);
      }

      // Planetary / Lunar cosmetic colors
      const bodyColor = new THREE.Color();
      if (body.kind === "sun") bodyColor.setHex(isGravur ? colors.star : 0xffd700);
      else if (body.kind === "moon") bodyColor.setHex(isGravur ? colors.star : 0xe0e0e0);
      else bodyColor.setHex(isGravur ? colors.star : 0xff9f43); // planets amber/orange tint
      
      starColors.push(bodyColor.r, bodyColor.g, bodyColor.b);
      starSizes.push(body.kind === "sun" || body.kind === "moon" ? 0.2 : 0.09);
    });

    const starsGeometry = new THREE.BufferGeometry();
    starsGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3));
    starsGeometry.setAttribute("color", new THREE.Float32BufferAttribute(starColors, 3));

    // Custom shader/Points material to handle varied particle sizes
    const starsMaterial = new THREE.PointsMaterial({
      size: 0.16, // Base size
      vertexColors: true,
      transparent: true,
      map: starTexture,
      blending: isGravur ? THREE.NormalBlending : THREE.AdditiveBlending,
      depthWrite: false,
    });
    starsMaterialRef.current = starsMaterial;

    const starPoints = new THREE.Points(starsGeometry, starsMaterial);
    globeGroup.add(starPoints);

    // 6. Draw Constellation lines
    const linePositions: number[] = [];
    CONSTELLATION_LINES.forEach(([nameA, nameB]) => {
      const posA = starNameToPos.get(nameA);
      const posB = starNameToPos.get(nameB);

      if (posA && posB) {
        linePositions.push(posA.x, posA.y, posA.z);
        linePositions.push(posB.x, posB.y, posB.z);
      }
    });

    if (linePositions.length > 0) {
      const linesGeometry = new THREE.BufferGeometry();
      linesGeometry.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
      
      const linesMaterial = new THREE.LineBasicMaterial({
        color: colors.constellation,
        transparent: true,
        opacity: isGravur ? 0.35 : 0.22,
        blending: isGravur ? THREE.NormalBlending : THREE.AdditiveBlending,
        depthWrite: false,
      });

      const constellationLines = new THREE.LineSegments(linesGeometry, linesMaterial);
      constellationLinesRef.current = constellationLines;
      globeGroup.add(constellationLines);
    }

    // 7. Draw Horizon Disk (the observer ground)
    const diskGeo = new THREE.RingGeometry(0, R * 0.98, 64);
    // Rotate to lie flat on XZ plane
    diskGeo.rotateX(-Math.PI / 2);
    
    const diskMat = new THREE.MeshBasicMaterial({
      color: colors.bg,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
      depthWrite: true,
    });
    const horizonDisk = new THREE.Mesh(diskGeo, diskMat);
    scene.add(horizonDisk);

    // 8. Grid Helper / Compass Ring
    const compassGeo = new THREE.RingGeometry(R * 0.97, R * 0.99, 64);
    compassGeo.rotateX(-Math.PI / 2);
    const compassMat = new THREE.MeshBasicMaterial({
      color: colors.horizon,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    });
    const compassRing = new THREE.Mesh(compassGeo, compassMat);
    scene.add(compassRing);

    // Horizon line grid
    const gridHelper = new THREE.GridHelper(R * 1.94, 20, colors.horizon, colors.horizon);
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.08;
    scene.add(gridHelper);

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 450;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // 10. Drag Interaction
    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !globeGroup) return;

      const deltaMove = {
        x: e.clientX - previousMousePosition.current.x,
        y: e.clientY - previousMousePosition.current.y,
      };

      // Set velocity based on client drags
      rotationVelocity.current = {
        x: deltaMove.x * 0.005,
        y: deltaMove.y * 0.005,
      };

      globeGroup.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), rotationVelocity.current.x);
      globeGroup.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), rotationVelocity.current.y);

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    // Touch event helpers
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      isDragging.current = true;
      previousMousePosition.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!isDragging.current || !globeGroup || !touch) return;

      const deltaMove = {
        x: touch.clientX - previousMousePosition.current.x,
        y: touch.clientY - previousMousePosition.current.y,
      };

      rotationVelocity.current = {
        x: deltaMove.x * 0.006,
        y: deltaMove.y * 0.006,
      };

      globeGroup.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), rotationVelocity.current.x);
      globeGroup.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), rotationVelocity.current.y);

      previousMousePosition.current = { x: touch.clientX, y: touch.clientY };
    };

    const dom = renderer.domElement;
    dom.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    
    dom.addEventListener("touchstart", handleTouchStart, { passive: true });
    dom.addEventListener("touchmove", handleTouchMove, { passive: true });
    dom.addEventListener("touchend", handleMouseUp);

    // 11. Render / Animation Loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      // Read audio frequencies to make components reactive
      const frequencies = getFrequenciesRef.current();
      let sum = 0;
      for (let i = 0; i < frequencies.length; i++) {
        sum += frequencies[i];
      }
      const avg = sum / (frequencies.length || 1);
      const pulse = avg / 255; // 0..1

      // Modulate point size of stars and opacity of constellation lines
      if (starsMaterialRef.current) {
        starsMaterialRef.current.size = 0.16 + pulse * 0.08;
      }
      if (constellationLinesRef.current && constellationLinesRef.current.material) {
        (constellationLinesRef.current.material as THREE.Material).opacity =
          (isGravur ? 0.35 : 0.22) + pulse * 0.25;
      }

      // Slow drift friction rotation when user is not dragging
      if (!isDragging.current && globeGroup) {
        globeGroup.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), rotationVelocity.current.x);
        globeGroup.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), rotationVelocity.current.y);

        // Apply friction to slow down to a crawl (diurnal drift pace)
        rotationVelocity.current.x *= 0.95;
        rotationVelocity.current.y *= 0.95;

        // Keep a minimum passive drift rotation going around the Y zenith axis
        if (Math.abs(rotationVelocity.current.x) < 0.0006) {
          rotationVelocity.current.x = 0.0006;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // 12. Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      
      dom.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      dom.removeEventListener("touchstart", handleTouchStart);
      dom.removeEventListener("touchmove", handleTouchMove);
      dom.removeEventListener("touchend", handleMouseUp);

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Dispose Three.js objects to release memory
      starTexture.dispose();
      starsGeometry.dispose();
      starsMaterial.dispose();
      diskGeo.dispose();
      diskMat.dispose();
      compassGeo.dispose();
      compassMat.dispose();
      gridHelper.dispose();
      
      if (linePositions.length > 0) {
        globeGroup.children.forEach((child) => {
          if (child instanceof THREE.LineSegments) {
            child.geometry.dispose();
            (child.material as THREE.Material).dispose();
          }
        });
      }

      renderer.dispose();
      if (container && dom.parentNode) {
        container.removeChild(dom);
      }
    };
  }, [sky, colors.bg, colors.star, colors.constellation, colors.horizon, isGravur]);

  return (
    <div className={`relative w-full ${className}`}>
      {/* 3D Canvas Container */}
      <div ref={containerRef} className="w-full h-[450px] relative overflow-hidden cursor-grab active:cursor-grabbing" />
      
      {/* Compass Directions Overlays (N, E, S, W) on the borders */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-widest text-dim select-none pointer-events-none opacity-60">
        Kuzey (N)
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-widest text-dim select-none pointer-events-none opacity-60">
        Güney (S)
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[9px] uppercase tracking-widest text-dim select-none pointer-events-none opacity-60">
        Doğu (E)
      </div>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[9px] uppercase tracking-widest text-dim select-none pointer-events-none opacity-60">
        Batı (W)
      </div>

      <div className="absolute bottom-4 right-4 bg-void/50 border border-text/10 rounded-full px-3 py-1 font-mono text-[8.5px] uppercase tracking-widest text-dim select-none pointer-events-none flex items-center gap-1.5">
        <svg className="h-3.5 w-3.5 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1" />
        </svg>
        <span>Döndürmek için sürükleyin</span>
      </div>
    </div>
  );
}
