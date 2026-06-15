import React, { useEffect, useState } from "react";
import API from "../services/api";
import "../styles/booking.css";
import "../styles/payment.css";
import { useNavigate } from "react-router-dom";
import { startConversation } from "../services/chatApi";
import PaymentButton from "../components/PaymentButton";
import {
  getPaymentStatusLabel,
  getRemainingRent,
  getTotalRent,
} from "../utils/rentUtils";

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
      alert(err.response?.data?.message || "Unable to start chat");
    }
  };

  const handleCancel = async (id, status) => {
    const message =
      status === "accepted"
        ? "This booking is already accepted. Are you sure you want to cancel?"
        : "Are you sure you want to withdraw this request?";

    if (window.confirm(message)) {
      try {
        await API.patch(`/booking/${id}/cancel`);
        alert("Booking cancelled successfully.");
        fetchMyBookings();
      } catch (err) {
        alert(err.response?.data?.message || "Cancellation failed");
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">Loading your applications...</div>
    );
  }

  return (
    <div className="booking-page-container">
      <div className="page-header">
        <h2 className="page-title">My Rental Applications</h2>
        <p className="page-subtitle">
          Track the status of your booking requests and coordinate with owners.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <span>🏠</span>
          <p>You haven't made any booking requests yet.</p>
          <button
            className="btn-primary"
            onClick={() => navigate("/properties")}
            style={{ width: "auto", marginTop: "1rem" }}
          >
            Browse Properties
          </button>
        </div>
      ) : (
        <div className="booking-grid">
          {bookings.map((b) => {
            const totalRent = getTotalRent(b);
            const remaining = getRemainingRent({ ...b, totalRent });

            return (
              <div key={b._id} className="request-card">
                <div className="request-header">
                  <span className={`status-badge ${b.status}`}>{b.status}</span>
                  <h3 className="property-name">
                    {b.property?.title || "Property Unavailable"}
                  </h3>
                  <p className="property-address">{b.property?.location}</p>
                </div>

                <div className="request-content">
                  <div className="tenant-info">
                    <div
                      className="avatar-placeholder"
                      style={{ background: "#10b981" }}
                    >
                      {b.owner?.name?.charAt(0)}
                    </div>
                    <div className="tenant-meta">
                      <strong>{b.owner?.name} (Owner)</strong>
                      <div className="tenant-actions">
                        <button
                          onClick={() => navigate(`/users/${b.owner?._id}`)}
                        >
                          View Profile
                        </button>
                        <button onClick={() => handleChatWithOwner(b)}>
                          Send Message
                        </button>
                      </div>
                    </div>
                  </div>

                  <hr className="divider" />

                  <div className="details-list">
                    <div className="detail-item">
                      <span className="label">Move-in Date</span>
                      <span className="value">
                        {new Date(b.startDate).toLocaleDateString("en-GB")}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Duration</span>
                      <span className="value">
                        {b.duration} {b.durationType}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Total Commitment</span>
                      <span className="value accent">
                        ₹{totalRent.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {b.status === "rejected" && b.rejectionReason && (
                    <div className="rejection-box" style={{ marginTop: "1rem" }}>
                      <strong>Reason:</strong> {b.rejectionReason}
                    </div>
                  )}

                  {b.status === "accepted" && (
                    <>
                      <div className="success-box" style={{ marginTop: "1rem" }}>
                        Accepted! You can now pay rent and coordinate move-in via
                        chat.
                      </div>

                      <div className="payment-status-box">
                        <div className="payment-status-info">
                          <span className="payment-status-label">
                            Payment Status
                          </span>
                          <span
                            className={`payment-status-value ${b.paymentStatus}`}
                          >
                            {getPaymentStatusLabel(b.paymentStatus)}
                          </span>
                          {b.paidAmount > 0 && (
                            <small>
                              Paid: ₹{b.paidAmount.toLocaleString()} | Remaining: ₹
                              {remaining.toLocaleString()}
                            </small>
                          )}
                        </div>
                        <PaymentButton booking={{ ...b, totalRent }} />
                      </div>
                    </>
                  )}
                </div>

                {(b.status === "pending" || b.status === "accepted") && (
                  <div className="request-footer">
                    <button
                      className={`btn-secondary ${b.status === "accepted" ? "reject" : ""}`}
                      onClick={() => handleCancel(b._id, b.status)}
                    >
                      {b.status === "accepted"
                        ? "Cancel Booking"
                        : "Withdraw Request"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyBookings;
