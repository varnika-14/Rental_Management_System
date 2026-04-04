import React, { useEffect, useState } from "react";
import API from "../services/api";
import "../styles/booking.css";

function MyBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    API.get("/booking/my-bookings").then((res) => setBookings(res.data));
  }, []);
  const handleCancel = async (id) => {
    if (window.confirm("Are you sure you want to cancel this request?")) {
      try {
        // Use PATCH to match your backend route
        await API.patch(`/booking/${id}/cancel`, {
          cancellationReason: "User changed mind",
        });
        alert("Booking cancelled successfully");
        window.location.reload(); // Refresh to show updated status
      } catch (err) {
        alert(err.response?.data?.message || "Cancellation failed");
      }
    }
  };

  return (
    <div className="property-container">
      <h2 className="section-title">My Rental Requests</h2>
      <div className="booking-grid">
        {bookings.map((b) => (
          <div key={b._id} className="booking-card">
            <div className="booking-card-header">
              <h3>{b.property?.title}</h3>
              <span className={`status-tag status-${b.status}`}>
                {b.status}
              </span>
            </div>
            <div className="booking-card-body">
              <p>
                <b>Location:</b> {b.property?.location}
              </p>
              <p>
                <b>Owner:</b> {b.owner?.name} ({b.owner?.email})
              </p>
              <p>
                <b>Monthly Rent:</b> ₹{b.monthlyRent}
              </p>
              {b.status === "rejected" && (
                <p className="reason">
                  <b>Reason:</b> {b.rejectionReason}
                </p>
              )}
            </div>
            <button className="btn-cancel" onClick={() => handleCancel(b._id)}>
              Cancel Request
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyBookings;
