import React, { useEffect, useState } from "react";
import API from "../services/api";
import "../styles/booking.css";
import { useNavigate } from "react-router-dom";
import { startConversation } from "../services/chatApi";

function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    try {
      const res = await API.get("/booking/my-bookings");
      setBookings(res.data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChatWithOwner = async (booking) => {
    try {
      if (
        !booking?.property?._id ||
        !booking?.owner?._id ||
        !currentUser?._id
      ) {
        return alert("Missing data to start chat");
      }
      const res = await startConversation({
        propertyId: booking.property._id,
        ownerId: booking.owner._id,
        tenantId: currentUser._id,
      });
      navigate(`/chats?conversation=${res.data._id}`);
    } catch (err) {
      console.error("Error starting chat:", err);
      alert(err.response?.data?.message || "Unable to start chat");
    }
  };

  const handleCancel = async (id, status) => {
    const message =
      status === "accepted"
        ? "This booking is already accepted. Cancelling will release the property for others. Are you sure?"
        : "Are you sure you want to cancel this request?";

    if (window.confirm(message)) {
      try {
        await API.patch(`/booking/${id}/cancel`);
        alert(
          "Booking cancelled successfully. The property is now available for others.",
        );
        fetchMyBookings();
      } catch (err) {
        alert(err.response?.data?.message || "Cancellation failed");
      }
    }
  };

  if (loading)
    return (
      <div className="property-container">
        <p>Loading your bookings...</p>
      </div>
    );

  return (
    <div className="property-container">
      <h2 className="section-title">My Rental Applications</h2>
      {bookings.length === 0 ? (
        <p className="empty-state">
          You haven't made any booking requests yet.
        </p>
      ) : (
        <div className="booking-grid">
          {bookings.map((b) => (
            <div key={b._id} className="booking-card">
              <div className="booking-card-header">
                <div>
                  <h3 className="property-title">
                    {b.property?.title || "Property Details Unavailable"}
                  </h3>
                  <p className="property-loc">📍 {b.property?.location}</p>
                </div>
                <span className={`status-tag status-${b.status}`}>
                  {b.status}
                </span>
              </div>

              <div className="booking-card-body">
                <div className="detail-row">
                  <span>
                    🔑 <b>Owner:</b>
                  </span>
                  <span>{b.owner?.name}</span>
                </div>
                {b.owner?._id && (
                  <button
                    type="button"
                    className="btn-view-details"
                    onClick={() => navigate(`/users/${b.owner._id}`)}
                  >
                    Owner Details
                  </button>
                )}
                <div className="detail-row">
                  <span>
                    📧 <b>Contact:</b>
                  </span>
                  <span>{b.owner?.email}</span>
                </div>
                <div className="detail-row">
                  <span>
                    📅 <b>Start Date:</b>
                  </span>
                  <span>{new Date(b.startDate).toLocaleDateString()}</span>
                </div>
                <div className="detail-row">
                  <span>
                    ⏳ <b>Stay Period:</b>
                  </span>
                  <span>
                    {b.duration} {b.durationType}
                  </span>
                </div>
                <div className="detail-row">
                  <span>
                    💳 <b>Total Commitment:</b>
                  </span>
                  <span className="total-price">
                    ₹{b.totalRent || b.monthlyRent * b.duration}
                  </span>
                </div>

                {b.status === "rejected" && b.rejectionReason && (
                  <div className="rejection-box">
                    <b>Reason:</b> {b.rejectionReason}
                  </div>
                )}

                <button
                  type="button"
                  className="btn-view-details"
                  onClick={() => handleChatWithOwner(b)}
                >
                  Chat with Owner
                </button>

                {b.status === "accepted" && (
                  <div className="success-box">
                    🎉 Your request was accepted! You can now coordinate move-in
                    details with the owner.
                  </div>
                )}
              </div>

              {(b.status === "pending" || b.status === "accepted") && (
                <button
                  className={
                    b.status === "accepted" ? "btn-cancel-danger" : "btn-cancel"
                  }
                  onClick={() => handleCancel(b._id, b.status)}
                >
                  {b.status === "accepted"
                    ? "Cancel Accepted Booking"
                    : "Cancel Request"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookings;
