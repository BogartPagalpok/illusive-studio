import { useRef, useState, useCallback } from 'react';

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  glowSize?: number;
  glowIntensity?: number;
  borderRadius?: string;
}

export default function GlowCard({
  children,
  className = '',
  glowColor = 'var(--accent)',
  glowSize = 150,
  glowIntensity = 0.08,
  borderRadius = '20px',
}: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: -1000, y: -1000 });
  };

  return (
    <div
      ref={cardRef}
      className={`relative ${className}`}
      style={{ borderRadius }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Subtle rim glow — only nearest the cursor */}
      <div
        className="absolute pointer-events-none"
        style={{
          inset: -2,
          borderRadius,
          opacity: isHovered ? 0.6 : 0,
          transition: 'opacity 0.4s ease',
          background: `
            radial-gradient(
              ${glowSize}px circle at ${mousePos.x}px ${mousePos.y}px,
              ${glowColor} 0%,
              transparent 60%
            )
          `,
          filter: 'blur(8px)',
        }}
      />

      {/* Inner edge highlight */}
      <div
        className="absolute pointer-events-none"
        style={{
          inset: 0,
          borderRadius,
          opacity: isHovered ? 0.3 : 0,
          transition: 'opacity 0.4s ease',
          background: `
            radial-gradient(
              ${glowSize * 0.6}px circle at ${mousePos.x}px ${mousePos.y}px,
              ${glowColor} 0%,
              transparent 80%
            )
          `,
          filter: 'blur(2px)',
        }}
      />

      <div className="relative" style={{ borderRadius }}>
        {children}
      </div>
    </div>
  );
}
