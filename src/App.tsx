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
import { heroSequenceCache } from './lib/heroSequenceCache';

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

function BrandLoader({ progress = 0, isFading = false }: { progress?: number; isFading?: boolean }) {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    let animId: number;
    let current = 0;
    const startTime = performance.now();

    const update = (now: number) => {
      // Natural sequence preload progress (0 to 1)
      const rawTarget = Math.min(100, Math.max(0, Math.round(progress * 100)));

      // Pacing curve ensures the counter starts counting upwards immediately (never frozen at 1%)
      const elapsed = now - startTime;
      const pacing = Math.min(40, Math.floor((elapsed / 600) * 40));
      const target = Math.max(pacing, rawTarget);

      if (current < target) {
        const diff = target - current;
        const step = Math.max(1, Math.ceil(diff * 0.14));
        current = Math.min(target, current + step);
        setPercent(current);
      }

      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [progress]);

  return (
    <div className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-black transition-opacity duration-700 ${isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        .loader-scanner {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100vw;
          max-width: 1200px;
          height: 480px;
          pointer-events: none;
          z-index: 1;
          background-color: transparent;
          -webkit-mask-image: repeating-linear-gradient(
            90deg,
            transparent 0,
            transparent 6px,
            black 7px,
            black 8px
          );
          mask-image: repeating-linear-gradient(
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
          top: 50%;
          left: 50%;
          width: min(85vw, 540px);
          height: 380px;
          margin-top: -190px;
          margin-left: max(-270px, -42.5vw);
          background-image: 
            radial-gradient(circle at 50% 50%, var(--accent, #ff8000) 0%, transparent 65%),
            radial-gradient(circle at 45% 45%, #ff0055 0%, transparent 50%),
            radial-gradient(circle at 55% 55%, #00ffff 0%, transparent 50%);
          -webkit-mask-image: radial-gradient(
            ellipse 48% 46% at 50% 50%,
            black 0%,
            black 20%,
            transparent 70%
          );
          mask-image: radial-gradient(
            ellipse 48% 46% at 50% 50%,
            black 0%,
            black 20%,
            transparent 70%
          );
          animation:
            loader-sweep 2.8s infinite alternate ease-in-out,
            loader-glow 3s infinite ease-in-out;
          will-change: transform, opacity;
        }
        @keyframes loader-sweep {
          0% { transform: translateX(calc(-1 * min(20vw, 160px))) scale(0.94); }
          100% { transform: translateX(min(20vw, 160px)) scale(1.06); }
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

      <div className="relative flex flex-col items-center justify-center w-full max-w-4xl px-4 min-h-[320px] overflow-visible">
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

        {/* Subtle Progress Bar & Percentage */}
        <div className="relative z-10 flex flex-col items-center gap-2 mt-3">
          <div className="w-48 sm:w-64 h-[2px] bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-200 ease-out rounded-full"
              style={{ width: `${Math.max(4, percent)}%`, boxShadow: '0 0 10px var(--accent)' }}
            />
          </div>
          <span className="text-white/45 font-mono text-[10px] sm:text-xs tracking-[0.25em] uppercase font-bold">
            {percent}%
          </span>
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
  const [loadProgress, setLoadProgress] = useState(0);
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
    // Enable Lenis smooth scrolling for desktops and laptops.
    // Keep native touch momentum on phones and small tablets.
    const isMobileDevice = window.innerWidth < 1024 || (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    if (isMobileDevice) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.0,
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
    // lagSmoothing(0) is required when pairing GSAP ticker with Lenis RAF
    // so the virtual scroll position and GSAP timeline never drift apart.
    gsap.ticker.lagSmoothing(0);

    // Keep Lenis scroll metrics synchronized when body height changes without triggering a ScrollTrigger rebuild loop
    let resizeTimer: any;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        lenis.resize();
      }, 100);
    });

    if (document.body) {
      resizeObserver.observe(document.body);
    }

    const handleWindowResize = () => {
      lenis.resize();
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', handleWindowResize);
    window.addEventListener('orientationchange', handleWindowResize);

    return () => {
      clearTimeout(resizeTimer);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleWindowResize);
      window.removeEventListener('orientationchange', handleWindowResize);
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

  // Preload hero sequence frames during BrandLoader so initial scroll never gets stuck on frame 0
  useEffect(() => {
    heroSequenceCache.startPreload();

    const mountTime = performance.now();
    let finished = false;
    let fadeTimer: any;
    let removeTimer: any;
    let readyTimer: any;

    const finishLoading = () => {
      if (finished) return;
      finished = true;
      fadeTimer = setTimeout(() => {
        setLoaderFading(true);
        window.scrollTo(0, 0);
        removeTimer = setTimeout(() => {
          setShowLoader(false);
        }, 700);
      }, 350);
    };

    const unsubscribe = heroSequenceCache.subscribe((progress, ready) => {
      setLoadProgress(progress);
      if (ready) {
        // Ensure at least 1.3s of smooth loader animation so user experiences the brand laser and count-up
        const elapsed = performance.now() - mountTime;
        const remaining = Math.max(0, 1300 - elapsed);
        clearTimeout(readyTimer);
        readyTimer = setTimeout(() => {
          setLoadProgress(1);
          finishLoading();
        }, remaining);
      }
    });

    // Safety fallback timer: guarantees unmount even if user is offline or connection times out
    const safetyTimer = setTimeout(() => {
      setLoadProgress(1);
      finishLoading();
    }, 4500);

    return () => {
      unsubscribe();
      clearTimeout(readyTimer);
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
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
        {showLoader && <BrandLoader progress={loadProgress} isFading={loaderFading} />}
        <AtmosphereGradient />
        <Suspense fallback={<BrandLoader progress={1} isFading={false} />}>
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
    <main className="min-h-screen relative overflow-x-clip">
      {showLoader && <BrandLoader progress={loadProgress} isFading={loaderFading} />}
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
