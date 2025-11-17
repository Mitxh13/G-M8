import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getGroup, requestToJoinGroup, handleJoinRequest, removeMemberFromGroup } from '../../api';
import { toast } from 'react-toastify';

const GroupView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useContext(AuthContext);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

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
  }, [token, id]);

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

          {/* Inline info beside the group name */}
          <div style={{ marginLeft: 12, display: 'flex', flexDirection: 'column', gap: 4 }} className="group-info-inline">
            <span style={{ fontSize: 13 }}><strong>Class:</strong> <span className="dim-text">{group.class?.name || 'None'}</span></span>
            <span style={{ fontSize: 13 }}><strong>Leader:</strong> <span className="dim-text">{group.leader?.name}{group.leader?.srn ? ` (${group.leader.srn})` : ''}</span></span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* Left column: Members (1/3) and pending requests below it */}
        <aside style={{ flex: '0 0 33%', minWidth: 220 }}>
          <div className="info-card">
            <h4>Members</h4>
            {group.members?.length ? (
              group.members.map(m => (
                <div key={m._id} className="member-item">
                  <span>{m.name} {m.srn && <span className="dim-text">({m.srn})</span>}</span>
                  {(isLeader || group.class?.teacher === user?._id) && String(m._id) !== String(group.leader?._id) && (
                    <button className="delete-icon" onClick={() => onRemove(m._id)}>Remove</button>
                  )}
                </div>
              ))
            ) : (
              <p className="dim-text">No members yet.</p>
            )}
          </div>

          <div className="info-card" style={{ marginTop: 12 }}>
            <h4>Join Requests</h4>
            {group.joinRequests?.length ? (
              group.joinRequests.map((jr) => (
                <div key={jr} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <span className="dim-text">{jr}</span>
                  {isLeader && (
                    <>
                      <button className="save-btn" onClick={() => onAcceptReject(jr, 'accept')}>Accept</button>
                      <button className="role-btn" onClick={() => onAcceptReject(jr, 'reject')}>Reject</button>
                    </>
                  )}
                </div>
              ))
            ) : (
              <p className="dim-text">No pending requests.</p>
            )}
          </div>
        </aside>

        {/* Right column: Group actions and additional content (remaining 2/3) */}
        <main style={{ flex: 1 }}>
          <div style={{ marginTop: 0 }}>
            {!isMember && <button className="save-btn" onClick={onRequestJoin}>Request to Join</button>}
          </div>
        </main>
      </div>
    </div>
  );
};

export default GroupView;