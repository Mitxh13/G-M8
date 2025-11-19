import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getGroup, requestToJoinGroup, handleJoinRequest, removeMemberFromGroup, inviteMemberToGroup, lookupUsersBySrns, createAssignment, getGroupAssignments, updateAssignment, uploadAssignmentFile, downloadAssignmentFile, deleteAssignmentFile, getGroupMessages, sendGroupMessage } from '../../api';
import { toast } from 'react-toastify';

const GroupView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useContext(AuthContext);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [srnInput, setSrnInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    deadline: '',
    workDivision: []
  });
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getGroup(token, id);
      setGroup(data);
    } catch (err) {
      toast.error(err.message || 'Failed to load group');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    load();
    loadAssignments();
    loadMessages();
  }, [token, id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAssignments = async () => {
    setLoadingAssignments(true);
    try {
      const data = await getGroupAssignments(token, id);
      setAssignments(data || []);
    } catch (err) {
      console.error('Failed to load assignments:', err.message);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const loadMessages = async () => {
    setLoadingMessages(true);
    try {
      const data = await getGroupMessages(token, id);
      setMessages(data || []);
    } catch (err) {
      console.error('Failed to load messages:', err.message);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    try {
      await sendGroupMessage(token, id, { content: newMessage });
      setNewMessage('');
      await loadMessages();
    } catch (err) {
      toast.error(err.message || 'Failed to send message');
    }
  };

  const onRequestJoin = async () => {
    try {
      await requestToJoinGroup(token, id);
      toast.success('Join request sent');
      await load();
    } catch (err) {
      toast.error(err.message || 'Failed to send request');
    }
  };

  const onAcceptReject = async (userId, action) => {
    try {
      await handleJoinRequest(token, id, { userId, action });
      toast.success(`Request ${action}ed`);
      await load();
    } catch (err) {
      toast.error(err.message || 'Failed to handle request');
    }
  };

  const onRemove = async (memberId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await removeMemberFromGroup(token, id, memberId);
      toast.success('Member removed');
      await load();
    } catch (err) {
      toast.error(err.message || 'Failed to remove member');
    }
  };

  const onInviteMember = async () => {
    if (!srnInput.trim()) return;
    setSearching(true);
    try {
      const results = await lookupUsersBySrns(token, [srnInput.trim()]);
      if (results.length === 0) {
        toast.error('No user found with that SRN');
        return;
      }
      const userId = results[0]._id;
      await inviteMemberToGroup(token, id, userId);
      toast.success('Invitation sent');
      setShowAddMember(false);
      setSrnInput('');
      await load();
    } catch (err) {
      toast.error(err.message || 'Failed to send invitation');
    } finally {
      setSearching(false);
    }
  };

  if (loading) return <p className="center-text">Loading group...</p>;
  if (!group) return <p className="center-text">Group not found.</p>;

  const isLeader = group.leader?._id === user?._id || String(group.leader?._id) === String(user?._id);
  const isMember = Array.isArray(group.members) && group.members.some(m => String(m._id) === String(user?._id));

  return (
    <div className="playground-tab view-class-tab">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="back-btn" onClick={() => navigate(-1)}>Back</button>
          <h2 className="class-heading-unique" style={{ margin: 0 }}>{group.name}</h2>
          <div style={{ marginLeft: 12, display: 'flex', flexDirection: 'column', gap: 4 }} className="group-info-inline">
            <span style={{ fontSize: 13 }}><strong>Class:</strong> <span className="dim-text">{group.class?.name || 'None'}</span></span>
            <span style={{ fontSize: 13 }}><strong>Leader:</strong> <span className="dim-text">{group.leader?.name}{group.leader?.srn ? ` (${group.leader.srn})` : ''}</span></span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <aside style={{ flex: '0 0 20%', minWidth: 200 }}>
          <div className="info-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h4 style={{ margin: 0 }}>Members</h4>
              {(isLeader || group.class?.teacher === user?._id) && (
                <button className="save-btn" onClick={() => setShowAddMember(!showAddMember)} style={{ fontSize: '12px', padding: '4px 8px' }}>
                  Add Member
                </button>
              )}
            </div>
            {group.members?.length ? (
              group.members.map(m => (
                <div key={m._id} className="member-item">
                  <span>{m.name} {m.srn && <span className="dim-text">({m.srn})</span>}</span>
                  {(isLeader || group.class?.teacher === user?._id) && String(m._id) !== String(group.leader?._id) && (
                    <button className="role-btn" onClick={() => onRemove(m._id)} style={{ fontSize: '11px', padding: '2px 6px' }}>Remove</button>
                  )}
                </div>
              ))
            ) : (
              <p className="dim-text">No members yet.</p>
            )}
            {showAddMember && (
              <div style={{ marginTop: 12, padding: 12, border: '1px solid #404040', borderRadius: 4, background: '#2d2d2d' }}>
                <h5 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Add Member by SRN</h5>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Enter SRN"
                    value={srnInput}
                    onChange={(e) => setSrnInput(e.target.value)}
                    style={{ flex: 1, minWidth: '150px', padding: '10px 12px', border: '1px solid #555555', borderRadius: '4px', background: '#1e1e1e', color: '#e0e0e0', outline: 'none', fontSize: '14px' }}
                  />
                  <button className="save-btn" onClick={onInviteMember} disabled={searching} style={{ fontSize: '12px', padding: '6px 12px' }}>
                    {searching ? 'Inviting...' : 'Invite'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="info-card" style={{ marginTop: 12 }}>
            <h4>Join Requests</h4>
            {group.joinRequests?.length ? (
              group.joinRequests.map((jr) => (
                <div key={jr._id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <span className="dim-text">{jr.name} {jr.srn && <span>({jr.srn})</span>}</span>
                  {isLeader && (
                    <>
                      <button className="save-btn" onClick={() => onAcceptReject(jr._id, 'accept')}>Accept</button>
                      <button className="role-btn" onClick={() => onAcceptReject(jr._id, 'reject')}>Reject</button>
                    </>
                  )}
                </div>
              ))
            ) : (
              <p className="dim-text">No pending requests.</p>
            )}
          </div>
        </aside>

        <main style={{ flex: 1, minWidth: 0, paddingLeft: '16px' }}>
          <div style={{ marginBottom: 16 }}>
            {!isMember && <button className="save-btn" onClick={onRequestJoin}>Request to Join</button>}
          </div>
          
          {isMember && (
            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="info-card" style={{ flex: '1', minWidth: '350px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Group Chat</h4>
                <div style={{ 
                  height: '400px', 
                  border: '1px solid #404040', 
                  borderRadius: '8px', 
                  display: 'flex', 
                  flexDirection: 'column',
                  background: '#1a1a1a'
                }}>
                  <div style={{ 
                    flex: 1, 
                    padding: '12px', 
                    overflowY: 'auto',
                    borderBottom: '1px solid #404040'
                  }}>
                    {loadingMessages ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>
                        Loading messages...
                      </div>
                    ) : messages.length === 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {messages.map((msg) => (
                          <div key={msg._id} style={{ 
                            padding: '8px 12px', 
                            backgroundColor: msg.sender._id === user?._id ? '#1e40af' : '#374151',
                            borderRadius: '8px',
                            alignSelf: msg.sender._id === user?._id ? 'flex-end' : 'flex-start',
                            maxWidth: '70%'
                          }}>
                            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '2px' }}>
                              {msg.sender.name} • {new Date(msg.createdAt).toLocaleTimeString()}
                            </div>
                            <div style={{ color: '#ffffff', fontSize: '14px' }}>
                              {msg.message}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <form onSubmit={handleSendMessage} style={{ 
                    padding: '16px', 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <textarea
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={3}
                      style={{ 
                        width: 'calc(100% - 32px)', 
                        padding: '12px 16px', 
                        border: '1px solid #555555', 
                        borderRadius: '6px', 
                        background: '#2d2d2d', 
                        color: '#e0e0e0', 
                        outline: 'none',
                        fontSize: '14px',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box'
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                    <button 
                      type="submit"
                      className="save-btn" 
                      style={{ padding: '12px 20px', fontSize: '14px', alignSelf: 'flex-end' }}
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>
              
              <div className="info-card" style={{ flex: '1', minWidth: '350px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h4 style={{ margin: 0, fontSize: '18px' }}>Group Assignments</h4>
                  {isLeader && (
                    <button className="save-btn" onClick={() => setShowAddAssignment(true)} style={{ fontSize: '14px', padding: '8px 16px' }}>
                      Add Assignment
                    </button>
                  )}
                </div>
                <div>
                  {loadingAssignments ? (
                    <p className="dim-text" style={{ textAlign: 'center', padding: '20px' }}>Loading assignments...</p>
                  ) : assignments.length === 0 ? (
                    <p className="dim-text" style={{ textAlign: 'center', padding: '20px' }}>No assignments yet.</p>
                  ) : (
                    assignments.map((assignment) => (
                      <div key={assignment._id} style={{ background: '#2d2d2d', border: '1px solid #404040', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <div style={{ flex: 1 }}>
                            <h5 style={{ margin: '0 0 8px 0', color: '#e0e0e0', fontSize: '16px' }}>{assignment.title}</h5>
                            <p className="dim-text" style={{ margin: '0 0 8px 0', lineHeight: '1.4' }}>{assignment.description}</p>
                            <p className="dim-text" style={{ margin: '0 0 12px 0', fontSize: '14px' }}>
                              <strong>Deadline:</strong> {new Date(assignment.deadline).toLocaleString()}
                            </p>
                          </div>
                          {isLeader && (
                            <button className="role-btn" onClick={() => setEditingAssignment(assignment._id)} style={{ fontSize: '12px', padding: '4px 8px', marginLeft: '12px' }}>
                              Edit Tasks
                            </button>
                          )}
                        </div>
                        {assignment.workDivision.length > 0 && (
                          <div style={{ borderTop: '1px solid #404040', paddingTop: '12px' }}>
                            <p className="dim-text" style={{ margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '14px' }}>Work Division:</p>
                            <div style={{ display: 'grid', gap: '6px' }}>
                              {assignment.workDivision.map((work, index) => {
                                const member = group.members?.find(m => m._id === work.member?._id || m._id === work.memberId);
                                const isMyTask = String(work.member?._id || work.memberId) === String(user?._id);
                                return work.task ? (
                                  <div key={index} style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    padding: '8px 12px', 
                                    backgroundColor: isMyTask ? '#1e40af' : 'transparent',
                                    borderRadius: '4px',
                                    border: isMyTask ? '1px solid #3b82f6' : 'none',
                                    marginBottom: '4px'
                                  }}>
                                    <span style={{ 
                                      color: isMyTask ? '#ffffff' : '#3b82f6', 
                                      fontWeight: '500', 
                                      minWidth: '100px', 
                                      fontSize: '13px' 
                                    }}>{member?.name}:</span>
                                    <span style={{ 
                                      fontSize: '13px', 
                                      marginLeft: '8px',
                                      color: isMyTask ? '#ffffff' : '#9ca3af'
                                    }}>{work.task}</span>
                                    {isMyTask && <span style={{ marginLeft: '8px', fontSize: '12px' }}>👤</span>}
                                  </div>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                        
                        <div style={{ borderTop: '1px solid #404040', paddingTop: '12px', marginTop: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <p className="dim-text" style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>File Uploads:</p>
                            <input
                              type="file"
                              id={`file-${assignment._id}`}
                              style={{ display: 'none' }}
                              onChange={async (e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  try {
                                    await uploadAssignmentFile(token, assignment._id, file);
                                    toast.success('File uploaded successfully!');
                                    await loadAssignments();
                                  } catch (err) {
                                    toast.error(err.message || 'Failed to upload file');
                                  }
                                }
                              }}
                            />
                            <button 
                              className="save-btn" 
                              onClick={() => document.getElementById(`file-${assignment._id}`).click()}
                              style={{ fontSize: '12px', padding: '4px 8px' }}
                            >
                              Upload File
                            </button>
                          </div>
                          {assignment.uploads?.length > 0 ? (
                            <div style={{ display: 'grid', gap: '6px' }}>
                              {assignment.uploads.map((upload, index) => {
                                const canDelete = String(upload.user?._id) === String(user?._id) || isLeader;
                                return (
                                  <div key={upload._id || index} style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    padding: '8px 12px', 
                                    backgroundColor: '#1a1a1a',
                                    borderRadius: '6px',
                                    border: '1px solid #333',
                                    fontSize: '13px'
                                  }}>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                                        <span style={{ color: '#3b82f6', fontWeight: '600' }}>
                                          📎 {upload.fileName}
                                        </span>
                                      </div>
                                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                                        Uploaded by <strong>{upload.user?.name}</strong> on {new Date(upload.uploadedAt).toLocaleString()}
                                      </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', marginLeft: '12px' }}>
                                      <button 
                                        className="save-btn"
                                        onClick={() => downloadAssignmentFile(token, assignment._id, upload._id, upload.fileName)}
                                        style={{ fontSize: '11px', padding: '4px 8px' }}
                                      >
                                        Download
                                      </button>
                                      {canDelete && (
                                        <button 
                                          className="role-btn"
                                          onClick={async () => {
                                            if (window.confirm('Delete this file?')) {
                                              try {
                                                await deleteAssignmentFile(token, assignment._id, upload._id);
                                                toast.success('File deleted successfully!');
                                                await loadAssignments();
                                              } catch (err) {
                                                toast.error(err.message || 'Failed to delete file');
                                              }
                                            }
                                          }}
                                          style={{ fontSize: '11px', padding: '4px 8px' }}
                                        >
                                          Delete
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="dim-text" style={{ fontSize: '12px', margin: 0 }}>No files uploaded yet.</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {editingAssignment && (
        <>
          <div className="modal-overlay" onClick={() => setEditingAssignment(null)} />
          <div className="settings-modal" style={{ width: '500px' }}>
            <div className="close-icon" onClick={() => setEditingAssignment(null)}>×</div>
            <div className="modal-header">
              <h2>Edit Work Division</h2>
            </div>
            <div className="modal-content">
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await updateAssignment(token, editingAssignment, { workDivision: assignmentForm.workDivision });
                  toast.success('Work division updated!');
                  setEditingAssignment(null);
                  await loadAssignments();
                } catch (err) {
                  toast.error(err.message || 'Failed to update assignment');
                }
              }}>
                <div className="form-group">
                  <label>Assign Tasks to Members</label>
                  {group.members?.map((member) => {
                    const currentAssignment = assignments.find(a => a._id === editingAssignment);
                    const currentTask = currentAssignment?.workDivision.find(w => (w.member?._id || w.memberId) === member._id)?.task || '';
                    return (
                      <div key={member._id} style={{ marginBottom: '12px' }}>
                        <label style={{ fontSize: '14px', color: '#b3b3b3', display: 'block', marginBottom: '4px' }}>{member.name}</label>
                        <input
                          type="text"
                          placeholder={`Task for ${member.name}...`}
                          defaultValue={currentTask}
                          onChange={(e) => {
                            const newDivision = [...(assignmentForm.workDivision || [])];
                            const existingIndex = newDivision.findIndex(w => w.memberId === member._id);
                            if (existingIndex >= 0) {
                              newDivision[existingIndex] = { member: member._id, task: e.target.value };
                            } else {
                              newDivision.push({ member: member._id, task: e.target.value });
                            }
                            setAssignmentForm({...assignmentForm, workDivision: newDivision});
                          }}
                          style={{ width: '100%', padding: '8px 12px', border: '1px solid #555555', borderRadius: '4px', background: '#1e1e1e', color: '#e0e0e0', outline: 'none' }}
                        />
                      </div>
                    );
                  })}
                </div>
                <button type="submit" className="save-btn" style={{ width: '100%', marginTop: '16px' }}>
                  Update Work Division
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {showAddAssignment && (
        <>
          <div className="modal-overlay" onClick={() => setShowAddAssignment(false)} />
          <div className="settings-modal" style={{ width: '600px' }}>
            <div className="close-icon" onClick={() => setShowAddAssignment(false)}>×</div>
            <div className="modal-header">
              <h2>Create Assignment</h2>
            </div>
            <div className="modal-content">
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await createAssignment(token, id, assignmentForm);
                  setAssignmentForm({ title: '', description: '', deadline: '', workDivision: [] });
                  toast.success('Assignment created!');
                  setShowAddAssignment(false);
                  await loadAssignments();
                } catch (err) {
                  toast.error(err.message || 'Failed to create assignment');
                }
              }}>
                <div className="form-group">
                  <label>Assignment Title</label>
                  <input
                    type="text"
                    placeholder="Enter assignment title"
                    value={assignmentForm.title}
                    onChange={(e) => setAssignmentForm({...assignmentForm, title: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Problem Statement</label>
                  <textarea
                    placeholder="Describe the assignment details..."
                    value={assignmentForm.description}
                    onChange={(e) => setAssignmentForm({...assignmentForm, description: e.target.value})}
                    rows={4}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Deadline</label>
                  <input
                    type="datetime-local"
                    value={assignmentForm.deadline}
                    onChange={(e) => setAssignmentForm({...assignmentForm, deadline: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Work Division</label>
                  {group.members?.map((member, index) => (
                    <div key={member._id} style={{ marginBottom: '8px' }}>
                      <label style={{ fontSize: '14px', color: '#b3b3b3' }}>{member.name}</label>
                      <input
                        type="text"
                        placeholder={`Task for ${member.name}...`}
                        onChange={(e) => {
                          const newDivision = [...assignmentForm.workDivision];
                          newDivision[index] = { member: member._id, task: e.target.value };
                          setAssignmentForm({...assignmentForm, workDivision: newDivision});
                        }}
                      />
                    </div>
                  ))}
                </div>
                <button type="submit" className="save-btn" style={{ width: '100%', marginTop: '16px' }}>
                  Create Assignment
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GroupView;