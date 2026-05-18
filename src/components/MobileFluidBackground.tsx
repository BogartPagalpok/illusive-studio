import { useEffect, useState } from 'react';

interface MobileFluidProps {
  color?: string;
}

export default function MobileFluidBackground({ color = 'var(--accent)' }: MobileFluidProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      {/* Layer 1 — slow wave */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(ellipse at 30% ${50 + Math.sin(scrollY * 0.002) * 20}%, ${color}33 0%, transparent 60%),
                      radial-gradient(ellipse at 70% ${40 + Math.cos(scrollY * 0.003) * 25}%, ${color}22 0%, transparent 55%)`,
          filter: 'blur(60px)',
          opacity: 0.7,
        }}
      />
      {/* Layer 2 — medium wave */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% ${60 + Math.sin(scrollY * 0.0015 + 1) * 30}%, ${color}44 0%, transparent 50%),
                      radial-gradient(ellipse at 20% ${30 + Math.cos(scrollY * 0.0025) * 20}%, ${color}28 0%, transparent 60%)`,
          filter: 'blur(80px)',
          opacity: 0.5,
        }}
      />
      {/* Layer 3 — fast pulse */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 60% ${70 + Math.cos(scrollY * 0.004) * 35}%, ${color}1a 0%, transparent 65%)`,
          filter: 'blur(40px)',
          opacity: 0.6,
        }}
      />
    </div>
  );
}
