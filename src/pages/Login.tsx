/*
 * AnimatedLiquidBackground_Prod
 *
 * Learn More: https://www.framer.com/asset-urls
 */
export * from "https://framerusercontent.com/modules/xx99X8dO7V1Egbc8GwnH/ghH1aHLmGZ0iE7qXDFVk/AnimatedLiquidBackground_Prod.js"
export { default } from "https://framerusercontent.com/modules/xx99X8dO7V1Egbc8GwnH/ghH1aHLmGZ0iE7qXDFVk/AnimatedLiquidBackground_Prod.js"

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Facebook } from 'lucide-react';
import { supabase } from '../lib/supabase';
// Import the background component (named "AnimatedLiquidBackground" after the default export)
import AnimatedLiquidBackground from "https://framerusercontent.com/modules/xx99X8dO7V1Egbc8GwnH/ghH1aHLmGZ0iE7qXDFVk/AnimatedLiquidBackground_Prod.js";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'facebook' | null>(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [successMsg, setSuccessMsg] = useState('');

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccessMsg('Account created! You can now sign in.');
        setMode('signin');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    setLoadingProvider(provider);
    setError('');

    const baseUrl = window.location.origin.endsWith('/')
      ? window.location.origin.slice(0, -1)
      : window.location.origin;

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${baseUrl}/`,
      },
    });

    if (error) {
      console.error(`${provider} login error:`, error.message);
      setError(error.message);
      setLoadingProvider(null);
    }
  };

  return (
    <main className="relative min-h-screen w-screen overflow-hidden">
      {/* Liquid background – fills entire screen, stays behind everything */}
      <div className="absolute inset-0 z-0">
        <AnimatedLiquidBackground
          preset="Plasma"          // Swap with "Lava", "Prism", "Pulse", "Vortex", or "Mist"
          speed={0.4}             // Adjust animation speed
          distortion={1.2}        // Control liquid distortion
        />
      </div>

      {/* Content – placed on top with a higher z‑index */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-10">
            <h1 className="font-heading font-black text-3xl tracking-wider uppercase" style={{ color: 'var(--text-primary)' }}>
              IAN<span className="text-accent">.</span>LESTER
            </h1>
            <p className="text-xs font-heading tracking-[0.3em] uppercase mt-2" style={{ color: 'var(--text-secondary)', opacity: 0.4 }}>
              {mode === 'signin' ? 'Sign in to continue' : 'Create your account'}
            </p>
          </div>

          <div className="card-dark p-8 border-white/10">
            {/* OAuth Buttons */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleOAuthLogin('google')}
                disabled={!!loadingProvider}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-white/10 bg-white/5 hover:bg-white/10 transition-all font-heading text-xs tracking-widest uppercase disabled:opacity-50"
                style={{ color: 'var(--text-primary)' }}
              >
                {loadingProvider === 'google' ? (
                  <span className="animate-spin w-4 h-4 border-2 border-accent border-t-transparent rounded-full" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Continue with Google
              </button>

              <button
                onClick={() => handleOAuthLogin('facebook')}
                disabled={!!loadingProvider}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-white/10 bg-white/5 hover:bg-white/10 transition-all font-heading text-xs tracking-widest uppercase disabled:opacity-50"
                style={{ color: 'var(--text-primary)' }}
              >
                {loadingProvider === 'facebook' ? (
                  <span className="animate-spin w-4 h-4 border-2 border-accent border-t-transparent rounded-full" />
                ) : (
                  <Facebook size={16} className="text-[#1877F2]" />
                )}
                Continue with Facebook
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] font-heading tracking-[0.2em] uppercase" style={{ color: 'var(--text-secondary)', opacity: 0.3 }}>
                or
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <label className="block text-[10px] font-heading tracking-[0.2em] uppercase mb-2" style={{ color: 'var(--text-secondary)', opacity: 0.4 }}>
                  Email
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-white/5 border border-white/10 font-body text-sm focus:outline-none focus:border-accent/50 transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-heading tracking-[0.2em] uppercase mb-2" style={{ color: 'var(--text-secondary)', opacity: 0.4 }}>
                  Password
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-white/5 border border-white/10 font-body text-sm focus:outline-none focus:border-accent/50 transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-400 font-heading tracking-wider uppercase">{error}</p>
              )}
              {successMsg && (
                <p className="text-xs font-heading tracking-wider uppercase" style={{ color: 'var(--accent)' }}>{successMsg}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center disabled:opacity-50"
              >
                {loading ? (
                  <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  <LogIn size={16} />
                )}
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {/* Toggle mode */}
            <p className="text-center text-xs font-body mt-6" style={{ color: 'var(--text-secondary)', opacity: 0.4 }}>
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setSuccessMsg(''); }}
                className="hover:text-accent transition-colors underline"
                style={{ color: 'var(--text-secondary)' }}
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
