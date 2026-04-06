import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/booking.css";

function BookingForm({ propertyId, bookedUntil, onBookingSuccess = () => {} }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    startDate: "",
    duration: "",
    durationType: "months",
  });

  const [loading, setLoading] = useState(false);

  // Helper to determine the first available date for the calendar
  const getMinDate = () => {
    const today = new Date().toISOString().split("T")[0];
    if (bookedUntil) {
      const availableDate = new Date(bookedUntil).toISOString().split("T")[0];
      // If the property becomes free in the past, default to today
      return availableDate > today ? availableDate : today;
    }
    return today;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await API.post("/booking/request", {
        propertyId,
        startDate: formData.startDate,
        durationType: formData.durationType,
        duration: formData.duration,
      });

      alert("Booking request sent successfully!");
      onBookingSuccess();
      navigate("/my-bookings");
    } catch (err) {
      alert(err.response?.data?.message || "Error sending request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-form-card">
      <h3>Request This Property</h3>
      <p className="form-subtitle">
        {bookedUntil
          ? `Note: This property is available from ${new Date(bookedUntil).toLocaleDateString()}`
          : "Enter your preferred stay details below."}
      </p>

      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-group">
          <label>Preferred Start Date</label>
          <input
            type="date"
            name="startDate"
            className="form-input"
            value={formData.startDate}
            onChange={handleChange}
            required
            min={getMinDate()}
          />
        </div>

        <div className="form-group">
          <label>Stay Duration</label>
          <div className="duration-input-container">
            <input
              type="number"
              name="duration"
              className="form-input duration-num"
              placeholder="Qty"
              value={formData.duration}
              onChange={handleChange}
              required
              min="1"
            />
            <select
              name="durationType"
              className="form-input duration-select"
              value={formData.durationType}
              onChange={handleChange}
            >
              <option value="months">Months</option>
              <option value="years">Years</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="booking-btn-primary"
        >
          {loading ? "Processing..." : "Confirm Booking Request"}
        </button>
      </form>
    </div>
  );
}

export default BookingForm;
