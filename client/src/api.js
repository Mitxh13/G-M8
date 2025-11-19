const API_URL = 'http://localhost:5050/api';

async function handleResponse(res) {
  if (!res.ok) {
    let errorMsg = 'Something went wrong.';
    try {
      const data = await res.json();
      errorMsg = data.message || errorMsg;
    } catch {
      errorMsg = `Server error: ${res.status} ${res.statusText}`;
    }
    throw new Error(errorMsg);
  }
  return await res.json();
}

export async function loginUser(email, password) {
  const res = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return await handleResponse(res);
}

export async function registerUser(data) {
  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await handleResponse(res);
}

export async function fetchMe(token) {
  const res = await fetch(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await handleResponse(res);
}

export async function getAllUsers(token) {
  const res = await fetch(`${API_URL}/users/all`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await handleResponse(res);
}


export async function updateUser(token, body) {
  const res = await fetch(`${API_URL}/users/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  return await handleResponse(res);
}

// === Class Fetching APIs ===
export async function fetchTeacherClasses(token) {
  const res = await fetch(`${API_URL}/classes/mine/teacher`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch teacher classes");
  return data;
}

export async function fetchStudentClasses(token) {
  const res = await fetch(`${API_URL}/classes/mine/student`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch student classes");
  return data;
}

// === Create a new class ===
export async function createClass(token, { name, description, code }) {
  const res = await fetch(`${API_URL}/classes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, description, code }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create class");
  return data;
}

// === Get class by ID ===
export const getClassById = async (token, classId) => {
  const res = await fetch(`${API_URL}/classes/${classId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to fetch class details");
  }
  return res.json();
};

export const removeStudentFromClass = async (token, classId, studentId) => {
  const res = await fetch(`${API_URL}/classes/${classId}/student/${studentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to remove student");
  return data;
};

// === Group APIs ===
export const createGroup = async (token, { name, classId = null, members = [] }) => {
  const res = await fetch(`${API_URL}/groups`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, classId, members }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create group');
  return data;
};

export const fetchMyGroups = async (token) => {
  const res = await fetch(`${API_URL}/groups/mine`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch groups');
  return data;
};

export const getGroup = async (token, groupId) => {
  const res = await fetch(`${API_URL}/groups/${groupId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to fetch group');
  }
  return res.json();
};

export const requestToJoinGroup = async (token, groupId) => {
  const res = await fetch(`${API_URL}/groups/${groupId}/request`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to request join');
  return data;
};

export const handleJoinRequest = async (token, groupId, { userId, action }) => {
  const res = await fetch(`${API_URL}/groups/${groupId}/handle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ userId, action }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to handle request');
  return data;
};

export const removeMemberFromGroup = async (token, groupId, memberId) => {
  const res = await fetch(`${API_URL}/groups/${groupId}/member/${memberId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to remove member');
  return data;
};

export const inviteMemberToGroup = async (token, groupId, userId) => {
  const res = await fetch(`${API_URL}/groups/${groupId}/invite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ userId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to invite member');
  return data;
};

export const handleInvitation = async (token, groupId, action) => {
  const res = await fetch(`${API_URL}/groups/${groupId}/invitation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action }),
  });
  return await handleResponse(res);
};

export const addMemberToGroup = async (token, groupId, userId) => {
  const res = await fetch(`${API_URL}/groups/${groupId}/add-member`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ userId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add member');
  return data;
};

// === User helpers ===
export const lookupUsersBySrns = async (token, srns) => {
  const res = await fetch(`${API_URL}/users/lookup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ srns }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to lookup users by SRN');
  return data.users || [];
};

// === Assignment APIs ===
export const createAssignment = async (token, groupId, assignmentData) => {
  const res = await fetch(`${API_URL}/assignments/group/${groupId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(assignmentData),
  });
  return await handleResponse(res);
};

export const getGroupAssignments = async (token, groupId) => {
  const res = await fetch(`${API_URL}/assignments/group/${groupId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await handleResponse(res);
};

export const updateAssignment = async (token, assignmentId, updateData) => {
  const res = await fetch(`${API_URL}/assignments/${assignmentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(updateData),
  });
  return await handleResponse(res);
};

export const uploadAssignmentFile = async (token, assignmentId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await fetch(`${API_URL}/assignments/${assignmentId}/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
  return await handleResponse(res);
};

export const downloadAssignmentFile = async (token, assignmentId, uploadId, fileName) => {
  const res = await fetch(`${API_URL}/assignments/${assignmentId}/download/${uploadId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (!res.ok) throw new Error('Failed to download file');
  
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const deleteAssignmentFile = async (token, assignmentId, uploadId) => {
  const res = await fetch(`${API_URL}/assignments/${assignmentId}/upload/${uploadId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  return await handleResponse(res);
};

export const getMyAssignments = async (token) => {
  const res = await fetch(`${API_URL}/assignments/my`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await handleResponse(res);
};

export const getStudentDeadlines = async (token) => {
  const res = await fetch(`${API_URL}/deadlines/student`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await handleResponse(res);
};

export const getMyFiles = async (token) => {
  const res = await fetch(`${API_URL}/assignments/my-files`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await handleResponse(res);
};

export const getGroupMessages = async (token, groupId) => {
  const res = await fetch(`${API_URL}/groupchat/${groupId}/messages`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await handleResponse(res);
};

export const sendGroupMessage = async (token, groupId, messageData) => {
  const res = await fetch(`${API_URL}/groupchat/${groupId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ message: messageData.content })
  });
  return await handleResponse(res);
};

// Private Chat API
export const getPrivateMessages = async (token, userId) => {
  const res = await fetch(`${API_URL}/private-chat/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await handleResponse(res);
};

export const sendPrivateMessage = async (token, userId, messageData) => {
  const res = await fetch(`${API_URL}/private-chat/${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(messageData)
  });
  return await handleResponse(res);
};

// Users API
export const getUsers = async (token) => {
  const res = await fetch(`${API_URL}/private-chat/recent`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await handleResponse(res);
};

export const getUserGroups = async (token) => {
  return await fetchMyGroups(token);
};

// Project API
export const createProject = async (token, classId, projectData, files = []) => {
  const formData = new FormData();
  formData.append('title', projectData.title);
  formData.append('description', projectData.description);
  formData.append('deadline', projectData.deadline);
  
  files.forEach(file => {
    formData.append('files', file);
  });
  
  const res = await fetch(`${API_URL}/projects/class/${classId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });
  return await handleResponse(res);
};

export const getClassProjects = async (token, classId) => {
  const res = await fetch(`${API_URL}/projects/class/${classId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await handleResponse(res);
};

export const downloadProjectFile = async (token, projectId, fileIndex, fileName) => {
  const res = await fetch(`${API_URL}/projects/download/${projectId}/${fileIndex}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (!res.ok) throw new Error('Failed to download file');
  
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const downloadAnnouncementFile = async (token, announcementId, fileIndex, fileName) => {
  const res = await fetch(`${API_URL}/announcements/download/${announcementId}/${fileIndex}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (!res.ok) throw new Error('Failed to download file');
  
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const updateProject = async (token, projectId, projectData) => {
  const res = await fetch(`${API_URL}/projects/${projectId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(projectData)
  });
  return await handleResponse(res);
};

export const updateAnnouncement = async (token, announcementId, announcementData) => {
  const res = await fetch(`${API_URL}/announcements/${announcementId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(announcementData)
  });
  return await handleResponse(res);
};

// Announcement API
export const getClassAnnouncements = async (token, classId) => {
  const res = await fetch(`${API_URL}/announcements/class/${classId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await handleResponse(res);
};

export const getTeacherAnnouncements = async (token) => {
  const res = await fetch(`${API_URL}/announcements/teacher`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await handleResponse(res);
};

export const createAnnouncement = async (token, classId, announcementData, files = []) => {
  const formData = new FormData();
  formData.append('title', announcementData.title);
  formData.append('content', announcementData.content);
  
  files.forEach(file => {
    formData.append('files', file);
  });
  
  const res = await fetch(`${API_URL}/announcements/class/${classId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });
  return await handleResponse(res);
};

// Class Chat API
export const getClassMessages = async (token, classId) => {
  const res = await fetch(`${API_URL}/class-chat/${classId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await handleResponse(res);
};

export const sendClassMessage = async (token, classId, messageData) => {
  const res = await fetch(`${API_URL}/class-chat/${classId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ content: messageData.content })
  });
  return await handleResponse(res);
};

// Class Files API
export const uploadClassFiles = async (token, classId, files) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });
  
  const res = await fetch(`${API_URL}/class-files/class/${classId}/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });
  return await handleResponse(res);
};

export const getClassFiles = async (token, classId) => {
  const res = await fetch(`${API_URL}/class-files/class/${classId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await handleResponse(res);
};

export const downloadClassFile = async (token, fileId, fileName) => {
  const res = await fetch(`${API_URL}/class-files/download/${fileId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (!res.ok) throw new Error('Failed to download file');
  
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
