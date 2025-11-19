import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { getUsers, getUserGroups, getPrivateMessages, sendPrivateMessage, getGroupMessages, sendGroupMessage, fetchTeacherClasses, fetchStudentClasses, getClassMessages, sendClassMessage } from '../../api';
import { useNavigate } from 'react-router-dom';

const Chat = () => {
  const [activeTab, setActiveTab] = useState('private');
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastMessages, setLastMessages] = useState({});
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadUsers();
    setActiveTab('private');
    if (!currentUser.isTeacher) {
      loadGroups();
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadUsers = async () => {
    try {
      const data = await getUsers(token);
      setUsers(data);
    } catch (err) {
      toast.error('Failed to load users');
    }
  };

  const loadGroups = async () => {
    try {
      const data = await getUserGroups(token);
      setGroups(data);
    } catch (err) {
      toast.error('Failed to load groups');
    }
  };

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

  const loadMessages = async (chatId, chatType = 'private') => {
    setLoading(true);
    try {
      let data;
      if (chatType === 'group') {
        data = await getGroupMessages(token, chatId);
      } else if (chatType === 'class') {
        data = await getClassMessages(token, chatId);
      } else {
        data = await getPrivateMessages(token, chatId);
      }
      setMessages(data);
    } catch (err) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const messageData = { content: newMessage };
      
      if (selectedChat.chatType === 'group') {
        await sendGroupMessage(token, selectedChat._id, messageData);
      } else if (selectedChat.chatType === 'class') {
        await sendClassMessage(token, selectedChat._id, messageData);
      } else {
        await sendPrivateMessage(token, selectedChat._id, messageData);
      }
      
      setNewMessage('');
      loadMessages(selectedChat._id, selectedChat.chatType);
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const selectChat = (chat, chatType = 'private') => {
    const chatData = { ...chat, chatType };
    setSelectedChat(chatData);
    loadMessages(chat._id, chatType);
  };

  const goToGroupView = (groupId) => {
    navigate(`/group/${groupId}`);
  };

  return (
    <div style={{ display: 'flex', height: '600px', background: '#1e1e1e', borderRadius: '8px', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: '300px', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column' }}>
        {/* Tabs */}
        {!currentUser.isTeacher && (
          <div style={{ display: 'flex', borderBottom: '1px solid #333' }}>
            <button
              onClick={() => setActiveTab('private')}
              style={{
                flex: 1,
                padding: '12px',
                background: activeTab === 'private' ? '#333' : 'transparent',
                color: '#e0e0e0',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Private Chats
            </button>
            <button
              onClick={() => {
                setActiveTab('groups');
                loadGroups();
              }}
              style={{
                flex: 1,
                padding: '12px',
                background: activeTab === 'groups' ? '#333' : 'transparent',
                color: '#e0e0e0',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Group Chats
            </button>
          </div>
        )}
        {currentUser.isTeacher && (
          <div style={{ padding: '16px', borderBottom: '1px solid #333', textAlign: 'center', color: '#e0e0e0', fontWeight: 'bold' }}>
            Private Chats
          </div>
        )}

        {/* Chat List */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {currentUser.isTeacher || activeTab === 'private' ? (
            users.map(user => (
              <div
                key={user._id}
                onClick={() => selectChat(user, 'private')}
                style={{
                  padding: '12px',
                  borderBottom: '1px solid #333',
                  cursor: 'pointer',
                  background: selectedChat?._id === user._id && selectedChat?.chatType === 'private' ? '#333' : 'transparent'
                }}
                onMouseEnter={(e) => e.target.style.background = '#333'}
                onMouseLeave={(e) => e.target.style.background = selectedChat?._id === user._id && selectedChat?.chatType === 'private' ? '#333' : 'transparent'}
              >
                <div style={{ fontWeight: 'bold', color: '#e0e0e0' }}>{user.name}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>{user.email}</div>
              </div>
            ))
          ) : (
            groups.map(group => (
              <div
                key={group._id}
                style={{
                  padding: '12px',
                  borderBottom: '1px solid #333',
                  cursor: 'pointer',
                  background: selectedChat?._id === group._id && selectedChat?.chatType === 'group' ? '#333' : 'transparent'
                }}
                onMouseEnter={(e) => e.target.style.background = '#333'}
                onMouseLeave={(e) => e.target.style.background = selectedChat?._id === group._id && selectedChat?.chatType === 'group' ? '#333' : 'transparent'}
              >
                <div
                  onClick={() => selectChat(group, 'group')}
                  style={{ marginBottom: '8px' }}
                >
                  <div style={{ fontWeight: 'bold', color: '#e0e0e0' }}>{group.name}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{group.members?.length} members</div>
                </div>
                <button
                  onClick={() => goToGroupView(group._id)}
                  className="save-btn"
                  style={{ fontSize: '11px', padding: '4px 8px' }}
                >
                  View Group
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div style={{ padding: '16px', borderBottom: '1px solid #333', background: '#2a2a2a' }}>
              <h3 style={{ margin: 0, color: '#e0e0e0' }}>
                {selectedChat.name}
                {selectedChat.chatType === 'group' && <span style={{ fontSize: '14px', color: '#888', marginLeft: '8px' }}>Group Chat</span>}
                {selectedChat.chatType === 'class' && <span style={{ fontSize: '14px', color: '#888', marginLeft: '8px' }}>Class Chat</span>}
              </h3>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, padding: '16px', overflow: 'auto' }}>
              {loading ? (
                <div style={{ textAlign: 'center', color: '#888' }}>Loading messages...</div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#888' }}>No messages yet. Start the conversation!</div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: '12px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: message.sender._id === currentUser._id ? '#0066cc' : '#333',
                      alignSelf: message.sender._id === currentUser._id ? 'flex-end' : 'flex-start',
                      maxWidth: '70%',
                      marginLeft: message.sender._id === currentUser._id ? 'auto' : '0',
                      marginRight: message.sender._id === currentUser._id ? '0' : 'auto'
                    }}
                  >
                    {(selectedChat.chatType === 'group' || selectedChat.chatType === 'class') && message.sender._id !== currentUser._id && (
                      <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>
                        {message.sender.name}
                      </div>
                    )}
                    <div style={{ color: '#e0e0e0' }}>{message.content}</div>
                    <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            {(selectedChat?.chatType !== 'class' || currentUser.isTeacher) && (
              <form onSubmit={handleSendMessage} style={{ padding: '16px', borderTop: '1px solid #333' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #555',
                      borderRadius: '4px',
                      background: '#2a2a2a',
                      color: '#e0e0e0',
                      outline: 'none',
                      resize: 'vertical',
                      minHeight: '80px'
                    }}
                  />
                  <button
                    type="submit"
                    className="save-btn"
                    style={{ padding: '12px 20px', alignSelf: 'flex-end' }}
                  >
                    Send
                  </button>
                </div>
              </form>
            )}
            {selectedChat?.chatType === 'class' && !currentUser.isTeacher && (
              <div style={{ padding: '16px', borderTop: '1px solid #333', textAlign: 'center', color: '#888' }}>
                Only teachers can send messages in class chat
              </div>
            )}
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;