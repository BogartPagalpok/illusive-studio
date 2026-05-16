import { useState, useEffect } from 'react';
import { RefreshCw, Database, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SiteContent {
  id: string;
  section: string;
  key: string;
  value: string;
}

const SEED_DATA = [
  // ... your entire SEED_DATA array stays exactly the same
];

export default function SiteContentManager() {
  const [contents, setContents] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { fetchContent(); }, []);

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
        supabase.from('site_content').update({ value: item.value }).match({ section: item.section, key: item.key })
      );
      const results = await Promise.all(updatePromises);
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
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-contrast text-[10px] font-heading font-bold uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
            style={{ boxShadow: '0 4px 15px rgba(157,0,255,0.3)' }}
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
                  <label className="text-[10px] font-heading font-bold tracking-[0.2em] uppercase text-white/40 block mb-2 group-hover:text-accent transition-colors">
                    {item.key.replace(/_/g, ' ')}
                  </label>

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
