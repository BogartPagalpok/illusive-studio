import { useRef, useCallback, ReactNode } from 'react';
import gsap from 'gsap';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number;
  radius?: number;
  as?: 'a' | 'button';
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export default function MagneticButton({
  children,
  className = '',
  strength = 12,
  radius = 60,
  as: Tag = 'a',
  href,
  onClick,
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null);
  const proxyRef = useRef({ x: 0, y: 0 });
  const xQuick = useRef(gsap.quickTo(proxyRef.current, 'x', { duration: 0.3, ease: 'power3.out' }));
  const yQuick = useRef(gsap.quickTo(proxyRef.current, 'y', { duration: 0.3, ease: 'power3.out' }));

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distX = e.clientX - centerX;
    const distY = e.clientY - centerY;
    const dist = Math.sqrt(distX * distX + distY * distY);

    if (dist < radius) {
      const factor = (1 - dist / radius) * strength;
      const moveX = distX * (factor / dist) * (dist / strength);
      const moveY = distY * (factor / dist) * (dist / strength);
      xQuick.current(moveX);
      yQuick.current(moveY);
      gsap.set(ref.current, { x: proxyRef.current.x, y: proxyRef.current.y });
    }
  }, [strength, radius, xQuick, yQuick]);

  const handleMouseLeave = useCallback(() => {
    xQuick.current(0);
    yQuick.current(0);
    gsap.set(ref.current, { x: 0, y: 0 });
  }, [xQuick, yQuick]);

  return (
    <Tag
      ref={ref as any}
      href={Tag === 'a' ? href : undefined}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{ display: 'inline-block', willChange: 'transform' }}
    >
      {children}
    </Tag>
  );
}
