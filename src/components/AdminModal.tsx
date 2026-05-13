import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X } from 'lucide-react';

const ADMIN_PASSWORD = '@Satanas666';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminModal({ isOpen, onClose, onSuccess }: AdminModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  // Clear state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPassword('');
      setError(false);
      setShake(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setError(false);
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
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
            className="p-8 max-w-sm w-full relative rounded-3xl border border-white/10 shadow-2xl backdrop-blur-2xl"
            style={{ 
              backgroundColor: 'var(--bg-secondary)', 
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255,255,255,0.05)' 
            }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-all duration-300 active:scale-90"
              style={{ color: 'var(--text-primary)', opacity: 0.6 }}
            >
              <X size={20} />
            </button>

            <div className="text-center mb-8">
              <div
                className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 shadow-lg"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.03)', 
                  border: '1px solid var(--accent)',
                  boxShadow: '0 0 30px -5px var(--accent)' 
                }}
              >
                <Lock size={32} className="text-accent drop-shadow-[0_0_8px_var(--accent)]" />
              </div>
              <h3 className="text-2xl font-heading font-black text-white tracking-tighter uppercase">Admin Access</h3>
              <p className="text-[10px] mt-3 font-heading tracking-widest uppercase opacity-60 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Provide master credentials to enter the control lab.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                  className={`w-full px-5 py-4 rounded-xl font-sans focus:outline-none transition-all duration-300 placeholder:text-white/20 ${
                    error ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 bg-white/5 focus:border-accent/50 focus:bg-white/10'
                  }`}
                  style={{
                    border: error ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                    color: 'var(--text-primary)',
                  }}
                  placeholder="••••••••"
                  autoFocus
                />
                <AnimatePresence>
                  {error && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-[10px] text-red-400 mt-3 font-heading tracking-[0.2em] uppercase font-bold text-center"
                    >
                      Unauthorized access denied
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <button type="submit" className="btn-primary w-full justify-center py-5 shadow-xl group">
                <span className="group-hover:scale-110 transition-transform duration-300">Authenticate System</span>
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
