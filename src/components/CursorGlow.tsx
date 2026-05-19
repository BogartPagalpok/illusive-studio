import { useEffect, useRef, useState } from 'react';

interface CursorGlowProps {
  containerRef: React.RefObject<HTMLElement>;
  size?: number;
}

export default function CursorGlow({ containerRef, size = 400 }: CursorGlowProps) {
  const glowRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const glow = glowRef.current;
    if (!container || !glow) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      glow.style.transform = `translate(${e.clientX - rect.left - size / 2}px, ${e.clientY - rect.top - size / 2}px)`;
      if (!visible) setVisible(true);
    };
    const handleMouseLeave = () => setVisible(false);
    const handleMouseEnter = () => setVisible(true);

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mouseenter', handleMouseEnter);
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [containerRef, size, visible]);

  return (
    <div ref={glowRef} className="absolute inset-0 pointer-events-none z-[5]" style={{
      width: size, height: size, borderRadius: '50%',
      background: `radial-gradient(circle, rgba(var(--accent-rgb), 0.15) 0%, transparent 70%)`,
      mixBlendMode: 'overlay', opacity: visible ? 1 : 0,
      transition: 'opacity 0.3s ease, transform 0.05s linear', willChange: 'transform, opacity',
    }} />
  );
}
