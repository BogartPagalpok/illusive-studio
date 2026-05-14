import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { ChevronLeft, ChevronRight, Play, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

import 'swiper/css';
import 'swiper/css/navigation';

interface Project {
  id: string;
  title: string;
  category: string;
  image_url: string;
  description?: string;
}

const CATEGORIES = ['All', 'Graphic Design', 'Photography', 'UI/UX', 'Motion'];

export default function SelectedWorks() {
  const [allData, setAllData] = useState<Project[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);

  const swiperRef = useRef<SwiperType | null>(null);
  const prevBtnRef = useRef<HTMLButtonElement | null>(null);
  const nextBtnRef = useRef<HTMLButtonElement | null>(null);

  const fetchWorks = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllData(data || []);
    } catch (err) {
      console.error('Supabase Error: Failed to fetch', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

  // One card per unique title
  const projects = useMemo(() => {
    const unique: Project[] = [];
    const seen = new Set<string>();

    for (const item of allData) {
      if (!seen.has(item.title)) {
        seen.add(item.title);
        unique.push(item);
      }
    }

    return activeCategory === 'All' ? unique : unique.filter((p) => p.category === activeCategory);
  }, [allData, activeCategory]);

  // When category changes, reset index + swiper
  useEffect(() => {
    setActiveIndex(0);
    const s = swiperRef.current;
    if (s) {
      // update first because slides changed
      s.update();
      s.slideTo(0, 0);
    }
  }, [activeCategory, projects.length]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
      </div>
    );
  }

  const current = projects[activeIndex] || projects[0] || null;
  const gallery = selectedTitle ? allData.filter((p) => p.title === selectedTitle) : [];

  return (
    <section id="works" className="relative h-screen w-full bg-black overflow-hidden font-sans">
      {/* BACKGROUND ENGINE */}
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={`bg-${current.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="pointer-events-none absolute inset-0 z-0"
          >
            <img src={current.image_url} className="w-full h-full object-cover" alt={current.title} />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 h-full flex flex-col px-6 md:px-16 pb-12">
        {/* CATEGORIES (PINNED TO TOP) */}
        <div className="absolute top-20 left-6 right-6 md:top-24 md:left-16 md:right-16 flex gap-6 items-center z-[50] overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? 'text-white border-b-2 border-accent pb-1'
                  : 'text-white/30 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Give content room so it doesn't sit under the pinned categories */}
        <div className="h-24 md:h-28" />

        {/* HERO + RAIL */}
        <div className="mt-auto flex flex-col gap-10">
          <div className="max-w-4xl">
            {current ? (
              <div className="transition-all duration-500">
                <span className="text-accent text-[10px] md:text-xs font-black tracking-[0.4em] uppercase block mb-3">
                  {current.category}
                </span>
                <h1 className="text-white text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter leading-tight mb-4 max-w-[850px]">
                  {current.title}
                </h1>
                <p className="text-white/60 text-xs md:text-base font-light leading-relaxed mb-8 max-w-xl line-clamp-3">
                  {current.description}
                </p>

                <button
                  onClick={() => setSelectedTitle(current.title)}
                  disabled={!current.title}
                  className="flex items-center gap-2 bg-white text-black px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-accent transition-all disabled:opacity-50"
                >
                  <Play size={14} fill="black" /> View Project
                </button>
              </div>
            ) : (
              <div className="text-white/60">No projects in this category.</div>
            )}
          </div>

          {/* SWIPER RAIL */}
          <div className="w-full relative select-none z-[10]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em]">Portfolio</h2>
              <div className="flex gap-4">
                <button
                  ref={prevBtnRef}
                  type="button"
                  className="text-white/40 hover:text-white disabled:opacity-20 transition-colors"
                  aria-label="Previous slide"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  ref={nextBtnRef}
                  type="button"
                  className="text-white/40 hover:text-white disabled:opacity-20 transition-colors"
                  aria-label="Next slide"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <Swiper
              onSwiper={(s) => {
                swiperRef.current = s;
              }}
              modules={[Navigation]}
              spaceBetween={16}
              slidesPerView={'auto'}
              grabCursor={true}
              watchSlidesProgress={true}
              navigation={true}
              onBeforeInit={(swiper) => {
                // Swiper params are not typed well; this is the reliable navigation hook:
                // @ts-ignore
                swiper.params.navigation = {
                  // @ts-ignore
                  ...(swiper.params.navigation || {}),
                  prevEl: prevBtnRef.current,
                  nextEl: nextBtnRef.current,
                };
              }}
              onSlideChange={(s) => setActiveIndex(s.realIndex)}
              className="!overflow-visible touch-pan-y"
            >
              {projects.map((p, idx) => (
                <SwiperSlide key={p.id} className="!w-[160px] md:!w-[260px]">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      // IMPORTANT: update activeIndex immediately so hero + View Project always match
                      setActiveIndex(idx);
                      swiperRef.current?.slideTo(idx);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActiveIndex(idx);
                        swiperRef.current?.slideTo(idx);
                      }
                    }}
                    className={`relative aspect-video cursor-pointer transition-all duration-500 border rounded-sm overflow-hidden ${
                      activeIndex === idx
                        ? 'border-accent scale-105 shadow-[0_0_20px_rgba(251,191,36,0.3)] z-20 opacity-100 grayscale-0'
                        : 'border-transparent opacity-40 grayscale hover:opacity-90 hover:grayscale-0'
                    }`}
                  >
                    <img src={p.image_url} className="w-full h-full object-cover" alt={p.title} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>

      {/* MODAL GALLERY */}
      <AnimatePresence>
        {selectedTitle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/98 backdrop-blur-3xl overflow-y-auto"
          >
            <div className="sticky top-0 z-[1001] flex justify-between items-center px-6 md:px-12 py-8 bg-black/80 backdrop-blur-md">
              <h2 className="text-white text-xl md:text-2xl font-black uppercase tracking-tighter">{selectedTitle}</h2>
              <button
                onClick={() => setSelectedTitle(null)}
                className="text-white/50 hover:text-white p-2"
                aria-label="Close modal"
              >
                <X size={28} />
              </button>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col gap-12">
              {gallery.map((img) => (
                <div key={img.id}>
                  <img
                    src={img.image_url}
                    className="w-full border border-white/10 shadow-2xl"
                    alt="gallery"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No-scrollbar utility without styled-jsx */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}
