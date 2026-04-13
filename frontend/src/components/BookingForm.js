import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import API from "../services/api";
import "../styles/booking.css";
function BookingForm({ propertyId, acceptedBookings, onBookingSuccess }) {
  const [startDate, setStartDate] = useState(new Date());
  const [duration, setDuration] = useState(1);
  const [durationType, setDurationType] = useState("months");
  const [loading, setLoading] = useState(false);

  // Convert accepted bookings into date ranges for the calendar to block
  const excludeIntervals = acceptedBookings.map((b) => ({
    start: new Date(b.startDate),
    end: new Date(b.endDate),
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/booking/request", {
        propertyId,
        startDate,
        duration,
        durationType,
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
    <form className="booking-form-card" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Select Start Date (White dates are free)</label>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          excludeDateIntervals={excludeIntervals}
          minDate={new Date()}
          inline // Shows the full calendar visually
        />
      </div>

      <div className="form-group">
        <label>Duration</label>
        <div className="duration-input-container">
          <input
            type="number"
            min="1"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="form-input"
            required
          />
          <select
            value={durationType}
            onChange={(e) => setDurationType(e.target.value)}
            className="form-input"
          >
            <option value="days">Days</option>
            <option value="months">Months</option>
            <option value="years">Years</option>
          </select>
        </div>
      </div>

      <button type="submit" className="booking-btn-primary" disabled={loading}>
        {loading ? "Processing..." : "Confirm Request"}
      </button>
    </form>
  );
}

export default BookingForm;
