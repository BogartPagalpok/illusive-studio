import { useRef, useCallback, ReactNode } from 'react';
import gsap from 'gsap';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export default function MagneticButton({ children, className = '', href, onClick }: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const proxy = useRef({ x: 0, y: 0 });
  const xQuick = useRef(gsap.quickTo(proxy.current, 'x', { duration: 0.3, ease: 'power3.out' }));
  const yQuick = useRef(gsap.quickTo(proxy.current, 'y', { duration: 0.3, ease: 'power3.out' }));

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 60) {
      const factor = (1 - dist / 60) * 12;
      xQuick.current((dx / dist) * factor);
      yQuick.current((dy / dist) * factor);
      gsap.set(ref.current, { x: proxy.current.x, y: proxy.current.y });
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    xQuick.current(0); yQuick.current(0);
    gsap.set(ref.current, { x: 0, y: 0 });
  }, []);

  return (
    <a ref={ref} href={href} onClick={onClick} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
      className={className} style={{ display: 'inline-block', willChange: 'transform' }}>
      {children}
    </a>
  );
}
