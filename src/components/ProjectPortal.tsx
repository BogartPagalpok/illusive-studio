import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

  const shoes: ShoeVariant[] = [
    {
      id: 'volt',
      title: 'Alphafly Proto',
      colorName: 'Volt Energy',
      colorHex: '#ccff00',
      url: 'https://demo-6py.pages.dev/?color=volt',
      image: 'https://ayfbrkudeqvvnhchmxas.supabase.co/storage/v1/object/public/media/proto.png'
    },
    {
      id: 'purple',
      title: 'Air Max Dn',
      colorName: 'Dynamic Purple',
      colorHex: '#8a2be2',
      url: 'https://demo-6py.pages.dev/?color=purple',
      image: 'https://ayfbrkudeqvvnhchmxas.supabase.co/storage/v1/object/public/media/purple.png'
    },
    {
      id: 'red',
      title: 'Air Zoom Red',
      colorName: 'Chili Red',
      colorHex: '#e60000',
      url: 'https://demo-6py.pages.dev/?color=red',
      image: 'https://ayfbrkudeqvvnhchmxas.supabase.co/storage/v1/object/public/media/proto.png' 
    }
  ];

  const imageWidth = 220;
  const imageHeight = 150;
  const translateZ = 320; 
  const spreadAngle = 360 / shoes.length;

  return (
    <section className="w-full min-h-screen py-16 px-4 md:px-12 lg:px-24 flex flex-col justify-center items-center relative z-10 bg-[#060606] overflow-hidden select-none">
      
      <style>{`
        @keyframes rotation {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
        .carousel-container {
          perspective: 1200px;
          overflow: visible;
        }
        .carousel-3d {
          transform-style: preserve-3d;
          transform-origin: center center;
          animation: rotation 25s infinite linear;
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
            className="w-full flex flex-col items-center justify-center min-h-[500px]"
          >
            <div className="text-center mb-16">
              <span className="text-xs font-black tracking-[0.4em] text-[var(--accent)] uppercase">Interactive Showroom</span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase mt-1">Select A Variant</h2>
            </div>

            <div className="carousel-container relative w-full max-w-4xl h-[300px] flex items-center justify-center">
              <div className="carousel-3d w-full h-full relative flex items-center justify-center">
                {shoes.map((shoe, index) => {
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
                          <h4 className="text-xs font-black text-white uppercase tracking-wider">{shoe.title}</h4>
                          <span className="text-[10px] font-bold uppercase tracking-wider opacity-40" style={{ color: shoe.colorHex }}>
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex flex-col"
          >
            <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
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

            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center justify-center min-h-[760px]">
              
              {/* DESKTOP WEB FRAME */}
              <div className="hidden lg:flex flex-col w-full h-[740px] bg-neutral-900 rounded-2xl p-3.5 border border-neutral-800 shadow-2xl relative">
                <div className="absolute top-4 left-6 flex gap-1.5 z-30">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="w-full h-8 flex items-center justify-center text-[10px] font-bold text-neutral-500 border-b border-neutral-800/40 uppercase tracking-widest mb-2 bg-neutral-950/20 rounded-t-lg">
                  Desktop Live Context
                </div>
                <div className="w-full h-full rounded-xl overflow-hidden border border-neutral-950 bg-black">
                  <iframe src={activeShoe.url} className="w-full h-full border-0" title="Desktop Showroom Frame" />
                </div>
              </div>

              {/* MOBILE PHONE FRAME - Isolated scrolling wrapper added here */}
              <div className="flex justify-center items-center w-full">
                <div 
                  className="relative w-[360px] h-[740px] bg-neutral-900 rounded-[50px] p-4 border-[4px] border-neutral-800 shadow-2xl ring-4 ring-neutral-950 overscroll-contain"
                  style={{ touchAction: 'pan-y' }}
                  onTouchMove={(e) => e.stopPropagation()} // Halts scroll chain propagation back out to portfolio root body
                >
                  {/* iPhone Hardware Top Notch */}
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 w-32 h-4 bg-neutral-950 rounded-full z-50 flex items-center justify-center">
                    <div className="w-12 h-1 bg-neutral-800 rounded-full" />
                  </div>
                  
                  {/* Dynamic Mobile Screen Display */}
                  <div className="w-full h-full rounded-[36px] overflow-hidden border border-neutral-950 bg-black [-webkit-overflow-scrolling:touch]">
                    <iframe 
                      src={activeShoe.url} 
                      className="w-full h-full border-0 overflow-y-auto" 
                      style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}
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
