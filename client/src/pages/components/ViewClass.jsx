import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  getClassById,
  removeStudentFromClass,
  fetchTeacherClasses,
  fetchStudentClasses,
} from "../../api";
import { toast } from "react-toastify";
import { FaTrash, FaFile, FaComments, FaUsers, FaBullhorn, FaArrowLeft } from "react-icons/fa";

const ViewClass = ({ selectedClassId: propClassId }) => {
  const { user, token } = useContext(AuthContext);
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(propClassId || "");
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [studentClasses, setStudentClasses] = useState([]);
  const [activeTab, setActiveTab] = useState("Projects");

  // Fetch teacher's classes for dropdown
  useEffect(() => {
    const loadClasses = async () => {
      try {
        if (user?.isTeacher) {
          const data = await fetchTeacherClasses(token);
          setTeacherClasses(data);
        } else {
          const data = await fetchStudentClasses(token); // student classes
          setStudentClasses(data);
        }
      } catch (err) {
        toast.error(err.message);
      }
    };
    loadClasses();
  }, [user, token]);

  // Fetch class info
  const fetchClassData = async (id) => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getClassById(token, id);
      setClassData(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClassId) fetchClassData(selectedClassId);
  }, [selectedClassId]);

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm("Remove this student from class?")) return;
    try {
      await removeStudentFromClass(token, selectedClassId, studentId);
      toast.success("Student removed");
      await fetchClassData(selectedClassId);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // === Class selection if no class selected ===
  if (!selectedClassId) {
    const classesToDisplay = user?.isTeacher ? teacherClasses : studentClasses;
    
    return (
      <div className="home-tab">
        <h2 className="class-heading-unique">
          {user?.isTeacher ? "Select Your Class" : "Select a Class to View"}
        </h2>

        {classesToDisplay.length === 0 ? (
          <div className="center-text">
            <p className="no-classes">
              {user?.isTeacher
                ? "You haven't created any classes yet."
                : "You are not enrolled in any classes yet."}
            </p>
          </div>
        ) : (
          <div className="class-grid">
            {classesToDisplay.map((cls) => (
              <div
                key={cls._id}
                className={`class-card ${user?.isTeacher ? "teacher-card" : "student-card"}`}
                onClick={() => setSelectedClassId(cls._id)}
                style={{ cursor: "pointer" }}
              >
                <div className="class-header">
                  <span className="class-name">{cls.name}</span>
                </div>
                <p className="class-desc">{cls.description || "No description"}</p>
                <p className="class-code-text" style={{ marginTop: "10px", fontSize: "0.9em", color: "#666" }}>
                  Code: {cls.code}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (loading) return <p className="center-text">Loading class details...</p>;
  if (!classData) return <p className="center-text">Class not found.</p>;

  const { classInfo, members, groups } = classData;

  const tabs = user?.isTeacher
    ? ["Projects", "Announcements", "Students", "Files", "Chat"]
    : ["Announcements", "Projects", "Groups", "Chat", "Files"];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Projects":
        return <div>Projects content here</div>;
      case "Announcements":
        return <div>Announcements content here</div>;
      case "Students":
        return (
          <div className="info-card">
            {members.students?.length > 0 ? (
              members.students.map((student) => (
                <div key={student._id} className="member-item">
                  <span>
                    {student.name} {student.srn && <span className="dim-text">({student.srn})</span>}
                  </span>
                  {user?.isTeacher && (
                    <FaTrash
                      className="delete-icon"
                      onClick={() => handleRemoveStudent(student._id)}
                    />
                  )}
                </div>
              ))
            ) : (
              <p className="dim-text">No students in this class yet.</p>
            )}
          </div>
        );
      case "Groups":
        return (
          <div className="info-card">
            {groups?.length > 0 ? (
              <ul className="list">
                {groups.map((g) => (
                  <li key={g._id}>
                    <strong>{g.name}</strong> — {g.members.length} members
                  </li>
                ))}
              </ul>
            ) : (
              <p className="dim-text">No groups created yet.</p>
            )}
          </div>
        );
      case "Files":
        return <div>Files content here</div>;
      case "Chat":
        return <div>Chat content here</div>;
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="playground-tab view-class-tab">
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <button 
          className="back-btn"
          onClick={() => setSelectedClassId("")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            backgroundColor: "#2d2d2d",
            border: "1px solid #404040",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            color: "#e0e0e0",
            fontWeight: "500",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#3b82f6";
            e.target.style.color = "#ffffff";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#2d2d2d";
            e.target.style.color = "#e0e0e0";
          }}
        >
          <FaArrowLeft /> Back to Classes
        </button>
        <h2 className="class-heading-unique" style={{ margin: 0 }}>{classInfo.name}</h2>
      </div>
      <div className="info-card">
        <p>
          <strong>Description:</strong>{" "}
          {classInfo.description || "No description provided"}
        </p>
        <p>
          <strong>Code:</strong> {classInfo.code}
        </p>
      </div>

      <div className="tabs-container">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "Projects" && <FaFile />}
            {tab === "Announcements" && <FaBullhorn />}
            {tab === "Students" && <FaUsers />}
            {tab === "Groups" && <FaUsers />}
            {tab === "Files" && <FaFile />}
            {tab === "Chat" && <FaComments />}
            <span>{tab}</span>
          </button>
        ))}
      </div>

      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ViewClass;
