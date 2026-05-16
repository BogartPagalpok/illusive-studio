import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, RefreshCw, Database, CheckCircle } from 'lucide-react';
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
  const [isSaving, setIsSaving] = useState(false);

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

  const handleMasterSave = async () => {
    setIsSaving(true);
    try {
      const updatePromises = contents.map((item) =>
        supabase
          .from('site_content')
          .update({ value: item.value })
          .match({ section: item.section, key: item.key })
      );

      const results = await Promise.all(updatePromises);
      const hasError = results.some((res) => res.error);

      if (hasError) throw new Error('One or more fields failed to save.');

      alert('All changes saved successfully!');
      fetchContent();
    } catch (error: any) {
      console.error('Save error:', error);
      alert(`Save failed: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const seedDefaultContent = async () => {
    if (!confirm('Seed default content? This will only add missing entries.')) return;
    setLoading(true);
    try {
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
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="animate-spin text-accent" size={24} />
      </div>
    );
  }

  const SECTION_ORDER = ['NAVBAR', 'HERO', 'SERVICES', 'WORKS', 'ABOUT', 'CONTACT', 'FOOTER'];
  
  const sections = Array.from(new Set(contents.map(c => c.section.toUpperCase())))
    .sort((a, b) => {
      const indexA = SECTION_ORDER.indexOf(a);
      const indexB = SECTION_ORDER.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      return a.localeCompare(b);
    });

  return (
    <div className="space-y-6 pb-12 relative">   {/* was space-y-12 pb-32 */}
      {/* HEADER BAR – compact */}
      <div className="sticky top-0 z-[100] bg-black/40 backdrop-blur-2xl border-b border-white/10 py-4 -mx-4 px-6 flex flex-col md:flex-row justify-between items-center gap-4 rounded-b-2xl">
        <div>
          <h2 className="text-base font-display font-bold tracking-widest uppercase text-white">System Content</h2>
          <p className="text-[10px] text-accent uppercase tracking-[0.3em] font-black">Live Production Editor</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={seedDefaultContent}
            className="btn-ghost-sm"    {/* compact outline button */}
          >
            <Database size={14} /> <span className="text-[10px] uppercase tracking-widest">Restore Defaults</span>
          </button>
          <button
            onClick={handleMasterSave}
            disabled={isSaving}
            className="btn-primary-sm"   {/* compact primary button */}
          >
            {isSaving ? <RefreshCw className="animate-spin" size={14} /> : <CheckCircle size={14} />}
            <span className="text-[10px] uppercase tracking-widest">{isSaving ? 'Syncing...' : 'Deploy Changes'}</span>
          </button>
        </div>
      </div>

      {sections.map((sectionName) => (
        <div key={sectionName} className="space-y-4">   {/* was space-y-8 */}
          <div className="flex items-center gap-4">
            <h3 className="text-[11px] font-display font-black tracking-[0.5em] uppercase text-accent/60">
              {sectionName}
            </h3>
            <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">   {/* was gap-8 */}
            {contents
              .filter(c => c.section.toUpperCase() === sectionName)
              .map((item) => (
                <div key={item.id} className="card-dark-sm group">   {/* compact card */}
                  <label className="text-[10px] font-display font-bold tracking-[0.2em] uppercase text-white/40 block mb-2 group-hover:text-accent transition-colors">
                    {item.key.replace(/_/g, ' ')}
                  </label>

                  {item.value.length > 80 || item.key.includes('description') || item.key.includes('desc') || item.key.includes('line') ? (
                    <textarea
                      value={item.value}
                      onChange={(e) => {
                        setContents(contents.map(c => c.id === item.id ? { ...c, value: e.target.value } : c));
                      }}
                      rows={3}
                      className="input-dark resize-none min-h-[70px]"    {/* compact textarea */}
                    />
                  ) : (
                    <input
                      type="text"
                      value={item.value}
                      onChange={(e) => {
                        setContents(contents.map(c => c.id === item.id ? { ...c, value: e.target.value } : c));
                      }}
                      className="input-dark"    {/* compact input */}
                    />
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
