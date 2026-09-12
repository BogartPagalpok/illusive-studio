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
import ErrorBoundary from './components/ErrorBoundary';

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
        .loader-scanner {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: min(92vw, 680px);
          height: 320px;
          pointer-events: none;
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
        }
        .loader-scanner::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(circle at 50% 50%, var(--accent, #ff8000) 0%, transparent 60%),
            radial-gradient(circle at 45% 45%, #ff0055 0%, transparent 50%),
            radial-gradient(circle at 55% 55%, #00ffff 0%, transparent 50%);
          -webkit-mask: radial-gradient(
            circle at 50% 50%,
            black 0%,
            black 25%,
            transparent 55%
          );
          mask: radial-gradient(
            circle at 50% 50%,
            black 0%,
            black 25%,
            transparent 55%
          );
          animation:
            loader-sweep 2.5s infinite alternate ease-in-out,
            loader-glow 3s infinite ease-in-out;
        }
        @keyframes loader-sweep {
          0% { transform: translateX(-35%) scale(0.9); }
          100% { transform: translateX(35%) scale(1.1); }
        }
        @keyframes loader-glow {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.95; }
        }
        .loader-wrapper {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 1.5rem;
          font-family: var(--font-heading), 'Satoshi', sans-serif;
          font-size: clamp(1.3rem, 3.8vw, 2.4rem);
          font-weight: 900;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          user-select: none;
          color: #ffffff;
        }
        .loader-letter {
          position: relative;
          z-index: 2;
          display: inline-block;
          opacity: 0.4;
          animation: loader-letter-anim 2.5s infinite ease-in-out;
          color: #ffffff;
        }
        @keyframes loader-letter-anim {
          0%, 100% { opacity: 0.4; transform: translateY(0); }
          25% { opacity: 1; text-shadow: 0 0 18px var(--accent, #FC931F), 0 0 36px #ffffff; transform: translateY(-2px) scale(1.05); }
          50% { opacity: 0.75; transform: translateY(0); }
        }
      `}} />

      <div className="relative flex items-center justify-center w-full max-w-2xl px-4 min-h-[300px]">
        {/* Full unmasked scanning circular radar beam */}
        <div className="loader-scanner" />

        {/* Brand Text */}
        <div className="loader-wrapper">
          {'ILLUSIVE STUDIO'.split('').map((letter, i) => (
            <span 
              key={i} 
              className="loader-letter"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {letter === ' ' ? '\u00A0' : letter}
            </span>
          ))}
        </div>
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
    // Keep native 120Hz/60Hz touch scrolling on mobile and tablets.
    // Lenis is only enabled for desktop mouse-wheel interactions.
    const isTouch = 'ontouchstart' in window || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0);
    const isSmallViewport = window.innerWidth < 1024;
    if (isTouch || isSmallViewport) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
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
  // with a guaranteed unmount timer so it can NEVER get stuck on any device.
  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setLoaderFading(true);
      window.scrollTo(0, 0);
      const removeTimer = setTimeout(() => {
        setShowLoader(false);
      }, 700);
      return () => clearTimeout(removeTimer);
    }, 1900);

    const safetyTimer = setTimeout(() => {
      setLoaderFading(true);
      setShowLoader(false);
    }, 3200);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(safetyTimer);
    };
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
      <ErrorBoundary componentName="LiquidEtherBackground" fallback={<AtmosphereGradient />}>
        <LiquidEtherBackground
          key={accentKey}
          mouseForce={20}
          cursorSize={100}
          resolution={0.25}
          autoDemo={true}
          autoSpeed={0.5}
        />
      </ErrorBoundary>
      <ErrorBoundary componentName="AppContent">
        <Suspense fallback={null}>
          <Routes>
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/" element={<HomePage onAdminAuth={() => setIsAdmin(true)} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}

export default App;
