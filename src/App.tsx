import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import { motion } from 'framer-motion';
import { useHoveringPenFavicon } from './hooks/useHoveringPenFavicon';
import { loadSavedTheme, subscribeToThemeChanges } from './lib/themes';
import LiquidEtherBackground from './components/LiquidEtherBackground';
import { SCROLL_SEQUENCE_BUCKET } from './lib/supabase';

function AtmosphereGradient() {
  return (
    <div
      className="fixed inset-0 overflow-hidden transition-colors duration-700 pointer-events-none"
      style={{ zIndex: -1 }}
    >
      <motion.div
        animate={{ x: ['-5%', '5%', '-5%'], y: ['-2%', '2%', '-2%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute top-[-15%] left-[-15%] w-[110%] h-[110%] rounded-full will-change-transform"
        style={{
          opacity: 0.15,
          background: 'radial-gradient(circle at 30% 30%, var(--accent) 0%, transparent 70%)',
          filter: 'saturate(1.2) blur(100px)',
        } as React.CSSProperties}
      />
      <motion.div
        animate={{ x: ['5%', '-5%', '5%'], y: ['2%', '-2%', '2%'] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-[-15%] right-[-15%] w-[100%] h-[100%] rounded-full will-change-transform"
        style={{
          opacity: 0.08,
          background: 'radial-gradient(circle at 70% 70%, var(--accent) 0%, transparent 70%)',
          filter: 'blur(90px)',
        } as React.CSSProperties}
      />
    </div>
  );
}

// ── Animated Pencil Loader ──────────────────────────────
function PencilLoader({ progress }: { progress?: number }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black gap-8">
      <svg
        className="pencil"
        viewBox="0 0 200 200"
        width="120"
        height="120"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="pencilGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="#fff" />
          </linearGradient>
        </defs>

        {/* Pencil body */}
        <rect
          className="pencil__body1"
          x="90" y="50" width="8" height="60" rx="2"
          fill="var(--accent)"
          transform-origin="94 80"
        />
        <rect
          className="pencil__body2"
          x="95" y="55" width="3" height="50" rx="1"
          fill="rgba(255,255,255,0.6)"
          transform-origin="96.5 80"
        />
        <rect
          className="pencil__body3"
          x="100" y="50" width="8" height="60" rx="2"
          fill="var(--accent)"
          transform-origin="104 80"
        />

        {/* Eraser */}
        <rect
          className="pencil__eraser"
          x="88" y="45" width="20" height="10" rx="3"
          fill="#FF9FFC"
          transform-origin="98 50"
        />
        <rect
          className="pencil__eraser-skew"
          x="90" y="42" width="16" height="5" rx="2"
          fill="#FF9FFC"
        />

        {/* Point */}
        <polygon
          className="pencil__point"
          points="90,110 98,95 106,110"
          fill="#FFE0B2"
          transform-origin="98 102"
        />
        <polygon
          points="95,110 98,105 101,110"
          fill="#333"
        />

        {/* Circular stroke being drawn */}
        <circle
          className="pencil__stroke"
          cx="100" cy="100" r="70"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeDasharray="439.82"
          strokeDashoffset="439.82"
          transform-origin="100 100"
        />

        {/* Rotating pencil group */}
        <g className="pencil__rotate" transform-origin="100 100">
          <line x1="100" y1="100" x2="100" y2="25" stroke="var(--accent)" strokeWidth="2" opacity="0.3" />
        </g>
      </svg>

      <style>{`
        .pencil__body1,
        .pencil__body2,
        .pencil__body3,
        .pencil__eraser,
        .pencil__eraser-skew,
        .pencil__point,
        .pencil__rotate,
        .pencil__stroke {
          animation-duration: 3s;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .pencil__body1 { animation-name: pencilBody1; }
        .pencil__body2 { animation-name: pencilBody2; }
        .pencil__body3 { animation-name: pencilBody3; }
        .pencil__eraser { animation-name: pencilEraser; }
        .pencil__eraser-skew { animation-name: pencilEraserSkew; animation-timing-function: ease-in-out; }
        .pencil__point { animation-name: pencilPoint; }
        .pencil__rotate { animation-name: pencilRotate; }
        .pencil__stroke { animation-name: pencilStroke; }

        @keyframes pencilBody1 {
          from, to { transform: rotate(-90deg); }
          50% { transform: rotate(-225deg); }
        }
        @keyframes pencilBody2 {
          from, to { transform: rotate(-90deg); }
          50% { transform: rotate(-225deg); }
        }
        @keyframes pencilBody3 {
          from, to { transform: rotate(-90deg); }
          50% { transform: rotate(-225deg); }
        }
        @keyframes pencilEraser {
          from, to { transform: rotate(-45deg) translate(49px,0); }
          50% { transform: rotate(0deg) translate(49px,0); }
        }
        @keyframes pencilEraserSkew {
          from, 32.5%, 67.5%, to { transform: skewX(0); }
          35%, 65% { transform: skewX(-4deg); }
          37.5%, 62.5% { transform: skewX(8deg); }
          40%, 45%, 50%, 55%, 60% { transform: skewX(-15deg); }
          42.5%, 47.5%, 52.5%, 57.5% { transform: skewX(15deg); }
        }
        @keyframes pencilPoint {
          from, to { transform: rotate(-90deg) translate(49px,-30px); }
          50% { transform: rotate(-225deg) translate(49px,-30px); }
        }
        @keyframes pencilRotate {
          from { transform: rotate(0); }
          to { transform: rotate(720deg); }
        }
        @keyframes pencilStroke {
          from { stroke-dashoffset: 439.82; transform: rotate(-113deg); }
          50% { stroke-dashoffset: 164.93; transform: rotate(-113deg); }
          75%, to { stroke-dashoffset: 439.82; transform: rotate(112deg); }
        }
      `}</style>

      {progress !== undefined && (
        <p className="text-white/40 text-xs font-heading tracking-[0.3em] uppercase">
          {Math.round(progress * 100)}%
        </p>
      )}
      {progress === undefined && (
        <p className="text-white/40 text-xs font-heading tracking-[0.3em] uppercase animate-pulse">
          Loading
        </p>
      )}
    </div>
  );
}

// ── Preload Hook ──────────────────────────────────────
function useHeroFramePreloader() {
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const totalFrames = 261;
  const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${SCROLL_SEQUENCE_BUCKET}/`;

  useEffect(() => {
    let cancelled = false;

    const preload = async () => {
      for (let i = 0; i < totalFrames; i++) {
        if (cancelled) break;
        const frameIndex = String(i).padStart(3, '0');
        const url = `${baseUrl}frame_${frameIndex}.webp`;

        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise<void>((resolve, reject) => {
            img.onload = () => img.decode().then(() => resolve()).catch(() => resolve());
            img.onerror = () => reject();
            img.src = url;
          });
        } catch {
          // frame failed, continue
        }

        if (!cancelled) {
          setProgress((i + 1) / totalFrames);
        }
      }

      if (!cancelled) {
        setReady(true);
      }
    };

    preload();

    return () => {
      cancelled = true;
    };
  }, [baseUrl]);

  return { ready, progress };
}

function App() {
  useHoveringPenFavicon();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { ready: framesReady, progress } = useHeroFramePreloader();

  // Wait for both theme + frames
  useEffect(() => {
    loadSavedTheme();
    const subscription = subscribeToThemeChanges();
    return () => subscription.unsubscribe();
  }, []);

  // Stop loader only when frames are ready
  useEffect(() => {
    if (framesReady) {
      setLoading(false);
    }
  }, [framesReady]);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      document.documentElement.style.setProperty('--scroll-offset', `${offset}px`);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  if (loading) {
    return <PencilLoader progress={progress} />;
  }

  if (isAdmin) {
    return (
      <main className="min-h-screen relative">
        <AtmosphereGradient />
        <AdminDashboard onLogout={() => setIsAdmin(false)} />
      </main>
    );
  }

  return (
    <main className="min-h-screen relative overflow-x-hidden">
      <LiquidEtherBackground
        mouseForce={20}
        cursorSize={100}
        resolution={0.25}
        autoDemo={true}
        autoSpeed={0.5}
      />
      <Routes>
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/" element={<HomePage onAdminAuth={() => setIsAdmin(true)} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
}

export default App;
