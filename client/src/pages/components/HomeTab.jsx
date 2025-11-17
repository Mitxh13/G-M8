import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { fetchTeacherClasses, fetchStudentClasses } from "../../api";
import { FaRegCopy } from "react-icons/fa";

const HomeTab = ({ setActiveTab, setSelectedClassId }) => {
  const { user, token, rolePreference } = useContext(AuthContext);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Determine which role to use based on rolePreference
  const isTeacherMode = rolePreference !== null ? rolePreference : user?.isTeacher;

  const loadClasses = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = isTeacherMode
        ? await fetchTeacherClasses(token)
        : await fetchStudentClasses(token);

      const normalizedData = data.map((cls) => ({
        _id: cls._id || cls.id,
        name: cls.name || cls.title || "Unnamed Class",
        code: cls.code || "No Code",
        description: cls.description || "No description provided",
      }));

      setClasses(normalizedData);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Class code copied!");
    } catch {
      toast.error("Failed to copy code.");
    }
  };

  useEffect(() => {
    loadClasses();
  }, [user]);

  if (!user) return <p className="center-text">Loading user info...</p>;

  return (
    <div className="home-tab">
      <div className="home-greeting">
        <h1 className="gradient-text">Hi, {user.name} 👋</h1>
      </div>

      <div className="home-content">
        <h2 className="class-heading-unique">
          {isTeacherMode
            ? "Classes You Have Created"
            : "Classes You Are Enrolled In"}
        </h2>

        {loading ? (
          <div className="center-text">
            <p className="loading-text">Loading your classes...</p>
          </div>
        ) : classes.length === 0 ? (
          <div className="center-text">
            <p className="no-classes">
              {isTeacherMode
                ? "You haven't created any classes yet."
                : "You are not enrolled in any classes yet."}
            </p>
          </div>
        ) : (
          <div className="class-grid">
            {classes.map((cls) => (
              <div
                key={cls._id}
                className={`class-card ${isTeacherMode ? "teacher-card" : "student-card"}`}
                onClick={() => {
                  setSelectedClassId(cls._id);
                  if (isTeacherMode) {
                    setActiveTab("View Class");
                  } else {
                    setActiveTab("My Classes");
                  }
                }}
              >
                <div className="class-header">
                  <span className="class-name">{cls.name}</span>
                  {isTeacherMode && (
                    <div className="class-code-container">
                      <span className="class-code-text">{cls.code}</span>
                      <FaRegCopy
                        className="copy-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyCode(cls.code);
                        }}
                      />
                    </div>
                  )}
                </div>
                <p className="class-desc">{cls.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeTab;
