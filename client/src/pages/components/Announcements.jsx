import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import { fetchTeacherClasses, fetchStudentClasses, getClassAnnouncements, getTeacherAnnouncements } from '../../api';

const Announcements = () => {
  const { token, user } = useContext(AuthContext);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);

  useEffect(() => {
    if (!token || !user) return;
    if (user.isTeacher) {
      loadTeacherAnnouncements();
    } else {
      loadClasses();
    }
  }, [token, user]);

  const loadClasses = async () => {
    setLoadingClasses(true);
    try {
      const data = user.isTeacher 
        ? await fetchTeacherClasses(token)
        : await fetchStudentClasses(token);
      setClasses(data || []);
    } catch (err) {
      console.error('Failed to load classes:', err);
      toast.error(err.message || 'Failed to load classes');
    } finally {
      setLoadingClasses(false);
    }
  };

  const loadAnnouncements = async (classId) => {
    setLoading(true);
    try {
      const data = await getClassAnnouncements(token, classId);
      setAnnouncements(data || []);
    } catch (err) {
      console.error('Failed to load announcements:', err);
      toast.error(err.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const loadTeacherAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await getTeacherAnnouncements(token);
      setAnnouncements(data || []);
    } catch (err) {
      console.error('Failed to load teacher announcements:', err);
      toast.error(err.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleClassSelect = (classItem) => {
    setSelectedClass(classItem);
    loadAnnouncements(classItem._id);
  };

  if (!user) {
    return (
      <div className="home-tab">
        <p className="center-text">Loading user information...</p>
      </div>
    );
  }

  return (
    <div className="home-tab">
      <h2 className="class-heading-unique">Announcements</h2>

      {user?.isTeacher ? (
        <div>
          <h3 style={{ margin: '10px 0', color: '#e0e0e0' }}>All My Announcements</h3>
          {loading ? (
            <p className="dim-text">Loading announcements...</p>
          ) : announcements.length === 0 ? (
            <p className="dim-text">No announcements yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {announcements.map(announcement => (
                <div key={announcement._id} className="info-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 8px 0' }}>{announcement.title}</h3>
                      <p style={{ margin: '0 0 8px 0', color: '#e0e0e0' }}>{announcement.content}</p>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#888' }}>
                        <span>Class: {announcement.class?.name || 'Unknown'}</span>
                        <span>{new Date(announcement.createdAt).toLocaleString()}</span>
                        {announcement.type === 'project' && <span style={{ color: '#0066cc' }}>📋 Project</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : !selectedClass ? (
        <div>
          <p className="dim-text">Select a class to view announcements:</p>
          {loadingClasses ? (
            <p className="dim-text">Loading classes...</p>
          ) : classes.length === 0 ? (
            <p className="dim-text">No classes found.</p>
          ) : (
            <div className="groups-grid">
              {classes.map(classItem => (
                <div key={classItem._id} className="info-card" onClick={() => handleClassSelect(classItem)} style={{ cursor: 'pointer' }}>
                  <h3>{classItem.name}</h3>
                  <p className="dim-text">{classItem.description || 'No description'}</p>
                  <p className="dim-text">{classItem.students?.length || 0} students</p>
                  <button className="save-btn" onClick={(e) => { e.stopPropagation(); handleClassSelect(classItem); }}>View Announcements</button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <button className="role-btn" onClick={() => setSelectedClass(null)}>← Back to Classes</button>
            <h3 style={{ margin: '10px 0', color: '#e0e0e0' }}>{selectedClass.name} - Announcements</h3>
          </div>

          {loading ? (
            <p className="dim-text">Loading announcements...</p>
          ) : announcements.length === 0 ? (
            <p className="dim-text">No announcements yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {announcements.map(announcement => (
                <div key={announcement._id} className="info-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 8px 0' }}>{announcement.title}</h3>
                      <p style={{ margin: '0 0 8px 0', color: '#e0e0e0' }}>{announcement.content}</p>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#888' }}>
                        <span>By: {announcement.teacher?.name || 'Unknown'}</span>
                        <span>{new Date(announcement.createdAt).toLocaleString()}</span>
                        {announcement.type === 'project' && <span style={{ color: '#0066cc' }}>📋 Project</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Announcements;