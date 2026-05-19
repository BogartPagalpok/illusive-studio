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

// ── Uiverse Loader ────────────────────────────────────
function BrandLoader({ progress }: { progress: number }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black gap-8">
      <style>{`
        .loader-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 120px;
          width: auto;
          margin: 2rem;
          font-family: "Poppins", sans-serif;
          font-size: 1.6em;
          font-weight: 600;
          user-select: none;
          color: #fff;
          scale: 2;
        }
        .loader {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          z-index: 1;
          background-color: transparent;
          mask: repeating-linear-gradient(
            90deg,
            transparent 0,
            transparent 6px,
            black 7px,
            black 8px
          );
        }
        .loader::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(circle at 50% 50%, #ff0 0%, transparent 50%),
            radial-gradient(circle at 45% 45%, #f00 0%, transparent 45%),
            radial-gradient(circle at 55% 55%, #0ff 0%, transparent 45%),
            radial-gradient(circle at 45% 55%, #0f0 0%, transparent 45%),
            radial-gradient(circle at 55% 45%, #00f 0%, transparent 45%);
          mask: radial-gradient(
            circle at 50% 50%,
            transparent 0%,
            transparent 10%,
            black 25%
          );
          animation:
            transform-animation 2s infinite alternate,
            opacity-animation 4s infinite;
          animation-timing-function: cubic-bezier(0.6, 0.8, 0.5, 1);
        }
        @keyframes transform-animation {
          0% { transform: translate(-55%); }
          100% { transform: translate(55%); }
        }
        @keyframes opacity-animation {
          0%, 100% { opacity: 0; }
          15% { opacity: 1; }
          65% { opacity: 0; }
        }
        .loader-letter {
          display: inline-block;
          opacity: 0;
          animation: loader-letter-anim 4s infinite linear;
          z-index: 2;
        }
        .loader-letter:nth-child(1) { animation-delay: 0.1s; }
        .loader-letter:nth-child(2) { animation-delay: 0.205s; }
        .loader-letter:nth-child(3) { animation-delay: 0.31s; }
        .loader-letter:nth-child(4) { animation-delay: 0.415s; }
        .loader-letter:nth-child(5) { animation-delay: 0.521s; }
        .loader-letter:nth-child(6) { animation-delay: 0.626s; }
        .loader-letter:nth-child(7) { animation-delay: 0.731s; }
        .loader-letter:nth-child(8) { animation-delay: 0.837s; }
        @keyframes loader-letter-anim {
          0% { opacity: 0; }
          5% { opacity: 1; text-shadow: 0 0 4px #fff; transform: scale(1.1) translateY(-2px); }
          20% { opacity: 0.2; }
          100% { opacity: 0; }
        }
      `}</style>

      <div className="loader-wrapper">
        <span className="loader"></span>
        {'LOADING'.split('').map((letter, i) => (
          <span key={i} className="loader-letter">{letter}</span>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-48 md:w-64 h-[1px] bg-white/10 overflow-hidden">
        <div
          className="h-full bg-white transition-all duration-500 ease-out"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>

      <p className="text-white/30 text-xs tracking-[0.3em] uppercase">
        {Math.round(progress * 100)}%
      </p>
    </div>
  );
}

// ── Smart Preload: Load enough frames to start smooth, then continue ──
function useHeroFramePreloader() {
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const totalFrames = 261;
  const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${SCROLL_SEQUENCE_BUCKET}/`;

  useEffect(() => {
    let cancelled = false;

    const preload = async () => {
      // Strategy: Load first 30 frames before showing site (covers initial scroll)
      // Then load the rest in background
      const MIN_FRAMES_TO_START = 30;

      // Phase 1: Load critical frames
      for (let i = 0; i < MIN_FRAMES_TO_START; i++) {
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

      // Phase 2: Site is ready to show
      if (!cancelled) {
        setReady(true);
      }

      // Phase 3: Load remaining frames in background
      for (let i = MIN_FRAMES_TO_START; i < totalFrames; i++) {
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
          // continue
        }

        if (!cancelled) {
          setProgress((i + 1) / totalFrames);
        }
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

  useEffect(() => {
    loadSavedTheme();
    const subscription = subscribeToThemeChanges();
    return () => subscription.unsubscribe();
  }, []);

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
    return <BrandLoader progress={progress} />;
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
