"use client";

import { useState, useEffect } from 'react';
import { RefreshCw, Database, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SiteContent {
  id: string;
  section: string;
  key: string;
  value: string;
  visible: boolean;
}

const SEED_DATA = [
  { section: 'hero', key: 'subtitle', value: 'Video Editor • Graphics Artist' },
  { section: 'hero', key: 'heading_line1', value: 'Crafting Visual' },
  { section: 'hero', key: 'heading_line2', value: 'Stories That' },
  { section: 'hero', key: 'heading_line3', value: 'Resonate' },
  { section: 'hero', key: 'description', value: "I'm Ian Lester Eclevia — where timeless design meets modern execution. From brand identity to digital painting, I bring ideas to life with precision and passion." },
  { section: 'services', key: 'subtitle', value: 'What I Do' },
  { section: 'services', key: 'heading', value: 'Services & Expertise' },
  { section: 'services', key: 'service1_title', value: 'Graphic Design' },
  { section: 'services', key: 'service1_desc', value: 'Bold visual systems, layouts, and artwork built with clarity and a distinct point of view.' },
  { section: 'services', key: 'service2_title', value: 'Video Editing' },
  { section: 'services', key: 'service2_desc', value: 'Cinematic edits, pacing, sound, and finishing that turn raw footage into a compelling story.' },
  { section: 'services', key: 'service3_title', value: 'Motion Graphics' },
  { section: 'services', key: 'service3_desc', value: 'Animated titles, transitions, visual effects, and kinetic graphics that give content energy.' },
  { section: 'services', key: 'service4_title', value: 'Digital Illustration' },
  { section: 'services', key: 'service4_desc', value: 'Custom digital artwork and illustrated assets that bring concepts to life.' },
  { section: 'services', key: 'service5_title', value: 'Brand Identity' },
  { section: 'services', key: 'service5_desc', value: 'Distinctive logos, typography, color, and visual direction for a coherent brand presence.' },
  { section: 'services', key: 'service6_title', value: 'Visual Content Production' },
  { section: 'services', key: 'service6_desc', value: 'End-to-end visual content shaped from concept through design, edit, and final delivery.' },
  { section: 'works', key: 'subtitle', value: 'Portfolio' },
  { section: 'works', key: 'heading', value: 'Selected Works' },
  { section: 'works', key: 'description', value: 'Quality over quantity — each project represents a deep commitment to craft, strategy, and visual storytelling.' },
  { section: 'works', key: 'shoes_showroom_visible', value: 'true' },
  { section: 'about', key: 'subtitle', value: 'Who I Am' },
  { section: 'about', key: 'heading', value: 'About & Skills' },
  { section: 'about', key: 'subheading', value: 'Creative mind. Reliable hands.' },
  { section: 'about', key: 'description_line1', value: "I'm Ian Lester Eclevia — a video editor and graphics artist who turns ideas into clear, polished, and expressive visual stories." },
  { section: 'about', key: 'description_line2', value: "From editing and motion graphics to digital illustration and brand visuals, I shape every frame with purpose, rhythm, and detail." },
  { section: 'about', key: 'description_line3', value: "My work combines strong visual direction with careful post-production to create content that feels distinctive and ready to share." },
  { section: 'about', key: 'skills_heading', value: 'Skills & Proficiency' },
  { section: 'about', key: 'skill_1_name', value: 'Video Editing & Post-Production' },
  { section: 'about', key: 'skill_1_level', value: '90' },
  { section: 'about', key: 'skill_2_name', value: 'Advanced Compositing (Ps)' },
  { section: 'about', key: 'skill_2_level', value: '95' },
  { section: 'about', key: 'skill_3_name', value: 'Motion Graphics & VFX' },
  { section: 'about', key: 'skill_3_level', value: '85' },
  { section: 'about', key: 'skill_4_name', value: 'Editorial Photography' },
  { section: 'about', key: 'skill_4_level', value: '92' },
  { section: 'about', key: 'skill_5_name', value: 'UI/UX Prototyping' },
  { section: 'about', key: 'skill_5_level', value: '88' },
  { section: 'about', key: 'skill_6_name', value: 'Agile Pipelines (Canva Pro)' },
  { section: 'about', key: 'skill_6_level', value: '95' },
  { section: 'about', key: 'skill_7_name', value: 'Digital Illustration' },
  { section: 'about', key: 'skill_7_level', value: '90' },
  { section: 'about', key: 'skill_8_name', value: 'Typography & Grid Systems' },
  { section: 'about', key: 'skill_8_level', value: '87' },
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

  useEffect(() => { fetchContent(); }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      let { data, error } = await supabase
        .from('site_content')
        .select('id, section, key, value, visible')
        .order('section', { ascending: true });
      if (error) {
        const fallback = await supabase
          .from('site_content')
          .select('id, section, key, value')
          .order('section', { ascending: true });
        if (fallback.error) throw fallback.error;
        data = (fallback.data || []).map(item => ({ ...item, visible: true }));
      }
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
      const results = await Promise.all(contents.map(async (item) => {
        const result = await supabase
          .from('site_content')
          .update({ value: item.value, visible: item.visible })
          .match({ section: item.section, key: item.key });
        if (result.error) {
          return supabase
            .from('site_content')
            .update({ value: item.value })
            .match({ section: item.section, key: item.key });
        }
        return result;
      }));
      if (results.some((res) => res.error)) throw new Error('One or more fields failed to save.');
      alert('All changes saved successfully!');
      fetchContent();
    } catch (error: any) {
      alert(`Save failed: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const seedDefaultContent = async () => {
    if (!confirm('Seed default content? This will only add missing entries.')) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('site_content').upsert(SEED_DATA, { onConflict: 'section,key' });
      if (error) throw error;
      alert('Default content seeded!');
      fetchContent();
    } catch (error: any) {
      alert(`Seed failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <RefreshCw className="animate-spin text-accent" size={24} />
      </div>
    );
  }

  const SECTION_ORDER = ['NAVBAR', 'HERO', 'SERVICES', 'WORKS', 'ABOUT', 'CONTACT', 'FOOTER'];
  const sections = Array.from(new Set(contents.map(c => c.section.toUpperCase())))
    .sort((a, b) => {
      const idxA = SECTION_ORDER.indexOf(a);
      const idxB = SECTION_ORDER.indexOf(b);
      return idxA !== -1 && idxB !== -1 ? idxA - idxB : a.localeCompare(b);
    });

  return (
    <div className="space-y-6 pb-12">
      {/* Sticky header */}
      <div className="sticky top-0 z-[100] bg-black/40 backdrop-blur-2xl border-b border-white/10 py-4 -mx-4 px-6 flex flex-col md:flex-row justify-between items-center gap-4 rounded-b-2xl">
        <div>
          <h2 className="text-base font-heading font-bold tracking-widest uppercase text-white">System Content</h2>
          <p className="text-[10px] text-accent uppercase tracking-[0.3em] font-black">Live Production Editor</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={seedDefaultContent}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-[10px] font-heading font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-colors"
          >
            <Database size={14} /> Restore Defaults
          </button>
          <button
            onClick={handleMasterSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-heading font-bold uppercase tracking-widest hover:brightness-110 transition disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-contrast)', boxShadow: '0 4px 15px rgba(157,0,255,0.3)' }}
          >
            {isSaving ? <RefreshCw className="animate-spin" size={14} /> : <CheckCircle size={14} />}
            {isSaving ? 'Syncing...' : 'Deploy Changes'}
          </button>
        </div>
      </div>

      {sections.map((sectionName) => (
        <div key={sectionName} className="space-y-4">
          <div className="flex items-center gap-4">
            <h3 className="text-[11px] font-heading font-black tracking-[0.5em] uppercase text-accent/60">{sectionName}</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contents
              .filter(c => c.section.toUpperCase() === sectionName)
              .map((item) => (
                <div
                  key={item.id}
                  className="group p-4 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl hover:border-accent/30 hover:bg-white/[0.04] transition-all"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <label className="text-[10px] font-heading font-bold tracking-[0.2em] uppercase text-white/40 group-hover:text-accent transition-colors">
                      {item.key.replace(/_/g, ' ')}
                    </label>
                    <button
                      type="button"
                      onClick={() => setContents(contents.map(c => c.id === item.id ? { ...c, visible: !c.visible } : c))}
                      aria-label={item.visible ? `Hide ${item.key}` : `Display ${item.key}`}
                      title={item.visible ? 'Displayed on site' : 'Hidden from site'}
                      className={`p-1.5 rounded-md transition-colors ${item.visible ? 'text-accent hover:bg-accent/10' : 'text-white/30 hover:bg-white/10'}`}
                    >
                      {item.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                  </div>

                  {item.value.length > 80 || item.key.includes('description') || item.key.includes('desc') || item.key.includes('line') ? (
                    <textarea
                      value={item.value}
                      onChange={(e) =>
                        setContents(contents.map(c => c.id === item.id ? { ...c, value: e.target.value } : c))
                      }
                      rows={3}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white font-body focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition resize-none min-h-[70px]"
                      style={{ color: 'var(--text-primary)' }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={item.value}
                      onChange={(e) =>
                        setContents(contents.map(c => c.id === item.id ? { ...c, value: e.target.value } : c))
                      }
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white font-body focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition"
                      style={{ color: 'var(--text-primary)' }}
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
