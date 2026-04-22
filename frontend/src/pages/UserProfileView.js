import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import "../styles/profile.css";

function UserProfileView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await API.get(`/auth/profile/${id}`);
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user details:", err);
        alert("Unable to load user profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id]);

  if (loading) return <div className="loading">Loading Profile Details...</div>;
  if (!user) return <div className="loading">User profile not found.</div>;

  return (
    <div className="profile-container">
      {showModal && (
        <div className="image-modal-overlay" onClick={() => setShowModal(false)}>
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
        <button
          type="button"
          className="profile-back-button"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

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

        <div className="profile-grid">
          <div className="info-group">
            <label>Phone Number</label>
            <input value={user?.phonenumber || "Not provided"} readOnly />
          </div>
          <div className="info-group">
            <label>Age</label>
            <input value={user?.age || "Not provided"} readOnly />
          </div>
          <div className="info-group">
            <label>Occupation</label>
            <input value={user?.occupation || "Not provided"} readOnly />
          </div>
          <div className="info-group">
            <label>Monthly Salary</label>
            <input value={user?.salary || "Not provided"} readOnly />
          </div>
          <div className="info-group">
            <label>Highest Qualification</label>
            <input value={user?.qualification || "Not provided"} readOnly />
          </div>
          <div className="info-group">
            <label>Govt ID Number</label>
            <input value={user?.govtIdNumber || "Not provided"} readOnly />
          </div>
          <div className="info-group">
            <label>UPI ID</label>
            <input value={user?.upiId || "Not provided"} readOnly />
          </div>
          <div className="info-group">
            <label>Emergency Contact No</label>
            <input value={user?.emergencyContact || "Not provided"} readOnly />
          </div>
          <div className="info-group full-width">
            <label>Bank Account Details</label>
            <textarea value={user?.bankDetails || "Not provided"} readOnly />
          </div>
          <div className="info-group full-width">
            <label>Permanent Address</label>
            <textarea value={user?.permanentAddress || "Not provided"} readOnly />
          </div>
          <div className="info-group full-width">
            <label>Verified Government ID Document</label>
            <div className="id-photo-preview" onClick={() => setShowModal(true)}>
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
            <p className="help-text">Click image above to view bigger</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfileView;
