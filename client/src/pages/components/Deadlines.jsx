import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getStudentDeadlines } from '../../api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Deadlines = () => {
  const { token } = useContext(AuthContext);
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    loadDeadlines();
  }, [token]);

  const loadDeadlines = async () => {
    setLoading(true);
    try {
      const data = await getStudentDeadlines(token);
      setDeadlines(data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load deadlines');
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate - now;
    
    if (diff < 0) return { text: 'Overdue', color: '#ef4444' };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return { text: `${days} day${days > 1 ? 's' : ''} left`, color: days > 3 ? '#10b981' : '#f59e0b' };
    } else {
      return { text: `${hours} hour${hours > 1 ? 's' : ''} left`, color: '#ef4444' };
    }
  };

  if (loading) return <p className="center-text">Loading deadlines...</p>;

  return (
    <div className="home-tab">
      <h2 className="class-heading-unique">All Deadlines</h2>
      
      {deadlines.length === 0 ? (
        <p className="dim-text">No deadlines found.</p>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {deadlines.map((deadline) => {
            const timeRemaining = getTimeRemaining(deadline.deadline);
            return (
              <div key={deadline._id} className="info-card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px 0', color: '#e0e0e0' }}>{deadline.title}</h4>
                    <p className="dim-text" style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                      {deadline.type === 'project' ? 'Class' : 'Group'}: <strong>{deadline.source}</strong>
                    </p>
                    <span style={{ 
                      fontSize: '12px', 
                      padding: '2px 8px', 
                      borderRadius: '12px',
                      background: deadline.type === 'project' ? '#0066cc' : '#10b981',
                      color: 'white'
                    }}>
                      {deadline.type === 'project' ? 'Class Project' : 'Group Assignment'}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      color: timeRemaining.color, 
                      fontWeight: 'bold', 
                      fontSize: '14px',
                      marginBottom: '4px'
                    }}>
                      {timeRemaining.text}
                    </div>
                    <div className="dim-text" style={{ fontSize: '12px' }}>
                      Due: {new Date(deadline.deadline).toLocaleString()}
                    </div>
                  </div>
                </div>
                <p className="dim-text" style={{ margin: '8px 0', fontSize: '13px', lineHeight: '1.4' }}>
                  {deadline.description}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Deadlines;