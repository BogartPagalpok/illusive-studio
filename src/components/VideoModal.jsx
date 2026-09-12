import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function VideoModal({ isOpen, onClose, youtubeId }) {
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/90 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 md:top-6 md:right-6 text-white/80 hover:text-white transition-colors duration-200 p-2 rounded-full hover:bg-white/10 z-50"
        aria-label="Close modal"
      >
        <X className="w-8 h-8 md:w-10 md:h-10" />
      </button>

      <div
        className="relative w-full max-w-5xl md:max-w-6xl aspect-video rounded-xl overflow-hidden shadow-2xl bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          className="w-full h-full border-0"
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  );
}
