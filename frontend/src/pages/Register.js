import React, { useState } from "react";
import API from "../services/api";
import "../styles/auth.css";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "tenant",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value.trim() });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/register", form);
      alert(res.data);
      navigate("/login");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (typeof err.response?.data === "string"
          ? err.response.data
          : "Registration failed");
      alert(msg);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />

          <select name="role" onChange={handleChange}>
            <option value="tenant">Tenant</option>
            <option value="owner">Owner</option>
          </select>

          <button type="submit">Register</button>
        </form>

        <div className="auth-link">
          Already have account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
