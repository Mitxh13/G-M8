import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  fetchStudentClasses,
  fetchTeacherClasses,
  getClassById,
  createGroup,
  lookupUsersBySrns,
} from "../../api";
import { toast } from "react-toastify";

const CreateGroup = () => {
  const { user, token, rolePreference } = useContext(AuthContext);
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  const [groupName, setGroupName] = useState("");
  const [selectedClassId, setSelectedClassId] = useState(""); // empty means no class
  const [submitting, setSubmitting] = useState(false);
  const [srnInput, setSrnInput] = useState("");

  const isTeacherMode = rolePreference !== null ? rolePreference : user?.isTeacher;

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoadingClasses(true);
      try {
        const data = isTeacherMode
          ? await fetchTeacherClasses(token)
          : await fetchStudentClasses(token);
        setClasses(data || []);
      } catch (err) {
        toast.error(err.message || "Failed to load classes");
      } finally {
        setLoadingClasses(false);
      }
    };
    load();
  }, [user, token, isTeacherMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return toast.error("Please enter a group name");
    setSubmitting(true);
    try {
      // parse SRN input
      const raw = srnInput || "";
      const parsed = raw
        .split(/[,\n\s]+/)
        .map((s) => s.trim())
        .filter(Boolean);

      let members = [];
      if (parsed.length > 0) {
        // lookup SRNs via API
        const users = await lookupUsersBySrns(token, parsed);
        const foundSrns = users.map((u) => u.srn);
        const notFound = parsed.filter((s) => !foundSrns.includes(s));
        if (notFound.length > 0) {
          toast.warn(`SRNs not found and will be skipped: ${notFound.join(", ")}`);
        }
        members = users.map((u) => u._id);
      }

      const classId = selectedClassId || null;
      await createGroup(token, { name: groupName.trim(), classId, members });
      toast.success("Group created successfully!");
      // reset
      setGroupName("");
      setSelectedClassId("");
      setSrnInput("");
    } catch (err) {
      toast.error(err.message || "Failed to create group");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-group-tab">
      <h2 className="class-heading">Create a Group</h2>
      <div className="create-class-card" style={{ maxWidth: 720 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Group Name</label>
            <input
              type="text"
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Associate with Class (optional)</label>
            {loadingClasses ? (
              <p className="dim-text">Loading classes...</p>
            ) : (
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="class-dropdown"
              >
                <option value="">-- No class (create standalone group) --</option>
                {classes.map((c) => (
                  <option key={c._id || c.id} value={c._id || c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group">
            <label>Add Members by SRN</label>
            <p className="dim-text">Enter SRNs of students to add (comma or newline separated). Leader will be added automatically.</p>

            <textarea
              placeholder="e.g. PES2UG24AM001, PES2UG24AM002"
              value={srnInput}
              onChange={(e) => setSrnInput(e.target.value)}
              rows={5}
              style={{ width: '100%', padding: 8 }}
            />
          </div>

          <button type="submit" className="create-btn" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Group'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateGroup;
