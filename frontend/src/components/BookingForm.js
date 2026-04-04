import React, { useState } from "react";
import API from "../services/api";
import "../styles/booking.css";

function BookingForm({ propertyId, onBookingSuccess = () => {} }) {
  const [formData, setFormData] = useState({
    startDate: "",
    duration: "",
    durationType: "months",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Inside handleSubmit in BookingForm.js
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // FIX: Change 'durationValue' to 'duration' to match controller
      await API.post("/booking/request", {
        propertyId,
        startDate: formData.startDate,
        durationType: formData.durationType,
        duration: formData.duration, // Matches backend req.body.duration
      });

      alert("Booking request sent!");
      onBookingSuccess();
    } catch (err) {
      alert(err.response?.data?.message || "Error sending request");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="booking-form-card">
      <h3>Request Booking</h3>

      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-group">
          <label>Start Date</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        <div className="form-group">
          <label>Duration</label>
          <div className="duration-group">
            <input
              type="number"
              name="duration"
              placeholder="Enter duration"
              value={formData.duration}
              onChange={handleChange}
              required
              min="1"
            />

            <select
              name="durationType"
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
          {loading ? "Sending..." : "Request Booking"}
        </button>
      </form>
    </div>
  );
}

export default BookingForm;
