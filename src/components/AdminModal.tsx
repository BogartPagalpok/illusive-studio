import { useState } from 'react';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setError(false);
      setPassword('');
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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: shake ? [1, 1.02, 0.98, 1.01, 1] : 1,
              opacity: 1,
            }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="p-8 max-w-sm w-full relative rounded-none"
            style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-none flex items-center justify-center hover:text-accent transition-colors"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', opacity: 0.4, border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <X size={16} />
            </button>

            <div className="text-center mb-6">
              <div
                className="w-16 h-16 mx-auto rounded-none flex items-center justify-center mb-4"
                style={{ backgroundColor: 'rgba(109,0,26,0.1)', border: '1px solid var(--accent)' }}
              >
                <Lock size={28} className="text-accent" />
              </div>
              <h3 className="heading-md">Admin Access</h3>
              <p className="text-sm mt-2 font-body" style={{ color: 'var(--text-secondary)', opacity: 0.4 }}>
                Enter the admin password to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                  className={`w-full px-4 py-3 rounded-none font-body focus:outline-none focus:ring-1 transition-all ${
                    error ? 'focus:ring-red-500/30' : 'focus:ring-accent/30'
                  }`}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: error ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                    color: 'var(--text-primary)',
                  }}
                  placeholder="Password"
                  autoFocus
                />
                {error && (
                  <p className="text-xs text-red-400 mt-2 font-heading tracking-wider uppercase">
                    Incorrect password
                  </p>
                )}
              </div>
              <button type="submit" className="btn-primary w-full justify-center">
                Authenticate
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
