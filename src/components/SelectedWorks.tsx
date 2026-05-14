import { useState, useEffect, useRef } from 'react';
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
  // FIX: Vercel TS strict mode requires HTMLElement, not HTMLButtonElement for Swiper
  const [prevEl, setPrevEl] = useState<HTMLElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    async function fetchWorks() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('portfolio_projects')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setAllData(data || []);
      } catch (err) {
        console.error("Fetch failed", err);
      } finally {
        setLoading(false);
      }
    }
    fetchWorks();
  }, []);

  // FIX: Explicitly typed reduce function prevents Vercel inference crashes
  const projects = allData.reduce<Project[]>((acc, current) => {
    const isDuplicate = acc.some(item => item.title.trim() === current.title.trim());
    const matchesCategory = activeCategory === 'All' || current.category === activeCategory;
    
    if (!isDuplicate && matchesCategory) {
      acc.push(current);
    }
    return acc;
  }, []);

  useEffect(() => {
    if (swiperRef.current && !swiperRef.current.destroyed) {
      swiperRef.current.slideTo(0, 0);
      swiperRef.current.update();
    }
    setActiveIndex(0);
  }, [activeCategory, projects.length]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
      </div>
    );
  }

  const current = projects[activeIndex] || projects[0] || null;
  const gallery = selectedTitle ? allData.filter(p => p.title.trim() === selectedTitle.trim()) : [];

  return (
    <section id="works" className="relative h-screen w-full bg-[#050505] overflow-hidden font-sans">
      
      {/* 1. BACKGROUND (Framer Motion removed here to stop build crashes. CSS handles the fade) */}
      <div className="absolute inset-0 z-0 bg-[#050505]">
        {current && (
          <img 
            key={current.id}
            src={current.image_url} 
            className="w-full h-full object-cover opacity-60 transition-opacity duration-1000 ease-in-out" 
            alt="Background" 
          />
        )}
        {/* FIX: Lighter gradient overlay so desktop isn't pitch black */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/90 via-[#050505]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
      </div>

      <div className="relative z-10 h-full flex flex-col px-6 md:px-20 pb-12">
        
        {/* 2. CATEGORIES (No hardcoded colors, relies entirely on Tailwind 'accent') */}
        <div className="flex gap-8 items-center pt-28 md:pt-36 justify-start overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`text-[10px] md:text-xs font-black uppercase tracking-[0.3em] transition-all whitespace-nowrap border-b-2 ${
                activeCategory === cat ? 'text-white border-accent' : 'text-white/20 border-transparent hover:text-white/60'
              } pb-1`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 3. HERO + RAIL (Pinned Bottom) */}
        <div className="mt-auto flex flex-col gap-8 md:gap-12">
          
          <div className="max-w-4xl min-h-[180px]">
            {current && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-700">
                <span className="text-accent text-[10px] md:text-xs font-black tracking-[0.4em] uppercase block mb-4">
                  {current.category}
                </span>
                <h1 className="text-white text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-6">
                  {current.title}
                </h1>
                <p className="text-white/60 text-sm md:text-lg font-light leading-relaxed mb-8 max-w-2xl line-clamp-2">
                  {current.description}
                </p>
                <button 
                  type="button"
                  onClick={() => setSelectedTitle(current.title)}
                  className="flex items-center gap-3 bg-white text-black px-10 py-4 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-accent hover:text-white transition-all group"
                >
                  <Play size={16} className="fill-black group-hover:fill-white transition-colors" /> View Project
                </button>
              </div>
            )}
          </div>

          <div className="w-full relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">Portfolio Rail</h2>
              <div className="flex gap-6">
                {/* FIX: Refs explicitly cast as HTMLElement for Swiper Types */}
                <button ref={setPrevEl as any} type="button" className="text-white/30 hover:text-accent transition-colors cursor-pointer"><ChevronLeft size={24} /></button>
                <button ref={setNextEl as any} type="button" className="text-white/30 hover:text-accent transition-colors cursor-pointer"><ChevronRight size={24} /></button>
              </div>
            </div>
            
            {/* FIX: observer & observeParents forces Swiper to recalculate width, fixing the 5-card mobile limit */}
            <Swiper
              onSwiper={(s) => { swiperRef.current = s; }}
              modules={[Navigation]}
              spaceBetween={24}
              slidesPerView={'auto'}
              grabCursor={true}
              observer={true}
              observeParents={true}
              navigation={{ prevEl, nextEl }}
              onSlideChange={(s) => setActiveIndex(s.activeIndex)}
              className="!overflow-visible w-full touch-pan-y"
            >
              {projects.map((p, idx) => (
                <SwiperSlide key={p.id} className="!w-[200px] md:!w-[340px]">
                  <div 
                    onClick={() => swiperRef.current?.slideTo(idx)}
                    className={`relative aspect-video cursor-pointer transition-all duration-500 border rounded-sm overflow-hidden ${
                      activeIndex === idx 
                        ? 'border-accent scale-105 z-20 opacity-100 shadow-[0_0_30px_rgba(255,255,255,0.05)]' 
                        : 'border-white/5 opacity-30 grayscale hover:opacity-100 hover:grayscale-0'
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

      {/* 4. MODAL GALLERY */}
      <AnimatePresence>
        {selectedTitle && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-[#050505]/98 backdrop-blur-3xl overflow-y-auto"
          >
            <div className="sticky top-0 z-[1001] flex justify-between items-center px-6 md:px-12 py-8 bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
              <h2 className="text-white text-xl md:text-2xl font-black uppercase tracking-tighter">{selectedTitle}</h2>
              <button type="button" onClick={() => setSelectedTitle(null)} className="text-white/50 hover:text-accent transition-colors"><X size={32} /></button>
            </div>
            <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col gap-16">
              {gallery.map((img) => (
                <div key={img.id}>
                  <img src={img.image_url} className="w-full border border-white/10 shadow-2xl" alt="gallery-img" />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-
