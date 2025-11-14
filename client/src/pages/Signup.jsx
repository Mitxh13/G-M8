import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    isTeacher: false,
    srn: '',
  });


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      isTeacher: form.isTeacher,
      srn: form.isTeacher ? undefined : form.srn,
    };

    try {
      const data = await registerUser(payload);
      login(data.token, data);
      toast.success('Signup successful!');
      navigate('/home');
    } catch (err) {
      toast.error(err.message || 'Signup failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="brand-title">GroupMate(G-M8)</h1>
        <h2 className="page-title">Sign Up</h2>

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
          />

          <label>Name</label>
          <input
            type="text"
            placeholder="Your name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
          />



          {!form.isTeacher && (
            <>
              <label>SRN</label>
              <input
                type="text"
                placeholder="Enter SRN"
                value={form.srn}
                onChange={(e) => setForm({ ...form, srn: e.target.value })}
              />
            </>
          )}

          <button type="submit">Sign Up</button>
        </form>

        <p className="dead-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
