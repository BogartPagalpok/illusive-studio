import { motion } from 'framer-motion';

export type CubeType = 'Ps' | 'Ai' | 'Id' | 'Lr' | 'Canva' | 'CapCut';

interface FloatingCubeProps {
  type: CubeType;
  size?: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  blur?: string;
  delay?: number;
  duration?: number;
  rotation?: number;
}

const cubeConfigs: Record<CubeType, { color: string; label: string; bg: string }> = {
  Ps: { color: '#31A8FF', label: 'Ps', bg: 'rgba(49, 168, 255, 0.1)' },
  Ai: { color: '#FF9A00', label: 'Ai', bg: 'rgba(255, 154, 0, 0.1)' },
  Id: { color: '#FF3366', label: 'Id', bg: 'rgba(255, 51, 102, 0.1)' },
  Lr: { color: '#31E1FF', label: 'Lr', bg: 'rgba(49, 225, 255, 0.1)' },
  Canva: { color: '#7D2AE8', label: 'C', bg: 'rgba(125, 42, 232, 0.1)' },
  CapCut: { color: '#FF007A', label: 'Cc', bg: 'rgba(255, 0, 122, 0.1)' },
};

export default function FloatingCube({
  type,
  size = 60,
  top,
  left,
  right,
  bottom,
  blur = '0px',
  delay = 0,
  duration = 4,
  rotation = 15,
}: FloatingCubeProps) {
  const config = cubeConfigs[type];

  return (
    <motion.div
      initial={{ y: 0, rotate: -rotation }}
      animate={{ 
        y: [-15, 15, -15],
        rotate: [-rotation, rotation, -rotation],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        delay: delay,
        ease: "easeInOut"
      }}
      className="absolute pointer-events-none z-0"
      style={{
        top,
        left,
        right,
        bottom,
        width: size,
        height: size,
        filter: `blur(${blur})`,
      }}
    >
      <div 
        className="w-full h-full relative backdrop-blur-md border border-white/20 rounded-lg flex items-center justify-center shadow-2xl"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          boxShadow: `0 0 20px ${config.color}20`,
        }}
      >
        {/* Identity Label */}
        <span 
          className="font-display font-black tracking-tighter select-none"
          style={{ 
            color: config.color,
            fontSize: size * 0.4,
            textShadow: `0 0 10px ${config.color}80`,
          }}
        >
          {config.label}
        </span>

        {/* Glossy Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-lg" />
      </div>
    </motion.div>
  );
}
