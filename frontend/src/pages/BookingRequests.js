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
      fetchRequests(); // Refresh data without reloading page
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
      console.error("Error starting chat:", err);
      alert(err.response?.data?.message || "Unable to start chat");
    }
  };

  if (loading)
    return (
      <div className="property-container">
        <p>Loading requests...</p>
      </div>
    );

  return (
    <div className="property-container">
      <h2 className="section-title">Incoming Property Requests</h2>
      {requests.length === 0 ? (
        <p className="empty-state">No booking requests received yet.</p>
      ) : (
        <div className="booking-grid">
          {requests.map((r) => (
            <div key={r._id} className="booking-card">
              <div className="booking-card-header">
                <div>
                  <h3 className="property-title">
                    {r.property?.title || "Deleted Property"}
                  </h3>
                  <p className="property-loc">📍 {r.property?.location}</p>
                </div>
                <span className={`status-tag status-${r.status}`}>
                  {r.status}
                </span>
              </div>

              <div className="booking-card-body">
                <div className="detail-row">
                  <span>
                    👤 <b>Tenant:</b>
                  </span>
                  <span>{r.tenant?.name}</span>
                </div>
                {r.tenant?._id && (
                  <button
                    type="button"
                    className="btn-view-details"
                    onClick={() => navigate(`/users/${r.tenant._id}`)}
                  >
                    Tenant Details
                  </button>
                )}
                <button
                  type="button"
                  className="btn-view-details"
                  onClick={() => handleChatWithTenant(r)}
                >
                  Chat with Tenant
                </button>
                <div className="detail-row">
                  <span>
                    📧 <b>Email:</b>
                  </span>
                  <span>{r.tenant?.email}</span>
                </div>
                <div className="detail-row">
                  <span>
                    📅 <b>Move-in:</b>
                  </span>
                  <span>{new Date(r.startDate).toLocaleDateString()}</span>
                </div>
                <div className="detail-row">
                  <span>
                    ⏳ <b>Duration:</b>
                  </span>
                  <span>
                    {r.duration} {r.durationType}
                  </span>
                </div>
                <div className="detail-row">
                  <span>
                    💰 <b>Rent:</b>
                  </span>
                  <span>₹{r.monthlyRent} /mo</span>
                </div>
              </div>

              {r.status === "pending" && (
                <div className="booking-actions">
                  <button
                    className="btn-accept"
                    onClick={() => handleAction(r._id, "accept")}
                  >
                    Accept
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => handleAction(r._id, "reject")}
                  >
                    Reject
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
