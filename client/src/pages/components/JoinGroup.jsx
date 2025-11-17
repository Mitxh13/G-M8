import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  fetchMyGroups,
  getGroup,
  requestToJoinGroup,
  handleJoinRequest,
  removeMemberFromGroup,
} from "../../api";
import { toast } from "react-toastify";

const JoinGroup = () => {
  const { token, user } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupDetails, setGroupDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const data = await fetchMyGroups(token);
      setGroups(data || []);
    } catch (err) {
      toast.error(err.message || "Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    loadGroups();
  }, [token]);

  const viewGroup = async (groupId) => {
    setSelectedGroup(groupId);
    setLoadingDetails(true);
    try {
      const data = await getGroup(token, groupId);
      setGroupDetails(data);
    } catch (err) {
      toast.error(err.message || "Failed to load group details");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleRequestJoin = async (groupId) => {
    try {
      await requestToJoinGroup(token, groupId);
      toast.success("Join request sent");
      await viewGroup(groupId);
    } catch (err) {
      toast.error(err.message || "Failed to request join");
    }
  };

  const handleAcceptReject = async (groupId, userId, action) => {
    try {
      await handleJoinRequest(token, groupId, { userId, action });
      toast.success(`Request ${action}ed`);
      await viewGroup(groupId);
      await loadGroups();
    } catch (err) {
      toast.error(err.message || 'Failed to handle request');
    }
  };

  const handleRemove = async (groupId, memberId) => {
    if (!window.confirm('Remove this member from group?')) return;
    try {
      await removeMemberFromGroup(token, groupId, memberId);
      toast.success('Member removed');
      await viewGroup(groupId);
      await loadGroups();
    } catch (err) {
      toast.error(err.message || 'Failed to remove member');
    }
  };

  return (
    <div className="home-tab">
      <h2 className="class-heading-unique">My Groups</h2>

      {loading ? (
        <p className="dim-text">Loading groups...</p>
      ) : groups.length === 0 ? (
        <p className="dim-text">You are not a member of any groups yet.</p>
      ) : (
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ flex: 1 }}>
            <h3>Your Groups</h3>
            <ul>
              {groups.map((g) => (
                <li key={g._id} style={{ marginBottom: 8 }}>
                  <button className="role-btn" onClick={() => viewGroup(g._id)}>
                    {g.name} {g.class && <span className="dim-text">({g.class.name})</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ flex: 2 }}>
            {selectedGroup ? (
              loadingDetails ? (
                <p className="dim-text">Loading details...</p>
              ) : groupDetails ? (
                <div className="info-card">
                  <h3>{groupDetails.name}</h3>
                  <p>
                    <strong>Leader:</strong> {groupDetails.leader?.name} {groupDetails.leader?.srn && <span className="dim-text">({groupDetails.leader.srn})</span>}
                  </p>

                  <div style={{ marginTop: 12 }}>
                    <h4>Members</h4>
                    {groupDetails.members?.length > 0 ? (
                      groupDetails.members.map((m) => (
                        <div key={m._id} className="member-item">
                          <span>
                            {m.name} {m.srn && <span className="dim-text">({m.srn})</span>}
                          </span>
                          {(groupDetails.leader?._id === user?._id || groupDetails.class?.teacher === user?._id) && (
                            <button className="delete-icon" onClick={() => handleRemove(groupDetails._id, m._id)}>
                              Remove
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="dim-text">No members yet.</p>
                    )}
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <h4>Join Requests</h4>
                    {groupDetails.joinRequests?.length > 0 ? (
                      groupDetails.joinRequests.map((jr) => (
                        <div key={jr} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className="dim-text">{jr}</span>
                          {/* joinRequests are userIds; for better UX we could fetch user info */}
                          {(groupDetails.leader?._id === user?._id || groupDetails.class?.teacher === user?._id) && (
                            <>
                              <button className="save-btn" onClick={() => handleAcceptReject(groupDetails._id, jr, 'accept')}>Accept</button>
                              <button className="role-btn" onClick={() => handleAcceptReject(groupDetails._id, jr, 'reject')}>Reject</button>
                            </>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="dim-text">No pending requests.</p>
                    )}
                  </div>

                </div>
              ) : (
                <p className="dim-text">Select a group to view details.</p>
              )
            ) : (
              <p className="dim-text">Select a group to view details.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JoinGroup;
