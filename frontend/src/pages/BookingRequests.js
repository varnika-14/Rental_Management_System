import React, { useState, useEffect } from "react";
import API from "../services/api";
import "../styles/booking.css";
import { useNavigate } from "react-router-dom";
import { startConversation } from "../services/chatApi";

function BookingRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await API.get("/booking/requests");
      setRequests(res.data);
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await API.patch(`/booking/${id}/${action}`);
      alert(`Booking ${action}ed successfully`);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    }
  };

  const handleChatWithTenant = async (requestItem) => {
    try {
      if (
        !requestItem?.property?._id ||
        !requestItem?.tenant?._id ||
        !currentUser?._id
      ) {
        return alert("Missing data to start chat");
      }
      const res = await startConversation({
        propertyId: requestItem.property._id,
        ownerId: currentUser._id,
        tenantId: requestItem.tenant._id,
      });
      navigate(`/chats?conversation=${res.data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Unable to start chat");
    }
  };

  if (loading)
    return <div className="loading-container">Fetching Requests...</div>;

  return (
    <div className="booking-page-container">
      <div className="page-header">
        <h2 className="page-title">Incoming Requests</h2>
        <p className="page-subtitle">
          Review and manage tenant booking inquiries for your properties.
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="empty-state">
          <span>📩</span>
          <p>No booking requests received yet.</p>
        </div>
      ) : (
        <div className="booking-grid">
          {requests.map((r) => (
            <div key={r._id} className="request-card">
              <div className="request-header">
                <span className={`status-badge ${r.status}`}>{r.status}</span>
                <h3 className="property-name">
                  {r.property?.title || "Unknown Property"}
                </h3>
                <p className="property-address">📍 {r.property?.location}</p>
              </div>

              <div className="request-content">
                <div className="tenant-info">
                  <div className="avatar-placeholder">
                    {r.tenant?.name?.charAt(0)}
                  </div>
                  <div className="tenant-meta">
                    <strong>{r.tenant?.name}</strong>
                    <div className="tenant-actions">
                      <button
                        onClick={() => navigate(`/users/${r.tenant._id}`)}
                      >
                        Profile
                      </button>
                      <button onClick={() => handleChatWithTenant(r)}>
                        Message
                      </button>
                    </div>
                  </div>
                </div>

                <hr className="divider" />

                <div className="details-list">
                  <div className="detail-item">
                    <span className="label">Move-in Date</span>
                    <span className="value">
                      {new Date(r.startDate).toLocaleDateString("en-GB")}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Stay Duration</span>
                    <span className="value">
                      {r.duration} {r.durationType}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Monthly Rent</span>
                    <span className="value accent">
                      ₹{r.monthlyRent.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {r.status === "pending" && (
                <div className="request-footer">
                  <button
                    className="btn-secondary reject"
                    onClick={() => handleAction(r._id, "reject")}
                  >
                    Reject
                  </button>
                  <button
                    className="btn-primary accept"
                    onClick={() => handleAction(r._id, "accept")}
                  >
                    Accept Request
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BookingRequests;
