import React, { useState } from "react";
import API from "../services/api";
import "../styles/auth.css";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      alert("Login Successful");
      navigate("/dashboard");
    } catch (err) {
      const msg = typeof err.response?.data === "string" ? err.response.data : (err.response?.data?.message || "Invalid credentials");
      alert(msg);
    }
  };

  return (
    <div className="auth-page">
    <div className="auth-container">
      <h2>Welcome Back</h2>
      <form onSubmit={handleSubmit}>
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
        <button type="submit">Login</button>
      </form>

      <div className="auth-link">
        New user? <Link to="/register">Register</Link>
      </div>
    </div>
    </div>
  );
}

export default Login;
