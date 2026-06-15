import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../services/api";
import { getPaymentStatusLabel } from "../utils/rentUtils";
import "../styles/rent-tracking.css";

function RentTracking() {
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("bookingId");
  const user = JSON.parse(localStorage.getItem("user"));
  const isOwner = user?.role === "owner";

  const [bookings, setBookings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await API.get("/booking/rent-tracking");
      setBookings(res.data.bookings);
      setSummary(res.data.summary);
    } catch (error) {
      console.error("Error fetching rent tracking:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="rent-loading">Loading rent tracking...</div>;
  }

  return (
    <div className="rent-page">
      <div className="rent-header">
        <h2>{isOwner ? "Rent & Revenue Tracking" : "Rent Tracking"}</h2>
        <p>
          {isOwner
            ? "Monitor tenant payments and revenue across your properties."
            : "Track your rental payments and payment history."}
        </p>
      </div>

      {summary && (
        <div className="rent-summary-grid">
          {isOwner ? (
            <>
              <div className="rent-summary-card">
                <span>Total Revenue</span>
                <strong>₹{summary.totalRevenue.toLocaleString()}</strong>
              </div>
              <div className="rent-summary-card">
                <span>Pending Amount</span>
                <strong>₹{summary.pendingAmount.toLocaleString()}</strong>
              </div>
              <div className="rent-summary-card">
                <span>Active Rentals</span>
                <strong>{summary.activeRentals}</strong>
              </div>
              <div className="rent-summary-card">
                <span>Fully Paid</span>
                <strong>{summary.fullyPaidCount}</strong>
              </div>
            </>
          ) : (
            <>
              <div className="rent-summary-card">
                <span>Total Paid</span>
                <strong>₹{summary.totalRevenue.toLocaleString()}</strong>
              </div>
              <div className="rent-summary-card">
                <span>Remaining</span>
                <strong>₹{summary.pendingAmount.toLocaleString()}</strong>
              </div>
              <div className="rent-summary-card">
                <span>Active Rentals</span>
                <strong>{summary.activeRentals}</strong>
              </div>
            </>
          )}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="rent-empty">
          <p>No active rentals found.</p>
          <p>
            {isOwner
              ? "Accepted bookings will appear here with payment details."
              : "When your booking is accepted and payment is made, it will appear here."}
          </p>
        </div>
      ) : (
        <div className="rent-list">
          {bookings.map((booking) => (
            <RentCard
              key={booking._id}
              booking={booking}
              isOwner={isOwner}
              highlighted={booking._id === highlightId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RentCard({ booking, isOwner, highlighted }) {
  const progress = booking.totalRent
    ? Math.min(100, Math.round((booking.paidAmount / booking.totalRent) * 100))
    : 0;
  const person = isOwner ? booking.tenant : booking.owner;
  const personLabel = isOwner ? "Tenant" : "Owner";

  return (
    <div className={`rent-card ${highlighted ? "highlighted" : ""}`}>
      <div className="rent-card-top">
        <div>
          <h3>{booking.property?.title || "Property"}</h3>
          <p className="rent-location">{booking.property?.location}</p>
          {person && (
            <p className="rent-person">
              {personLabel}: <strong>{person.name}</strong>
            </p>
          )}
        </div>
        <span className={`rent-status-badge ${booking.paymentStatus}`}>
          {getPaymentStatusLabel(booking.paymentStatus)}
        </span>
      </div>

      <div className="rent-stats-grid">
        <div className="rent-stat">
          <span>Total Rent</span>
          <strong>₹{booking.totalRent.toLocaleString()}</strong>
        </div>
        <div className="rent-stat">
          <span>Plan</span>
          <strong>
            {booking.paymentType === "monthly" ? "Monthly" : "One-Time"}
          </strong>
        </div>
        <div className="rent-stat">
          <span>Monthly Rent</span>
          <strong>₹{booking.monthlyRent.toLocaleString()}</strong>
        </div>
        <div className="rent-stat">
          <span>Paid</span>
          <strong className="paid">₹{(booking.paidAmount || 0).toLocaleString()}</strong>
        </div>
        <div className="rent-stat">
          <span>Remaining</span>
          <strong className={booking.remaining > 0 ? "due" : "paid"}>
            ₹{booking.remaining.toLocaleString()}
          </strong>
        </div>
      </div>

      <div className="rent-progress">
        <div className="rent-progress-bar">
          <div
            className="rent-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="rent-progress-labels">
          <span>Payment Progress</span>
          <span>{progress}%</span>
        </div>
      </div>

      <p className="rent-period">
        Period: {new Date(booking.startDate).toLocaleDateString()} –{" "}
        {new Date(booking.endDate).toLocaleDateString()}
      </p>

      {booking.payments?.length > 0 && (
        <div className="rent-payments">
          <h4>Payment History</h4>
          <div className="rent-payments-list">
            {booking.payments.map((payment) => (
              <div key={payment._id} className="rent-payment-row">
                <div>
                  <strong>₹{payment.amount.toLocaleString()}</strong>
                  <span>
                    {payment.paymentType === "monthly" ? "Monthly" : "One-Time"}
                  </span>
                </div>
                <div className="rent-payment-date">
                  {new Date(payment.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default RentTracking;
