import React, { useState } from "react";
import API from "../services/api";
import "../styles/auth.css";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  // Single loading state to handle all button transitions
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Info, 2: OTP, 3: Password

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "tenant",
    otp: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // STEP 1: Send OTP
  const handleSendOTP = async () => {
    if (!form.email || !form.name) {
      return alert("Please fill in your name and email");
    }
    setLoading(true);
    try {
      await API.post("/auth/send-otp", { email: form.email });
      alert("OTP sent to your email!");
      setStep(2);
    } catch (err) {
      alert(err.response?.data || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOTP = async () => {
    if (!form.otp) return alert("Please enter the OTP");
    setLoading(true);
    try {
      await API.post("/auth/verify-otp", { email: form.email, otp: form.otp });
      alert("Email Verified!");
      setStep(3);
    } catch (err) {
      alert(err.response?.data || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Final Register
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/auth/register", form);
      alert(res.data);
      navigate("/login");
    } catch (err) {
      alert(err.response?.data || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>
          {step === 1 && "Create Account"}
          {step === 2 && "Verify Email"}
          {step === 3 && "Set Password"}
        </h2>

        {/* STEP 1: User Details */}
        {step === 1 && (
          <div className="form-step">
            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <button onClick={handleSendOTP} disabled={loading}>
              {loading ? "Sending OTP..." : "Send Verification OTP"}
            </button>
          </div>
        )}

        {/* STEP 2: OTP Verification */}
        {step === 2 && (
          <div className="form-step">
            <p className="step-instruction">
              Enter the 6-digit code sent to <br />
              <strong>{form.email}</strong>
            </p>
            <input
              name="otp"
              placeholder="Enter OTP"
              value={form.otp}
              onChange={handleChange}
              maxLength="6"
              required
            />
            <button onClick={handleVerifyOTP} disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              className="text-button"
              onClick={() => setStep(1)}
              disabled={loading}
            >
              Change Email
            </button>
          </div>
        )}

        {/* STEP 3: Password & Role */}
        {step === 3 && (
          <form onSubmit={handleFinalSubmit}>
            <input
              name="password"
              type="password"
              placeholder="Enter Password"
              onChange={handleChange}
              required
            />
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="tenant">Tenant</option>
              <option value="owner">Owner</option>
            </select>
            <button type="submit" disabled={loading}>
              {loading ? "Creating Account..." : "Complete Registration"}
            </button>
          </form>
        )}

        <div className="auth-link">
          Already have account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
