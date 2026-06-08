import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import { motion } from 'framer-motion';
import { useHoveringPenFavicon } from './hooks/useHoveringPenFavicon';
import { loadSavedTheme, subscribeToThemeChanges, themePresets, applyTheme } from './lib/themes';
import LiquidEtherBackground from './components/LiquidEtherBackground';
import ThemeModeToggle from './components/ThemeModeToggle';

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

function BrandLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black gap-8">
      <style dangerouslySetInnerHTML={{ __html: `
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
        .loader-letter:nth-child(9) { animation-delay: 0.942s; }
        .loader-letter:nth-child(10) { animation-delay: 1.047s; }
        .loader-letter:nth-child(11) { animation-delay: 1.152s; }
        .loader-letter:nth-child(12) { animation-delay: 1.257s; }
        .loader-letter:nth-child(13) { animation-delay: 1.362s; }
        .loader-letter:nth-child(14) { animation-delay: 1.467s; }
        @keyframes loader-letter-anim {
          0% { opacity: 0; }
          5% { opacity: 1; text-shadow: 0 0 4px #fff; transform: scale(1.1) translateY(-2px); }
          20% { opacity: 0.2; }
          100% { opacity: 0; }
        }
        @media (max-width: 640px) {
          .loader-wrapper {
            scale: 1.4;
          }
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  // Tracks the current accent color so LiquidEther re-mounts (rebuilding its
  // WebGL palette) when the user / admin switches theme.
  const [accentKey, setAccentKey] = useState<string>(() => {
    if (typeof window === 'undefined') return 'default';
    return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || 'default';
  });
  // Tracks the current color mode (light/dark). In light mode we hide the
  // WebGL fluid background because its dark accent swirls smudge text contrast.
  // This is the same pattern Linear / Vercel / Stripe use for their hero bgs.
  const [colorMode, setColorMode] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'dark';
    return (document.documentElement.getAttribute('data-mode') as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--scroll-offset', `${window.scrollY}px`);
        ticking = false;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
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

    // STEP 2: Mount the app immediately. Don't wait on Supabase.
    setLoading(false);

    // STEP 3: In the background, fetch the latest theme from Supabase.
    // If admin changed it remotely, it will swap in seamlessly.
    let cancelled = false;
    loadSavedTheme().catch(() => {
      /* network failure is fine, we already have the cached theme */
    });

    const subscription = subscribeToThemeChanges();

    // Watch for accent-color changes (theme switcher in admin or remote update)
    // and refresh the accentKey so LiquidEther rebuilds with the new palette.
    // Also watch data-mode (set by ThemeModeToggle) so we can hide the fluid
    // background in light mode.
    const accentObserver = new MutationObserver(() => {
      const root = document.documentElement;
      const newAccent = getComputedStyle(root).getPropertyValue('--accent').trim();
      if (newAccent) setAccentKey(newAccent);
      const newMode = (root.getAttribute('data-mode') as 'light' | 'dark') || 'dark';
      setColorMode((prev) => (prev !== newMode ? newMode : prev));
    });
    accentObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'data-theme', 'data-mode'] });

    return () => {
      cancelled = true;
      void cancelled;
      subscription.unsubscribe();
      accentObserver.disconnect();
    };
  }, []);

  // Force scroll to top on every full page load / hard refresh.
  // Runs in three phases because different browsers (esp. Chrome on Android
  // and Safari) restore scroll at different points:
  //   1. Immediately on mount (catches most cases)
  //   2. After first paint (catches layout-shift-induced jumps)
  //   3. After image/font loads settle (catches the stragglers)
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    const forceTop = () => window.scrollTo(0, 0);

    forceTop(); // phase 1: immediate

    // phase 2: after the next two animation frames (layout has settled)
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(forceTop);
      (forceTop as any)._raf2 = raf2;
    });

    // phase 3: once the window has fully loaded (fonts/images done)
    const onLoad = () => forceTop();
    if (document.readyState === 'complete') {
      forceTop();
    } else {
      window.addEventListener('load', onLoad, { once: true });
    }

    return () => {
      cancelAnimationFrame(raf1);
      window.removeEventListener('load', onLoad);
    };
  }, []);

  if (loading) {
    return <BrandLoader />;
  }

  if (isAdmin) {
    return (
      <main className="min-h-screen relative">
        <AtmosphereGradient />
        <Suspense fallback={<BrandLoader />}>
          <AdminDashboard onLogout={() => setIsAdmin(false)} />
        </Suspense>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative overflow-x-hidden">
      {colorMode === 'dark' ? (
        <LiquidEtherBackground
          key={accentKey}
          mouseForce={20}
          cursorSize={100}
          resolution={0.25}
          autoDemo={true}
          autoSpeed={0.5}
        />
      ) : (
        // Light-mode fallback: soft static atmospheric gradient using the
        // DECORATIVE (unaltered) accent. No animation, no GPU cost, and the
        // very low opacity guarantees text contrast stays compliant.
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none"
          style={{
            zIndex: 0,
            background: `
              radial-gradient(60vw 60vh at 15% 20%, color-mix(in srgb, var(--accent-decorative, var(--accent)) 18%, transparent) 0%, transparent 60%),
              radial-gradient(50vw 50vh at 85% 75%, color-mix(in srgb, var(--accent-decorative, var(--accent)) 14%, transparent) 0%, transparent 60%),
              var(--bg-primary)
            `,
          }}
        />
      )}
      <Suspense fallback={null}>
        <Routes>
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/" element={<HomePage onAdminAuth={() => setIsAdmin(true)} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <ThemeModeToggle />
    </main>
  );
}

export default App;
