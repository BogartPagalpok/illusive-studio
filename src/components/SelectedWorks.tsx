'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Play,
} from 'lucide-react';

import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';

import { supabase } from '../lib/supabase';

import 'swiper/css';

interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  image_url: string;
  card_thumbnail: string;
  tools: string[];
}

interface PortfolioProjectRow {
  id: string | number | null;
  title: string | null;
  category: string | null;
  description: string | null;
  image_url: string | null;
  card_thumbnail: string | null;
  tools: unknown;
}

export default function SelectedWorks() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [zoom, setZoom] = useState(1);

  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select(
          'id, title, category, description, image_url, card_thumbnail, tools'
        )
        .eq('featured', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error.message);
        return;
      }

      if (!isMounted) return;

      const sanitized: Project[] = ((data ?? []) as PortfolioProjectRow[]).map(
        (item, index) => {
          const imageUrl = item.image_url ?? '';

          return {
            id: String(item.id ?? `project-${index}`),
            title: (item.title || 'Untitled').replace(/\.[^/.]+$/, '').trim(),
            category: item.category || 'Featured',
            description: item.description || '',
            image_url: imageUrl,
            card_thumbnail: item.card_thumbnail || imageUrl,
            tools: Array.isArray(item.tools) ? item.tools.map(String) : [],
          };
        }
      );

      setProjects(sanitized);
      setActiveIndex(0);
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeProject = projects[activeIndex] ?? projects[0];

  const goToProject = (index: number) => {
    const swiper = swiperRef.current;

    if (!swiper) return;

    if (projects.length > 4 && typeof swiper.slideToLoop === 'function') {
      swiper.slideToLoop(index);
    } else {
      swiper.slideTo(index);
    }

    setActiveIndex(index);
  };

  const goPrev = () => {
    swiperRef.current?.slidePrev();
  };

  const goNext = () => {
    swiperRef.current?.slideNext();
  };

  return (
    <section
      id="works"
      className="selected-works-container relative h-screen w-full bg-[#050505] overflow-hidden flex flex-col justify-end"
    >
      {/* 1. CINEMATIC BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          {activeProject && (
            <motion.div
              key={activeProject.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              <img
                src={activeProject.image_url}
                className="h-full w-full object-cover brightness-[0.4]"
                alt={activeProject.title}
              />

              <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. HERO CONTENT */}
      <div className="relative z-20 w-full px-6 md:px-16 mb-6 flex items-end justify-between">
        <div className="max-w-4xl">
          <AnimatePresence mode="wait">
            {activeProject && (
              <motion.div
                key={`txt-${activeProject.id}`}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.45 }}
                className="space-y-4"
              >
                <p className="text-[#e50914] text-[10px] tracking-[0.6em] uppercase font-black italic">
                  {activeProject.category}
                </p>

                <h2 className="text-5xl md:text-[7vw] font-black text-white uppercase tracking-tighter leading-[0.8] italic">
                  {activeProject.title}
                </h2>

                <p className="text-white/70 text-sm md:text-lg italic max-w-xl leading-relaxed line-clamp-3">
                  {activeProject.description}
                </p>

                <button
                  type="button"
                  onClick={() => setSelectedProject(activeProject)}
                  className="bg-white text-black px-10 py-4 rounded-md font-black uppercase text-[10px] flex items-center gap-2 hover:bg-[#e50914] hover:text-white transition-all active:scale-95"
                >
                  <Play size={18} fill="currentColor" />
                  View Project
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="hidden md:flex gap-4">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous project"
            className="p-4 bg-white/5 border border-white/10 rounded-full text-white hover:bg-white hover:text-black transition-all"
          >
            <ChevronLeft size={32} />
          </button>

          <button
            type="button"
            onClick={goNext}
            aria-label="Next project"
            className="p-4 bg-white/5 border border-white/10 rounded-full text-white hover:bg-white hover:text-black transition-all"
          >
            <ChevronRight size={32} />
          </button>
        </div>
      </div>

      {/* 3. NETFLIX-STYLE ROW CAROUSEL */}
      <div className="relative z-20 w-full pb-12 px-6 md:px-16">
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={(swiper) => {
            setActiveIndex(swiper.realIndex);
          }}
          slidesPerView="auto"
          spaceBetween={15}
          loop={projects.length > 4}
          className="!overflow-visible"
        >
          {projects.map((project, idx) => {
            const isActive = activeIndex === idx;

            return (
              <SwiperSlide
                key={project.id}
                style={{ width: 'min(280px, 50vw)' }}
              >
                <button
                  type="button"
                  onClick={() => goToProject(idx)}
                  className={`relative w-full aspect-[16/9] rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-500 ${
                    isActive
                      ? 'border-[#e50914] scale-105 opacity-100 grayscale-0 z-30'
                      : 'border-transparent opacity-45 grayscale hover:opacity-100 hover:grayscale-0'
                  }`}
                  style={
                    isActive
                      ? {
                          boxShadow: '0 0 35px rgba(229, 9, 20, 0.55)',
                        }
                      : undefined
                  }
                  aria-label={`Select ${project.title}`}
                >
                  <img
                    src={project.card_thumbnail}
                    className="w-full h-full object-cover"
                    alt={project.title}
                  />

                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors" />
                </button>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      {/* 4. FULLSCREEN MODAL */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black flex flex-col"
          >
            <div className="flex justify-between items-center p-6 md:p-8">
              <h2 className="text-white uppercase font-black italic text-xl md:text-2xl tracking-tighter">
                {selectedProject.title}
              </h2>

              <div className="flex gap-3 md:gap-4">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(z - 0.5, 1))}
                  className="p-3 bg-white/5 rounded-full text-white hover:bg-white hover:text-black transition-all"
                  aria-label="Zoom out"
                >
                  <ZoomOut size={20} />
                </button>

                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(z + 0.5, 4))}
                  className="p-3 bg-white/5 rounded-full text-white hover:bg-white hover:text-black transition-all"
                  aria-label="Zoom in"
                >
                  <ZoomIn size={20} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedProject(null);
                    setZoom(1);
                  }}
                  className="p-3 bg-[#e50914] rounded-full text-white md:ml-4 hover:scale-105 transition-transform"
                  aria-label="Close project"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="relative flex-1 flex items-center justify-center overflow-hidden">
              <motion.div
                drag={zoom > 1}
                dragMomentum={false}
                dragElastic={0}
                className={zoom > 1 ? 'cursor-move' : 'cursor-default'}
              >
                <motion.img
                  animate={{ scale: zoom }}
                  transition={{ type: 'spring', stiffness: 180, damping: 22 }}
                  src={selectedProject.image_url}
                  className="max-h-[85vh] max-w-[95vw] w-auto object-contain select-none shadow-2xl"
                  alt={selectedProject.title}
                  draggable={false}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
