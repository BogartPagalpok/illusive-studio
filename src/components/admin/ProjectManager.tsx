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

      // Editing existing + new images → insert new rows (add to project)
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
      }
      // Creating new with multiple files
      else if (selectedFiles.length > 1 && !editingProject.id) {
        setProgress({ current: 0, total: selectedFiles.length });
        const batchProjects = [];
        for (let i = 0; i < selectedFiles.length; i++) {
          setProgress(prev => ({ ...prev, current: i + 1 }));
          const url = await uploadToStorage(selectedFiles[i]);
          batchProjects.push({ ...baseProjectData, image_url: url });
        }
        const { error } = await supabase.from('portfolio_projects').insert(batchProjects);
        if (error) throw error;
      }
      // Single file or no file
      else {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="animate-spin text-accent" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div
        className="absolute top-[-10%] left-[-10%] w-[60%] h-[600px] pointer-events-none z-0 rounded-full"
        style={{ backgroundColor: 'var(--accent)', filter: 'blur(140px)', opacity: 0.15 }}
      />
      <div
        className="absolute bottom-[20%] right-[-10%] w-[50%] h-[500px] pointer-events-none z-0 rounded-full"
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
          style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-contrast)' }}
        >
          <Plus size={16} /> New Entry
        </button>
      </div>

      {editingProject && (
        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl space-y-6 relative z-10">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <h3 className="text-sm font-heading font-black uppercase tracking-[0.2em] text-white">
              {editingProject.id ? 'Add to Project' : `New Entry ${selectedFiles.length > 1 ? `(${selectedFiles.length} files)` : ''}`}
            </h3>
            <button onClick={clearForm} className="text-white/20 hover:text-white"><X size={18} /></button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-2">Project Title *</label>
                <input
                  value={editingProject.title}
                  onChange={e => setEditingProject({ ...editingProject, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white font-body focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition"
                  placeholder="Shared title"
                />
              </div>
              <div>
                <label className="block text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-2">Category</label>
                <select
                  value={editingProject.category}
                  onChange={e => setEditingProject({ ...editingProject, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white font-body focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition appearance-none cursor-pointer"
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
                <label className="block text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-2">Display Layout</label>
                <select
                  value={editingProject.image_layout || 'auto'}
                  onChange={e => setEditingProject({ ...editingProject, image_layout: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white font-body focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition appearance-none cursor-pointer"
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
                <label className="block text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-2">Project URL (Optional)</label>
                <input
                  value={editingProject.project_url || ''}
                  onChange={e => setEditingProject({ ...editingProject, project_url: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white font-body focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition"
                  placeholder="https://behance.net/your-project"
                />
              </div>
              <div>
                <label className="block text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-2">Video URLs (Optional)</label>
                <div className="space-y-2">
                  {(editingProject.video_urls || []).map((entry, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <div className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 flex items-center overflow-hidden whitespace-nowrap">
                        {entry.url}
                      </div>
                      <label className="flex items-center gap-1 text-[10px] text-white/40 cursor-pointer flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={entry.vertical}
                          onChange={() => toggleVideoVertical(index)}
                          className="w-3 h-3 rounded accent-accent"
                        />
                        V
                      </label>
                      <button
                        onClick={() => removeVideoUrl(index)}
                        className="p-2 text-white/20 hover:text-red-400 transition bg-white/5 rounded-lg flex-shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2 items-center">
                    <input
                      value={newVideoUrl}
                      onChange={e => setNewVideoUrl(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addVideoUrl()}
                      className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white font-body focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                    <label className="flex items-center gap-1 text-[10px] text-white/40 cursor-pointer flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={newVideoVertical}
                        onChange={e => setNewVideoVertical(e.target.checked)}
                        className="w-3 h-3 rounded accent-accent"
                      />
                      V
                    </label>
                    <button
                      onClick={addVideoUrl}
                      className="p-2 text-white/20 hover:text-accent transition bg-white/5 rounded-lg flex-shrink-0"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-2">
                  Main Image / Gallery (Optional) {selectedFiles.length > 0 && <span className="text-accent ml-2">({selectedFiles.length} selected)</span>}
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/50 flex items-center overflow-hidden whitespace-nowrap">
                    {selectedFiles.length > 0 ? `${selectedFiles.length} files selected` : editingProject.image_url || 'No file chosen'}
                  </div>
                  <label className="flex items-center justify-center p-3 border border-white/10 rounded-lg hover:bg-white/10 transition cursor-pointer">
                    <Upload size={14} />
                    <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
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
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-contrast)' }}
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

      {/* FOLDER VIEW */}
      <div className="space-y-3 relative z-10">
        {Object.entries(groupedProjects).map(([category, categoryProjects]) => {
          const isCollapsed = collapsedFolders[category] ?? true;
          const projectCount = categoryProjects.length;

          return (
            <div key={category} className="rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden">
              <button
                onClick={() => toggleFolder(category)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/[0.03] transition"
              >
                <div className="flex items-center gap-3">
                  <Folder size={18} className="text-accent" />
                  <div className="text-left">
                    <h3 className="text-sm font-heading font-bold tracking-widest uppercase text-white">{category}</h3>
                    <p className="text-[10px] text-white/30 font-heading uppercase tracking-[0.2em]">
                      {projectCount} {projectCount === 1 ? 'project' : 'projects'}
                    </p>
                  </div>
                </div>
                <div className="text-white/30">
                  {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                </div>
              </button>

              {!isCollapsed && (
                <div className="border-t border-white/5">
                  {categoryProjects.map(project => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition border-b border-white/5 last:border-b-0"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg overflow-hidden flex-shrink-0">
                          {(project.card_thumbnail || project.image_url) ? (
                            <img
                              src={project.card_thumbnail || project.image_url}
                              className="w-full h-full object-cover"
                              alt={project.title}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/10">
                              <Link size={14} />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-heading font-bold tracking-widest uppercase text-white">{project.title}</h4>
                          <p className="text-[10px] text-accent uppercase tracking-[0.2em] font-black">{project.category}</p>
                          {project.image_layout && project.image_layout !== 'auto' && (
                            <p className="text-[10px] text-white/20 mt-0.5">Layout: {project.image_layout}</p>
                          )}
                          {(project.video_urls || []).length > 0 && (
                            <p className="text-[10px] text-white/20 mt-0.5 flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-accent inline-block" /> {(project.video_urls || []).length} video{(project.video_urls || []).length > 1 ? 's' : ''} linked
                            </p>
                          )}
                          {project.project_url && (
                            <p className="text-[10px] text-white/20 mt-0.5 flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-accent inline-block" /> External link
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            clearForm();
                            setEditingProject({ ...project, video_urls: project.video_urls || [] });
                          }}
                          className="p-2 text-white/20 hover:text-white transition bg-white/5 rounded-lg"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => project.id && handleDelete(project.id)}
                          className="p-2 text-white/20 hover:text-red-400 transition bg-white/5 rounded-lg"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
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
