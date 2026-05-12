import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  featured: true,
};

export default function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
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
      // For a single file, we still show the URL in the input preview
      setEditingProject({ ...editingProject, image_url: files[0].name });
    }
  };

  const handleSave = async () => {
    if (!editingProject || (!editingProject.image_url && selectedFiles.length === 0)) return;
    
    setIsSaving(true);
    try {
      const toolArray = Array.isArray(editingProject.tools) 
        ? editingProject.tools 
        : (editingProject.tools as string).split(',').map(t => t.trim());

      // CASE 1: BULK UPLOAD (Multiple files selected in New Entry)
      if (selectedFiles.length > 1 && !editingProject.id) {
        setProgress({ current: 0, total: selectedFiles.length });
        const batchProjects = [];

        for (let i = 0; i < selectedFiles.length; i++) {
          setProgress(prev => ({ ...prev, current: i + 1 }));
          const url = await uploadToStorage(selectedFiles[i]);
          batchProjects.push({
            ...editingProject,
            image_url: url,
            tools: toolArray
          });
        }
        const { error } = await supabase.from('portfolio_projects').insert(batchProjects);
        if (error) throw error;
      } 
      // CASE 2: SINGLE PROJECT (New or Edit)
      else {
        let finalUrl = editingProject.image_url;
        if (selectedFiles.length === 1) {
          finalUrl = await uploadToStorage(selectedFiles[0]);
        }

        const projectData = { ...editingProject, image_url: finalUrl, tools: toolArray };
        
        const { error } = editingProject.id 
          ? await supabase.from('portfolio_projects').update(projectData).eq('id', editingProject.id)
          : await supabase.from('portfolio_projects').insert([projectData]);
        
        if (error) throw error;
      }

      setEditingProject(null);
      setSelectedFiles([]);
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
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Soft Pastel/Neon Mesh Gradient Backgrounds */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[60%] h-[600px] pointer-events-none z-0 rounded-full mix-blend-screen"
        style={{ backgroundColor: 'var(--accent)', filter: 'blur(140px)', opacity: 0.15 }}
      />
      <div 
        className="absolute bottom-[20%] right-[-10%] w-[50%] h-[500px] pointer-events-none z-0 rounded-full mix-blend-screen"
        style={{ backgroundColor: 'var(--accent)', filter: 'blur(120px)', opacity: 0.1 }}
      />

      <div className="flex justify-between items-center relative z-10">
        <h2 className="text-xl font-heading font-bold tracking-widest uppercase text-white">Portfolio Manager</h2>
        <button 
          onClick={() => { setEditingProject(EMPTY_PROJECT); setSelectedFiles([]); }} 
          className="btn-primary flex items-center gap-2"
          style={{ background: 'var(--accent)', backgroundImage: 'none' }}
        >
          <Plus size={16} /> New Entry
        </button>
      </div>

      {editingProject && (
        <div className="card-dark border-white/10 p-8 space-y-8 relative z-10">
          <div className="flex justify-between items-center border-b border-white/5 pb-6">
            <h3 className="font-heading font-black uppercase tracking-[0.2em] text-white text-sm">
              {editingProject.id ? 'Modify Details' : `New Entry ${selectedFiles.length > 1 ? `(${selectedFiles.length} files)` : ''}`}
            </h3>
            <button onClick={() => setEditingProject(null)} className="text-white/20 hover:text-white"><X size={20} /></button>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-3">Project Title</label>
                <input value={editingProject.title} onChange={e => setEditingProject({...editingProject, title: e.target.value})} className="input-field" placeholder="Shared title for all uploads" />
              </div>
              <div>
                <label className="block text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-3">Category</label>
                <input value={editingProject.category} onChange={e => setEditingProject({...editingProject, category: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-3">
                  Upload Assets {selectedFiles.length > 0 && <span className="text-accent ml-2">({selectedFiles.length} selected)</span>}
                </label>
                <div className="flex gap-2">
                  <div className="input-field flex-1 opacity-50 text-[10px] flex items-center overflow-hidden whitespace-nowrap">
                    {selectedFiles.length > 0 ? `${selectedFiles.length} files selected` : editingProject.image_url || 'No file selected'}
                  </div>
                  <label className="btn-outline p-4 cursor-pointer flex-shrink-0">
                    <Upload size={14} />
                    <input type="file" multiple={!editingProject.id} accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-3">Tech Stack</label>
                <input value={Array.isArray(editingProject.tools) ? editingProject.tools.join(', ') : editingProject.tools} onChange={e => setEditingProject({...editingProject, tools: e.target.value.split(',').map(t => t.trim())})} className="input-field" placeholder="Photoshop, Illustrator..." />
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-3">Overview</label>
                <textarea value={editingProject.description} onChange={e => setEditingProject({...editingProject, description: e.target.value})} rows={3} className="input-field resize-none custom-scrollbar" />
              </div>
              <div>
                <label className="block text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-3">Workflow</label>
                <textarea value={editingProject.process} onChange={e => setEditingProject({...editingProject, process: e.target.value})} rows={3} className="input-field resize-none custom-scrollbar" />
              </div>
            </div>
          </div>

          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="btn-primary w-full py-5 text-xs flex flex-col items-center gap-1"
            style={{ background: 'var(--accent)', backgroundImage: 'none' }}
          >
            {isSaving ? (
              <>
                <RefreshCw className="animate-spin" size={16} />
                {progress.total > 1 && <span>Processing {progress.current} of {progress.total}</span>}
              </>
            ) : (
              <span className="flex items-center gap-2"><Save size={16} /> Finalize and Push to Production</span>
            )}
          </button>
        </div>
      )}

      <div className="grid gap-3 relative z-10">
        {projects.map(project => (
          <div key={project.id} className="card-dark border-white/5 p-4 group hover:border-accent/30 transition-all flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/5 border border-white/10 overflow-hidden flex-shrink-0 rounded-lg">
                <img src={project.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
              </div>
              <div>
                <h4 className="text-white font-bold tracking-widest uppercase text-xs mb-1">{project.title}</h4>
                <p className="text-[9px] text-accent uppercase tracking-[0.2em] font-black">{project.category}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditingProject(project); setSelectedFiles([]); }} className="p-3 text-white/20 hover:text-white transition-colors bg-white/5 rounded-lg"><Pencil size={16} /></button>
              <button onClick={() => project.id && handleDelete(project.id)} className="p-3 text-white/20 hover:text-accent transition-colors bg-white/5 rounded-lg"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
