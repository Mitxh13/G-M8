import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";

const JoinClass = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e) => {
    e.preventDefault();

    if (!code.trim()) {
      toast.error("Please enter a class code");
      return;
    }

    try {
      setLoading(true);

      // 👇 Direct call to your backend port (5050)
      const res = await axios.post(
        "http://localhost:5050/api/class/join",
        { code },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(res.data.message || "Joined class successfully!");
      setCode("");
      navigate("/home");
    } catch (err) {
      console.error("Join class error:", err);
      toast.error(
        err.response?.data?.message || "Failed to join class. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-content">
      <h2>Join Class</h2>
      <form onSubmit={handleJoin}>
        <input
          type="text"
          placeholder="Enter Class Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          size={15}
          required
        />
        <button type="submit" className="create-btn" disabled={loading}>
          {loading ? "Joining..." : "Join"}
        </button>
      </form>
    </div>
  );
};

export default JoinClass;
