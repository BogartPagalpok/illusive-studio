import React, { useRef } from 'react';
import { motion } from 'framer-motion';

interface DiagonalScrollFadeProps {
  children: React.ReactNode;
  fadeEdge?: number;
  angle?: number;
}

const DiagonalScrollFade: React.FC<DiagonalScrollFadeProps> = ({
  children,
  fadeEdge = 25,
  angle = 135,
}) => {
  const ref = useRef<HTMLDivElement>(null);

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
