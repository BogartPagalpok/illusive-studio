import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface LiquidEtherProps {
  mouseForce?: number;
  cursorSize?: number;
  resolution?: number;
  autoDemo?: boolean;
  autoSpeed?: number;
  className?: string;
  style?: React.CSSProperties;
}

// Helper to convert a CSS color (like var(--accent)) to a THREE.Color
function getAccentHex(): string {
  if (typeof window === 'undefined') return '#9D00FF';
  const rootStyle = getComputedStyle(document.documentElement);
  // Read the actual computed accent color
  return rootStyle.getPropertyValue('--accent').trim() || '#9D00FF';
}

function getAccentPalette(): string[] {
  const accent = getAccentHex();
  // Create a subtle palette from the accent (accent, lighter tint, white)
  const c = new THREE.Color(accent);
  const lighter = c.clone().lerp(new THREE.Color('#FFFFFF'), 0.5);
  return [accent, '#' + lighter.getHexString(), '#FFFFFF'];
}

// … (shaders and fluid simulation classes remain exactly the same, omitted for brevity)
// They will now be fed the dynamic palette from getAccentPalette()

// ── Mobile CSS Wave Background (now uses the theme accent) ──
function MobileWaveBg() {
  const [y, setY] = useState(0);
  const accent = getAccentHex(); // real accent from theme

  useEffect(() => {
    const cb = () => setY(window.scrollY);
    window.addEventListener('scroll', cb, { passive: true });
    return () => window.removeEventListener('scroll', cb);
  }, []);

  const t1 = 50 + Math.sin(y * 0.002) * 20;
  const t2 = 40 + Math.cos(y * 0.003) * 25;
  const t3 = 60 + Math.sin(y * 0.0015 + 1) * 30;
  const t4 = 30 + Math.cos(y * 0.0025) * 20;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden', background: '#030305' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: `radial-gradient(ellipse 80vw 60vh at 30vw ${t1}vh, ${accent}33 0%, transparent 60%), radial-gradient(ellipse 70vw 50vh at 70vw ${t2}vh, ${accent}22 0%, transparent 55%)`, filter: 'blur(60px)', opacity: 0.7 }} />
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: `radial-gradient(ellipse 80vw 60vh at 50vw ${t3}vh, ${accent}44 0%, transparent 50%), radial-gradient(ellipse 70vw 50vh at 20vw ${t4}vh, ${accent}28 0%, transparent 60%)`, filter: 'blur(80px)', opacity: 0.5 }} />
    </div>
  );
}

// ── Main Component ──────────────────────────────────────
export default function LiquidEtherBackground(props: LiquidEtherProps) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (isMobile) return <MobileWaveBg />;
  return <DesktopFluidSim {...props} palette={getAccentPalette()} />;
}

// ── Desktop Fluid (now accepts a dynamic palette) ───────
function DesktopFluidSim({
  palette,
  mouseForce = 20, cursorSize = 100, resolution = 0.25,
  autoDemo = true, autoSpeed = 0.5, className = '', style,
}: LiquidEtherProps & { palette: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const sim = new FluidSimulation({ colors: palette, mouseForce, cursorSize, resolution });
    const mouse = new MouseTracker();
    const driver = new AutoDriver(mouse, autoDemo, autoSpeed, 1000);
    const arr = palette.length > 1 ? palette : [palette[0], palette[0]];
    const data = new Uint8Array(arr.length * 4);
    arr.forEach((c, i) => { const col = new THREE.Color(c); data[i*4]=Math.round(col.r*255); data[i*4+1]=Math.round(col.g*255); data[i*4+2]=Math.round(col.b*255); data[i*4+3]=255; });
    const paletteTex = new THREE.DataTexture(data, arr.length, 1, THREE.RGBAFormat);
    paletteTex.magFilter=THREE.LinearFilter; paletteTex.minFilter=THREE.LinearFilter;
    paletteTex.wrapS=THREE.ClampToEdgeWrapping; paletteTex.wrapT=THREE.ClampToEdgeWrapping;
    paletteTex.generateMipmaps=false; paletteTex.needsUpdate=true;
    sim.init(container, paletteTex);

    const onMouseMove = (e: MouseEvent) => { const rect = container.getBoundingClientRect(); mouse.update(e.clientX, e.clientY, rect); };
    window.addEventListener('mousemove', onMouseMove);

    const canvas = container.querySelector('canvas');
    const onTouchStart = (e: TouchEvent) => { e.preventDefault(); if (e.touches.length === 1) { const rect = container.getBoundingClientRect(); mouse.update(e.touches[0].clientX, e.touches[0].clientY, rect); } };
    const onTouchMove = (e: TouchEvent) => { e.preventDefault(); if (e.touches.length === 1) { const rect = container.getBoundingClientRect(); mouse.update(e.touches[0].clientX, e.touches[0].clientY, rect); } };
    if (canvas) { canvas.addEventListener('touchstart', onTouchStart, { passive: false }); canvas.addEventListener('touchmove', onTouchMove, { passive: false }); }

    let raf: number;
    const animate = () => { driver.update(mouse.lastInteraction); sim.update(mouse.coords, mouse.diff); raf = requestAnimationFrame(animate); };
    animate();
    const onResize = () => sim.resize(container);
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMouseMove);
      if (canvas) { canvas.removeEventListener('touchstart', onTouchStart); canvas.removeEventListener('touchmove', onTouchMove); }
      window.removeEventListener('resize', onResize);
      sim.dispose();
    };
  }, [palette, mouseForce, cursorSize, resolution, autoDemo, autoSpeed]);

  return <div ref={containerRef} className={`fixed inset-0 pointer-events-none ${className}`} style={{ zIndex: 0, ...style }} />;
}
