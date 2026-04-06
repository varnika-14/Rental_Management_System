import React, { useEffect, useState } from "react";
import API from "../services/api";
import "../styles/booking.css";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleCancel = async (id) => {
    if (window.confirm("Are you sure you want to cancel this request?")) {
      try {
        await API.patch(`/booking/${id}/cancel`);
        alert("Booking cancelled successfully");
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
                  <h3 className="property-title">{b.property?.title}</h3>
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
              </div>

              {b.status === "pending" && (
                <button
                  className="btn-cancel"
                  onClick={() => handleCancel(b._id)}
                >
                  Cancel Request
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
