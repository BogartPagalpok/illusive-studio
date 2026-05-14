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
  const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);

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
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWorks(); }, [fetchWorks]);

  const projects = useMemo(() => {
    const unique: Project[] = [];
    const seen = new Set<string>();
    allData.forEach(p => {
      const cleanTitle = p.title.trim();
      if (!seen.has(cleanTitle)) {
        seen.add(cleanTitle);
        unique.push(p);
      }
    });
    return activeCategory === 'All' ? unique : unique.filter(p => p.category === activeCategory);
  }, [allData, activeCategory]);

  useEffect(() => {
    setActiveIndex(0);
    if (swiperRef.current) {
      swiperRef.current.slideTo(0, 0);
      swiperRef.current.update();
    }
  }, [activeCategory, projects.length]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-black">
      <Loader2 className="w-10 h-10 text-accent animate-spin" />
    </div>
  );

  const current = projects[activeIndex] || projects[0] || null;
  const gallery = allData.filter(p => selectedTitle && p.title.trim() === selectedTitle.trim());

  return (
    <section id="works" className="relative h-screen w-full bg-black overflow-hidden font-sans">
      
      {/* 1. DYNAMIC BACKGROUND (Reduced Tint) */}
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={`bg-${current.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-0"
          >
            <img src={current.image_url} className="w-full h-full object-cover" alt="bg" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 h-full flex flex-col px-6 md:px-20 pb-12">
        
        {/* 2. CATEGORIES (Theme-aware and aligned) */}
        <div className="flex gap-8 items-center pt-28 md:pt-40 justify-start overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-[10px] md:text-xs font-black uppercase tracking-[0.3em] transition-all whitespace-nowrap border-b-2 ${
                activeCategory === cat ? 'text-white border-accent' : 'text-white/20 border-transparent hover:text-white/50'
              } pb-1`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 3. HERO + RAIL (ANCHORED BOTTOM) */}
        <div className="mt-auto flex flex-col gap-10">
          
          <div className="max-w-4xl min-h-[180px]">
            {current && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-700">
                <span className="text-accent text-[10px] md:text-xs font-black tracking-[0.4em] uppercase block mb-4">
                  {current.category}
                </span>
                <h1 className="text-white text-4xl sm:text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-6">
                  {current.title}
                </h1>
                <p className="text-white/60 text-sm md:text-lg font-light leading-relaxed mb-8 max-w-2xl line-clamp-2">
                  {current.description}
                </p>
                <button 
                  onClick={() => setSelectedTitle(current.title)}
                  className="flex items-center gap-3 bg-white text-black px-10 py-4 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-accent transition-all"
                >
                  <Play size={16} fill="currentColor" /> View Project
                </button>
              </div>
            )}
          </div>

          <div className="w-full relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white/10 text-[10px] font-black uppercase tracking-[0.4em]">Portfolio Rail</h2>
              <div className="flex gap-6">
                <button ref={setPrevEl} className="text-white/30 hover:text-accent transition-all cursor-pointer"><ChevronLeft size={24} /></button>
                <button ref={setNextEl} className="text-white/30 hover:text-accent transition-all cursor-pointer"><ChevronRight size={24} /></button>
              </div>
            </div>
            
            <Swiper
              key={activeCategory} 
              onSwiper={(s) => { swiperRef.current = s; }}
              modules={[Navigation]}
              spaceBetween={24}
              slidesPerView={'auto'}
              grabCursor={true}
              observer={true}
              observeParents={true}
              navigation={{ prevEl, nextEl }}
              onSlideChange={(s) => setActiveIndex(s.activeIndex)}
              className="!overflow-visible w-full"
            >
              {projects.map((p, idx) => (
                <SwiperSlide key={p.id} className="!w-[220px] md:!w-[380px]">
                  <div 
                    onClick={() => swiperRef.current?.slideTo(idx)}
                    className={`relative aspect-video cursor-pointer transition-all duration-500 border rounded-sm overflow-hidden ${
                      activeIndex === idx 
                        ? 'border-accent scale-105 z-20 opacity-100 shadow-2xl' 
                        : 'border-white/5 opacity-20 grayscale hover:opacity-100 hover:grayscale-0'
                    }`}
                  >
                    <img src={p.image_url} className="w-full h-full object-cover" alt="thumb" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>

      {/* 4. MODAL GALLERY (Theme-aware) */}
      <AnimatePresence>
        {selectedTitle && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-3xl overflow-y-auto"
          >
            <div className="sticky top-0 z-[1001] flex justify-between items-center px-8 py-8 bg-black/50 backdrop-blur-md border-b border-white/5">
              <h2 className="text-white text-2xl font-black uppercase tracking-tighter">{selectedTitle}</h2>
              <button onClick={() => setSelectedTitle(null)} className="text-white/50 hover:text-accent"><X size={32} /></button>
            </div>
            <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col gap-16">
              {gallery.map((img) => (
                <div key={img.id} className="group">
                  <img src={img.image_url} className="w-full border border-white/10 shadow-2xl group-hover:border-accent/50 transition-all" alt="gallery-img" />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}
