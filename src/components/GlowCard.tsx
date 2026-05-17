import { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

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
  glowSize = 300,
  glowIntensity = 0.15,
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
      {/* Glow layer */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          borderRadius,
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
          background: `radial-gradient(${glowSize}px circle at ${mousePos.x}px ${mousePos.y}px, ${glowColor}, transparent 70%)`,
          opacity: isHovered ? glowIntensity : 0,
        }}
      />

      {/* Glow rim — only on hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          borderRadius,
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
          boxShadow: isHovered
            ? `0 0 40px -10px ${glowColor}, 0 0 80px -20px ${glowColor}, inset 0 0 30px -15px ${glowColor}`
            : 'none',
        }}
      />

      {/* Content */}
      <div className="relative z-10" style={{ borderRadius }}>
        {children}
      </div>
    </div>
  );
}
