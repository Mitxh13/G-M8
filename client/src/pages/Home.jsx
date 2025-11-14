import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaUserCircle,
  FaHome,
  FaChalkboardTeacher,
  FaUsers,
  FaComments,
  FaPlusCircle,
  FaEnvelope,
  FaIdCard,
  FaUser,
  FaCog,
  FaLock,
  FaEdit,
  FaTimes,
  FaBars,
  FaSignOutAlt,
} from "react-icons/fa";
import { HiUserAdd } from "react-icons/hi";
import { updateUser } from "../api";

// Tab Components
import HomeTab from "./components/HomeTab";
import CreateClass from "./components/CreateClass";
import ViewClass from "./components/ViewClass";
import JoinClass from "./components/JoinClass";
import CreateGroup from "./components/CreateGroup";
import JoinGroup from "./components/JoinGroup";
import Chat from "./components/Chat";

const Home = () => {
  const { user, logout, token, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState("Home");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState(null);

  const [newName, setNewName] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleLogout = () => {
    logout();
    toast.info("Logged out successfully");
    navigate("/login");
  };

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return toast.error("Enter a valid name");
    try {
      await updateUser(token, { type: "name", newUserName: newName });
      toast.success("Name updated successfully");
      setNewName("");
      setShowSettings(false);
      await refreshUser();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword)
      return toast.error("Please fill all password fields");
    try {
      await updateUser(token, {
        type: "password",
        oldPassword,
        newPassword,
      });
      toast.success("Password updated successfully");
      setOldPassword("");
      setNewPassword("");
      setShowSettings(false);
      await refreshUser();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const menuItemsTeacher = [
    {
      name: "Dashboard",
      icon: <FaHome />,
      component: (
        <HomeTab
          setActiveTab={setActiveTab}
          setSelectedClassId={setSelectedClassId}
        />
      ),
    },
    {
      name: "Classes",
      icon: <FaChalkboardTeacher />,
      component: <CreateClass />,
    },
    {
      name: "Projects",
      icon: <FaPlusCircle />,
      component: <div>Projects Placeholder</div>,
    },
    {
      name: "Announcements",
      icon: <FaEnvelope />,
      component: <div>Announcements Placeholder</div>,
    },
    {
      name: "Chats",
      icon: <FaComments />,
      component: <Chat />,
    },
    {
      name: "Files",
      icon: <FaIdCard />,
      component: <div>Files Placeholder</div>,
    },
  ];

  const menuItemsStudent = [
    {
      name: "Dashboard",
      icon: <FaHome />,
      component: (
        <HomeTab
          setActiveTab={setActiveTab}
          setSelectedClassId={setSelectedClassId}
        />
      ),
    },
    { name: "Join Class", icon: <HiUserAdd />, component: <JoinClass /> },
    {
      name: "My Classes",
      icon: <FaChalkboardTeacher />,
      component: <ViewClass selectedClassId={selectedClassId} />,
    },
    {
      name: "Groups",
      icon: <FaUsers />,
      component: <CreateGroup />,
    },
    {
      name: "Deadlines",
      icon: <FaEnvelope />,
      component: <div>Deadlines Placeholder</div>,
    },
    {
      name: "Chat",
      icon: <FaComments />,
      component: <Chat />,
    },
    {
      name: "Files",
      icon: <FaIdCard />,
      component: <div>Files Placeholder</div>,
    },
  ];

  const menu = user?.isTeacher ? menuItemsTeacher : menuItemsStudent;

  const activeComponent =
    menu.find((m) => m.name === activeTab)?.component || (
      <HomeTab
        setActiveTab={setActiveTab}
        setSelectedClassId={setSelectedClassId}
      />
    );

  return (
    <div className="home-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <h2 className="sidebar-title">{sidebarOpen ? "Dashboard" : ""}</h2>
        <ul>
          {menu.map((item) => (
            <li
              key={item.name}
              className={activeTab === item.name ? "active" : ""}
              onClick={() => setActiveTab(item.name)}
              title={!sidebarOpen ? item.name : ""}
            >
              <span className="icon">{item.icon}</span>
              {sidebarOpen && <span className="label">{item.name}</span>}
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Section */}
      <div className={`main-section ${sidebarOpen ? "expanded" : "collapsed"}`}>
        {/* Top Bar */}
        <header className="topbar">
          <div className="topbar-left">
            <div className="brand-with-menu">
              <FaBars
                className="menu-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              />
              <h1 className="brand">GroupMate(G-M8)</h1>
            </div>
          </div>

          <div className="topbar-right">
            <FaCog
              size={28}
              className="settings-icon"
              onClick={() => setShowSettings(true)}
            />
            <FaUserCircle
              size={28}
              className="profile-icon"
              onClick={() => setShowProfile(true)}
            />
            <FaSignOutAlt
              size={22}
              className="logout-icon"
              onClick={handleLogout}
              title="Logout"
            />
          </div>
        </header>

        {/* Playground */}
        <div className="playground">{activeComponent}</div>
      </div>

      {/* Profile Modal */}
      {showProfile && (
        <>
          <div className="modal-overlay" onClick={() => setShowProfile(false)} />
          <div className="profile-modal">
            <FaTimes
              className="close-icon"
              onClick={() => setShowProfile(false)}
            />
            <div className="modal-header">
              <FaUserCircle size={60} className="modal-avatar" />
              <h2>Profile Information</h2>
            </div>

            <div className="modal-content">
              <div className="profile-item">
                <FaUser className="profile-icon-modal" />
                <span>{user?.name}</span>
              </div>
              <div className="profile-item">
                <FaEnvelope className="profile-icon-modal" />
                <span>{user?.email}</span>
              </div>
              {user?.srn && (
                <div className="profile-item">
                  <FaIdCard className="profile-icon-modal" />
                  <span>{user?.srn}</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <>
          <div className="modal-overlay" onClick={() => setShowSettings(false)} />
          <div className="settings-modal">
            <FaTimes
              className="close-icon"
              onClick={() => setShowSettings(false)}
            />
            <div className="modal-header">
              <FaCog size={60} className="modal-avatar" />
              <h2>Account Settings</h2>
            </div>

            <div className="modal-content">
              <form onSubmit={handleUpdateName}>
                <label>
                  <FaEdit className="profile-icon-modal" /> Update Name
                </label>
                <input
                  type="text"
                  placeholder="Enter new name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <button type="submit" className="save-btn">
                  Update Name
                </button>
              </form>

              <hr className="divider" />

              <form onSubmit={handleUpdatePassword}>
                <label>
                  <FaLock className="profile-icon-modal" /> Change Password
                </label>
                <input
                  type="password"
                  placeholder="Old Password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button type="submit" className="save-btn">
                  Update Password
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
