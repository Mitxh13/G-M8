import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  getClassById,
  removeStudentFromClass,
  fetchTeacherClasses,
  fetchStudentClasses,
  createProject,
  getClassProjects,
  getClassAnnouncements,
  createAnnouncement,
  uploadClassFiles,
  getClassFiles,
  downloadClassFile,
  downloadProjectFile,
  downloadAnnouncementFile,
  updateProject,
  updateAnnouncement,
  getClassMessages,
  sendClassMessage
} from "../../api";
import { toast } from "react-toastify";
import { FaTrash, FaFile, FaComments, FaUsers, FaBullhorn, FaArrowLeft, FaPlus } from "react-icons/fa";

const ViewClass = ({ selectedClassId: propClassId }) => {
  const { user, token } = useContext(AuthContext);
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(propClassId || "");
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [studentClasses, setStudentClasses] = useState([]);
  const [activeTab, setActiveTab] = useState("Projects");
  const [projects, setProjects] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [showAddProject, setShowAddProject] = useState(false);
  const [projectForm, setProjectForm] = useState({ title: '', description: '', deadline: '' });
  const [projectFiles, setProjectFiles] = useState([]);
  const [showAddAnnouncement, setShowAddAnnouncement] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '' });
  const [announcementFiles, setAnnouncementFiles] = useState([]);
  const [classFiles, setClassFiles] = useState([]);
  const [showUploadFiles, setShowUploadFiles] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [classMessages, setClassMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Fetch teacher's classes for dropdown
  useEffect(() => {
    const loadClasses = async () => {
      try {
        if (user?.isTeacher) {
          const data = await fetchTeacherClasses(token);
          setTeacherClasses(data);
        } else {
          const data = await fetchStudentClasses(token); // student classes
          setStudentClasses(data);
        }
      } catch (err) {
        toast.error(err.message);
      }
    };
    loadClasses();
  }, [user, token]);

  // Fetch class info
  const fetchClassData = async (id) => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getClassById(token, id);
      setClassData(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClassId) {
      fetchClassData(selectedClassId);
      loadProjects();
      loadAnnouncements();
      loadClassFiles();
      loadClassMessages();
    }
  }, [selectedClassId]);

  const loadProjects = async () => {
    if (!selectedClassId) return;
    try {
      const data = await getClassProjects(token, selectedClassId);
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  const loadAnnouncements = async () => {
    if (!selectedClassId) return;
    try {
      const data = await getClassAnnouncements(token, selectedClassId);
      setAnnouncements(data);
    } catch (err) {
      console.error('Failed to load announcements:', err);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await createProject(token, selectedClassId, projectForm, projectFiles);
      toast.success('Project created successfully!');
      setProjectForm({ title: '', description: '', deadline: '' });
      setProjectFiles([]);
      setShowAddProject(false);
      loadProjects();
      loadAnnouncements();
    } catch (err) {
      toast.error(err.message || 'Failed to create project');
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await createAnnouncement(token, selectedClassId, announcementForm, announcementFiles);
      toast.success('Announcement created successfully!');
      setAnnouncementForm({ title: '', content: '' });
      setAnnouncementFiles([]);
      setShowAddAnnouncement(false);
      loadAnnouncements();
    } catch (err) {
      toast.error(err.message || 'Failed to create announcement');
    }
  };

  const handleProjectFileSelect = (e) => {
    setProjectFiles(Array.from(e.target.files));
  };

  const removeProjectFile = (index) => {
    setProjectFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnnouncementFileSelect = (e) => {
    setAnnouncementFiles(Array.from(e.target.files));
  };

  const removeAnnouncementFile = (index) => {
    setAnnouncementFiles(prev => prev.filter((_, i) => i !== index));
  };

  const loadClassFiles = async () => {
    if (!selectedClassId) return;
    try {
      const data = await getClassFiles(token, selectedClassId);
      setClassFiles(data);
    } catch (err) {
      console.error('Failed to load class files:', err);
    }
  };

  const handleUploadFiles = async (e) => {
    e.preventDefault();
    if (uploadFiles.length === 0) return;
    try {
      await uploadClassFiles(token, selectedClassId, uploadFiles);
      toast.success('Files uploaded successfully!');
      setUploadFiles([]);
      setShowUploadFiles(false);
      loadClassFiles();
    } catch (err) {
      toast.error(err.message || 'Failed to upload files');
    }
  };

  const handleFileSelect = (e) => {
    setUploadFiles(Array.from(e.target.files));
  };

  const removeUploadFile = (index) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      await downloadClassFile(token, fileId, fileName);
    } catch (err) {
      toast.error('Failed to download file');
    }
  };

  const handleProjectFileDownload = async (projectId, fileIndex, fileName) => {
    try {
      await downloadProjectFile(token, projectId, fileIndex, fileName);
    } catch (err) {
      toast.error('Failed to download file');
    }
  };

  const handleAnnouncementFileDownload = async (announcementId, fileIndex, fileName) => {
    try {
      await downloadAnnouncementFile(token, announcementId, fileIndex, fileName);
    } catch (err) {
      toast.error('Failed to download file');
    }
  };

  const handleEditProject = (project) => {
    setEditingProject({
      ...project,
      deadline: new Date(project.deadline).toISOString().slice(0, 16)
    });
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      await updateProject(token, editingProject._id, {
        title: editingProject.title,
        description: editingProject.description,
        deadline: editingProject.deadline
      });
      toast.success('Project updated successfully!');
      setEditingProject(null);
      loadProjects();
    } catch (err) {
      toast.error(err.message || 'Failed to update project');
    }
  };

  const handleEditAnnouncement = (announcement) => {
    setEditingAnnouncement(announcement);
  };

  const handleUpdateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await updateAnnouncement(token, editingAnnouncement._id, {
        title: editingAnnouncement.title,
        content: editingAnnouncement.content
      });
      toast.success('Announcement updated successfully!');
      setEditingAnnouncement(null);
      loadAnnouncements();
    } catch (err) {
      toast.error(err.message || 'Failed to update announcement');
    }
  };

  const loadClassMessages = async () => {
    if (!selectedClassId) return;
    try {
      const data = await getClassMessages(token, selectedClassId);
      setClassMessages(data);
    } catch (err) {
      console.error('Failed to load class messages:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await sendClassMessage(token, selectedClassId, { content: newMessage });
      setNewMessage('');
      loadClassMessages();
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm("Remove this student from class?")) return;
    try {
      await removeStudentFromClass(token, selectedClassId, studentId);
      toast.success("Student removed");
      await fetchClassData(selectedClassId);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // === Class selection if no class selected ===
  if (!selectedClassId) {
    const classesToDisplay = user?.isTeacher ? teacherClasses : studentClasses;
    
    return (
      <div className="home-tab">
        <h2 className="class-heading-unique">
          {user?.isTeacher ? "Select Your Class" : "Select a Class to View"}
        </h2>

        {classesToDisplay.length === 0 ? (
          <div className="center-text">
            <p className="no-classes">
              {user?.isTeacher
                ? "You haven't created any classes yet."
                : "You are not enrolled in any classes yet."}
            </p>
          </div>
        ) : (
          <div className="class-grid">
            {classesToDisplay.map((cls) => (
              <div
                key={cls._id}
                className={`class-card ${user?.isTeacher ? "teacher-card" : "student-card"}`}
                onClick={() => setSelectedClassId(cls._id)}
                style={{ cursor: "pointer" }}
              >
                <div className="class-header">
                  <span className="class-name">{cls.name}</span>
                </div>
                <p className="class-desc">{cls.description || "No description"}</p>
                <p className="class-code-text" style={{ marginTop: "10px", fontSize: "0.9em", color: "#666" }}>
                  Code: {cls.code}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (loading) return <p className="center-text">Loading class details...</p>;
  if (!classData) return <p className="center-text">Class not found.</p>;

  const { classInfo, members, groups } = classData;

  const tabs = user?.isTeacher
    ? ["Projects", "Announcements", "Students", "Files", "Chat"]
    : ["Announcements", "Projects", "Groups", "Chat", "Files"];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Projects":
        return (
          <div>
            {user?.isTeacher && (
              <div style={{ marginBottom: '20px' }}>
                <button className="save-btn" onClick={() => setShowAddProject(true)}>
                  <FaPlus style={{ marginRight: '8px' }} />Add New Project
                </button>
              </div>
            )}
            {projects.length === 0 ? (
              <p className="dim-text">No projects assigned yet.</p>
            ) : (
              <div className="groups-grid">
                {projects.map(project => (
                  <div key={project._id} className="info-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <h3>{project.title}</h3>
                        <p className="dim-text">{project.description}</p>
                        <p className="dim-text">Deadline: {new Date(project.deadline).toLocaleDateString()}</p>
                        <p className="dim-text">Created: {new Date(project.createdAt).toLocaleDateString()}</p>
                      </div>
                      {user?.isTeacher && (
                        <button 
                          className="role-btn" 
                          onClick={() => handleEditProject(project)}
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                          Edit
                        </button>
                      )}
                    </div>
                    {project.files && project.files.length > 0 && (
                      <div style={{ marginTop: '8px' }}>
                        <p className="dim-text" style={{ fontSize: '14px', marginBottom: '4px' }}>📎 Files:</p>
                        {project.files.map((file, index) => (
                          <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginLeft: '16px', marginBottom: '4px' }}>
                            <span style={{ color: '#a0a0a0' }}>• {file.originalName}</span>
                            <button 
                              className="role-btn" 
                              onClick={() => handleProjectFileDownload(project._id, index, file.originalName)}
                              style={{ padding: '2px 6px', fontSize: '10px', marginLeft: '8px' }}
                            >
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case "Announcements":
        return (
          <div>
            {user?.isTeacher && (
              <div style={{ marginBottom: '20px' }}>
                <button className="save-btn" onClick={() => setShowAddAnnouncement(true)}>
                  <FaPlus style={{ marginRight: '8px' }} />Make Announcement
                </button>
              </div>
            )}
            {announcements.length === 0 ? (
              <p className="dim-text">No announcements yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {announcements.map(announcement => (
                  <div key={announcement._id} className="info-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 8px 0' }}>{announcement.title}</h3>
                        <p style={{ margin: '0 0 8px 0', color: '#e0e0e0' }}>{announcement.content}</p>
                      </div>
                      {user?.isTeacher && announcement.type !== 'project' && (
                        <button 
                          className="role-btn" 
                          onClick={() => handleEditAnnouncement(announcement)}
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                          Edit
                        </button>
                      )}
                    </div>
                    {announcement.files && announcement.files.length > 0 && (
                      <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                        <p className="dim-text" style={{ fontSize: '14px', marginBottom: '4px' }}>📎 Attachments:</p>
                        {announcement.files.map((file, index) => (
                          <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginLeft: '16px', marginBottom: '4px' }}>
                            <span style={{ color: '#a0a0a0' }}>• {file.originalName}</span>
                            <button 
                              className="role-btn" 
                              onClick={() => handleAnnouncementFileDownload(announcement._id, index, file.originalName)}
                              style={{ padding: '2px 6px', fontSize: '10px', marginLeft: '8px' }}
                            >
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#888' }}>
                      <span>By: {announcement.teacher.name}</span>
                      <span>{new Date(announcement.createdAt).toLocaleString()}</span>
                      {announcement.type === 'project' && <span style={{ color: '#0066cc' }}>📋 Project</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case "Students":
        return (
          <div className="info-card">
            {members.students?.length > 0 ? (
              members.students.map((student) => (
                <div key={student._id} className="member-item">
                  <span>
                    {student.name} {student.srn && <span className="dim-text">({student.srn})</span>}
                  </span>
                  {user?.isTeacher && (
                    <FaTrash
                      className="delete-icon"
                      onClick={() => handleRemoveStudent(student._id)}
                    />
                  )}
                </div>
              ))
            ) : (
              <p className="dim-text">No students in this class yet.</p>
            )}
          </div>
        );
      case "Groups":
        return (
          <div className="info-card">
            {groups?.length > 0 ? (
              <ul className="list">
                {groups.map((g) => (
                  <li key={g._id}>
                    <strong>{g.name}</strong> — {g.members.length} members
                  </li>
                ))}
              </ul>
            ) : (
              <p className="dim-text">No groups created yet.</p>
            )}
          </div>
        );
      case "Files":
        const allFiles = [];
        
        // Add class files
        classFiles.forEach(file => {
          allFiles.push({
            ...file,
            type: 'class',
            source: 'Class Files'
          });
        });
        
        // Add project files
        projects.forEach(project => {
          if (project.files && project.files.length > 0) {
            project.files.forEach((file, index) => {
              allFiles.push({
                _id: `project-${project._id}-${index}`,
                originalName: file.originalName,
                uploadedBy: project.teacher,
                createdAt: project.createdAt,
                type: 'project',
                source: `Project: ${project.title}`,
                projectId: project._id,
                fileIndex: index
              });
            });
          }
        });
        
        // Add announcement files
        announcements.forEach(announcement => {
          if (announcement.files && announcement.files.length > 0) {
            announcement.files.forEach((file, index) => {
              allFiles.push({
                _id: `announcement-${announcement._id}-${index}`,
                originalName: file.originalName,
                uploadedBy: announcement.teacher,
                createdAt: announcement.createdAt,
                type: 'announcement',
                source: `Announcement: ${announcement.title}`,
                announcementId: announcement._id,
                fileIndex: index
              });
            });
          }
        });
        
        // Sort by creation date
        allFiles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        return (
          <div>
            {user?.isTeacher && (
              <div style={{ marginBottom: '20px' }}>
                <button className="save-btn" onClick={() => setShowUploadFiles(true)}>
                  <FaPlus style={{ marginRight: '8px' }} />Upload Files
                </button>
              </div>
            )}
            {allFiles.length === 0 ? (
              <p className="dim-text">No files uploaded yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {allFiles.map(file => (
                  <div key={file._id} className="info-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0' }}>{file.originalName}</h4>
                      <p className="dim-text" style={{ margin: 0, fontSize: '12px' }}>
                        {file.source} • Uploaded by {file.uploadedBy.name} • {new Date(file.createdAt).toLocaleDateString()}
                        {file.fileSize && ` • ${(file.fileSize / 1024).toFixed(1)} KB`}
                      </p>
                    </div>
                    <button 
                      className="save-btn" 
                      onClick={() => {
                        if (file.type === 'class') {
                          handleDownload(file._id, file.originalName);
                        } else if (file.type === 'project') {
                          handleProjectFileDownload(file.projectId, file.fileIndex, file.originalName);
                        } else if (file.type === 'announcement') {
                          handleAnnouncementFileDownload(file.announcementId, file.fileIndex, file.originalName);
                        }
                      }}
                      style={{ padding: '6px 12px', fontSize: '14px' }}
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case "Chat":
        return (
          <div style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #404040', borderRadius: '4px', padding: '16px', marginBottom: '16px', backgroundColor: '#1a1a1a' }}>
              {classMessages.length === 0 ? (
                <p className="dim-text">No messages yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {classMessages.map(message => (
                    <div key={message._id} style={{ padding: '8px 12px', backgroundColor: '#2a2a2a', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>{message.sender.name}</span>
                        <span style={{ fontSize: '12px', color: '#888' }}>{new Date(message.createdAt).toLocaleString()}</span>
                      </div>
                      <p style={{ margin: 0, color: '#e0e0e0' }}>{message.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {user?.isTeacher && (
              <form onSubmit={handleSendMessage}>
                <textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '12px', backgroundColor: '#2a2a2a', border: '1px solid #404040', borderRadius: '4px', color: '#e0e0e0', resize: 'vertical', marginBottom: '8px' }}
                />
                <button type="submit" className="save-btn" style={{ width: '100%', padding: '10px' }}>
                  Send Message
                </button>
              </form>
            )}
            {!user?.isTeacher && (
              <p className="dim-text" style={{ textAlign: 'center', padding: '8px' }}>Only teachers can send messages in class chat.</p>
            )}
          </div>
        );
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="playground-tab view-class-tab">
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <button 
          className="back-btn"
          onClick={() => setSelectedClassId("")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            backgroundColor: "#2d2d2d",
            border: "1px solid #404040",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            color: "#e0e0e0",
            fontWeight: "500",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#3b82f6";
            e.target.style.color = "#ffffff";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#2d2d2d";
            e.target.style.color = "#e0e0e0";
          }}
        >
          <FaArrowLeft /> Back to Classes
        </button>
        <h2 className="class-heading-unique" style={{ margin: 0 }}>{classInfo.name}</h2>
      </div>
      <div className="info-card">
        <p>
          <strong>Description:</strong>{" "}
          {classInfo.description || "No description provided"}
        </p>
        <p>
          <strong>Code:</strong> {classInfo.code}
        </p>
      </div>

      <div className="tabs-container">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "Projects" && <FaFile />}
            {tab === "Announcements" && <FaBullhorn />}
            {tab === "Students" && <FaUsers />}
            {tab === "Groups" && <FaUsers />}
            {tab === "Files" && <FaFile />}
            {tab === "Chat" && <FaComments />}
            <span>{tab}</span>
          </button>
        ))}
      </div>

      <div className="tab-content">
        {renderTabContent()}
      </div>

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
                    onChange={handleProjectFileSelect}
                    style={{ marginBottom: '8px' }}
                  />
                  {projectFiles.length > 0 && (
                    <div>
                      <p className="dim-text" style={{ fontSize: '14px', marginBottom: '8px' }}>Selected files:</p>
                      {projectFiles.map((file, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', backgroundColor: '#2a2a2a', borderRadius: '4px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '14px' }}>{file.name}</span>
                          <button type="button" onClick={() => removeProjectFile(index)} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}>×</button>
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

      {showAddAnnouncement && (
        <>
          <div className="modal-overlay" onClick={() => setShowAddAnnouncement(false)} />
          <div className="settings-modal" style={{ width: '500px' }}>
            <div className="close-icon" onClick={() => setShowAddAnnouncement(false)}>×</div>
            <div className="modal-header">
              <h2>Make Announcement</h2>
            </div>
            <div className="modal-content">
              <form onSubmit={handleCreateAnnouncement}>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    placeholder="Enter announcement title"
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm({...announcementForm, title: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Content</label>
                  <textarea
                    placeholder="Write your announcement..."
                    value={announcementForm.content}
                    onChange={(e) => setAnnouncementForm({...announcementForm, content: e.target.value})}
                    rows={4}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Attachment Files (Optional)</label>
                  <input
                    type="file"
                    multiple
                    onChange={handleAnnouncementFileSelect}
                    style={{ marginBottom: '8px' }}
                  />
                  {announcementFiles.length > 0 && (
                    <div>
                      <p className="dim-text" style={{ fontSize: '14px', marginBottom: '8px' }}>Selected files:</p>
                      {announcementFiles.map((file, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', backgroundColor: '#2a2a2a', borderRadius: '4px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '14px' }}>{file.name}</span>
                          <button type="button" onClick={() => removeAnnouncementFile(index)} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button type="submit" className="save-btn" style={{ width: '100%', marginTop: '16px' }}>
                  Create Announcement
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {showUploadFiles && (
        <>
          <div className="modal-overlay" onClick={() => setShowUploadFiles(false)} />
          <div className="settings-modal" style={{ width: '500px' }}>
            <div className="close-icon" onClick={() => setShowUploadFiles(false)}>×</div>
            <div className="modal-header">
              <h2>Upload Class Files</h2>
            </div>
            <div className="modal-content">
              <form onSubmit={handleUploadFiles}>
                <div className="form-group">
                  <label>Select Files</label>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    style={{ marginBottom: '8px' }}
                    required
                  />
                  {uploadFiles.length > 0 && (
                    <div>
                      <p className="dim-text" style={{ fontSize: '14px', marginBottom: '8px' }}>Selected files:</p>
                      {uploadFiles.map((file, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', backgroundColor: '#2a2a2a', borderRadius: '4px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '14px' }}>{file.name}</span>
                          <button type="button" onClick={() => removeUploadFile(index)} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button type="submit" className="save-btn" style={{ width: '100%', marginTop: '16px' }}>
                  Upload Files
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {editingProject && (
        <>
          <div className="modal-overlay" onClick={() => setEditingProject(null)} />
          <div className="settings-modal" style={{ width: '500px' }}>
            <div className="close-icon" onClick={() => setEditingProject(null)}>×</div>
            <div className="modal-header">
              <h2>Edit Project</h2>
            </div>
            <div className="modal-content">
              <form onSubmit={handleUpdateProject}>
                <div className="form-group">
                  <label>Project Title</label>
                  <input
                    type="text"
                    value={editingProject.title}
                    onChange={(e) => setEditingProject({...editingProject, title: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={editingProject.description}
                    onChange={(e) => setEditingProject({...editingProject, description: e.target.value})}
                    rows={4}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Deadline</label>
                  <input
                    type="datetime-local"
                    value={editingProject.deadline}
                    onChange={(e) => setEditingProject({...editingProject, deadline: e.target.value})}
                    required
                  />
                </div>
                <button type="submit" className="save-btn" style={{ width: '100%', marginTop: '16px' }}>
                  Update Project
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {editingAnnouncement && (
        <>
          <div className="modal-overlay" onClick={() => setEditingAnnouncement(null)} />
          <div className="settings-modal" style={{ width: '500px' }}>
            <div className="close-icon" onClick={() => setEditingAnnouncement(null)}>×</div>
            <div className="modal-header">
              <h2>Edit Announcement</h2>
            </div>
            <div className="modal-content">
              <form onSubmit={handleUpdateAnnouncement}>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={editingAnnouncement.title}
                    onChange={(e) => setEditingAnnouncement({...editingAnnouncement, title: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Content</label>
                  <textarea
                    value={editingAnnouncement.content}
                    onChange={(e) => setEditingAnnouncement({...editingAnnouncement, content: e.target.value})}
                    rows={4}
                    required
                  />
                </div>
                <button type="submit" className="save-btn" style={{ width: '100%', marginTop: '16px' }}>
                  Update Announcement
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ViewClass;
