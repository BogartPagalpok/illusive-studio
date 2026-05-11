import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, RefreshCw, Database } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SiteContent {
  id: string;
  section: string;
  key: string;
  value: string;
}

const SEED_DATA = [
  { section: 'hero', key: 'subtitle', value: 'Graphic Designer • Photographer • Virtual Assistant' },
  { section: 'hero', key: 'heading_line1', value: 'Crafting Visual' },
  { section: 'hero', key: 'heading_line2', value: 'Stories That' },
  { section: 'hero', key: 'heading_line3', value: 'Resonate' },
  { section: 'hero', key: 'description', value: "I'm Ian Lester Eclevia — where timeless design meets modern execution. From brand identity to digital painting, I bring ideas to life with precision and passion." },
  { section: 'services', key: 'subtitle', value: 'What I Do' },
  { section: 'services', key: 'heading', value: 'Services & Expertise' },
  { section: 'services', key: 'service1_title', value: 'Brand Identity' },
  { section: 'services', key: 'service1_desc', value: 'Complete visual identity systems — logos, color palettes, typography, and brand guidelines.' },
  { section: 'services', key: 'service2_title', value: 'Photography' },
  { section: 'services', key: 'service2_desc', value: 'Professional photo sessions from portraits to product photography, with expert post-processing.' },
  { section: 'services', key: 'service3_title', value: 'Digital Painting' },
  { section: 'services', key: 'service3_desc', value: 'Custom digital illustrations and concept art that bring imagination to canvas.' },
  { section: 'services', key: 'service4_title', value: 'Admin Support' },
  { section: 'services', key: 'service4_desc', value: 'Reliable virtual assistance — email management, scheduling, and operational support.' },
  { section: 'services', key: 'service5_title', value: 'Graphic Design' },
  { section: 'services', key: 'service5_desc', value: 'Stunning layouts for social media, print materials, and marketing collateral.' },
  { section: 'services', key: 'service6_title', value: 'Videography' },
  { section: 'services', key: 'service6_desc', value: 'Creative video production and editing that tells your story with cinematic quality.' },
  { section: 'works', key: 'subtitle', value: 'Portfolio' },
  { section: 'works', key: 'heading', value: 'Selected Works' },
  { section: 'works', key: 'description', value: 'Quality over quantity — each project represents a deep commitment to craft, strategy, and visual storytelling.' },
  { section: 'about', key: 'subtitle', value: 'Who I Am' },
  { section: 'about', key: 'heading', value: 'About & Skills' },
  { section: 'about', key: 'subheading', value: 'Creative mind. Reliable hands.' },
  { section: 'about', key: 'description_line1', value: "I'm Ian Lester Eclevia — a graphic designer, photographer, and virtual assistant." },
  { section: 'about', key: 'description_line2', value: "With deep proficiency in Photoshop, digital painting, and photography, I craft visual stories." },
  { section: 'about', key: 'description_line3', value: "Beyond design, I bring the same dedication to virtual assistance — organized and proactive." },
  { section: 'about', key: 'skills_heading', value: 'Skills & Proficiency' },
  { section: 'contact', key: 'subtitle', value: "Let's Connect" },
  { section: 'contact', key: 'heading', value: 'Get in Touch' },
  { section: 'contact', key: 'description', value: "Have a project in mind or need a creative partner? I'd love to hear from you." },
  { section: 'footer', key: 'hook_heading', value: "Want to elevate your visual identity? Let's collaborate." },
  { section: 'footer', key: 'hook_desc', value: "From brand systems to digital art — I bring ideas to life with precision and passion." },
  { section: 'footer', key: 'email', value: 'yhanlhester@gmail.com' },
  { section: 'footer', key: 'phone', value: '+639524437988' },
  { section: 'footer', key: 'instagram', value: 'https://www.instagram.com/ilucifer0911/' },
  { section: 'footer', key: 'github', value: 'https://github.com/BogartPagalpok' },
  { section: 'footer', key: 'facebook', value: 'https://www.facebook.com/LordOfTheFlies911' },
  { section: 'footer', key: 'copyright', value: '© 2026 Ian Lester Eclevia. All rights reserved.' },
  { section: 'navbar', key: 'logo_text', value: 'IAN.LESTER' },
  { section: 'navbar', key: 'cta_text', value: 'Hire Me' },
];

