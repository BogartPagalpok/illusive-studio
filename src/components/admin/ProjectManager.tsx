"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Upload, Save, RefreshCw, X, Pencil } from 'lucide-react';
import { supabase, PORTFOLIO_BUCKET } from '../../lib/supabase';

interface Project {
  id?: string;
  title: string;
  category: string;
  description: string;
  process: string;
  tools: string[];
  results: string;
  image_url: string;
  card_thumbnail?: string;
  hero_bg_desktop?: string;
  hero_bg_mobile?: string;
  featured: boolean;
}

const EMPTY_PROJECT: Project = {
  title: '',
  category: 'Graphic Design',
  description: '',
  process: '',
  tools: [],
  results: '',
  image_url: '',
  card_thumbnail: '',
  hero_bg_desktop: '',
  hero_bg_mobile: '',
  featured: true,
};

export default function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [cardFile, setCardFile] = useState<File | null>(null);
  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);

  const [progress, setProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadToStorage = async (file: File) => {
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const { error: uploadError } = await supabase.storage
      .from(PORTFOLIO_BUCKET)
      .upload(fileName, file);
    if (uploadError) throw uploadError;
    const { data: urlData } = supabase.storage
      .from(PORTFOLIO_BUCKET)
      .getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    if (files.length === 1 && editingProject) {
      setEditingProject({ ...editingProject, image_url: files[0].name });
    }
  };

  const clearForm = () => {
    setEditingProject(null);
    setSelectedFiles([]);
    setCardFile(null);
    setDesktopFile(null);
    setMobileFile(null);
  };

  const handleSave = async () => {
    if (!editingProject || (!editingProject.image_url && selectedFiles.length === 0 && !editingProject.id)) return;

    setIsSaving(true);
    try {
      const toolArray = Array.isArray(editingProject.tools)
        ? editingProject.tools
        : (editingProject.tools as string).split(',').map(t => t.trim());

      let cUrl = editingProject.card_thumbnail;
      if (cardFile) cUrl = await uploadToStorage(cardFile);

      let dUrl = editingProject.hero_bg_desktop;
      if (desktopFile) dUrl = await uploadToStorage(desktopFile);

      let mUrl = editingProject.hero_bg_mobile;
      if (mobileFile) mUrl = await uploadToStorage(mobileFile);

      const baseProjectData = {
        ...editingProject,
        card_thumbnail: cUrl,
        hero_bg_desktop: dUrl,
        hero_bg_mobile: mUrl,
        tools: toolArray
      };

      if (selectedFiles.length > 1 && !editingProject.id) {
        setProgress({ current: 0, total: selectedFiles.length });
        const batchProjects = [];
        for (let i = 0; i < selectedFiles.length; i++) {
          setProgress(prev => ({ ...prev, current: i + 1 }));
          const url = await uploadToStorage(selectedFiles[i]);
          batchProjects.push({ ...baseProjectData, image_url: url });
        }
        const { error } = await supabase.from('portfolio_projects').insert(batchProjects);
        if (error) throw error;
      } else {
        let finalUrl = editingProject.image_url;
        if (selectedFiles.length === 1) {
          finalUrl = await uploadToStorage(selectedFiles[0]);
        }
        const projectData = { ...baseProjectData, image_url: finalUrl };
        const { error } = editingProject.id
          ? await supabase.from('portfolio_projects').update(projectData).eq('id', editingProject.id)
          : await supabase.from('portfolio_projects').insert([projectData]);
        if (error) throw error;
      }

      clearForm();
      fetchProjects();
    } catch (error: any) {
      alert(`Operation failed: ${error.message}`);
    } finally {
      setIsSaving(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this item?')) return;
    try {
      const { error } = await supabase.from('portfolio_projects').delete().eq('id', id);
      if (error) throw error;
      fetchProjects();
    } catch (error: any) {
      console.error('Delete error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="animate-spin text-accent" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Background glows */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[60%] h-[600px] pointer-events-none z-0 rounded-full mix-blend-screen"
        style={{ backgroundColor: 'var(--accent)', filter: 'blur(140px)', opacity: 0.15 }}
      />
      <div
        className="absolute bottom-[20%] right-[-10%] w-[50%] h-[500px] pointer-events-none z-0 rounded-full mix-blend-screen"
        style={{ backgroundColor: 'var(--accent)', filter: 'blur(120px)', opacity: 0.1 }}
      />

      <div className="flex justify-between items-center relative z-10">
        <h2 className="text-base font-heading font-bold tracking-widest uppercase text-white">Portfolio Manager</h2>
        <button
          onClick={() => {
            clearForm();
            setEditingProject(EMPTY_PROJECT);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-heading font-bold uppercase tracking-widest hover:brightness-110 transition"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-contrast)', boxShadow: '0 4px 15px rgba(157,0,255,0.3)' }}
        >
          <Plus size={16} /> New Entry
        </button>
      </div>

      {editingProject && (
        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl space-y-6 relative z-10">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <h3 className="text-sm font-heading font-black uppercase tracking-[0.2em] text-white">
              {editingProject.id ? 'Modify Details' : `New Entry ${selectedFiles.length > 1 ? `(${selectedFiles.length} files)` : ''}`}
            </h3>
            <button onClick={clearForm} className="text-white/20 hover:text-white"><X size={18} /></button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-2">Project Title</label>
                <input
                  value={editingProject.title}
                  onChange={e => setEditingProject({ ...editingProject, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white font-body focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition"
                  placeholder="Shared title"
                />
              </div>
              <div>
                <label className="block text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-2">Category</label>
                <input
                  value={editingProject.category}
                  onChange={e => setEditingProject({ ...editingProject, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white font-body focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition"
                />
              </div>
              <div>
                <label className="block text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-2">
                  Main Image / Gallery {selectedFiles.length > 0 && <span className="text-accent ml-2">({selectedFiles.length} selected)</span>}
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/50 flex items-center overflow-hidden whitespace-nowrap">
                    {selectedFiles.length > 0 ? `${selectedFiles.length} files selected` : editingProject.image_url || 'No file chosen'}
                  </div>
                  <label className="flex items-center justify-center p-3 border border-white/10 rounded-lg hover:bg-white/10 transition cursor-pointer">
                    <Upload size={14} />
                    <input type="file" multiple={!editingProject.id} accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-2">Tech Stack</label>
                <input
                  value={Array.isArray(editingProject.tools) ? editingProject.tools.join(', ') : editingProject.tools}
                  onChange={e => setEditingProject({ ...editingProject, tools: e.target.value.split(',').map(t => t.trim()) })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white font-body focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition"
                  placeholder="Photoshop, Illustrator..."
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-2">Overview</label>
                <textarea
                  value={editingProject.description}
                  onChange={e => setEditingProject({ ...editingProject, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white font-body focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition resize-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-2">Workflow / Process</label>
                <textarea
                  value={editingProject.process}
                  onChange={e => setEditingProject({ ...editingProject, process: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white font-body focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition resize-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-2">Results</label>
                <textarea
                  value={editingProject.results}
                  onChange={e => setEditingProject({ ...editingProject, results: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white font-body focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition resize-none"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 mt-2 space-y-4">
            <h4 className="text-[10px] font-heading font-black uppercase tracking-[0.2em] text-accent">Layout Assets (Optional)</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-2">Card Thumbnail</label>
                <div className="flex gap-2">
                  <div className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/50 flex items-center overflow-hidden whitespace-nowrap">
                    {cardFile ? cardFile.name : editingProject.card_thumbnail ? 'URL exists' : 'Fallback to Main'}
                  </div>
                  <label className="flex items-center justify-center p-3 border border-white/10 rounded-lg hover:bg-white/10 transition cursor-pointer">
                    <Upload size={14} />
                    <input type="file" accept="image/*" onChange={(e) => e.target.files && setCardFile(e.target.files[0])} className="hidden" />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-2">Hero (Desktop)</label>
                <div className="flex gap-2">
                  <div className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/50 flex items-center overflow-hidden whitespace-nowrap">
                    {desktopFile ? desktopFile.name : editingProject.hero_bg_desktop ? 'URL exists' : 'Fallback to Main'}
                  </div>
                  <label className="flex items-center justify-center p-3 border border-white/10 rounded-lg hover:bg-white/10 transition cursor-pointer">
                    <Upload size={14} />
                    <input type="file" accept="image/*" onChange={(e) => e.target.files && setDesktopFile(e.target.files[0])} className="hidden" />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-2">Hero (Mobile)</label>
                <div className="flex gap-2">
                  <div className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/50 flex items-center overflow-hidden whitespace-nowrap">
                    {mobileFile ? mobileFile.name : editingProject.hero_bg_mobile ? 'URL exists' : 'Fallback to Main'}
                  </div>
                  <label className="flex items-center justify-center p-3 border border-white/10 rounded-lg hover:bg-white/10 transition cursor-pointer">
                    <Upload size={14} />
                    <input type="file" accept="image/*" onChange={(e) => e.target.files && setMobileFile(e.target.files[0])} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-[10px] font-heading font-bold uppercase tracking-widest hover:brightness-110 transition disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-contrast)', boxShadow: '0 4px 15px rgba(157,0,255,0.3)' }}
          >
            {isSaving ? (
              <>
                <RefreshCw className="animate-spin" size={16} />
                {progress.total > 1 && <span>Processing {progress.current} of {progress.total}</span>}
              </>
            ) : (
              <><Save size={16} /> Deploy to Production</>
            )}
          </button>
        </div>
      )}

      <div className="grid gap-3 relative z-10">
        {projects.map(project => (
          <div
            key={project.id}
            className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-xl hover:border-accent/30 transition group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={project.card_thumbnail || project.image_url}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  alt={project.title}
                />
              </div>
              <div>
                <h4 className="text-xs font-heading font-bold tracking-widest uppercase text-white">{project.title}</h4>
                <p className="text-[10px] text-accent uppercase tracking-[0.2em] font-black">{project.category}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  clearForm();
                  setEditingProject(project);
                }}
                className="p-2 text-white/20 hover:text-white transition bg-white/5 rounded-lg"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => project.id && handleDelete(project.id)}
                className="p-2 text-white/20 hover:text-accent transition bg-white/5 rounded-lg"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
