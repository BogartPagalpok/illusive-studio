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
      // Reset input value so same files can be selected again if needed
      e.target.value = '';
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
          {/* BULK UPLOAD BUTTON: Forced Multiple attribute */}
          <label className="btn-outline flex items-center gap-2 cursor-pointer py-3 px-6 text-[10px]">
            <Upload size={14} /> Bulk Upload
            <input type="file" multiple accept="image/*" onChange={handleBulkUpload} className="hidden" disabled={bulkUploading} />
          </label>
          <button onClick={() => setEditingProject(EMPTY_PROJECT)} className="btn-primary flex items-center gap-2">
            <Plus size={14} /> New Project
          </button>
        </div>
      </div>

      {bulkUploading && (
        <div className="card-dark border-accent/20">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-heading font-black uppercase text-white tracking-widest">Uploading Sequence...</span>
            <span className="text-[10px] font-heading font-black text-accent">{progress.current} / {progress.total}</span>
          </div>
          <div className="h-1 w-full bg-white/5 overflow-hidden rounded-full">
            <motion.div 
              className="h-full" 
              style={{ backgroundColor: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }}
              initial={{ width: 0 }} 
              animate={{ width: `${(progress.current / progress.total) * 100}%` }} 
            />
          </div>
        </div>
      )}

      {editingProject && (
        <div className="card-dark border-white/10 p-8 space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="font-heading font-black uppercase tracking-[0.2em] text-white text-sm">
              {editingProject.id ? 'Modify Data' : 'New Entry'}
            </h3>
            <button onClick={() => setEditingProject(null)} className="text-white/20 hover:text-white transition-colors"><X size={20} /></button>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-3">Title</label>
                <input value={editingProject.title} onChange={e => setEditingProject({...editingProject, title: e.target.value})} className="input-field" placeholder="Project Name" />
              </div>
              <div>
                <label className="block text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-3">Category</label>
                <input value={editingProject.category} onChange={e => setEditingProject({...editingProject, category: e.target.value})} className="input-field" placeholder="e.g. Branding" />
              </div>
              <div>
                <label className="block text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-3">Image Source</label>
                <div className="flex gap-2">
                  <input value={editingProject.image_url} readOnly className="input-field flex-1 opacity-50 text-[10px]" placeholder="Auto-fills on upload..." />
                  <label className="btn-outline p-4 cursor-pointer">
                    {uploadingSingle ? <RefreshCw className="animate-spin" size={14} /> : <Upload size={14} />}
                    <input type="file" accept="image/*" onChange={handleSingleFileUpload} className="hidden" disabled={uploadingSingle} />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-3">Stack (comma separated)</label>
                <input value={Array.isArray(editingProject.tools) ? editingProject.tools.join(', ') : editingProject.tools} onChange={e => setEditingProject({...editingProject, tools: e.target.value.split(',').map(t => t.trim())})} className="input-field" placeholder="Photoshop, Figma, React" />
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-3">Context / Description</label>
                <textarea value={editingProject.description} onChange={e => setEditingProject({...editingProject, description: e.target.value})} rows={3} className="input-field resize-none custom-scrollbar" placeholder="Project background..." />
              </div>
              <div>
                <label className="block text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-3">Creative Process</label>
                <textarea value={editingProject.process} onChange={e => setEditingProject({...editingProject, process: e.target.value})} rows={3} className="input-field resize-none custom-scrollbar" placeholder="Steps taken..." />
              </div>
              <div>
                <label className="block text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white/30 mb-3">Final Output</label>
                <textarea value={editingProject.results} onChange={e => setEditingProject({...editingProject, results: e.target.value})} rows={2} className="input-field resize-none custom-scrollbar" placeholder="Impact/Results..." />
              </div>
            </div>
          </div>

          <button onClick={handleSave} className="btn-primary w-full py-4 text-xs">
            <Save size={16} /> Update Central Database
          </button>
        </div>
      )}

      <div className="grid gap-3">
        {projects.map(project => (
          <div key={project.id} className="card-dark border-white/5 p-4 group hover:border-accent/30 transition-all flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/5 border border-white/10 overflow-hidden flex-shrink-0 rounded-lg">
                <img src={project.image_url || ''} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div>
                <h4 className="text-white font-bold tracking-widest uppercase text-xs mb-1">{project.title}</h4>
                <p className="text-[9px] text-accent uppercase tracking-[0.2em] font-black">{project.category}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditingProject(project)} className="p-3 text-white/20 hover:text-white transition-colors bg-white/5 rounded-lg"><Pencil size={16} /></button>
              <button onClick={() => project.id && handleDelete(project.id)} className="p-3 text-white/20 hover:text-accent transition-colors bg-white/5 rounded-lg"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
