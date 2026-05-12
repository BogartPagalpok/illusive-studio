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

        const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        const { error: uploadError } = await supabase.storage
          .from(PORTFOLIO_BUCKET)
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from(PORTFOLIO_BUCKET)
          .getPublicUrl(fileName);

        newProjects.push({
          title: folderTitle, // Uses the shared title for grouping
          category: 'Graphic Design',
          description: `Bulk uploaded assets for ${folderTitle}`,
          image_url: urlData.publicUrl,
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

      alert(`Successfully uploaded ${files.length} images to ${folderTitle}`);
      fetchProjects();
    } catch (error: any) {
      console.error('Bulk upload failed:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setBulkUploading(false);
      setProgress({ current: 0, total: 0 });
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
      alert('Project saved!');
      setEditingProject(null);
      fetchProjects();
    } catch (error: any) {
      console.error('Save error:', error);
      alert(`Save failed: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return;
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
        <h2 className="text-xl font-heading font-bold tracking-widest uppercase text-white">
          Portfolio Manager
        </h2>
        
        <div className="flex gap-3">
          <label className="btn-outline flex items-center gap-2 cursor-pointer">
            <Upload size={16} />
            Bulk Upload
            <input type="file" multiple accept="image/*" onChange={handleBulkUpload} className="hidden" disabled={bulkUploading} />
          </label>
          <button onClick={() => setEditingProject(EMPTY_PROJECT)} className="btn-primary flex items-center gap-2">
            <Plus size={16} />
            New Project
          </button>
        </div>
      </div>

      {bulkUploading && (
        <div className="card-dark border-accent/20">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-heading font-bold tracking-widest uppercase text-white">Uploading Folder...</span>
            <span className="text-xs font-heading font-bold text-accent">{progress.current} / {progress.total}</span>
          </div>
          <div className="h-1 w-full bg-white/10 overflow-hidden">
            <motion.div 
              className="h-full bg-accent shadow-[0_0_10px_#FF007A]"
              initial={{ width: 0 }}
              animate={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {editingProject && (
        <div className="card-dark border-white/10 p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-heading font-bold uppercase tracking-widest text-white">
              {editingProject.id ? 'Edit Details' : 'Create Project'}
            </h3>
            <button onClick={() => setEditingProject(null)} className="text-white/40 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="label-admin">Title</label>
                <input 
                  value={editingProject.title} 
                  onChange={e => setEditingProject({...editingProject, title: e.target.value})}
                  className="input-admin"
                />
              </div>
              <div>
                <label className="label-admin">Category</label>
                <input 
                  value={editingProject.category} 
                  onChange={e => setEditingProject({...editingProject, category: e.target.value})}
                  className="input-admin"
                />
              </div>
              <div>
                <label className="label-admin">Tools (comma separated)</label>
                <input 
                  value={Array.isArray(editingProject.tools) ? editingProject.tools.join(', ') : editingProject.tools} 
                  onChange={e => setEditingProject({...editingProject, tools: e.target.value.split(',').map(t => t.trim())})}
                  placeholder="Photoshop, Illustrator, Canva"
                  className="input-admin"
                />
              </div>
              <div>
                <label className="label-admin">Image URL</label>
                <input 
                  value={editingProject.image_url} 
                  onChange={e => setEditingProject({...editingProject, image_url: e.target.value})}
                  className="input-admin text-xs"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="label-admin">Description (Overview)</label>
                <textarea 
                  value={editingProject.description} 
                  onChange={e => setEditingProject({...editingProject, description: e.target.value})}
                  rows={3}
                  className="input-admin resize-none"
                />
              </div>
              <div>
                <label className="label-admin">The Process</label>
                <textarea 
                  value={editingProject.process} 
                  onChange={e => setEditingProject({...editingProject, process: e.target.value})}
                  rows={3}
                  className="input-admin resize-none"
                />
              </div>
              <div>
                <label className="label-admin">Results</label>
                <textarea 
                  value={editingProject.results} 
                  onChange={e => setEditingProject({...editingProject, results: e.target.value})}
                  rows={2}
                  className="input-admin resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button onClick={handleSave} className="btn-primary px-10 py-3 flex items-center gap-2">
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {projects.map(project => (
          <div key={project.id} className="card-dark border-white/5 p-4 group hover:border-accent/20 transition-all flex items-center gap-6">
            <div className="w-16 h-16 bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
              <img src={project.image_url || ''} className="w-full h-full object-cover" alt="" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-bold tracking-widest uppercase truncate mb-1">{project.title}</h4>
              <p className="text-[10px] text-accent uppercase tracking-widest font-black">{project.category}</p>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setEditingProject(project)} className="p-2 text-white/40 hover:text-white transition-colors" title="Edit project">
                <Pencil size={18} />
              </button>
              <button onClick={() => project.id && handleDelete(project.id)} className="p-2 text-white/40 hover:text-accent transition-colors" title="Delete project">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
