import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Upload, Save, RefreshCw, X, Image as ImageIcon, Pencil } from 'lucide-react';
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
  const [bulkUploading, setBulkUploading] = useState(false);
  const [uploadingSingle, setUploadingSingle] = useState(false);
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

  // Shared function to handle file uploads to storage
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

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const folderTitle = prompt("Enter a shared Title for this bulk upload (e.g. Zamba Coffee App):");
    if (!folderTitle) return;

    setBulkUploading(true);
    setProgress({ current: 0, total: files.length });

    const newProjects: any[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress({ current: i + 1, total: files.length });
        const publicUrl = await uploadToStorage(file);

        newProjects.push({
          title: folderTitle,
          category: 'Graphic Design',
          description: `Part of the ${folderTitle} project gallery.`,
          image_url: publicUrl,
          featured: true,
          tools: [],
          process: '',
          results: '',
        });
      }

      const { error: insertError } = await supabase
        .from('portfolio_projects')
        .insert(newProjects);

      if (insertError) throw insertError;
      alert(`Successfully uploaded ${files.length} images.`);
      fetchProjects();
    } catch (error: any) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setBulkUploading(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const handleSingleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProject) return;

    setUploadingSingle(true);
    try {
      const publicUrl = await uploadToStorage(file);
      setEditingProject({ ...editingProject, image_url: publicUrl });
    } catch (error: any) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploadingSingle(false);
    }
  };

  const handleSave = async () => {
    if (!editingProject) return;
    try {
      const projectData = {
        ...editingProject,
        tools: Array.isArray(editingProject.tools) ? editingProject.tools : 
               (typeof editingProject.tools === 'string' ? (editingProject.tools as string).split(',').map(t => t.trim()) : []),
      };
      
      let error;
      if (editingProject.id) {
        ({ error } = await supabase.from('portfolio_projects').update(projectData).eq('id', editingProject.id));
      } else {
        ({ error } = await supabase.from('portfolio_projects').insert([projectData]));
      }

      if (error) throw error;
      alert('Project saved successfully!');
      setEditingProject(null);
      fetchProjects();
    } catch (error: any) {
      alert(`Save failed: ${error.message}`);
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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-heading font-bold tracking-widest uppercase text-white">Portfolio Manager</h2>
        <div className="flex gap-3">
          <label className="btn-outline flex items-center gap-2 cursor-pointer">
            <Upload size={16} /> Bulk Upload
            <input type="file" multiple accept="image/*" onChange={handleBulkUpload} className="hidden" disabled={bulkUploading} />
          </label>
          <button onClick={() => setEditingProject(EMPTY_PROJECT)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Project
          </button>
        </div>
      </div>

      {bulkUploading && (
        <div className="card-dark border-accent/20">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-heading font-bold uppercase text-white">Uploading Folder...</span>
            <span className="text-xs font-heading font-bold text-accent">{progress.current} / {progress.total}</span>
          </div>
          <div className="h-1 w-full bg-white/10 overflow-hidden">
            <motion.div className="h-full bg-accent" initial={{ width: 0 }} animate={{ width: `${(progress.current / progress.total) * 100}%` }} />
          </div>
        </div>
      )}

      {editingProject && (
        <div className="card-dark border-white/10 p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-heading font-bold uppercase tracking-widest text-white">
              {editingProject.id ? 'Edit Details' : 'Create Project'}
            </h3>
            <button onClick={() => setEditingProject(null)} className="text-white/40 hover:text-white"><X size={20} /></button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="label-admin">Title</label>
                <input value={editingProject.title} onChange={e => setEditingProject({...editingProject, title: e.target.value})} className="input-admin" />
              </div>
              <div>
                <label className="label-admin">Category</label>
                <input value={editingProject.category} onChange={e => setEditingProject({...editingProject, category: e.target.value})} className="input-admin" />
              </div>
              <div>
                <label className="label-admin">Image Asset</label>
                <div className="flex gap-2">
                  <input value={editingProject.image_url} readOnly className="input-admin flex-1 text-xs opacity-50" placeholder="Auto-fills on upload..." />
                  <label className="btn-outline p-3 cursor-pointer">
                    {uploadingSingle ? <RefreshCw className="animate-spin" size={16} /> : <Upload size={16} />}
                    <input type="file" accept="image/*" onChange={handleSingleFileUpload} className="hidden" disabled={uploadingSingle} />
                  </label>
                </div>
              </div>
              <div>
                <label className="label-admin">Tools (comma separated)</label>
                <input value={Array.isArray(editingProject.tools) ? editingProject.tools.join(', ') : editingProject.tools} onChange={e => setEditingProject({...editingProject, tools: e.target.value.split(',').map(t => t.trim())})} className="input-admin" />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="label-admin">Overview</label>
                <textarea value={editingProject.description} onChange={e => setEditingProject({...editingProject, description: e.target.value})} rows={3} className="input-admin resize-none" />
              </div>
              <div>
                <label className="label-admin">Process</label>
                <textarea value={editingProject.process} onChange={e => setEditingProject({...editingProject, process: e.target.value})} rows={3} className="input-admin resize-none" />
              </div>
              <div>
                <label className="label-admin">Results</label>
                <textarea value={editingProject.results} onChange={e => setEditingProject({...editingProject, results: e.target.value})} rows={2} className="input-admin resize-none" />
              </div>
            </div>
          </div>

          <button onClick={handleSave} className="btn-primary w-full py-4 flex items-center justify-center gap-2">
            <Save size={18} /> Save Project Changes
          </button>
        </div>
      )}

      <div className="grid gap-4">
        {projects.map(project => (
          <div key={project.id} className="card-dark border-white/5 p-4 group hover:border-accent/20 transition-all flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                <img src={project.image_url || ''} className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="text-white font-bold tracking-widest uppercase mb-1">{project.title}</h4>
                <p className="text-[10px] text-accent uppercase tracking-widest font-black">{project.category}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditingProject(project)} className="p-2 text-white/40 hover:text-white transition-colors"><Pencil size={18} /></button>
              <button onClick={() => project.id && handleDelete(project.id)} className="p-2 text-white/40 hover:text-accent transition-colors"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
