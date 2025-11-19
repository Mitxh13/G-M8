import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { fetchTeacherClasses, fetchStudentClasses, getClassAnnouncements, getTeacherAnnouncements } from '../../api';

const Announcements = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (currentUser.isTeacher) {
      loadTeacherAnnouncements();
    } else {
      loadClasses();
    }
  }, []);

  const loadClasses = async () => {
    try {
      const data = currentUser.isTeacher 
        ? await fetchTeacherClasses(token)
        : await fetchStudentClasses(token);
      setClasses(data);
    } catch (err) {
      toast.error('Failed to load classes');
    }
  };

  const loadAnnouncements = async (classId) => {
    setLoading(true);
    try {
      const data = await getClassAnnouncements(token, classId);
      setAnnouncements(data);
    } catch (err) {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const loadTeacherAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await getTeacherAnnouncements(token);
      setAnnouncements(data);
    } catch (err) {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleClassSelect = (classItem) => {
    setSelectedClass(classItem);
    loadAnnouncements(classItem._id);
  };

  return (
    <div className="home-tab">
      <h2 className="class-heading-unique">Announcements</h2>

      {currentUser.isTeacher ? (
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
                        <span>Class: {announcement.class.name}</span>
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
          <div className="groups-grid">
            {classes.map(classItem => (
              <div key={classItem._id} className="info-card" onClick={() => handleClassSelect(classItem)}>
                <h3>{classItem.name}</h3>
                <p className="dim-text">{classItem.students?.length || 0} students</p>
                <button className="save-btn">View Announcements</button>
              </div>
            ))}
          </div>
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
                        <span>By: {announcement.teacher.name}</span>
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