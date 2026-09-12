import React, { useState, useRef, useEffect } from 'react';
import { PlayDuotone, MonitorPlayDuotone } from './icons/StreamlineIcons';
import VideoModal from './VideoModal';
import { usePortfolioStore } from '../lib/store';

function extractYoutubeId(url) {
  if (!url) return '';
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : url.trim();
}

function ShowreelCard({
  title,
  category,
  description,
  is_coming_soon = false,
  webm_url = '',
  youtube_url = '',
  onOpenModal,
}) {
  const videoRef = useRef(null);

  const videoSource = webm_url ? webm_url : 'https://www.w3schools.com/html/mov_bbb.mp4';
  const modalTarget = youtube_url ? youtube_url : 'LXb3EKWsInQ';

  return (
    <div
      className="group relative aspect-video w-full rounded-2xl overflow-hidden border border-white/15 bg-black/40 shadow-2xl cursor-pointer hover:border-accent/60 hover:shadow-[0_0_35px_rgba(var(--accent-rgb),0.25)] transition-all duration-500 select-none"
      onClick={() => onOpenModal(modalTarget)}
      onMouseEnter={() => videoRef.current?.play()}
      onMouseLeave={() => videoRef.current?.pause()}
    >
      {/* Video Loop (prioritizes real webm_url, falls back to test clip) */}
      <video
        ref={videoRef}
        src={videoSource}
        loop
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />

      {/* Dark Vignette Overlay for Crisp Typography Contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none z-10" />

      {/* Top Category Badge */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <span className="px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-heading font-black tracking-[0.2em] uppercase bg-black/60 border border-white/15 text-white/90 backdrop-blur-md">
          {category}
        </span>
      </div>

      {/* Centered Play Button on Hover */}
      <div className="absolute inset-0 flex items-center justify-center z-20 opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 pointer-events-none">
        <div
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-2xl transition-transform duration-300"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-contrast)',
            boxShadow: '0 0 30px rgba(var(--accent-rgb), 0.5)',
          }}
        >
          <PlayDuotone
            size={24}
            className="ml-0.5"
            primaryColor="var(--accent-contrast, #000000)"
            secondaryColor="rgba(0, 0, 0, 0.25)"
          />
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 z-20 flex flex-col gap-1 pointer-events-none">
        <div className="flex items-center gap-2">
          <MonitorPlayDuotone size={16} primaryColor="var(--accent)" />
          <h3 className="text-base sm:text-lg font-heading font-black tracking-wider uppercase text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            {title}
          </h3>
        </div>
        <p className="text-xs text-white/70 line-clamp-1 font-body">
          {description}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] font-heading font-bold uppercase tracking-[0.2em] text-accent group-hover:translate-x-1 transition-transform">
            Watch Full Reel →
          </span>
        </div>
      </div>

      {/* Non-Blocking COMING SOON Visual Overlay */}
      {is_coming_soon && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-30 text-center px-4 pointer-events-none">
          <span className="text-2xl sm:text-3xl md:text-4xl font-heading font-black tracking-[0.35em] uppercase text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)]">
            COMING SOON
          </span>
          <span className="mt-2 text-[10px] sm:text-xs font-heading font-bold tracking-[0.25em] uppercase text-accent">
            {title}
          </span>
        </div>
      )}
    </div>
  );
}

export default function DualShowreel(props) {
  const dualShowreel = usePortfolioStore((s) => s.dualShowreel);

  const [activeYoutubeId, setActiveYoutubeId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const essayConfig = {
    is_coming_soon: props?.essay?.is_coming_soon ?? props?.card1?.is_coming_soon ?? dualShowreel?.essay?.is_coming_soon ?? false,
    webm_url: props?.essay?.webm_url ?? props?.card1?.webm_url ?? dualShowreel?.essay?.webm_url ?? '',
    youtube_url: props?.essay?.youtube_url ?? props?.card1?.youtube_url ?? dualShowreel?.essay?.youtube_url ?? '',
  };

  const gamingConfig = {
    is_coming_soon: props?.gaming?.is_coming_soon ?? props?.card2?.is_coming_soon ?? dualShowreel?.gaming?.is_coming_soon ?? false,
    webm_url: props?.gaming?.webm_url ?? props?.card2?.webm_url ?? dualShowreel?.gaming?.webm_url ?? '',
    youtube_url: props?.gaming?.youtube_url ?? props?.card2?.youtube_url ?? dualShowreel?.gaming?.youtube_url ?? '',
  };

  const handleOpenModal = (youtubeUrl) => {
    const target = youtubeUrl ? youtubeUrl : 'LXb3EKWsInQ';
    const parsedId = extractYoutubeId(target);
    setActiveYoutubeId(parsedId || target);
    setIsModalOpen(true);
  };

  return (
    <section id="dual-showreel" className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-20">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-10 sm:mb-14">
        <span className="section-subtitle">FEATURED REELS //</span>
        <h2 className="section-title">
          DUAL <span className="text-accent">SHOWREEL</span>
        </h2>
        <div className="section-divider" />
        <p className="mt-4 text-xs sm:text-sm text-white/60 max-w-xl font-body leading-relaxed">
          High-retention storytelling, rhythmic documentary pacing, and gaming retention loops.
        </p>
      </div>

      {/* 2-Column Exact CSS Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 w-full">
        {/* Card 1: Video Essays & Docu */}
        <ShowreelCard
          title="Video Essays & Docu"
          category="Long-Form Narratives"
          description="Pacing, narrative arc, dynamic archival cutaways, and sound design."
          is_coming_soon={essayConfig.is_coming_soon}
          webm_url={essayConfig.webm_url}
          youtube_url={essayConfig.youtube_url}
          onOpenModal={handleOpenModal}
        />

        {/* Card 2: Gaming & Retention */}
        <ShowreelCard
          title="Gaming & Retention"
          category="Retention & Pacing"
          description="Instant hook momentum, visual gags, zooms, and algorithmic engagement."
          is_coming_soon={gamingConfig.is_coming_soon}
          webm_url={gamingConfig.webm_url}
          youtube_url={gamingConfig.youtube_url}
          onOpenModal={handleOpenModal}
        />
      </div>

      {/* Full-Screen YouTube Video Modal */}
      <VideoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        youtubeId={activeYoutubeId}
      />
    </section>
  );
}
