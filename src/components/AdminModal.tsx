import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { isAdminEmail } from '../lib/admin';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminModal({ isOpen, onClose, onSuccess }: AdminModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const onSuccessRef = useRef(onSuccess);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    if (!isOpen) {
      setError((prev) => (prev ? false : prev));
      setShake((prev) => (prev ? false : prev));
      return;
    }

    const checkActiveSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user?.email && isAdminEmail(data.session.user.email)) {
          onSuccessRef.current?.();
        }
      } catch {
        // Continue to show modal
      }
    };

    checkActiveSession();
  }, [isOpen]);

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setError(false);
    localStorage.setItem('admin-auth-pending', 'true');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      localStorage.removeItem('admin-auth-pending');
      setIsSubmitting(false);
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } else {
      onSuccess?.();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{
              scale: shake ? [1, 1.05, 0.95, 1.05, 0.95, 1] : 1,
              opacity: 1,
              y: 0,
              x: shake ? [-10, 10, -10, 10, 0] : 0
            }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="card-dark-sm p-6 max-w-sm w-full relative"
            style={{ 
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255,255,255,0.05)' 
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-all duration-300 active:scale-90"
              style={{ color: 'var(--text-primary)', opacity: 0.6 }}
            >
              <X size={18} />
            </button>

            {/* Icon + heading */}
            <div className="text-center mb-6">
              <div
                className="w-16 h-16 mx-auto rounded-xl flex items-center justify-center mb-4 transition-all duration-500 shadow-lg"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.03)', 
                  border: '1px solid var(--accent)',
                  boxShadow: '0 0 20px -5px var(--accent)' 
                }}
              >
                <Lock size={24} className="text-accent drop-shadow-[0_0_6px_var(--accent)]" />
              </div>
              <h3 className="text-xl font-heading font-black text-white tracking-tighter uppercase">Admin Access</h3>
              <p className="text-xs mt-2 font-heading tracking-widest uppercase text-[var(--text-muted)] leading-relaxed">
                Restricted studio access
              </p>
            </div>

            <div className="space-y-5">
                <AnimatePresence>
                  {error && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs text-red-400 mt-2 font-heading tracking-[0.2em] uppercase font-bold text-center"
                    >
                      Unauthorized access denied
                    </motion.p>
                  )}
                </AnimatePresence>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-white/15 px-4 py-2.5 text-xs font-heading font-bold uppercase tracking-widest text-white hover:bg-white/10 transition disabled:opacity-50"
              >
                Continue with Google
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