export default function SiteContentManager() {
  const [contents, setContents] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('id, section, key, value')
        .order('section', { ascending: true });

      if (error) throw error;
      setContents(data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (item: SiteContent) => {
    setSavingId(item.id);
    try {
      const { error } = await supabase
        .from('site_content')
        .update({ value: item.value })
        .match({ section: item.section, key: item.key });

      if (error) throw error;
      alert('Content updated successfully');
      
      // Force page reload after a short delay to sync changes to the main site
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error: any) {
      console.error('Error saving content:', error);
      alert(`Save failed: ${error.message}`);
    } finally {
      setSavingId(null);
    }
  };

  const seedDefaultContent = async () => {
    if (!confirm('Seed default content? This will only add missing entries.')) return;
    setLoading(true);
    try {
      // Upsert based on section, key constraint
      const { error } = await supabase
        .from('site_content')
        .upsert(SEED_DATA, { onConflict: 'section,key' });

      if (error) throw error;
      alert('Default content seeded!');
      fetchContent();
    } catch (error: any) {
      console.error('Seed error:', error);
      alert(`Seed failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  // Predefined section order
  const SECTION_ORDER = ['HERO', 'SERVICES', 'WORKS', 'ABOUT', 'CONTACT', 'FOOTER'];
  
  const sections = Array.from(new Set(contents.map(c => c.section.toUpperCase())))
    .sort((a, b) => {
      const indexA = SECTION_ORDER.indexOf(a);
      const indexB = SECTION_ORDER.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });

  return (
    <div className="space-y-12 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-heading font-bold tracking-widest uppercase text-white mb-2">
            Content Editor
          </h2>
          <p className="text-xs text-white/40 font-body uppercase tracking-[0.2em]">
            Manage site-wide text and configurations
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={fetchContent}
            className="btn-outline flex items-center gap-2 py-2 px-4 text-xs"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            onClick={seedDefaultContent}
            className="btn-primary flex items-center gap-2 py-2 px-4 text-xs"
          >
            <Database size={14} />
            Seed Missing Keys
          </button>
        </div>
      </div>

      {sections.map((sectionName) => (
        <div key={sectionName} className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-sm font-heading font-black tracking-[0.3em] uppercase text-accent">
              {sectionName}
            </h3>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contents
              .filter(c => c.section.toUpperCase() === sectionName)
              .map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card-dark border-white/5 p-5 hover:border-white/10 transition-colors"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-heading font-bold tracking-[0.2em] uppercase text-white/30">
                      {item.key.replace(/_/g, ' ')}
                    </span>
                    <button
                      onClick={() => handleSave(item)}
                      disabled={savingId === item.id}
                      className="p-2 bg-white/5 text-accent hover:bg-accent hover:text-white transition-all disabled:opacity-50"
                      title="Save Changes"
                    >
                      {savingId === item.id ? (
                        <RefreshCw className="animate-spin" size={14} />
                      ) : (
                        <Save size={14} />
                      )}
                    </button>
                  </div>

                  {item.value.length > 60 || item.key.includes('description') || item.key.includes('desc') ? (
                    <textarea
                      value={item.value}
                      onChange={(e) => {
                        setContents(contents.map(c => c.id === item.id ? { ...c, value: e.target.value } : c));
                      }}
                      rows={4}
                      className="w-full bg-white/[0.02] border border-white/10 p-3 text-white font-body focus:outline-none focus:border-accent/50 transition-colors resize-none text-sm leading-relaxed"
                    />
                  ) : (
                    <input
                      type="text"
                      value={item.value}
                      onChange={(e) => {
                        setContents(contents.map(c => c.id === item.id ? { ...c, value: e.target.value } : c));
                      }}
                      className="w-full bg-white/[0.02] border border-white/10 p-3 text-white font-body focus:outline-none focus:border-accent/50 transition-colors text-sm"
                    />
                  )}
                </motion.div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
