import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import { motion } from 'framer-motion';
import { useHoveringPenFavicon } from './hooks/useHoveringPenFavicon';
import { loadSavedTheme, subscribeToThemeChanges, themePresets, applyTheme } from './lib/themes';
import LiquidEtherBackground from './components/LiquidEtherBackground';
import { supabase } from './lib/supabase';
import { isAdminEmail } from './lib/admin';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Lazy-load admin / legal pages so they don't bloat the main bundle
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));

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

function BrandLoader({ isFading = false }: { isFading?: boolean }) {
  return (
    <div className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-black transition-opacity duration-700 ${isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        .loader-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 80px;
          width: auto;
          margin: 1.5rem;
          font-family: var(--font-heading), 'Satoshi', sans-serif;
          font-size: clamp(1.2rem, 3.5vw, 2.2rem);
          font-weight: 900;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          user-select: none;
          color: #ffffff;
        }
        .loader {
          position: absolute;
          inset: -10px -20px;
          z-index: 1;
          background-color: transparent;
          -webkit-mask: repeating-linear-gradient(
            90deg,
            transparent 0,
            transparent 6px,
            black 7px,
            black 8px
          );
          mask: repeating-linear-gradient(
            90deg,
            transparent 0,
            transparent 6px,
            black 7px,
            black 8px
          );
          pointer-events: none;
        }
        .loader::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(circle at 50% 50%, var(--accent, #ff8000) 0%, transparent 60%),
            radial-gradient(circle at 45% 45%, #ff0055 0%, transparent 50%),
            radial-gradient(circle at 55% 55%, #00ffff 0%, transparent 50%);
          -webkit-mask: radial-gradient(
            circle at 50% 50%,
            transparent 0%,
            transparent 15%,
            black 40%
          );
          mask: radial-gradient(
            circle at 50% 50%,
            transparent 0%,
            transparent 15%,
            black 40%
          );
          animation:
            loader-sweep 2s infinite alternate,
            loader-glow 3s infinite;
          animation-timing-function: cubic-bezier(0.6, 0.8, 0.5, 1);
        }
        @keyframes loader-sweep {
          0% { transform: translate(-40%); }
          100% { transform: translate(40%); }
        }
        @keyframes loader-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.85; }
        }
        .loader-letter {
          display: inline-block;
          opacity: 0.25;
          animation: loader-letter-anim 2.5s infinite ease-in-out;
          z-index: 2;
          color: #ffffff;
        }
        .loader-letter:nth-child(1) { animation-delay: 0.08s; }
        .loader-letter:nth-child(2) { animation-delay: 0.16s; }
        .loader-letter:nth-child(3) { animation-delay: 0.24s; }
        .loader-letter:nth-child(4) { animation-delay: 0.32s; }
        .loader-letter:nth-child(5) { animation-delay: 0.40s; }
        .loader-letter:nth-child(6) { animation-delay: 0.48s; }
        .loader-letter:nth-child(7) { animation-delay: 0.56s; }
        .loader-letter:nth-child(8) { animation-delay: 0.64s; }
        .loader-letter:nth-child(9) { animation-delay: 0.72s; }
        .loader-letter:nth-child(10) { animation-delay: 0.80s; }
        .loader-letter:nth-child(11) { animation-delay: 0.88s; }
        .loader-letter:nth-child(12) { animation-delay: 0.96s; }
        .loader-letter:nth-child(13) { animation-delay: 1.04s; }
        .loader-letter:nth-child(14) { animation-delay: 1.12s; }
        .loader-letter:nth-child(15) { animation-delay: 1.20s; }
        @keyframes loader-letter-anim {
          0%, 100% { opacity: 0.25; transform: translateY(0); }
          25% { opacity: 1; text-shadow: 0 0 12px var(--accent, #FC931F), 0 0 24px #fff; transform: translateY(-2px) scale(1.04); }
          50% { opacity: 0.7; transform: translateY(0); }
        }
      `}} />

      <div className="loader-wrapper">
        <span className="loader"></span>
        {'ILLUSIVE STUDIO'.split('').map((letter, i) => (
          <span key={i} className="loader-letter">
            {letter === ' ' ? '\u00A0' : letter}
          </span>
        ))}
      </div>
    </div>
  );
}

function App() {
  useHoveringPenFavicon();
  const [isAdmin, setIsAdmin] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('admin-authenticated') === 'true';
  });
  const [showLoader, setShowLoader] = useState(true);
  const [loaderFading, setLoaderFading] = useState(false);
  // Tracks the current accent color so LiquidEther re-mounts (rebuilding its
  // WebGL palette) when the user / admin switches theme.
  const [accentKey, setAccentKey] = useState<string>(() => {
    if (typeof window === 'undefined') return 'default';
    return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || 'default';
  });

  useEffect(() => {
    // Check and restore active Supabase auth session
    const initAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          localStorage.removeItem('admin-auth-pending');
          if (isAdminEmail(data.session.user.email)) {
            localStorage.setItem('admin-authenticated', 'true');
            // If returning to admin or on /admin route, activate admin
            if (localStorage.getItem('admin-authenticated') === 'true' || window.location.pathname === '/admin') {
              setIsAdmin(true);
            }
          } else {
            localStorage.removeItem('admin-authenticated');
            setIsAdmin(false);
            await supabase.auth.signOut();
            window.alert('This Google account is not authorized for admin access.');
          }
        } else {
          // No active session in Supabase
          localStorage.removeItem('admin-authenticated');
          setIsAdmin(false);
        }
      } catch (err) {
        console.warn('Session verification error:', err);
      }
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email && isAdminEmail(session.user.email)) {
        localStorage.removeItem('admin-auth-pending');
        localStorage.setItem('admin-authenticated', 'true');
        setIsAdmin(true);
      } else if (!session) {
        localStorage.removeItem('admin-authenticated');
        setIsAdmin(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    window.__lenis = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  useEffect(() => {
    // STEP 1: Apply cached theme synchronously from localStorage so the
    // LiquidEther background reads the correct --accent color on first paint.
    // This is the critical fix — without it the BG samples the default purple
    // before the saved theme is applied.
    try {
      const cachedId = localStorage.getItem('portfolio-theme');
      if (cachedId) {
        const cached = themePresets.find((t) => t.id === cachedId);
        if (cached) applyTheme(cached, false);
      }
    } catch {
      // localStorage blocked — fine, fall through to remote load
    }

    // STEP 2: In the background, fetch the latest theme from Supabase.
    // If admin changed it remotely, it will swap in seamlessly.
    let cancelled = false;
    loadSavedTheme().catch(() => {
      /* network failure is fine, we already have the cached theme */
    });

    const subscription = subscribeToThemeChanges();

    // Watch for accent-color changes (theme switcher in admin or remote update)
    // and refresh the accentKey so LiquidEther rebuilds with the new palette.
    const accentObserver = new MutationObserver(() => {
      const newAccent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
      if (newAccent) setAccentKey(newAccent);
    });
    accentObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'data-theme'] });

    return () => {
      cancelled = true;
      void cancelled;
      subscription.unsubscribe();
      accentObserver.disconnect();
    };
  }, []);

  // Display the custom BrandLoader during initial load
  // so the laser letter animation plays while initial assets load underneath.
  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setLoaderFading(true);
      window.scrollTo(0, 0);
      const removeTimer = setTimeout(() => {
        setShowLoader(false);
      }, 700);
      return () => clearTimeout(removeTimer);
    }, 2400);

    return () => clearTimeout(fadeTimer);
  }, []);

  // Ensure scroll is at top on mount
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    const forceTop = () => window.scrollTo(0, 0);
    forceTop();

    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(forceTop);
    });

    return () => {
      cancelAnimationFrame(raf1);
    };
  }, []);

  if (isAdmin) {
    return (
      <main className="min-h-screen relative">
        {showLoader && <BrandLoader isFading={loaderFading} />}
        <AtmosphereGradient />
        <Suspense fallback={<BrandLoader isFading={false} />}>
          <AdminDashboard
            onExit={() => setIsAdmin(false)}
            onLogout={async () => {
              localStorage.removeItem('admin-authenticated');
              localStorage.removeItem('admin-auth-pending');
              await supabase.auth.signOut();
              setIsAdmin(false);
            }}
          />
        </Suspense>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative overflow-x-hidden">
      {showLoader && <BrandLoader isFading={loaderFading} />}
      <LiquidEtherBackground
        key={accentKey}
        mouseForce={20}
        cursorSize={100}
        resolution={0.25}
        autoDemo={true}
        autoSpeed={0.5}
      />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/" element={<HomePage onAdminAuth={() => setIsAdmin(true)} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </main>
  );
}

export default App;
