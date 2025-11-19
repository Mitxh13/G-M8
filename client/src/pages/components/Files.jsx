import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getMyFiles } from '../../api';
import { toast } from 'react-toastify';

const Files = () => {
  const { token } = useContext(AuthContext);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    loadFiles();
  }, [token]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const data = await getMyFiles(token);
      setFiles(data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="center-text">Loading files...</p>;

  return (
    <div className="home-tab">
      <h2 className="class-heading-unique">My Files</h2>
      
      {files.length === 0 ? (
        <p className="dim-text">No files uploaded yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {files.map((file) => (
            <div key={file._id} className="info-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#e0e0e0', display: 'flex', alignItems: 'center' }}>
                    📎 {file.fileName}
                  </h4>
                  <p className="dim-text" style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
                    Assignment: <strong>{file.assignment?.title}</strong>
                  </p>
                  <p className="dim-text" style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
                    Group: <strong>{file.group?.name}</strong>
                  </p>
                  <p className="dim-text" style={{ margin: '0', fontSize: '13px' }}>
                    Uploaded: {new Date(file.uploadedAt).toLocaleString()}
                  </p>
                </div>
                <button 
                  className="save-btn"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = `http://localhost:5050/api/assignments/${file.assignment._id}/download/${file._id}`;
                    link.download = file.fileName;
                    link.click();
                  }}
                  style={{ fontSize: '12px', padding: '8px 16px' }}
                >
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Files;