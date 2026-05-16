import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface DiagonalScrollFadeProps {
  children: React.ReactNode;
  fadeEdge?: number;   // Percentage of viewport height to fade (e.g., 25)
  angle?: number;      // Angle of the fade in degrees (e.g., 135)
}

const DiagonalScrollFade: React.FC<DiagonalScrollFadeProps> = ({ 
  children, 
  fadeEdge = 25, 
  angle = 135 
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // Track scroll progress relative to this section
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Convert the angle to radians for our gradient calculations
  const angleRad = (angle * Math.PI) / 180;
  const x = Math.cos(angleRad);
  const y = Math.sin(angleRad);

  // Create a dynamic mask that moves with the scroll
  const maskPosition = useTransform(
    scrollYProgress, 
    [0, 1], 
    [`${-(100 - fadeEdge)}%`, `${100 - fadeEdge}%`]
  );

  return (
    <motion.div
      ref={ref}
      style={{
        WebkitMaskImage: `linear-gradient(${angle}deg, black ${fadeEdge}%, transparent 100%)`,
        maskImage: `linear-gradient(${angle}deg, black ${fadeEdge}%, transparent 100%)`,
      }}
    >
      {children}
    </motion.div>
  );
};

export default DiagonalScrollFade;
