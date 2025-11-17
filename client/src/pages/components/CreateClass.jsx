import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { createClass } from "../../api";
import { toast } from "react-toastify";
import {FaPlusCircle} from  "react-icons/fa";

const CreateClass = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    code: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, description, code } = formData;
    if (!name || !code) return toast.error("Name and code are required.");
    try {
      setLoading(true);
      await createClass(token, { name, description, code });
      toast.success("Class created successfully!");
      setFormData({ name: "", description: "", code: "" });
      navigate("/home");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-class-tab">
      <FaPlusCircle 
        size={25}
      />
      <h2 className="class-heading">Create a New Class</h2>

      <div className="create-class-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Class Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter class name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="Enter class description (optional)"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="code">Class Code</label>
            <input
              type="text"
              id="code"
              name="code"
              placeholder="Enter unique class code"
              value={formData.code}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="create-btn" disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateClass;
