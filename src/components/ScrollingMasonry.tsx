import { useEffect, useState, useMemo, useCallback } from 'react';
import { CloseDuotone } from './icons/StreamlineIcons';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScrollingMasonryProps {
  projects: Array<{
    id: string;
    title: string;
    image_url: string;
    description?: string;
  }>;
  height?: number;
  speed?: number;
}

export default function ScrollingMasonry({
  projects,
  height = 600,
  speed = 100,
}: ScrollingMasonryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [columns, setColumns] = useState(3);

  useEffect(() => {
    const updateColumns = () => {
      setColumns(window.innerWidth >= 1024 ? 5 : 3);
    };
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  const images = useMemo(() => {
    return projects
      .filter((p) => Boolean(p.image_url))
      .map((p) => ({
        id: p.id,
        title: p.title,
        url: p.image_url,
        description: p.description || '',
      }));
  }, [projects]);

  const handlePrev = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (images.length === 0) return;
      setSelectedIndex((prev) => (prev !== null ? (prev - 1 + images.length) % images.length : 0));
    },
    [images.length]
  );

  const handleNext = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (images.length === 0) return;
      setSelectedIndex((prev) => (prev !== null ? (prev + 1) % images.length : 0));
    },
    [images.length]
  );

  // Keyboard navigation
  useEffect(() => {
    if (selectedIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, handlePrev, handleNext]);

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    setTouchStartX(null);
  };

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-white/30 font-mono text-sm">
        No images to display
      </div>
    );
  }

  const cols: Array<Array<{ item: (typeof images)[0]; originalIndex: number }>> = Array.from(
    { length: columns },
    () => []
  );
  images.forEach((img, idx) => {
    cols[idx % columns].push({ item: img, originalIndex: idx });
  });

  const currentImg = selectedIndex !== null ? images[selectedIndex] : null;

  return (
    <>
      <div className="w-full" style={{ height: `${height}px`, overflow: 'hidden' }}>
        <style>{`
          @keyframes scrollVertical {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
          }
          .scroll-column {
            height: 100%;
            overflow: hidden;
            position: relative;
            min-width: 0;
            contain: paint layout;
          }
          .scroll-track {
            display: flex;
            flex-direction: column;
            animation: scrollVertical linear infinite;
            line-height: 0;
            will-change: transform;
            transform: translateZ(0);
          }
          .scroll-track > * {
            margin-bottom: 12px;
          }
          .overlay-bg {
            background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, transparent 100%);
          }
        `}</style>

        {/* Smooth Top & Bottom Fade Overlays without GPU-heavy mask-image */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[var(--bg-primary,#030305)] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[var(--bg-primary,#030305)] to-transparent z-10" />

        <div className="grid gap-3 h-full" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {cols.map((col, colIdx) => (
            <div className="scroll-column" key={colIdx}>
              <div
                className="scroll-track"
                style={{
                  animationDuration: `${colIdx % 2 === 0 ? speed : speed * 1.2}s`,
                  animationDirection: colIdx % 2 === 0 ? 'normal' : 'reverse',
                }}
              >
                {[...col, ...col].map((entry, idx) => (
                  <div
                    key={`${entry.item.id}-${idx}`}
                    className="group relative overflow-hidden cursor-pointer bg-[#1a1a1a] rounded-lg"
                    onClick={() => setSelectedIndex(entry.originalIndex)}
                  >
                    <img
                      src={entry.item.url}
                      alt={entry.item.title}
                      className="w-full h-auto block transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex flex-col justify-end p-4 overlay-bg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <h3 className="text-xs sm:text-sm font-bold text-white mb-0.5 line-clamp-1">{entry.item.title}</h3>
                        {entry.item.description && (
                          <p className="text-[11px] text-white/80 line-clamp-2">{entry.item.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal with Next / Prev Controls */}
      <AnimatePresence>
        {currentImg && selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-8 select-none"
            style={{ backgroundColor: 'rgba(0,0,0,0.92)', touchAction: 'none' }}
            onClick={() => setSelectedIndex(null)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Top Bar: Counter + Close */}
            <div
              className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 flex items-center justify-between pointer-events-none z-[10001]"
            >
              <span
                className="px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider pointer-events-auto backdrop-blur-md border border-white/10"
                style={{ backgroundColor: 'var(--glass-bg)', color: 'var(--text-primary)' }}
              >
                {selectedIndex + 1} / {images.length}
              </span>

              <button
                onClick={() => setSelectedIndex(null)}
                className="p-2.5 rounded-full border transition-all pointer-events-auto backdrop-blur-md hover:scale-105 active:scale-95 hover:border-accent"
                style={{
                  backgroundColor: 'var(--glass-bg)',
                  borderColor: 'var(--glass-border)',
                  color: 'var(--text-primary)',
                }}
                aria-label="Close photo"
              >
                <CloseDuotone size={18} />
              </button>
            </div>

            {/* Left Button (Prev) */}
            {images.length > 1 && (
              <button
                onClick={handlePrev}
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 sm:p-3.5 rounded-full border transition-all z-[10001] backdrop-blur-md hover:scale-110 active:scale-95 hover:border-accent shadow-xl"
                style={{
                  backgroundColor: 'var(--glass-bg)',
                  borderColor: 'var(--glass-border)',
                  color: 'var(--text-primary)',
                }}
                aria-label="Previous photo"
              >
                <ChevronLeft size={24} className="stroke-[2.5]" />
              </button>
            )}

            {/* Center: Image */}
            <div className="relative flex flex-col items-center justify-center max-w-full max-h-full">
              <motion.img
                key={currentImg.id || selectedIndex}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                src={currentImg.url}
                alt={currentImg.title}
                className="max-w-[92vw] sm:max-w-[85vw] max-h-[75vh] sm:max-h-[80vh] object-contain rounded-xl sm:rounded-2xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Right Button (Next) */}
            {images.length > 1 && (
              <button
                onClick={handleNext}
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 sm:p-3.5 rounded-full border transition-all z-[10001] backdrop-blur-md hover:scale-110 active:scale-95 hover:border-accent shadow-xl"
                style={{
                  backgroundColor: 'var(--glass-bg)',
                  borderColor: 'var(--glass-border)',
                  color: 'var(--text-primary)',
                }}
                aria-label="Next photo"
              >
                <ChevronRight size={24} className="stroke-[2.5]" />
              </button>
            )}

            {/* Bottom Bar: Title & Description */}
            {(currentImg.title || currentImg.description) && (
              <div
                className="absolute bottom-4 sm:bottom-6 left-4 sm:left-8 right-4 sm:right-8 flex justify-center pointer-events-none z-[10001]"
              >
                <div
                  className="pointer-events-auto max-w-xl text-center px-4 sm:px-6 py-2.5 rounded-xl border backdrop-blur-md shadow-lg"
                  style={{
                    backgroundColor: 'var(--glass-bg)',
                    borderColor: 'var(--glass-border)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-xs sm:text-sm font-heading font-bold uppercase tracking-wider text-white mb-0.5 line-clamp-1">
                    {currentImg.title}
                  </h3>
                  {currentImg.description && (
                    <p className="text-[11px] sm:text-xs text-white/70 line-clamp-2">
                      {currentImg.description}
                    </p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
