"use client";

import { useEffect, useRef, useState } from "react";
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
  const [selectedStar, setSelectedStar] = useState<{
    name: string;
    mag: number;
    altitude: number;
    type: "star" | "body";
    kind?: string;
  } | null>(null);

  // Hybrid Cinematic Refs
  const interactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAutoRotating = useRef(true);
  const targetStarVectorRef = useRef<THREE.Vector3 | null>(null);
  const dustPointsRef = useRef<THREE.Points | null>(null);

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

  // Listen to selectedStar to manage target vectors and interaction timeouts
  useEffect(() => {
    if (selectedStar === null) {
      targetStarVectorRef.current = null;
      if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
      interactionTimeoutRef.current = setTimeout(() => {
        isAutoRotating.current = true;
      }, 3000);
    }
  }, [selectedStar]);

  useEffect(() => {
    const container = containerRef.current;
    if (!sky || !container) return;

    let dragStartX = 0;
    let dragStartY = 0;
    let dragStartTouchX = 0;
    let dragStartTouchY = 0;

    const width = container.clientWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(colors.bg);
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.001, 100);
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

    // 9. Space Dust (Stardust) Particle System
    const dustGeometry = new THREE.BufferGeometry();
    const dustCount = 800;
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i++) {
      dustPositions[i] = (Math.random() - 0.5) * 15; // Spread across a 15 unit cube
    }
    dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    
    const dustMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.04,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const dustPoints = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dustPoints);
    dustPointsRef.current = dustPoints;

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 450;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // 10. Drag & Click Interaction
    const startInteraction = () => {
      isAutoRotating.current = false;
      if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
    };

    const endInteraction = () => {
      if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
      interactionTimeoutRef.current = setTimeout(() => {
        isAutoRotating.current = true;
      }, 3000);
    };

    const handleMouseDown = (e: MouseEvent) => {
      startInteraction();
      isDragging.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
      dragStartX = e.clientX;
      dragStartY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !globeGroup) return;

      const deltaMove = {
        x: e.clientX - previousMousePosition.current.x,
        y: e.clientY - previousMousePosition.current.y,
      };

      rotationVelocity.current = {
        x: deltaMove.x * 0.005,
        y: deltaMove.y * 0.005,
      };

      globeGroup.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), rotationVelocity.current.x);
      globeGroup.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), rotationVelocity.current.y);

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = (e: MouseEvent) => {
      isDragging.current = false;
      endInteraction();

      const diffX = Math.abs(e.clientX - dragStartX);
      const diffY = Math.abs(e.clientY - dragStartY);
      if (diffX < 5 && diffY < 5) {
        const rect = dom.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        
        const raycaster = new THREE.Raycaster();
        raycaster.params.Points.threshold = 0.16;
        raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
        const intersects = raycaster.intersectObject(starPoints);

        if (intersects.length > 0) {
          const index = intersects[0].index;
          if (index !== undefined && sky) {
            const px = starPositions[index * 3];
            const py = starPositions[index * 3 + 1];
            const pz = starPositions[index * 3 + 2];
            targetStarVectorRef.current = new THREE.Vector3(px, py, pz);
            isAutoRotating.current = false;

            if (index < sky.stars.length) {
              const star = sky.stars[index];
              setSelectedStar({
                name: star.name,
                mag: star.mag,
                altitude: star.altitude,
                type: "star",
              });
            } else {
              const body = sky.bodies[index - sky.stars.length];
              setSelectedStar({
                name: body.name,
                mag: body.mag,
                altitude: body.altitude,
                type: "body",
                kind: body.kind,
              });
            }
          }
        } else {
          setSelectedStar(null);
        }
      }
    };

    // Touch event helpers
    const handleTouchStart = (e: TouchEvent) => {
      startInteraction();
      const touch = e.touches[0];
      if (!touch) return;
      isDragging.current = true;
      previousMousePosition.current = { x: touch.clientX, y: touch.clientY };
      dragStartTouchX = touch.clientX;
      dragStartTouchY = touch.clientY;
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

    const handleTouchEnd = (e: TouchEvent) => {
      isDragging.current = false;
      endInteraction();
      const touch = e.changedTouches[0];
      if (!touch) return;

      const diffX = Math.abs(touch.clientX - dragStartTouchX);
      const diffY = Math.abs(touch.clientY - dragStartTouchY);
      if (diffX < 5 && diffY < 5) {
        const rect = dom.getBoundingClientRect();
        const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
        
        const raycaster = new THREE.Raycaster();
        raycaster.params.Points.threshold = 0.22;
        raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
        const intersects = raycaster.intersectObject(starPoints);

        if (intersects.length > 0) {
          const index = intersects[0].index;
          if (index !== undefined && sky) {
            const px = starPositions[index * 3];
            const py = starPositions[index * 3 + 1];
            const pz = starPositions[index * 3 + 2];
            targetStarVectorRef.current = new THREE.Vector3(px, py, pz);
            isAutoRotating.current = false;

            if (index < sky.stars.length) {
              const star = sky.stars[index];
              setSelectedStar({
                name: star.name,
                mag: star.mag,
                altitude: star.altitude,
                type: "star",
              });
            } else {
              const body = sky.bodies[index - sky.stars.length];
              setSelectedStar({
                name: body.name,
                mag: body.mag,
                altitude: body.altitude,
                type: "body",
                kind: body.kind,
              });
            }
          }
        } else {
          setSelectedStar(null);
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    
    dom.addEventListener("touchstart", handleTouchStart, { passive: true });
    dom.addEventListener("touchmove", handleTouchMove, { passive: true });
    dom.addEventListener("touchend", handleTouchEnd, { passive: true });

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

      // Space Dust rotation
      if (dustPointsRef.current) {
        dustPointsRef.current.rotation.y += 0.0003;
        dustPointsRef.current.rotation.x += 0.0001;
        (dustPointsRef.current.material as THREE.PointsMaterial).opacity = 0.2 + pulse * 0.4;
      }

      // Hybrid Interaction: Lerp Camera Zoom and Globe Rotation
      if (targetStarVectorRef.current && globeGroup && camera) {
        // Zoom in smoothly
        camera.fov = THREE.MathUtils.lerp(camera.fov, 25, 0.03);
        camera.updateProjectionMatrix();

        // Rotate globe so target points to camera
        const currentWorldPos = targetStarVectorRef.current.clone().applyMatrix4(globeGroup.matrixWorld).normalize();
        const targetWorldPos = new THREE.Vector3(0, 4, 8).normalize(); // Camera direction
        const quaternion = new THREE.Quaternion().setFromUnitVectors(currentWorldPos, targetWorldPos);
        globeGroup.quaternion.slerp(globeGroup.quaternion.clone().premultiply(quaternion), 0.04);
      } else if (camera) {
        // Zoom out smoothly
        camera.fov = THREE.MathUtils.lerp(camera.fov, 60, 0.04);
        camera.updateProjectionMatrix();
      }

      // Auto rotation and friction
      if (!isDragging.current && globeGroup) {
        if (!targetStarVectorRef.current) {
          globeGroup.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), rotationVelocity.current.x);
          globeGroup.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), rotationVelocity.current.y);
        }

        // Apply friction
        rotationVelocity.current.x *= 0.95;
        rotationVelocity.current.y *= 0.95;

        // Auto Cinematic Spin
        if (isAutoRotating.current && !targetStarVectorRef.current) {
          rotationVelocity.current.x = THREE.MathUtils.lerp(rotationVelocity.current.x, 0.0015, 0.02);
          // Optional subtle tilt
          rotationVelocity.current.y = THREE.MathUtils.lerp(rotationVelocity.current.y, Math.sin(Date.now() * 0.0005) * 0.0002, 0.01);
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
      dom.removeEventListener("touchend", handleTouchEnd);

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
    <div className={`relative w-full h-full min-h-[400px] ${className}`}>
      {/* 3D Canvas Container */}
      <div ref={containerRef} className="w-full h-full absolute inset-0 overflow-hidden cursor-grab active:cursor-grabbing touch-none" />
      
      {/* Compass Directions Overlays (N, E, S, W) on the borders */}
      <div className={`absolute top-2 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-widest select-none pointer-events-none opacity-60 ${isGravur ? "text-[#241F19]" : "text-dim"}`}>
        Kuzey (N)
      </div>
      <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-widest select-none pointer-events-none opacity-60 ${isGravur ? "text-[#241F19]" : "text-dim"}`}>
        Güney (S)
      </div>
      <div className={`absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[9px] uppercase tracking-widest select-none pointer-events-none opacity-60 ${isGravur ? "text-[#241F19]" : "text-dim"}`}>
        Doğu (E)
      </div>
      <div className={`absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[9px] uppercase tracking-widest select-none pointer-events-none opacity-60 ${isGravur ? "text-[#241F19]" : "text-dim"}`}>
        Batı (W)
      </div>

      <div className={`absolute top-8 md:top-6 left-1/2 -translate-x-1/2 ${isGravur ? "bg-[#E4DFCD]/90 border-[#241F19]/20 text-[#241F19]" : "bg-void/30 border-text/10 text-dim"} rounded-full px-3 py-1 font-mono text-[8.5px] uppercase tracking-widest select-none pointer-events-none flex items-center gap-1.5 opacity-80 backdrop-blur-sm`}>
        <svg className={`h-3.5 w-3.5 ${isGravur ? "text-[#8A5A3B]" : "text-amber"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1" />
        </svg>
        <span>Döndürmek için sürükleyin</span>
      </div>

      {/* Selected Star Details Card */}
      {selectedStar && (
        <div className={`absolute bottom-[max(2rem,env(safe-area-inset-bottom))] left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-80 rounded-xl border p-4 shadow-xl backdrop-blur-sm z-30 flex flex-col gap-1.5 text-left animate-fadeIn ${isGravur ? "bg-[#E4DFCD]/95 border-[#241F19]/30 shadow-2xl" : "border-amber/20 bg-void/90"}`}>
          <button
            type="button"
            onClick={() => setSelectedStar(null)}
            className={`absolute top-2.5 right-2.5 ${isGravur ? "text-[#241F19]/60 hover:text-[#241F19]" : "text-dim hover:text-bright"}`}
            aria-label="Kapat"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <p className={`font-mono text-[8.5px] uppercase tracking-[0.2em] ${isGravur ? "text-[#8A5A3B]" : "text-amber"}`}>
            {selectedStar.type === "body" ? "🪐 Gök Cismi" : "⭐ Yıldız Raporu"}
          </p>
          <h4 className={`font-display text-base italic font-medium ${isGravur ? "text-[#241F19] font-gravur-serif" : "text-bright"}`}>
            {selectedStar.name || "Katalog Yıldızı"}
          </h4>
          <div className={`grid grid-cols-2 gap-2 border-t pt-2 text-[10px] font-mono ${isGravur ? "border-[#241F19]/15 text-[#5C5646]" : "border-text/10 text-dim"}`}>
            <div>
              <span className={`text-[8px] uppercase tracking-wider block ${isGravur ? "text-[#241F19]/60" : "text-subtle"}`}>Kadir</span>
              <span className={isGravur ? "text-[#241F19]" : "text-bright"}>{selectedStar.mag.toFixed(2)}</span>
            </div>
            <div>
              <span className={`text-[8px] uppercase tracking-wider block ${isGravur ? "text-[#241F19]/60" : "text-subtle"}`}>Yükseklik</span>
              <span className={isGravur ? "text-[#241F19]" : "text-bright"}>{selectedStar.altitude.toFixed(1)}°</span>
            </div>
          </div>
          <p className={`text-[11px] leading-relaxed italic mt-1.5 ${isGravur ? "text-[#5C5646] font-gravur-serif" : "text-subtle"}`}>
            {getStarDescription(selectedStar.name, selectedStar.mag, selectedStar.type, selectedStar.kind)}
          </p>
        </div>
      )}
    </div>
  );
}

// Poetic Turkish descriptions for stars and planets
function getStarDescription(name: string, mag: number, type?: string, kind?: string): string {
  if (type === "body") {
    const k = kind || "";
    if (k === "sun") {
      return "Güneş. Hayat veren ışığın, bilincin ve o özel anın merkezindeki sıcak enerjinin kaynağı.";
    }
    if (k === "moon") {
      return "Ay. Duyguların, sezgilerin ve o unutulmaz anı çevreleyen gümüş ışığın koruyucusu.";
    }
    // Turkish translation for planet names
    const planetName = name === "Mercury" ? "Merkür" 
                     : name === "Venus" ? "Venüs" 
                     : name === "Mars" ? "Mars" 
                     : name === "Jupiter" ? "Jüpiter" 
                     : name === "Saturn" ? "Satürn" 
                     : name === "Uranus" ? "Uranüs" 
                     : name === "Neptune" ? "Neptün" : name;
    return `${planetName} Gezegeni. Kozmik yörüngedeki dansıyla, hayatınızın o benzersiz anına eşlik eden büyük gezegen gücü.`;
  }

  const normalizedName = (name || "").toLowerCase();
  
  if (normalizedName.includes("sirius")) {
    return "Gökyüzünün en parlak yıldızı. Antik çağlardan beri sadakat, rehberlik ve büyük dönüşümlerin simgesi olarak kabul edilir.";
  }
  if (normalizedName.includes("vega")) {
    return "Mavi-beyaz ışığıyla göğün liri. Gece gökyüzündeki en saf ışıklardan biri, sanatsal ilhamın ve yaratıcılığın sembolü.";
  }
  if (normalizedName.includes("polaris") || normalizedName.includes("kutup")) {
    return "Kutup Yıldızı. Yüzyıllardır denizcilere ve kaybolan ruhlara yön gösteren, sadakatin ve değişmez sığınağın temsilcisi.";
  }
  if (normalizedName.includes("capella")) {
    return "Gökyüzünün altın sarısı kraliçesi. Bolluk, bereket ve koruyucu enerjiyi simgeler.";
  }
  if (normalizedName.includes("rigel")) {
    return "Orion takımyıldızının görkemli mavi devi. Cesaretin, bilgeliğin ve yüksek hedeflerin ışığı.";
  }
  if (normalizedName.includes("betelgeuse")) {
    return "Ömrünün son demlerindeki dev kızıl yıldız. Yaşam döngülerinin güzelliğini ve tutkuyu sembolize eder.";
  }
  if (normalizedName.includes("altair")) {
    return "Kartal takımyıldızının kalbi. Hızlı kararların, özgürlüğün ve cesur uçuşların habercisidir.";
  }
  if (normalizedName.includes("aldebaran")) {
    return "Boğanın öfkeli kırmızı gözü. Güçlü bir duruşu, sarsılmaz inancı ve kararlılığı temsil eder.";
  }
  if (normalizedName.includes("procyon")) {
    return "Küçük Köpek takımyıldızının incisi. Erken uyanışların ve yeni fırsatların müjdecisidir.";
  }
  if (normalizedName.includes("spica")) {
    return "Başak takımyıldızının buğday başağı. Saf sevginin, zarafetin ve emek verilen değerlerin parıltısı.";
  }
  if (normalizedName.includes("antares")) {
    return "Akrebin kalbindeki dev kızıl fener. Derin duyguları, gizemi ve dönüşümün gücünü simgeler.";
  }
  if (normalizedName.includes("fomalhaut")) {
    return "Güney Balığı'nın ağzındaki yalnız yıldız. Bağımsızlığı, mistik sezgileri ve yalnızlığın asaletini yansıtır.";
  }

  // Fallback for nameless/catalog stars based on magnitude
  if (mag < 2.0) {
    return "Gökyüzünü parlaklığıyla taçlandıran bu yıldız, o özel anda hayatınızı aydınlatan önemli bir enerjiyi simgeliyor.";
  }
  if (mag < 4.0) {
    return "Göğün bu zarif yıldızı, o büyülü gecede arka planda sessizce parıldayan, detaylarda gizli mutlulukları anlatıyor.";
  }
  return "Kozmik örtünün derinliklerindeki bu küçük yıldız, hayatınızın büyük tablosunu tamamlayan görünmez bağların temsilcisidir.";
}
