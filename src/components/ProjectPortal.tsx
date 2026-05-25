import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { shoes as originalShoesData } from '../data/shoes';

interface ShoeVariant {
  id: string;
  title: string;
  colorName: string;
  colorHex: string;
  url: string;
  image: string;
}

export default function ProjectPortal() {
  const [activeShoe, setActiveShoe] = useState<ShoeVariant | null>(null);

  // Maps all items directly from your source data using the temporary GitHub raw fallback assets
  const dynamicShoes: ShoeVariant[] = originalShoesData.map((s) => {
    let fallbackImage = s.image;
    
    // Wire up clean local asset fallback mappings to prevent broken image cards on load
    if (s.id === 'proto' || s.tags.some(t => t.toLowerCase().includes('volt'))) {
      fallbackImage = 'https://raw.githubusercontent.com/BogartPagalpok/demo/85ba49837705fc8ba0dda4a93525d3411485aadc/public/shoes/proto.png';
    } else if (s.id === 'dn' || s.tags.some(t => t.toLowerCase().includes('purple'))) {
      fallbackImage = 'https://raw.githubusercontent.com/BogartPagalpok/demo/85ba49837705fc8ba0dda4a93525d3411485aadc/public/shoes/purple.png';
    } else if (s.tags.some(t => t.toLowerCase().includes('red')) || s.id.includes('red')) {
      fallbackImage = 'https://raw.githubusercontent.com/BogartPagalpok/demo/85ba49837705fc8ba0dda4a93525d3411485aadc/public/shoes/red.png';
    }

    return {
      id: s.id,
      title: s.line1 + " " + s.line2,
      colorName: s.subtitle,
      colorHex: s.theme.accent,
      url: `https://demo-6py.pages.dev/?color=${s.tags[0]?.toLowerCase() || 'volt'}`,
      image: fallbackImage
    };
  });

  const imageWidth = 220;
  const imageHeight = 150;
  const translateZ = 340; 
  const spreadAngle = 360 / dynamicShoes.length;

  return (
    <section className="w-full min-h-screen py-12 px-4 sm:px-8 lg:px-12 flex flex-col justify-center items-center relative z-10 bg-[#060606] overflow-hidden select-none">
      
      <style>{`
        @keyframes rotation {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
        .carousel-container {
          perspective: 1400px;
          overflow: visible;
        }
        .carousel-3d {
          transform-style: preserve-3d;
          transform-origin: center center;
          animation: rotation 28s infinite linear;
        }
        .carousel-3d:hover {
          animation-play-state: paused;
        }
        .carousel-item {
          position: absolute;
          margin: 0;
          top: 50%;
          left: 50%;
          transform-origin: center center;
          backface-visibility: visible;
        }
        .carousel-item img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          backface-visibility: visible;
        }
      `}</style>

      <AnimatePresence mode="wait">
        {!activeShoe ? (
          /* STATE 1: 3D ROTATING CAROUSEL VIEWPORT */
          <motion.div
            key="carousel-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="w-full flex flex-col items-center justify-center min-h-[550px]"
          >
            <div className="text-center mb-20">
              <span className="text-xs font-black tracking-[0.4em] text-[var(--accent)] uppercase">Interactive Showroom</span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase mt-1">Select A Variant</h2>
            </div>

            <div className="carousel-container relative w-full max-w-5xl h-[320px] flex items-center justify-center">
              <div className="carousel-3d w-full h-full relative flex items-center justify-center">
                {dynamicShoes.map((shoe, index) => {
                  const angle = index * spreadAngle;
                  const transform = `translate(-50%, -50%) rotateY(${angle}deg) translateZ(${translateZ}px)`;

                  return (
                    <figure
                      key={shoe.id}
                      className="carousel-item group cursor-pointer transition-all duration-300"
                      style={{ width: imageWidth, height: imageHeight, transform }}
                      onClick={() => setActiveShoe(shoe)}
                    >
                      <div className="absolute inset-0 bg-neutral-900/40 border border-white/5 rounded-2xl backdrop-blur-sm -z-10 transition-all duration-300 group-hover:border-white/20" 
                           style={{ boxShadow: `0 10px 30px rgba(0,0,0,0.5)` }}/>
                      
                      <div className="w-full h-full p-4 flex flex-col items-center justify-between">
                        <img 
                          src={shoe.image} 
                          alt={shoe.title} 
                          className="transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6"
                        />
                        <div className="text-center pb-2">
                          <h4 className="text-[11px] font-black text-white uppercase tracking-wider line-clamp-1">{shoe.title}</h4>
                          <span className="text-[9px] font-bold uppercase tracking-wider opacity-50" style={{ color: shoe.colorHex }}>
                            {shoe.colorName}
                          </span>
                        </div>
                      </div>
                    </figure>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          /* STATE 2: AD CONVERSION LIVE PORTAL */
          <motion.div
            key="portal-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex flex-col max-w-[1700px]"
          >
            {/* Top Navigation Bar */}
            <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 px-2">
              <div>
                <span className="text-xs font-black tracking-[0.4em] uppercase" style={{ color: activeShoe.colorHex }}>
                  Campaign Live Portal &rarr; {activeShoe.colorName}
                </span>
                <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Match Verification Frame</h3>
              </div>
              <button
                onClick={() => setActiveShoe(null)}
                className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-bold uppercase tracking-widest text-white rounded-xl transition-all duration-200"
              >
                &larr; Back To Carousel
              </button>
            </div>

            {/* Split Screen Matrix Framework Layout */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-[1.65fr_1fr] gap-6 xl:gap-10 items-center justify-center">
              
              {/* DESKTOP WEB FRAME */}
              <div className="hidden lg:flex flex-col w-full h-[760px] bg-neutral-900 rounded-2xl p-3.5 border border-neutral-800 shadow-2xl relative">
                <div className="absolute top-4 left-6 flex gap-1.5 z-30">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="w-full h-8 flex items-center justify-center text-[10px] font-bold text-neutral-500 border-b border-neutral-800/40 uppercase tracking-widest mb-2 bg-neutral-950/20 rounded-t-lg">
                  Desktop Live Context
                </div>
                <div className="w-full h-full rounded-xl overflow-hidden border border-neutral-950 bg-black">
                  <iframe src={activeShoe.url} className="w-full h-full border-0 select-none bg-black" title="Desktop Showroom Frame" />
                </div>
              </div>

              {/* MOBILE PHONE FRAME */}
              <div className="flex justify-center items-center w-full h-[760px]">
                <div 
                  className="relative w-full max-w-[360px] h-[740px] bg-neutral-900 rounded-[50px] p-4 border-[4px] border-neutral-800 shadow-2xl ring-4 ring-neutral-950 overscroll-contain"
                  style={{ touchAction: 'auto' }}
                >
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 w-32 h-4 bg-neutral-950 rounded-full z-50 flex items-center justify-center">
                    <div className="w-12 h-1 bg-neutral-800 rounded-full" />
                  </div>
                  
                  <div className="w-full h-full rounded-[36px] overflow-hidden border border-neutral-950 bg-black relative">
                    <iframe 
                      src={activeShoe.url} 
                      className="w-full h-full border-0 absolute inset-0 bg-black" 
                      title="Mobile Showroom Frame" 
                    />
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
