import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getOptimizedImageUrl } from '../lib/supabase';

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [columns, setColumns] = useState(3);

  useEffect(() => {
    const updateColumns = () => {
      setColumns(window.innerWidth >= 1024 ? 5 : 3);
    };
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  const images = projects.filter((p) => p.image_url).map((p) => ({
    id: p.id,
    title: p.title,
    url: p.image_url,
    description: p.description || '',
  }));

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-white/30">
        No images to display
      </div>
    );
  }

  const cols: Array<typeof images> = Array.from({ length: columns }, () => []);
  images.forEach((img, idx) => {
    cols[idx % columns].push(img);
  });

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
            mask-image: linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%);
            -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%);
            min-width: 0;
          }
          .scroll-track {
            display: flex;
            flex-direction: column;
            animation: scrollVertical linear infinite;
            line-height: 0;
          }
          .scroll-track > * {
            margin-bottom: 12px;
          }
          .overlay-bg {
            background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
          }
        `}</style>

        <div className={`grid gap-3 h-full`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {cols.map((col, colIdx) => (
            <div className="scroll-column" key={colIdx}>
              <div
                className="scroll-track"
                style={{
                  animationDuration: `${colIdx % 2 === 0 ? speed : speed * 1.2}s`,
                  animationDirection: colIdx % 2 === 0 ? 'normal' : 'reverse',
                }}
              >
                {[...col, ...col].map((img, idx) => (
                  <div
                    key={`${img.id}-${idx}`}
                    className="group relative overflow-hidden cursor-pointer bg-[#1a1a1a]"
                    onClick={() => setSelectedImage(img.url)}
                  >
                    <img
                      src={getOptimizedImageUrl(img.url, { width: 500, quality: 75, format: 'webp' })}
                      alt={img.title}
                      className="w-full h-auto block transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 flex flex-col justify-end p-4 overlay-bg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300">
                        <h3 className="text-sm font-bold text-white mb-1">{img.title}</h3>
                        {img.description && (
                          <p className="text-xs text-white/80">{img.description}</p>
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

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.95)', touchAction: 'none' }}
            onClick={() => setSelectedImage(null)}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2.5 rounded-full border transition-all z-[10000]"
              style={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}
            >
              <X size={18} />
            </button>
            <img
              src={selectedImage}
              alt="Full view"
              className="max-w-full max-h-[90vh] object-contain rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
