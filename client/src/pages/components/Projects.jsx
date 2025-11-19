import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { fetchTeacherClasses, createProject, getClassProjects } from '../../api';

const Projects = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [projects, setProjects] = useState([]);
  const [showAddProject, setShowAddProject] = useState(false);
  const [projectForm, setProjectForm] = useState({ title: '', description: '', deadline: '' });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const data = await fetchTeacherClasses(token);
      setClasses(data);
    } catch (err) {
      toast.error('Failed to load classes');
    }
  };

  const loadProjects = async (classId) => {
    setLoading(true);
    try {
      const data = await getClassProjects(token, classId);
      setProjects(data);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleClassSelect = (classItem) => {
    setSelectedClass(classItem);
    loadProjects(classItem._id);
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await createProject(token, selectedClass._id, projectForm, selectedFiles);
      toast.success('Project created successfully!');
      setProjectForm({ title: '', description: '', deadline: '' });
      setSelectedFiles([]);
      setShowAddProject(false);
      loadProjects(selectedClass._id);
    } catch (err) {
      toast.error(err.message || 'Failed to create project');
    }
  };

  const handleFileSelect = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="home-tab">
      <h2 className="class-heading-unique">Projects</h2>

      {!selectedClass ? (
        <div>
          <p className="dim-text">Select a class to manage projects:</p>
          <div className="groups-grid">
            {classes.map(classItem => (
              <div key={classItem._id} className="info-card" onClick={() => handleClassSelect(classItem)}>
                <h3>{classItem.name}</h3>
                <p className="dim-text">{classItem.students?.length || 0} students</p>
                <button className="save-btn">Manage Projects</button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <button className="role-btn" onClick={() => setSelectedClass(null)}>← Back to Classes</button>
              <h3 style={{ margin: '10px 0', color: '#e0e0e0' }}>{selectedClass.name} - Projects</h3>
            </div>
            <button className="save-btn" onClick={() => setShowAddProject(true)}>Add New Project</button>
          </div>

          {loading ? (
            <p className="dim-text">Loading projects...</p>
          ) : projects.length === 0 ? (
            <p className="dim-text">No projects assigned yet.</p>
          ) : (
            <div className="groups-grid">
              {projects.map(project => (
                <div key={project._id} className="info-card">
                  <h3>{project.title}</h3>
                  <p className="dim-text">{project.description}</p>
                  <p className="dim-text">Deadline: {new Date(project.deadline).toLocaleDateString()}</p>
                  <p className="dim-text">Created: {new Date(project.createdAt).toLocaleDateString()}</p>
                  {project.files && project.files.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      <p className="dim-text" style={{ fontSize: '14px', marginBottom: '4px' }}>📎 Files:</p>
                      {project.files.map((file, index) => (
                        <div key={index} style={{ fontSize: '12px', color: '#a0a0a0', marginLeft: '16px' }}>
                          • {file.originalName}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showAddProject && (
        <>
          <div className="modal-overlay" onClick={() => setShowAddProject(false)} />
          <div className="settings-modal" style={{ width: '500px' }}>
            <div className="close-icon" onClick={() => setShowAddProject(false)}>×</div>
            <div className="modal-header">
              <h2>Add New Project</h2>
            </div>
            <div className="modal-content">
              <form onSubmit={handleCreateProject}>
                <div className="form-group">
                  <label>Project Title</label>
                  <input
                    type="text"
                    placeholder="Enter project title"
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({...projectForm, title: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    placeholder="Describe the project..."
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                    rows={4}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Deadline</label>
                  <input
                    type="datetime-local"
                    value={projectForm.deadline}
                    onChange={(e) => setProjectForm({...projectForm, deadline: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Project Files (Optional)</label>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    style={{ marginBottom: '8px' }}
                  />
                  {selectedFiles.length > 0 && (
                    <div>
                      <p className="dim-text" style={{ fontSize: '14px', marginBottom: '8px' }}>Selected files:</p>
                      {selectedFiles.map((file, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', backgroundColor: '#2a2a2a', borderRadius: '4px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '14px' }}>{file.name}</span>
                          <button type="button" onClick={() => removeFile(index)} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button type="submit" className="save-btn" style={{ width: '100%', marginTop: '16px' }}>
                  Create Project
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Projects;