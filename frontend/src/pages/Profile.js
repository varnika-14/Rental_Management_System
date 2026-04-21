import React, { useState, useEffect } from "react";
import API from "../services/api";
import "../styles/profile.css";

function Profile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State for the Big Image Modal
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/auth/profile");
      setUser(res.data);
      setFormData(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching profile", err);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    // All editable fields from your User Model
    const editableFields = [
      "name",
      "age",
      "permanentAddress",
      "emergencyContact",
      "qualification",
      "occupation",
      "salary",
      "govtIdNumber",
      "upiId",
      "bankDetails",
    ];

    try {
      setSaving(true);
      const payload = {};
      editableFields.forEach((field) => {
        payload[field] = formData[field] ?? "";
      });

      const res = await API.put("/auth/profile/update", payload);

      // 1. Update Profile UI
      setUser(res.data);
      setFormData(res.data);

      // 2. Sync Dashboard Name: Update the name in localStorage
      const localAuth = JSON.parse(localStorage.getItem("user"));
      if (localAuth) {
        const updatedAuth = { ...localAuth, name: res.data.name };
        localStorage.setItem("user", JSON.stringify(updatedAuth));
      }

      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
      alert(err.response?.data || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Loading Profile Details...</div>;

  return (
    <div className="profile-container">
      {/* --- IMAGE MODAL (Opens Bigly in same tab) --- */}
      {showModal && (
        <div
          className="image-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div className="modal-content">
            <span className="close-modal">&times;</span>
            <img
              src={user?.govtIdPhoto}
              alt="Full ID View"
              className="full-res-img"
            />
          </div>
        </div>
      )}

      <div className="profile-card">
        {/* --- Header Section --- */}
        <div className="profile-header">
          <img
            src={user?.profilePhoto || "https://via.placeholder.com/150"}
            alt="Profile"
            className="profile-pic-large"
          />
          <h2>{user?.name}</h2>
          <p className="profile-email">{user?.email}</p>
          <div className="badge-row">
            <span className="role-badge">{user?.role}</span>
          </div>
        </div>

        {/* --- Form Section (All fields automatically editable) --- */}
        <form onSubmit={handleUpdate} className="profile-grid">
          <div className="info-group">
            <label>Full Name</label>
            <input
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              placeholder="Enter full name"
            />
          </div>

          <div className="info-group">
            <label>Email Address (Immutable)</label>
            <input
              name="email"
              value={user?.email || ""}
              disabled
              className="readonly-input"
            />
          </div>

          <div className="info-group">
            <label>Occupation</label>
            <input
              name="occupation"
              value={formData.occupation || ""}
              onChange={handleChange}
              placeholder="Your job title"
            />
          </div>

          <div className="info-group">
            <label>Monthly Salary</label>
            <input
              name="salary"
              type="number"
              value={formData.salary || ""}
              onChange={handleChange}
              placeholder="Enter amount"
            />
          </div>

          <div className="info-group">
            <label>Age</label>
            <input
              name="age"
              type="number"
              value={formData.age || ""}
              onChange={handleChange}
              placeholder="Years"
            />
          </div>

          <div className="info-group">
            <label>Highest Qualification</label>
            <input
              name="qualification"
              value={formData.qualification || ""}
              onChange={handleChange}
              placeholder="e.g. Bachelor's Degree"
            />
          </div>

          <div className="info-group">
            <label>Govt ID Number</label>
            <input
              name="govtIdNumber"
              value={formData.govtIdNumber || ""}
              onChange={handleChange}
              placeholder="Aadhar / PAN / SSN"
            />
          </div>

          <div className="info-group">
            <label>UPI ID</label>
            <input
              name="upiId"
              value={formData.upiId || ""}
              onChange={handleChange}
              placeholder="example@upi"
            />
          </div>

          <div className="info-group full-width">
            <label>Bank Account Details</label>
            <textarea
              name="bankDetails"
              value={formData.bankDetails || ""}
              onChange={handleChange}
              placeholder="Bank Name, A/C No, IFSC/Swift Code"
            />
          </div>

          {/* --- Govt ID Display --- */}
          <div className="info-group full-width">
            <label>Verified Government ID Document</label>
            <div
              className="id-photo-preview"
              onClick={() => setShowModal(true)}
            >
              {user?.govtIdPhoto ? (
                <img
                  src={user.govtIdPhoto}
                  alt="Govt ID Preview"
                  className="id-img"
                />
              ) : (
                <p className="no-photo-text">No image uploaded</p>
              )}
            </div>
            <p className="help-text">Click image above to view bigly</p>
          </div>
          <div className="info-group">
            <label>Emergency Contact No</label>
            <input
              name="emergencyContact"
              value={formData.emergencyContact || ""}
              onChange={handleChange}
              placeholder="Emergency Phone Number"
            />
          </div>

          {/* Add Permanent Address as a Full Width Textarea */}
          <div className="info-group full-width">
            <label>Permanent Address</label>
            <textarea
              name="permanentAddress"
              value={formData.permanentAddress || ""}
              onChange={handleChange}
              placeholder="Enter your full permanent address"
            />
          </div>
          {/* --- Save Button --- */}
          <div className="profile-actions">
            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? "Saving Changes..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
