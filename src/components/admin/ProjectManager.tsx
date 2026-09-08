"use client";

import { useState, useEffect } from 'react';
import { Plus, Trash2, Upload, Save, RefreshCw, X, Pencil, Folder, ChevronDown, ChevronRight, Link, Eye, EyeOff, Search, MonitorPlay, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase, PORTFOLIO_BUCKET } from '../../lib/supabase';

interface VideoEntry {
  url: string;
  vertical: boolean;
}

interface Project {
  id?: string;
  project_group_id?: string;
  visible: boolean;
  title: string;
  category: string;
  description: string;
  process: string;
  tools: string[];
  results: string;
  image_url: string;
  video_urls?: VideoEntry[];
  facebook_urls?: string[];
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
  facebook_urls: [],
  image_layout: 'auto',
  project_url: '',
  card_thumbnail: '',
  hero_bg_desktop: '',
  hero_bg_mobile: '',
  featured: true,
  visible: true,
};

const CATEGORIES = ['Motion', 'Graphic Design', 'Photography', 'UI/UX'];
const LAYOUT_OPTIONS = [
  { value: 'auto', label: 'Auto (Count-based)' },
  { value: 'single', label: 'Single Image' },
  { value: '3up-portrait-left', label: '3-up Portrait Left' },
  { value: '4up-grid', label: '4-up Grid (2×2)' },
  { value: 'preview-grid', label: 'Preview Grid (+more)' },
];

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingProjectGroup, setEditingProjectGroup] = useState(false);
  const [previewProject, setPreviewProject] = useState<Project | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});
  const [projectSearch, setProjectSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [cardFile, setCardFile] = useState<any>(null);
  const [desktopFile, setDesktopFile] = useState<any>(null);
  const [mobileFile, setMobileFile] = useState<any>(null);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoVertical, setNewVideoVertical] = useState(false);
  const [newFacebookUrl, setNewFacebookUrl] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

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
    setEditingProjectGroup(false);
    setSelectedFiles([]);
    setCardFile(null);
    setDesktopFile(null);
    setMobileFile(null);
    setNewVideoUrl('');
    setNewVideoVertical(false);
    setNewFacebookUrl('');
    setValidationErrors([]);
  };

  const isValidUrl = (value: string) => {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const validateProject = (project: Project) => {
    const errors: string[] = [];
    if (project.project_url && !isValidUrl(project.project_url)) errors.push('Project URL must be a valid http or https URL.');
    if ((project.video_urls || []).some(video => !video.url.trim() || !isValidUrl(video.url))) errors.push('Every video entry must contain a valid http or https URL.');
    if ((project.facebook_urls || []).some(url => !url.trim() || !isValidUrl(url))) errors.push('Every link entry must contain a valid http or https URL.');
    if ((project.video_urls || []).length > 0 || (project.facebook_urls || []).length > 0) {
      if (!project.description.trim()) errors.push('A description is required for video or link projects.');
    }
    return errors;
  };

  const addVideoUrl = () => {
    if (!editingProject) return;
    if (!isValidUrl(newVideoUrl.trim())) {
      setValidationErrors(['Enter a valid http or https video URL before adding it.']);
      return;
    }
    setEditingProject({
      ...editingProject,
      video_urls: [...(editingProject.video_urls || []), { url: newVideoUrl.trim(), vertical: newVideoVertical }]
    });
    setNewVideoUrl('');
    setNewVideoVertical(false);
    setValidationErrors([]);
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

  const addFacebookUrl = () => {
    if (!editingProject) return;
    if (!isValidUrl(newFacebookUrl.trim())) {
      setValidationErrors(['Enter a valid http or https link before adding it.']);
      return;
    }
    setEditingProject({
      ...editingProject,
      facebook_urls: [...(editingProject.facebook_urls || []), newFacebookUrl.trim()]
    });
    setNewFacebookUrl('');
    setValidationErrors([]);
  };

  const removeFacebookUrl = (index: number) => {
    if (!editingProject) return;
    const updated = [...(editingProject.facebook_urls || [])];
    updated.splice(index, 1);
    setEditingProject({ ...editingProject, facebook_urls: updated });
  };

  const handleSave = async () => {
    if (!editingProject || !editingProject.title.trim()) return;

    const errors = validateProject(editingProject);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setSaveStatus('error');
      return;
    }
    setValidationErrors([]);

    setIsSaving(true);
    setSaveStatus('saving');
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
        project_group_id: editingProject.project_group_id || crypto.randomUUID(),
        title: editingProject.title,
        category: editingProject.category,
        description: editingProject.description,
        process: editingProject.process,
        tools: toolArray,
        results: editingProject.results,
        featured: editingProject.featured,
        visible: editingProject.visible,
        video_urls: editingProject.video_urls || [],
        facebook_urls: editingProject.facebook_urls || [],
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
      } else if (editingProject.id && selectedFiles.length === 0 && editingProjectGroup) {
        const originalProject = projects.find(p => p.id === editingProject.id);
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
            facebook_urls: editingProject.facebook_urls || [],
            video_urls: editingProject.video_urls || [],
            visible: editingProject.visible,
          })
          .eq('project_group_id', originalProject?.project_group_id || editingProject.project_group_id);
        if (error) throw error;
      } else if (editingProject.id && selectedFiles.length === 0) {
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
            facebook_urls: editingProject.facebook_urls || [],
            video_urls: editingProject.video_urls || [],
            visible: editingProject.visible,
          })
          .eq('id', editingProject.id);
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
      setSaveStatus('saved');
    } catch (error: any) {
      setSaveStatus('error');
      alert(`Operation failed: ${error.message}`);
    } finally {
      setIsSaving(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this item?')) return;
    setSaveStatus('saving');
    try {
      const { error } = await supabase.from('portfolio_projects').delete().eq('id', id);
      if (error) throw error;
      await fetchProjects();
      setSaveStatus('saved');
    } catch (error: any) {
      setSaveStatus('error');
      alert(`Delete failed: ${error.message}`);
    }
  };

  const handleDeleteProjectGroup = async (projectRows: Project[]) => {
    const groupId = projectRows[0]?.project_group_id;
    if (!confirm(`Permanently delete all ${projectRows.length} item${projectRows.length === 1 ? '' : 's'} in this project?`)) return;
    setSaveStatus('saving');
    try {
      const query = supabase.from('portfolio_projects').delete();
      const { error } = groupId
        ? await query.eq('project_group_id', groupId)
        : await query.in('id', projectRows.map(project => project.id).filter(Boolean));
      if (error) throw error;
      await fetchProjects();
      setSaveStatus('saved');
    } catch (error: any) {
      setSaveStatus('error');
      alert(`Delete failed: ${error.message}`);
    }
  };

  const toggleProjectVisibility = async (projectRows: Project[]) => {
    const nextVisible = !projectRows.every(project => project.visible);
    const groupId = projectRows[0]?.project_group_id;
    setSaveStatus('saving');
    const query = supabase.from('portfolio_projects').update({ visible: nextVisible });
    const { error } = groupId
      ? await query.eq('project_group_id', groupId)
      : await query.in('id', projectRows.map(project => project.id).filter(Boolean));
    if (error) {
      setSaveStatus('error');
      alert(`Visibility update failed: ${error.message}`);
      return;
    }
    await fetchProjects();
    setSaveStatus('saved');
  };

  const toggleProjectImages = async (projectRows: Project[]) => {
    const imageRows = projectRows.filter(project => project.image_url);
    if (imageRows.length === 0) return;
    const nextVisible = !imageRows.every(project => project.visible);
    setSaveStatus('saving');
    const { error } = await supabase
      .from('portfolio_projects')
      .update({ visible: nextVisible })
      .in('id', imageRows.map(project => project.id).filter(Boolean));
    if (error) {
      setSaveStatus('error');
      alert(`Image visibility update failed: ${error.message}`);
      return;
    }
    await fetchProjects();
    setSaveStatus('saved');
  };

  const toggleFolder = (category: string) => {
    setCollapsedFolders(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const normalizedSearch = projectSearch.trim().toLowerCase();
  const filteredProjects = projects.filter(project => {
    const matchesCategory = categoryFilter === 'All' || project.category === categoryFilter;
    if (!matchesCategory) return false;
    if (!normalizedSearch) return true;
    const searchableText = [
      project.title,
      project.category,
      project.description,
      project.process,
      project.results,
      project.project_url,
      ...(project.tools || []),
      ...(project.video_urls || []).map(video => video.url),
      ...(project.facebook_urls || []),
    ].filter(Boolean).join(' ').toLowerCase();
    return searchableText.includes(normalizedSearch);
  });

  const groupedProjects = CATEGORIES.reduce((acc, category) => {
    const categoryProjects = filteredProjects.filter(p => p.category === category);
    if (categoryProjects.length > 0) {
      acc[category] = categoryProjects;
    }
    return acc;
  }, {} as Record<string, Project[]>);

  const getGroupedByProject = (categoryProjects: Project[]) => {
    const grouped: Record<string, Project[]> = {};
    categoryProjects.forEach(project => {
      const fallbackKey = `${project.category}:${project.title.trim().toLowerCase()}`;
      const projectKey = project.project_group_id || fallbackKey;
      if (!grouped[projectKey]) grouped[projectKey] = [];
      grouped[projectKey].push(project);
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
        <div className="flex items-center gap-3">
          <h2 className="text-sm sm:text-base font-heading font-bold tracking-widest uppercase text-white">Portfolio Manager</h2>
          {saveStatus !== 'idle' && (
            <span className={`flex items-center gap-1 text-[9px] font-heading font-bold uppercase tracking-wider ${saveStatus === 'saved' ? 'text-emerald-400' : saveStatus === 'error' ? 'text-red-400' : 'text-accent'}`}>
              {saveStatus === 'saving' && <RefreshCw size={12} className="animate-spin" />}
              {saveStatus === 'saved' && <CheckCircle size={12} />}
              {saveStatus === 'error' && <AlertCircle size={12} />}
              {saveStatus === 'saving' ? 'Saving' : saveStatus === 'saved' ? 'Saved' : 'Save failed'}
            </span>
          )}
        </div>
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

      <div className="flex flex-col sm:flex-row gap-3 relative z-10">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="search"
            value={projectSearch}
            onChange={e => setProjectSearch(e.target.value)}
            placeholder="Search projects, descriptions, links..."
            className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs sm:text-sm text-white font-body focus:outline-none focus:border-accent/50 transition"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs sm:text-sm text-white font-body focus:outline-none focus:border-accent/50 transition"
        >
          <option value="All" className="bg-zinc-900 text-white">All categories</option>
          {CATEGORIES.map(category => (
            <option key={category} value={category} className="bg-zinc-900 text-white">{category}</option>
          ))}
        </select>
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
                <label className="block text-[9px] sm:text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-1.5">Facebook URLs (Optional)</label>
                <div className="space-y-1.5">
                  {(editingProject.facebook_urls || []).map((url, index) => (
                    <div key={index} className="flex gap-1.5 items-center">
                      <div className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] sm:text-sm text-white/70 flex items-center overflow-hidden whitespace-nowrap">
                        {url}
                      </div>
                      <button onClick={() => removeFacebookUrl(index)} className="p-1.5 text-white/20 hover:text-red-400 transition bg-white/5 rounded-lg flex-shrink-0">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-1.5 items-center">
                    <input
                      value={newFacebookUrl}
                      onChange={e => setNewFacebookUrl(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addFacebookUrl()}
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] sm:text-sm text-white font-body focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition"
                      placeholder="https://facebook.com/your-post"
                    />
                    <button onClick={addFacebookUrl} className="p-1.5 text-white/20 hover:text-accent transition bg-white/5 rounded-lg flex-shrink-0">
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

          {validationErrors.length > 0 && (
            <div className="rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-[10px] font-body text-red-200 space-y-1">
              {validationErrors.map(error => <p key={error}>{error}</p>)}
            </div>
          )}

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
          const byProject = getGroupedByProject(categoryProjects);

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
                  {Object.entries(byProject).map(([projectKey, projectRows]) => {
                    const projectTitle = projectRows[0]?.title || 'Untitled';
                    return (
                    <div key={projectKey}>
                      <div className="px-3 sm:px-4 py-2 bg-white/[0.01] border-b border-white/5 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] sm:text-xs font-heading font-bold uppercase tracking-wider text-white/50">{projectTitle}</span>
                          <span className="text-[9px] sm:text-[10px] text-white/20 ml-2">({projectRows.length})</span>
                        </div>
                        <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleProjectVisibility(projectRows)}
                          className={`flex items-center gap-1 p-1 text-[9px] font-heading font-bold uppercase tracking-wider ${projectRows.every(project => project.visible) ? 'text-accent' : 'text-white/30'} hover:text-accent transition`}
                          title={projectRows.every(project => project.visible) ? 'Hide project' : 'Display project'}
                        >
                          {projectRows.every(project => project.visible) ? <Eye size={13} /> : <EyeOff size={13} />}
                          {projectRows.every(project => project.visible) ? 'Hide' : 'Show'}
                        </button>
                        {projectRows.some(project => project.image_url) && (
                          <button
                            onClick={() => toggleProjectImages(projectRows)}
                            className="flex items-center gap-1 p-1 text-[9px] font-heading font-bold uppercase tracking-wider text-white/40 hover:text-accent transition"
                            title={projectRows.filter(project => project.image_url).every(project => project.visible) ? 'Hide all project images' : 'Show all project images'}
                          >
                            {projectRows.filter(project => project.image_url).every(project => project.visible) ? <EyeOff size={13} /> : <Eye size={13} />}
                            Images
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteProjectGroup(projectRows)}
                          className="flex items-center gap-1 p-1 text-[9px] font-heading font-bold uppercase tracking-wider text-white/40 hover:text-red-400 transition"
                          title="Delete entire project"
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>
                        <button
                          onClick={() => {
                            const first = projectRows[0];
                            clearForm();
                            setEditingProjectGroup(true);
                            setEditingProject({ 
                              ...first, 
                              video_urls: first.video_urls || [],
                              facebook_urls: first.facebook_urls || [],
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
                      </div>
                      {projectRows.map(project => (
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
                              {(project.facebook_urls || []).length > 0 && (
                                <p className="text-[9px] sm:text-[10px] text-white/20 flex items-center gap-1">
                                  <span className="w-1 h-1 rounded-full bg-accent inline-block flex-shrink-0" /> {(project.facebook_urls || []).length} FB post
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                            <button
                              onClick={() => setPreviewProject(project)}
                              className="p-1.5 sm:p-2 text-white/20 hover:text-accent transition bg-white/5 rounded-lg"
                              title="Preview project"
                            >
                              <MonitorPlay size={12} />
                            </button>
                            <button
                              onClick={() => {
                                clearForm();
                                setEditingProjectGroup(false);
                                setEditingProject({ ...project, video_urls: project.video_urls || [], facebook_urls: project.facebook_urls || [] });
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
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {previewProject && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setPreviewProject(null)}>
          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950 p-5 sm:p-7 shadow-2xl"
            onClick={event => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className="text-[10px] font-heading font-bold uppercase tracking-[0.25em] text-accent">Project Preview</p>
                <h3 className="text-xl sm:text-2xl font-heading font-black uppercase tracking-tight text-white mt-1">{previewProject.title}</h3>
                <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1">{previewProject.category}</p>
              </div>
              <button onClick={() => setPreviewProject(null)} className="p-2 text-white/40 hover:text-white rounded-lg bg-white/5" title="Close preview">
                <X size={16} />
              </button>
            </div>

            {(previewProject.hero_bg_desktop || previewProject.card_thumbnail || previewProject.image_url) && (
              <img
                src={previewProject.hero_bg_desktop || previewProject.card_thumbnail || previewProject.image_url}
                alt={previewProject.title}
                className="w-full max-h-[420px] object-contain rounded-xl border border-white/10 bg-black/40 mb-5"
              />
            )}

            <div className="space-y-4 text-sm text-white/70">
              {previewProject.description && <p className="leading-relaxed">{previewProject.description}</p>}
              {previewProject.process && <p><span className="text-white/40 uppercase text-[10px] tracking-widest">Process:</span> {previewProject.process}</p>}
              {previewProject.tools.length > 0 && <p><span className="text-white/40 uppercase text-[10px] tracking-widest">Tools:</span> {previewProject.tools.join(', ')}</p>}
              <div className="flex flex-wrap gap-2">
                {previewProject.project_url && (
                  <a href={previewProject.project_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--accent-contrast)' }}>
                    Project Link <ExternalLink size={12} />
                  </a>
                )}
                {(previewProject.video_urls || []).map((video, index) => (
                  <a key={`${video.url}-${index}`} href={video.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-white/20">
                    Video {index + 1} <ExternalLink size={12} />
                  </a>
                ))}
                {(previewProject.facebook_urls || []).map((url, index) => (
                  <a key={`${url}-${index}`} href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-white/20">
                    Link {index + 1} <ExternalLink size={12} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
