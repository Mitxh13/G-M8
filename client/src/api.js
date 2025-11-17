const API_URL = 'http://localhost:5050/api';

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.message || 'Something went wrong.';
    throw new Error(msg);
  }
  return data;
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
