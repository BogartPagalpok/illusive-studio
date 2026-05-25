import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProjectCard {
  id: string;
  title: string;
  colorName: string;
  colorHex: string;
  url: string;
  image: string;
}

export default function ProjectPortal() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [activeUrl, setActiveUrl] = useState<string>("https://demo-6py.pages.dev/");

  const shoeCards: ProjectCard[] = [
    {
      id: 'volt',
      title: 'Alphafly Proto',
      colorName: 'Volt Energy',
      colorHex: '#ccff00',
      // Simulating clicking a Volt Color Ad match string
      url: 'https://demo-6py.pages.dev/?color=volt',
      image: 'https://ayfbrkudeqvvnhchmxas.supabase.co/storage/v1/object/public/media/proto.png'
    },
    {
      id: 'purple',
      title: 'Air Max Dn',
      colorName: 'Dynamic Purple',
      colorHex: '#8a2be2',
      // Simulating clicking a Purple Color Ad match string
      url: 'https://demo-6py.pages.dev/?color=purple',
      image: 'https://ayfbrkudeqvvnhchmxas.supabase.co/storage/v1/object/public/media/purple.png'
    }
  ];

  const handleCardSelect = (card: ProjectCard) => {
    setSelectedCard(card.id);
    setActiveUrl(card.url);
  };

  return (
    <section className="w-full min-h-screen py-20 px-4 md:px-12 lg:px-20 flex flex-col justify-center relative z-10 bg-[#060606]">
      <div className="mb-12 text-left">
        <span className="text-xs font-black tracking-[0.4em] text-[var(--accent)] uppercase">Simulated Ad Conversion funnel</span>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase mt-1">Landing Page Relevance</h2>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-8 items-stretch min-h-[680px]">
        
        {/* Left Column: FB Ad Simulation Cards */}
        <div className="flex flex-col gap-4 justify-center">
          {shoeCards.map((card) => {
            const isSelected = selectedCard === card.id;
            return (
              <button
                key={card.id}
                onClick={() => handleCardSelect(card)}
                className="group relative w-full p-6 rounded-2xl border text-left flex items-center justify-between transition-all duration-500 overflow-hidden bg-neutral-950/40"
                style={{
                  borderColor: isSelected ? card.colorHex : 'rgba(255,255,255,0.05)',
                  boxShadow: isSelected ? `0 0 30px rgba(${card.colorHex}20)` : 'none'
                }}
              >
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 pointer-events-none"
                  style={{ backgroundColor: card.colorHex }}
                />

                <div className="relative z-10 flex flex-col gap-1">
                  <span className="text-[10px] font-black tracking-widest uppercase text-blue-500">Facebook Ad Asset</span>
                  <h3 className="text-xl font-black text-white uppercase tracking-wide">{card.title}</h3>
                  <span 
                    className="text-xs font-bold tracking-wider uppercase transition-colors duration-300"
                    style={{ color: isSelected ? card.colorHex : 'rgba(255,255,255,0.4)' }}
                  >
                    Click to simulate ad conversion ({card.colorName})
                  </span>
                </div>

                <div className="relative w-32 h-20 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                  <img src={card.image} alt={card.title} className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Embedded Portal Viewport */}
        <div className="relative w-full rounded-2xl border border-neutral-900 bg-black overflow-hidden flex items-center justify-center shadow-2xl min-h-[500px] lg:min-h-auto">
          <AnimatePresence mode="wait">
            {!selectedCard ? (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center text-center p-8 absolute inset-0 z-10"
              >
                <h4 className="text-xs font-black tracking-[0.3em] uppercase text-neutral-400">FB Feed Simulator</h4>
                <p className="text-[11px] text-neutral-600 max-w-[250px] mt-1.5 uppercase tracking-wider leading-relaxed">
                  Click a marketing ad placement to the left to test bounce reduction and instant color matching logic.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={activeUrl}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 w-full h-full z-20"
              >
                <iframe
                  src={activeUrl}
                  className="w-full h-full border-0 select-none bg-black"
                  title="Matched Landing Showcase"
                  allow="autoplay"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
