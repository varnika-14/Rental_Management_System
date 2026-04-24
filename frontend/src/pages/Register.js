import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import API from "../services/api";
import "../styles/auth.css";

function Register() {
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const initialRole = location.state?.role || "tenant";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: initialRole,
    otp: "",
    age: "",
    qualification: "",
    occupation: "",
    salary: "",
    permanentAddress: "",
    emergencyContact: "",
    govtIdNumber: "",
    upiId: "",
    bankDetails: "",
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [govtIdPhoto, setGovtIdPhoto] = useState(null);

  useEffect(() => {
    if (location.state?.role) {
      setForm((prev) => ({ ...prev, role: location.state.role }));
    }
  }, [location.state]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    if (e.target.name === "profilePhoto") setProfilePhoto(e.target.files[0]);
    if (e.target.name === "govtIdPhoto") setGovtIdPhoto(e.target.files[0]);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/send-otp", { email: form.email });
      alert(`OTP sent! You are registering as a ${form.role}`);
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/verify-otp", { email: form.email, otp: form.otp });
      alert("Email verified. Please complete your profile.");
      setStep(3);
    } catch (err) {
      alert("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();

    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    if (profilePhoto) formData.append("profilePhoto", profilePhoto);
    if (govtIdPhoto) formData.append("govtIdPhoto", govtIdPhoto);

    try {
      const res = await API.post("/auth/register", formData);

      alert("Registration Successful!");
      navigate("/login");
    } catch (err) {
      console.error("Full Error Object:", err);
      alert(
        err.response?.data || "Registration failed. Check console for details.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className={`auth-container ${step === 3 ? "extended-auth" : ""}`}>
        <h2 style={{ textTransform: "capitalize" }}>Register as {form.role}</h2>

        {step === 1 && (
          <form onSubmit={handleSendOTP} className="auth-form">
            <p>Step 1: Email Verification</p>
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
            />
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="auth-form">
            <p>Step 2: Enter Verification Code</p>
            <input
              name="otp"
              placeholder="6-digit OTP"
              value={form.otp}
              onChange={handleChange}
              required
            />
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleFinalSubmit} className="registration-grid">
            <div className="form-section">
              <h4>Personal</h4>
              <label className="file-label">Profile Photo</label>
              <input
                type="file"
                name="profilePhoto"
                onChange={handleFileChange}
                required
              />
              <input
                name="name"
                placeholder="Full Name"
                onChange={handleChange}
                required
              />
              <input
                name="age"
                type="number"
                placeholder="Age"
                onChange={handleChange}
                required
              />
              <input
                name="phonenumber"
                type="text"
                placeholder="Phone Number"
                value={form.phonenumber}
                onChange={handleChange}
                required
              />

              <input
                name="emergencyContact"
                placeholder="Emergency Contact No"
                onChange={handleChange}
                required
              />
              <textarea
                name="permanentAddress"
                placeholder="Permanent Address"
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-section">
              <h4>Professional</h4>
              <input
                name="qualification"
                placeholder="Qualification"
                onChange={handleChange}
                required
              />
              <input
                name="occupation"
                placeholder="Occupation"
                onChange={handleChange}
                required
              />
              <input
                name="salary"
                type="number"
                placeholder="Monthly Salary"
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-section">
              <h4>Identity</h4>
              <input
                name="govtIdNumber"
                placeholder="Aadhar / PAN Number"
                onChange={handleChange}
                required
              />
              <label className="file-label">Upload ID Photo</label>
              <input
                type="file"
                name="govtIdPhoto"
                onChange={handleFileChange}
                required
              />
            </div>

            <div className="form-section">
              <h4>Payments</h4>
              <input
                name="upiId"
                placeholder="UPI ID (e.g. user@okaxis)"
                onChange={handleChange}
                required
              />
              <textarea
                name="bankDetails"
                placeholder="Bank Name, A/C No, IFSC"
                onChange={handleChange}
                required
              />
              <h4>Set Password</h4>
              <input
                name="password"
                type="password"
                placeholder="Create Password"
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="submit-btn-full"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register Successfully"}
            </button>
          </form>
        )}

        <div className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
