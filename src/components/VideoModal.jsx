import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CloseDuotone } from './icons/StreamlineIcons';

export default function VideoModal({ isOpen, onClose, youtubeId, title = 'Showreel Showcase' }) {
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Pause Lenis smooth scrolling so the background cannot scroll
    if (typeof window !== 'undefined' && window.__lenis) {
      window.__lenis.stop();
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      if (typeof window !== 'undefined' && window.__lenis) {
        window.__lenis.start();
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 md:p-10"
      style={{ backgroundColor: '#050505' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Subtle Ambient Accent Glow */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle at 50% 50%, var(--accent, #ff8000) 0%, transparent 65%)',
          filter: 'blur(100px)',
        }}
      />

      {/* Pop-up Window Frame */}
      <div
        className="relative w-full max-w-5xl md:max-w-6xl flex flex-col rounded-2xl overflow-hidden border border-white/20 bg-[#0a0a0a] shadow-[0_25px_80px_rgba(0,0,0,1)] z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Window Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-white/[0.04]">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-heading font-black tracking-[0.2em] uppercase text-white/95">
              {title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs font-heading tracking-widest uppercase text-white/70">
              Press ESC to exit
            </span>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200"
              aria-label="Close modal"
            >
              <CloseDuotone size={16} primaryColor="#ffffff" secondaryColor="rgba(255,255,255,0.5)" />
            </button>
          </div>
        </div>

        {/* Video Player Frame */}
        <div className="relative w-full aspect-video bg-black">
          <iframe
            className="w-full h-full border-0"
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
