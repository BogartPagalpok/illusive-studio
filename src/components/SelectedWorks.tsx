The lagginess comes from heavy effects + transitions fighting each other. Here's the optimized version:

```tsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { supabase } from '../lib/supabase';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';

export default function SelectedWorks() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    document.body.style.overflow = selectedProject ? 'hidden' : 'unset';
  }, [selectedProject]);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('portfolio_projects')
        .select('*')
        .eq('featured', true)
        .order('created_at', { ascending: false });
      if (data) {
        const grouped: Record<string, any> = {};
        data.forEach((item) => {
          const cleanTitle = item.title.replace(/\.[^/.]+$/, '').trim();
          if (!grouped[cleanTitle]) {
            grouped[cleanTitle] = {
              ...item,
              title: cleanTitle,
              all_images: [item.image_url],
            };
          } else {
            grouped[cleanTitle].all_images?.push(item.image_url);
          }
        });
        setProjects(Object.values(grouped));
      }
    };
    fetchData();
  }, []);

  return (
    <section
      id="works"
      className="relative z-40 bg-transparent min-h-[120vh] py-20 flex flex-col justify-center"
      style={{ overflow: 'visible' }}
    >
      <div className="max-w-[1600px] mx-auto px-4 w-full relative z-20">
        <div className="text-center mb-12">
          <p className="text-[10px] tracking-[0.4em] uppercase text-accent mb-2">
            Selected Portfolio
          </p>
          <h2 className="text-6xl md:text-8xl font-bold text-white uppercase tracking-tighter leading-none">
            Works
          </h2>
        </div>

        <div className="relative" style={{ overflow: 'visible' }}>
          <Swiper
            onSwiper={(s) => { swiperRef.current = s; }}
            modules={[EffectCoverflow, Navigation]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            loop={true}
            slidesPerView="auto"
            navigation={{ nextEl: '.nav-next', prevEl: '.nav-prev' }}
            coverflowEffect={{
              rotate: 6,
              stretch: 0,
              depth: 280,
              modifier: 1,
              slideShadows: true,
            }}
            speed={400}
            style={{ overflow: 'visible', paddingBottom: '80px', paddingTop: '40px' }}
          >
            {projects.map((project) => (
              <SwiperSlide
                key={project.id}
                style={{
                  width: '340px',
                  willChange: 'transform',
                }}
                className="md:!w-[400px]"
              >
                {({ isActive }) => (
                  <div
                    style={{
                      borderRadius: '28px',
                      overflow: 'hidden',
                      position: 'relative',
                      height: isActive ? '620px' : '520px',
                      transition: 'height 0.4s ease, opacity 0.4s ease',
                      opacity: isActive ? 1 : 0.55,
                      willChange: 'transform, opacity',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.04)',
                    }}
                  >
                    {/* IMAGE - no object-fit transitions */}
                    <img
                      src={project.image_url}
                      alt=""
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        pointerEvents: 'none',
                        display: 'block',
                      }}
                    />

                    {/* Static gradient - no transition */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
                      }}
                    />

                    {/* Bottom content */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '36px',
                        zIndex: 10,
                        opacity: isActive ? 1 : 0,
                        transform: isActive ? 'translateY(0)' : 'translateY(12px)',
                        transition: 'opacity 0.3s ease, transform 0.3s ease',
                        willChange: 'opacity, transform',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '10px',
                          letterSpacing: '0.4em',
                          textTransform: 'uppercase',
                          fontWeight: 900,
                          color: 'var(--color-accent, #a855f7)',
                        }}
                      >
                        {project.category}
                      </span>
                      <h3
                        style={{
                          fontSize: 'clamp(22px, 3vw, 36px)',
                          fontWeight: 700,
                          color: '#fff',
                          textTransform: 'uppercase',
                          marginTop: '8px',
                          marginBottom: '24px',
                          lineHeight: 1,
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {project.title}
                      </h3>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedProject(project);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '10px',
                          background: '#fff',
                          color: '#000',
                          padding: '14px 28px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: 900,
                          letterSpacing: '0.15em',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          border: 'none',
                          transition: 'background 0.2s ease',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-accent, #a855f7)')}
                        onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                      >
                        View Case <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Nav */}
          <button className="nav-prev absolute left-0 top-1/2 -translate-y-1/2 z-[100] p-4 rounded-full bg-black/70 border border-white/15 text-white hover:bg-accent transition-colors flex shadow-xl backdrop-blur-sm">
            <ChevronLeft size={26} />
          </button>
          <button className="nav-next absolute right-0 top-1/2 -translate-y-1/2 z-[100] p-4 rounded-full bg-black/70 border border-white/15 text-white hover:bg-accent transition-colors flex shadow-xl backdrop-blur-sm">
            <ChevronRight size={26} />
          </button>
        </div>
      </div>

      <div className="h-[15vh] w-full pointer-events-none" />

      {/* MODAL */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              background: 'rgba(0,0,0,0.95)',
              backdropFilter: 'blur(24px)',
            }}
          >
            <button
              onClick={() => setSelectedProject(null)}
              style={{
                position: 'absolute',
                top: '32px',
                right: '32px',
                zIndex: 10000,
                padding: '14px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '999px',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
              }}
            >
              <X size={26} />
            </button>

            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '48px',
                maxWidth: '1200px',
                width: '100%',
              }}
              className="md:flex-row"
            >
              <img
                src={selectedProject.image_url}
                style={{
                  width: '100%',
                  borderRadius: '40px',
                  boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'block',
                }}
                className="md:w-3/5"
                alt=""
              />
              <div style={{ textAlign: 'left' }} className="md:w-2/5">
                <span style={{ color: 'var(--color-accent)', fontSize: '12px', letterSpacing: '0.4em', textTransform: 'uppercase', fontWeight: 700 }}>
                  {selectedProject.category}
                </span>
                <h2 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 700, color: '#fff', textTransform: 'uppercase', marginTop: '20px', marginBottom: '24px', letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {selectedProject.title}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '18px', lineHeight: 1.7 }}>
                  {selectedProject.description}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .swiper-slide-shadow-left,
        .swiper-slide-shadow-right {
          border-radius: 28px !important;
        }
      `}</style>
    </section>
  );
}
```

## What fixed the lag:

| Problem | Fix |
|---|---|
| `backdrop-blur-3xl` on every card | **Removed** — GPU killer |
| Tailwind transitions on scale/height | Replaced with **inline `style` transitions** — no class recalculation |
| `Pagination` module loaded | **Removed** — fewer DOM mutations per slide |
| `transition-all` on card wrapper | Changed to **specific properties only** (`height`, `opacity`) |
| `loopedSlides` prop | **Removed** — Swiper auto-calculates, double renders were stacking |
| `speed: 600` | Dropped to **400ms** — snappier feel |
| `will-change` missing | Added `willChange: 'transform'` on slides and inner elements |
| Heavy box-shadows with blur | Simplified shadow values |
