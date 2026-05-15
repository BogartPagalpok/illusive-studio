import { motion } from 'framer-motion';
import { Palette, Camera, Brush } from 'lucide-react';

const SERVICES = [
  {
    title: 'Brand Identity',
    description: 'Complete visual identity systems — logos, color palettes, typography, and brand guidelines.',
    icon: Palette,
  },
  {
    title: 'Photography',
    description: 'Professional photo sessions from portraits to product photography, with expert post-processing.',
    icon: Camera,
  },
  {
    title: 'Digital Painting',
    description: 'Custom digital illustrations and concept art that bring imagination to canvas.',
    icon: Brush,
  }
];

export default function Services() {
  return (
    <section id="services" className="relative section-padding bg-transparent overflow-hidden">
      <div className="section-container relative z-10">
        
        {/* REPLICATED TITLE BLOCK FROM ABOUT.TSX */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-sm font-heading tracking-[0.3em] uppercase text-accent mb-4">
            What I Do
          </p>
          <h2 className="font-bold tracking-tighter heading-lg text-white">
            SERVICES <span className="text-accent">&</span> EXPERTISE
          </h2>
          <div className="mt-6 w-20 h-0.5 bg-accent mx-auto" />
        </motion.div>

        {/* GRID LAYOUT - Using About Section Card Logic */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-10 rounded-3xl border transition-all duration-500 backdrop-blur-[32px] saturate-[180%] h-full flex flex-col group"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.03)', 
                borderColor: 'rgba(255, 255, 255, 0.12)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
                WebkitBackdropFilter: 'blur(32px) saturate(180%)'
              }}
            >
              <div className="mb-8 w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-accent transition-colors">
                <service.icon className="w-6 h-6 text-accent" />
              </div>
              
              <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-accent transition-colors uppercase tracking-tight">
                {service.title}
              </h3>
              
              <p className="text-[#efefef] text-base leading-relaxed font-light">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
