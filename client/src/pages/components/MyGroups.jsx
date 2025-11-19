import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { fetchMyGroups, handleInvitation } from '../../api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const MyGroups = () => {
  const { token, user } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState('all');

  useEffect(() => {
    if (!token) return;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchMyGroups(token);
        console.log('Groups data:', data);
        setGroups(data || []);
      } catch (err) {
        toast.error(err?.message || 'Failed to load groups');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const navigate = useNavigate();

  const onHandleInvitation = async (groupId, action) => {
    try {
      await handleInvitation(token, groupId, action);
      toast.success('Invitation ' + action + 'ed');
      const data = await fetchMyGroups(token);
      setGroups(data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to handle invitation');
    }
  };

  const groupsArr = (() => {
    if (Array.isArray(groups)) return groups;
    if (groups && Array.isArray(groups.data)) return groups.data;
    if (groups && Array.isArray(groups.groups)) return groups.groups;
    if (groups == null) return [];
    console.error('Unexpected groups payload (expected array):', groups);
    return [];
  })();

  console.log('Filtered groups:', groupsArr);

  return (
    <div className="home-tab">
      <h2 className="class-heading-unique">My Groups</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button
          className={filterMode === 'all' ? 'save-btn' : 'role-btn'}
          onClick={() => setFilterMode('all')}
        >
          All
        </button>
        <button
          className={filterMode === 'leading' ? 'save-btn' : 'role-btn'}
          onClick={() => setFilterMode('leading')}
        >
          Leading
        </button>
        <button
          className={filterMode === 'member' ? 'save-btn' : 'role-btn'}
          onClick={() => setFilterMode('member')}
        >
          Member
        </button>
        <button
          className={filterMode === 'invitations' ? 'save-btn' : 'role-btn'}
          onClick={() => setFilterMode('invitations')}
        >
          Invitations
        </button>
      </div>

      {loading && <p className="dim-text">Loading groups...</p>}
      {!loading && groupsArr.filter((g) => {
        if (filterMode === 'all') return true;
        const normalizeId = (val) => {
          if (!val) return null;
          if (typeof val === 'string') return val;
          if (val._id) return String(val._id);
          return null;
        };
        const me = user?._id ? String(user._id) : null;
        const leaderId = normalizeId(g.leader);
        if (filterMode === 'leading') return me && leaderId === me;
        if (filterMode === 'member') {
          if (!Array.isArray(g.members)) return false;
          return g.members.some((m) => {
            const mid = normalizeId(m);
            return me && mid === me;
          });
        }
        if (filterMode === 'invitations') {
          return g.invitations?.some((inv) => inv.user && inv.user._id === user._id && inv.status === 'pending');
        }
        return true;
      }).length === 0 && (
        <p className="dim-text">
          {filterMode === 'invitations' ? 'No pending invitations.' : 'You are not in any groups yet.'}
        </p>
      )}
      {!loading && groupsArr.length > 0 && (
        <div className="groups-grid">
          {groupsArr
            .filter((g) => {
              if (filterMode === 'all') return true;
              const normalizeId = (val) => {
                if (!val) return null;
                if (typeof val === 'string') return val;
                if (val._id) return String(val._id);
                return null;
              };
              const me = user?._id ? String(user._id) : null;
              const leaderId = normalizeId(g.leader);
              if (filterMode === 'leading') return me && leaderId === me;
              if (filterMode === 'member') {
                if (!Array.isArray(g.members)) return false;
                return g.members.some((m) => {
                  const mid = normalizeId(m);
                  return me && mid === me;
                });
              }
              if (filterMode === 'invitations') {
                return g.invitations?.some((inv) => inv.user && inv.user._id === user._id && inv.status === 'pending');
              }
              return true;
            })
            .map((g) => {
              const myInvitation = g.invitations?.find((inv) => inv.user && inv.user._id === user._id && inv.status === 'pending');
              return (
                <div key={g._id} className="info-card" style={{ marginBottom: 12 }}>
                  <h3>{g.name}</h3>
                  <p className="dim-text">Class: {g.class?.name || 'Standalone'}</p>
                  <p className="dim-text">Leader: {g.leader?.name || '-'}</p>
                  <p className="dim-text">Members: {g.members?.length || 0}</p>
                  {filterMode === 'invitations' && myInvitation && (
                    <p className="dim-text" style={{ color: '#fbbf24' }}>📩 Invitation pending</p>
                  )}
                  <div style={{ marginTop: 8 }}>
                    {myInvitation ? (
                      <div>
                        <button className="save-btn" onClick={() => onHandleInvitation(g._id, 'accept')}>Accept Invite</button>
                        <button className="role-btn" onClick={() => onHandleInvitation(g._id, 'reject')} style={{ marginLeft: 8 }}>Reject Invite</button>
                      </div>
                    ) : (
                      <button className="save-btn" onClick={() => navigate(`/home/group/${g._id}`)}>View</button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default MyGroups;