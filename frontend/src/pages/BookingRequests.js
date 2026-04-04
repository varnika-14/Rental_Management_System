import React, { useState, useEffect } from "react"; // Added useState and useEffect
import API from "../services/api";
import "../styles/booking.css";
function BookingRequests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    API.get("/booking/requests").then((res) => setRequests(res.data));
  }, []);

  const handleAction = async (id, action) => {
    await API.patch(`/booking/${id}/${action}`);
    window.location.reload();
  };

  return (
    <div className="property-container">
      <h2 className="section-title">Property Requests</h2>
      <div className="booking-grid">
        {requests.map((r) => (
          <div key={r._id} className="booking-card">
            <div className="booking-card-header">
              <h3>{r.property?.title}</h3>
              <span className={`status-tag status-${r.status}`}>
                {r.status}
              </span>
            </div>
            <div className="booking-card-body">
              <p>
                <b>Tenant Name:</b> {r.tenant?.name}
              </p>
              <p>
                <b>Tenant Email:</b> {r.tenant?.email}
              </p>
              <p>
                <b>Proposed Start:</b>{" "}
                {new Date(r.startDate).toLocaleDateString()}
              </p>
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
    </div>
  );
}
export default BookingRequests;
