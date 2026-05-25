import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShoeVariant {
  id: string;
  title: string;
  colorName: string;
  colorHex: string;
  url: string;
  shoeImage: string;
}

export default function ProjectPortal() {
  const [activeShoe, setActiveShoe] = useState<ShoeVariant | null>(null);

  const dynamicShoes: ShoeVariant[] = [
    {
      id: 'blue',
      title: 'ZoomX Blue',
      colorName: 'Ocean Surge',
      colorHex: '#00d2ff',
      url: 'https://demo-6py.pages.dev/?color=blue',
      shoeImage: 'https://raw.githubusercontent.com/BogartPagalpok/illusive-studio/main/public/shoe_blue.png'
    },
    {
      id: 'cherry',
      title: 'Air Cherry',
      colorName: 'Cherry Bomb',
      colorHex: '#ff0055',
      url: 'https://demo-6py.pages.dev/?color=cherry',
      shoeImage: 'https://raw.githubusercontent.com/BogartPagalpok/illusive-studio/main/public/shoe_cherry.png'
    },
    {
      id: 'green',
      title: 'Alphafly Proto',
      colorName: 'Volt Energy',
      colorHex: '#ccff00',
      url: 'https://demo-6py.pages.dev/?color=volt',
      shoeImage: 'https://raw.githubusercontent.com/BogartPagalpok/illusive-studio/main/public/shoe_green.png'
    },
    {
      id: 'purple',
      title: 'Air Max Dn',
      colorName: 'Dynamic Purple',
      colorHex: '#8a2be2',
      url: 'https://demo-6py.pages.dev/?color=purple',
      shoeImage: 'https://raw.githubusercontent.com/BogartPagalpok/illusive-studio/main/public/shoe_purple.png'
    },
    {
      id: 'red',
      title: 'Air Zoom Red',
      colorName: 'Chili Red',
      colorHex: '#e60000',
      url: 'https://demo-6py.pages.dev/?color=red',
      shoeImage: 'https://raw.githubusercontent.com/BogartPagalpok/illusive-studio/main/public/shoe_red.png'
    }
  ];

  const marqueeShoes = [...dynamicShoes, ...dynamicShoes, ...dynamicShoes];

  return (
    <section className="w-full min-h-screen py-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center relative z-10 bg-transparent overflow-hidden select-none">
      
      <AnimatePresence mode="wait">
        {!activeShoe ? (
          /* STATE 1: SELECTION VIEWPORT (Desktop Grid / Mobile Marquee) */
          <motion.div
            key="selection-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="w-full flex flex-col items-center justify-center min-h-[600px]"
          >
            <div className="text-center mb-12 lg:mb-24">
              <span className="text-xs font-black tracking-[0.4em] text-white/50 uppercase">Interactive Showroom</span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase mt-2">Select A Variant</h2>
            </div>

            {/* --- DESKTOP VIEW: Sleek Floating Flex Row --- */}
            <div className="hidden lg:flex flex-wrap justify-center items-center gap-12 max-w-[1400px] w-full px-8">
              {dynamicShoes.map((shoe) => (
                <button
                  key={`desktop-${shoe.id}`}
                  onClick={() => setActiveShoe(shoe)}
                  className="group relative flex flex-col items-center justify-center w-[220px] transition-all duration-500"
                >
                  <div className="relative w-full h-[220px] flex items-center justify-center mb-6">
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-700 rounded-full"
                      style={{ backgroundColor: shoe.colorHex }}
                    />
                    <img 
                      src={shoe.shoeImage} 
                      alt={shoe.title} 
                      className="w-full h-auto object-contain transition-all duration-500 group-hover:scale-125 group-hover:-translate-y-6 group-hover:-rotate-12 filter drop-shadow-[0_20px_20px_rgba(0,0,0,0.6)]"
                    />
                  </div>
                  <h4 className="text-[14px] font-black text-white uppercase tracking-wider transition-transform duration-500 group-hover:-translate-y-2">{shoe.title}</h4>
                  <span 
                    className="text-[10px] font-bold uppercase tracking-widest mt-1 transition-transform duration-500 group-hover:-translate-y-2" 
                    style={{ color: shoe.colorHex }}
                  >
                    {shoe.colorName}
                  </span>
                </button>
              ))}
            </div>

            {/* --- MOBILE VIEW: Infinite Left-to-Right Auto-Scroll Marquee --- */}
            <div className="flex lg:hidden w-full overflow-hidden relative py-10 fade-edges">
              <style>{`
                .fade-edges {
                  mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
                  -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
                }
              `}</style>

              <motion.div
                className="flex gap-10 w-max cursor-grab active:cursor-grabbing"
                animate={{ x: ["-50%", "0%"] }}
                transition={{ ease: "linear", duration: 25, repeat: Infinity }}
              >
                {marqueeShoes.map((shoe, idx) => (
                  <button
                    key={`mobile-${shoe.id}-${idx}`}
                    onClick={() => setActiveShoe(shoe)}
                    className="flex flex-col items-center justify-center w-[200px] shrink-0 group focus:outline-none"
                  >
                    <div className="relative w-full h-[180px] flex items-center justify-center mb-4">
                       <img 
                        src={shoe.shoeImage} 
                        alt={shoe.title} 
                        className="w-full h-auto object-contain filter drop-shadow-[0_15px_15px_rgba(0,0,0,0.5)] transition-transform duration-300 active:scale-95"
                      />
                    </div>
                    <h4 className="text-[13px] font-black text-white uppercase tracking-wider">{shoe.title}</h4>
                    <span className="text-[9px] font-bold uppercase tracking-widest mt-1" style={{ color: shoe.colorHex }}>
                      {shoe.colorName}
                    </span>
                  </button>
                ))}
              </motion.div>
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
            className="w-full flex flex-col max-w-[1800px]"
          >
            <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 px-2">
              <div>
                <span className="text-xs font-black tracking-[0.4em] uppercase" style={{ color: activeShoe.colorHex }}>
                  Campaign Live Portal &rarr; {activeShoe.colorName}
                </span>
                <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Match Verification Frame</h3>
              </div>
              <button
                onClick={() => setActiveShoe(null)}
                className="px-6 py-3 border border-neutral-800 text-neutral-400 bg-transparent hover:bg-neutral-900 hover:text-white rounded-xl text-xs font-bold tracking-widest uppercase transition-all duration-200"
              >
                &larr; Back To Selection
              </button>
            </div>

            <div className="w-full grid grid-cols-1 lg:grid-cols-[1.95fr_1fr] gap-6 xl:gap-8 items-center justify-center">
              
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
