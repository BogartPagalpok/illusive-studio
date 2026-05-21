"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Upload, Save, RefreshCw, X, Pencil, Folder, ChevronDown, ChevronRight, Link } from 'lucide-react';
import { supabase, PORTFOLIO_BUCKET } from '../../lib/supabase';

interface VideoEntry {
  url: string;
  vertical: boolean;
}

interface Project {
  id?: string;
  title: string;
  category: string;
  description: string;
  process: string;
  tools: string[];
  results: string;
  image_url: string;
  video_urls?: VideoEntry[];
  image_layout?: string;
  project_url?: string;
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
  video_urls: [],
  image_layout: 'auto',
  project_url: '',
  card_thumbnail: '',
  hero_bg_desktop: '',
  hero_bg_mobile: '',
  featured: true,
};

const CATEGORIES = ['Graphic Design', 'Photography', 'UI/UX', 'Motion'];
const LAYOUT_OPTIONS = [
  { value: 'auto', label: 'Auto (Count-based)' },
  { value: 'single', label: 'Single Image' },
  { value: '3up-portrait-left', label: '3-up Portrait Left' },
  { value: '4up-grid', label: '4-up Grid (2×2)' },
  { value: 'preview-grid', label: 'Preview Grid (+more)' },
];

export default function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});

  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [cardFile, setCardFile] = useState<any>(null);
  const [desktopFile, setDesktopFile] = useState<any>(null);
  const [mobileFile, setMobileFile] = useState<any>(null);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoVertical, setNewVideoVertical] = useState(false);

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

  const uploadToStorage = async (file: any) => {
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
    setNewVideoUrl('');
    setNewVideoVertical(false);
  };

  const addVideoUrl = () => {
    if (!newVideoUrl.trim() || !editingProject) return;
    setEditingProject({
      ...editingProject,
      video_urls: [...(editingProject.video_urls || []), { url: newVideoUrl.trim(), vertical: newVideoVertical }]
    });
    setNewVideoUrl('');
    setNewVideoVertical(false);
  };

  const removeVideoUrl = (index: number) => {
    if (!editingProject) return;
    const updated = [...(editingProject.video_urls || [])];
    updated.splice(index, 1);
    setEditingProject({ ...editingProject, video_urls: updated });
  };

  const toggleVideoVertical = (index: number) => {
    if (!editingProject) return;
    const updated = [...(editingProject.video_urls || [])];
    updated[index] = { ...updated[index], vertical: !updated[index].vertical };
    setEditingProject({ ...editingProject, video_urls: updated });
  };

  const handleSave = async () => {
    if (!editingProject || !editingProject.title.trim()) return;

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
        title: editingProject.title,
        category: editingProject.category,
        description: editingProject.description,
        process: editingProject.process,
        tools: toolArray,
        results: editingProject.results,
        featured: editingProject.featured,
        video_urls: editingProject.video_urls || [],
        image_layout: editingProject.image_layout || 'auto',
        project_url: editingProject.project_url || '',
        card_thumbnail: cUrl,
        hero_bg_desktop: dUrl,
        hero_bg_mobile: mUrl,
      };

      if (editingProject.id && selectedFiles.length > 0) {
        setProgress({ current: 0, total: selectedFiles.length });
        const newRows = [];
        for (let i = 0; i < selectedFiles.length; i++) {
          setProgress(prev => ({ ...prev, current: i + 1 }));
          const url = await uploadToStorage(selectedFiles[i]);
          newRows.push({ ...baseProjectData, image_url: url });
        }
        const { error } = await supabase.from('portfolio_projects').insert(newRows);
        if (error) throw error;
      } else if (selectedFiles.length > 1 && !editingProject.id) {
        setProgress({ current: 0, total: selectedFiles.length });
        const batchProjects = [];
        for (let i = 0; i < selectedFiles.length; i++) {
          setProgress(prev => ({ ...prev, current: i + 1 }));
          const url = await uploadToStorage(selectedFiles[i]);
          batchProjects.push({ ...baseProjectData, image_url: url });
        }
        const { error } = await supabase.from('portfolio_projects').insert(batchProjects);
        if (error) throw error;
           } else if (editingProject.id && selectedFiles.length === 0) {
        const originalTitle = projects.find(p => p.id === editingProject.id)?.title || editingProject.title;
        const { error } = await supabase
          .from('portfolio_projects')
          .update({ 
            title: editingProject.title,
            description: editingProject.description,
            tools: toolArray,
            process: editingProject.process,
            results: editingProject.results,
            category: editingProject.category,
            project_url: editingProject.project_url || '',
          })
          .eq('title', originalTitle);
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

  const toggleFolder = (category: string) => {
    setCollapsedFolders(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const groupedProjects = CATEGORIES.reduce((acc, category) => {
    const categoryProjects = projects.filter(p => p.category === category);
    if (categoryProjects.length > 0) {
      acc[category] = categoryProjects;
    }
    return acc;
  }, {} as Record<string, Project[]>);

  const getGroupedByTitle = (categoryProjects: Project[]) => {
    const grouped: Record<string, Project[]> = {};
    categoryProjects.forEach(project => {
      const title = project.title || 'Untitled';
      if (!grouped[title]) grouped[title] = [];
      grouped[title].push(project);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="animate-spin text-accent" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div
        className="absolute top-[-10%] left-[-10%] w-[60%] h-[600px] pointer-events-none z-0 rounded-full"
        style={{ backgroundColor: 'var(--accent)', filter: 'blur(140px)', opacity: 0.15 }}
      />
      <div
        className="absolute bottom-[20%] right-[-10%] w-[50%] h-[500px] pointer-events-none z-0 rounded-full"
        style={{ backgroundColor: 'var(--accent)', filter: 'blur(120px)', opacity: 0.1 }}
      />

      <div className="flex justify-between items-center relative z-10">
        <h2 className="text-sm sm:text-base font-heading font-bold tracking-widest uppercase text-white">Portfolio Manager</h2>
        <button
          onClick={() => {
            clearForm();
            setEditingProject(EMPTY_PROJECT);
          }}
          className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-[9px] sm:text-[10px] font-heading font-bold uppercase tracking-widest hover:brightness-110 transition"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-contrast)' }}
        >
          <Plus size={14} /> New
        </button>
      </div>

      {editingProject && (
        <div className="p-4 sm:p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl space-y-4 sm:space-y-6 relative z-10">
          <div className="flex justify-between items-center border-b border-white/5 pb-3 sm:pb-4">
            <h3 className="text-xs sm:text-sm font-heading font-black uppercase tracking-[0.2em] text-white">
              {editingProject.id ? 'Edit Details' : `New Entry ${selectedFiles.length > 1 ? `(${selectedFiles.length} files)` : ''}`}
            </h3>
            <button onClick={clearForm} className="text-white/20 hover:text-white"><X size={16} /></button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-[9px] sm:text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-1.5">Project Title *</label>
                <input
                  value={editingProject.title}
                  onChange={e => setEditingProject({ ...editingProject, title: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs sm:text-sm text-white font-body focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition"
                  placeholder="Shared title"
                />
              </div>
              <div>
                <label className="block text-[9px] sm:text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-1.5">Category</label>
                <select
                  value={editingProject.category}
                  onChange={e => setEditingProject({ ...editingProject, category: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs sm:text-sm text-white font-body focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='white' opacity='0.3' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    paddingRight: '2.5rem',
                  }}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat} className="bg-zinc-900 text-white">{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[9px] sm:text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-1.5">Display Layout</label>
                <select
                  value={editingProject.image_layout || 'auto'}
                  onChange={e => setEditingProject({ ...editingProject, image_layout: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs sm:text-sm text-white font-body focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='white' opacity='0.3' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    paddingRight: '2.5rem',
                  }}
                >
                  {LAYOUT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-zinc-900 text-white">{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[9px] sm:text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-1.5">Project URL (Optional)</label>
                <input
                  value={editingProject.project_url || ''}
                  onChange={e => setEditingProject({ ...editingProject, project_url: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs sm:text-sm text-white font-body focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition"
                  placeholder="https://behance.net/your-project"
                />
              </div>
              <div>
                <label className="block text-[9px] sm:text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-1.5">Video URLs (Optional)</label>
                <div className="space-y-1.5">
                  {(editingProject.video_urls || []).map((entry, index) => (
                    <div key={index} className="flex gap-1.5 items-center">
                      <div className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] sm:text-sm text-white/70 flex items-center overflow-hidden whitespace-nowrap">
                        {entry.url}
                      </div>
                      <label className="flex items-center gap-1 text-[9px] text-white/40 cursor-pointer flex-shrink-0">
                        <input type="checkbox" checked={entry.vertical} onChange={() => toggleVideoVertical(index)} className="w-3 h-3 rounded accent-accent" />
                        V
                      </label>
                      <button onClick={() => removeVideoUrl(index)} className="p-1.5 text-white/20 hover:text-red-400 transition bg-white/5 rounded-lg flex-shrink-0">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-1.5 items-center">
                    <input
                      value={newVideoUrl}
                      onChange={e => setNewVideoUrl(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addVideoUrl()}
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] sm:text-sm text-white font-body focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                    <label className="flex items-center gap-1 text-[9px] text-white/40 cursor-pointer flex-shrink-0">
                      <input type="checkbox" checked={newVideoVertical} onChange={e => setNewVideoVertical(e.target.checked)} className="w-3 h-3 rounded accent-accent" />
                      V
                    </label>
                    <button onClick={addVideoUrl} className="p-1.5 text-white/20 hover:text-accent transition bg-white/5 rounded-lg flex-shrink-0">
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[9px] sm:text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-1.5">
                  Main Image / Gallery {selectedFiles.length > 0 && <span className="text-accent ml-1">({selectedFiles.length} selected)</span>}
                </label>
                <div className="flex gap-1.5">
                  <div className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] sm:text-sm text-white/50 flex items-center overflow-hidden whitespace-nowrap">
                    {selectedFiles.length > 0 ? `${selectedFiles.length} files selected` : editingProject.image_url || 'No file chosen'}
                  </div>
                  <label className="flex items-center justify-center p-2 border border-white/10 rounded-lg hover:bg-white/10 transition cursor-pointer">
                    <Upload size={12} />
                    <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-[9px] sm:text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-1.5">Tech Stack</label>
                <input
                  value={Array.isArray(editingProject.tools) ? editingProject.tools.join(', ') : editingProject.tools}
                  onChange={e => setEditingProject({ ...editingProject, tools: e.target.value.split(',').map(t => t.trim()) })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs sm:text-sm text-white font-body focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition"
                  placeholder="Photoshop, Illustrator..."
                />
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-[9px] sm:text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-1.5">Overview</label>
                <textarea
                  value={editingProject.description}
                  onChange={e => setEditingProject({ ...editingProject, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs sm:text-sm text-white font-body focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition resize-none"
                />
              </div>
              <div>
                <label className="block text-[9px] sm:text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-1.5">Workflow / Process</label>
                <textarea
                  value={editingProject.process}
                  onChange={e => setEditingProject({ ...editingProject, process: e.target.value })}
                  rows={2}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs sm:text-sm text-white font-body focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition resize-none"
                />
              </div>
              <div>
                <label className="block text-[9px] sm:text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-1.5">Results</label>
                <textarea
                  value={editingProject.results}
                  onChange={e => setEditingProject({ ...editingProject, results: e.target.value })}
                  rows={2}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs sm:text-sm text-white font-body focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition resize-none"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 mt-2 space-y-3">
            <h4 className="text-[9px] sm:text-[10px] font-heading font-black uppercase tracking-[0.2em] text-accent">Layout Assets (Optional)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[9px] sm:text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-1.5">Card Thumbnail</label>
                <div className="flex gap-1.5">
                  <div className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] text-white/50 flex items-center overflow-hidden whitespace-nowrap">
                    {cardFile ? cardFile.name : editingProject.card_thumbnail ? 'URL exists' : 'Fallback to Main'}
                  </div>
                  <label className="flex items-center justify-center p-2 border border-white/10 rounded-lg hover:bg-white/10 transition cursor-pointer">
                    <Upload size={12} />
                    <input type="file" accept="image/*" onChange={(e) => e.target.files && setCardFile(e.target.files[0])} className="hidden" />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-[9px] sm:text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-1.5">Hero (Desktop)</label>
                <div className="flex gap-1.5">
                  <div className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] text-white/50 flex items-center overflow-hidden whitespace-nowrap">
                    {desktopFile ? desktopFile.name : editingProject.hero_bg_desktop ? 'URL exists' : 'Fallback to Main'}
                  </div>
                  <label className="flex items-center justify-center p-2 border border-white/10 rounded-lg hover:bg-white/10 transition cursor-pointer">
                    <Upload size={12} />
                    <input type="file" accept="image/*" onChange={(e) => e.target.files && setDesktopFile(e.target.files[0])} className="hidden" />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-[9px] sm:text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-1.5">Hero (Mobile)</label>
                <div className="flex gap-1.5">
                  <div className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] text-white/50 flex items-center overflow-hidden whitespace-nowrap">
                    {mobileFile ? mobileFile.name : editingProject.hero_bg_mobile ? 'URL exists' : 'Fallback to Main'}
                  </div>
                  <label className="flex items-center justify-center p-2 border border-white/10 rounded-lg hover:bg-white/10 transition cursor-pointer">
                    <Upload size={12} />
                    <input type="file" accept="image/*" onChange={(e) => e.target.files && setMobileFile(e.target.files[0])} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-[9px] sm:text-[10px] font-heading font-bold uppercase tracking-widest hover:brightness-110 transition disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-contrast)' }}
          >
            {isSaving ? (
              <>
                <RefreshCw className="animate-spin" size={14} />
                {progress.total > 1 && <span>Processing {progress.current} of {progress.total}</span>}
              </>
            ) : (
              <><Save size={14} /> Deploy to Production</>
            )}
          </button>
        </div>
      )}

      {/* FOLDER VIEW — Category → Title → Items */}
      <div className="space-y-2 sm:space-y-3 relative z-10">
        {Object.entries(groupedProjects).map(([category, categoryProjects]) => {
          const isCollapsed = collapsedFolders[category] ?? true;
          const projectCount = categoryProjects.length;
          const byTitle = getGroupedByTitle(categoryProjects);

          return (
            <div key={category} className="rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden">
              <button
                onClick={() => toggleFolder(category)}
                className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-white/[0.03] transition"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <Folder size={16} className="text-accent flex-shrink-0" />
                  <div className="text-left">
                    <h3 className="text-xs sm:text-sm font-heading font-bold tracking-widest uppercase text-white">{category}</h3>
                    <p className="text-[9px] sm:text-[10px] text-white/30 font-heading uppercase tracking-[0.2em]">
                      {projectCount} {projectCount === 1 ? 'project' : 'projects'}
                    </p>
                  </div>
                </div>
                <div className="text-white/30 flex-shrink-0">
                  {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {!isCollapsed && (
                <div className="border-t border-white/5">
                  {Object.entries(byTitle).map(([title, titleProjects]) => (
                    <div key={title}>
                      <div className="px-3 sm:px-4 py-2 bg-white/[0.01] border-b border-white/5 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] sm:text-xs font-heading font-bold uppercase tracking-wider text-white/50">{title}</span>
                          <span className="text-[9px] sm:text-[10px] text-white/20 ml-2">({titleProjects.length})</span>
                        </div>
                        <button
                          onClick={() => {
                            const first = titleProjects[0];
                            clearForm();
                            setEditingProject({ 
                              ...first, 
                              video_urls: first.video_urls || [],
                              image_url: '',
                              image_layout: ''
                            });
                          }}
                          className="p-1 text-white/20 hover:text-accent transition"
                          title="Edit details for all"
                        >
                          <Pencil size={12} />
                        </button>
                      </div>
                      {titleProjects.map(project => (
                        <div
                          key={project.id}
                          className="flex items-center justify-between pl-6 sm:pl-8 pr-3 sm:pr-4 py-2.5 sm:py-3 hover:bg-white/[0.02] transition border-b border-white/5 last:border-b-0"
                        >
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/5 border border-white/10 rounded-lg overflow-hidden flex-shrink-0">
                              {(project.card_thumbnail || project.image_url) ? (
                                <img
                                  src={project.card_thumbnail || project.image_url}
                                  className="w-full h-full object-cover"
                                  alt={project.title}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/10">
                                  <Link size={12} />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] sm:text-xs text-white/60 truncate">{project.image_layout !== 'auto' ? `Layout: ${project.image_layout}` : 'Image'}</p>
                              {(project.video_urls || []).length > 0 && (
                                <p className="text-[9px] sm:text-[10px] text-white/20 flex items-center gap-1">
                                  <span className="w-1 h-1 rounded-full bg-accent inline-block flex-shrink-0" /> {(project.video_urls || []).length} video
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                            <button
                              onClick={() => {
                                clearForm();
                                setEditingProject({ ...project, video_urls: project.video_urls || [] });
                              }}
                              className="p-1.5 sm:p-2 text-white/20 hover:text-white transition bg-white/5 rounded-lg"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              onClick={() => project.id && handleDelete(project.id)}
                              className="p-1.5 sm:p-2 text-white/20 hover:text-red-400 transition bg-white/5 rounded-lg"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
