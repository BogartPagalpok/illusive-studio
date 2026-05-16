// src/components/DiagonalScrollFade.tsx
import { useRef, ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface DiagonalScrollFadeProps {
  children: ReactNode;
  className?: string;
  angle?: number;       // default 135 (top-left to bottom-right)
  fadeEdge?: number;    // default 20 (softness)
  offsetStart?: string;
  offsetEnd?: string;
}

export default function DiagonalScrollFade({
  children,
  className = '',
  angle = 135,
  fadeEdge = 20,
  offsetStart = 'start end',
  offsetEnd = 'end start',
}: DiagonalScrollFadeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [offsetStart, offsetEnd],
  });
  const gradientPos = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const maskImage = useTransform(gradientPos, (pos) => {
    const posNum = parseInt(pos);
    return `linear-gradient(${angle}deg, 
      rgba(0,0,0,1) 0%, 
      rgba(0,0,0,1) ${Math.max(0, posNum - fadeEdge)}%, 
      rgba(0,0,0,0) ${Math.min(100, posNum + fadeEdge)}%, 
      rgba(0,0,0,0) 100%)`;
  });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        WebkitMaskImage: maskImage,
        maskImage: maskImage,
      }}
    >
      {children}
    </motion.div>
  );
}
