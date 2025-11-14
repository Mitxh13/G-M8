import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "", isTeacher: false, srn: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser(form.email, form.password);
      login(data.token, data);
      toast.success("Login successful!");
      navigate("/home");
    } catch (err) {
      toast.error(err.message || "Login failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="brand-title">GroupMate(G-M8)</h1>
        <h2 className="page-title">Log in</h2>

        <div className="role-toggle">
          <button
            type="button"
            className={`role-btn ${form.isTeacher ? 'active' : ''}`}
            onClick={() => setForm({ ...form, isTeacher: true })}
          >
            🧑‍🏫 I’m a Teacher
          </button>
          <button
            type="button"
            className={`role-btn ${!form.isTeacher ? 'active' : ''}`}
            onClick={() => setForm({ ...form, isTeacher: false })}
          >
            🎓 I’m a Student
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            placeholder="your@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          {!form.isTeacher && (
            <>
              <label>SRN</label>
              <input
                type="text"
                placeholder="Enter SRN"
                value={form.srn}
                onChange={(e) => setForm({ ...form, srn: e.target.value })}
                required
              />
            </>
          )}

          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          <button type="submit">Log in</button>
        </form>

        <p className="dead-text">
          Didn’t have an account? <Link to="/signup">Create a new one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
