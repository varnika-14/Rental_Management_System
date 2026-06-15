import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  getPaymentAmount,
  getRemainingRent,
  getTotalRent,
} from "../utils/rentUtils";
import "../styles/payment.css";

function PaymentButton({ booking }) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const remaining = getRemainingRent(booking);
  const isFullyPaid = booking.paymentStatus === "paid" || remaining <= 0;

  if (isFullyPaid) {
    return <button className="pay-btn paid" disabled>Paid</button>;
  }

  return (
    <>
      <button
        className="pay-btn"
        onClick={() => setShowModal(true)}
        disabled={loading}
      >
        {loading ? "Loading..." : "Pay Now"}
      </button>
      {showModal && (
        <PaymentModal
          booking={booking}
          onClose={() => setShowModal(false)}
          onLoading={setLoading}
          onSuccess={() => navigate(`/rent-tracking?bookingId=${booking._id}`)}
        />
      )}
    </>
  );
}

function PaymentModal({ booking, onClose, onLoading, onSuccess }) {
  const [step, setStep] = useState("type");
  const [paymentType, setPaymentType] = useState(
    booking.paymentType === "monthly" ? "monthly" : "one_time",
  );
  const [paymentData, setPaymentData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const totalRent = getTotalRent(booking);
  const remaining = getRemainingRent(booking);
  const payAmount = getPaymentAmount({ ...booking, totalRent }, paymentType);

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const startPayment = async () => {
    setError("");
    onLoading(true);
    try {
      const response = await API.post("/payment/create-order", {
        bookingId: booking._id,
        paymentType,
      });
      setPaymentData(response.data);
      setStep("pay");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start payment");
    } finally {
      onLoading(false);
    }
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError("");
    try {
      const response = await API.post("/payment/process-payment", {
        orderId: paymentData.orderId,
        bookingId: booking._id,
        paymentDetails: {
          cardNumber: cardNumber.replace(/\s/g, ""),
          expiry,
          cvv,
          name,
          paymentMethod,
        },
      });
      if (response.data.success) {
        onClose();
        onSuccess();
      } else {
        setError(response.data.message || "Payment failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="payment-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="payment-modal-header">
          <h3>{step === "type" ? "Choose Payment Plan" : "Complete Payment"}</h3>
          <button type="button" className="payment-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="payment-summary">
          <span>Amount Due</span>
          <strong>₹{payAmount.toLocaleString()}</strong>
          <small>Remaining balance: ₹{remaining.toLocaleString()}</small>
        </div>

        {error && <div className="payment-error">{error}</div>}

        {step === "type" ? (
          <div className="payment-type-step">
            <button
              type="button"
              className={`payment-type-card ${paymentType === "one_time" ? "active" : ""}`}
              onClick={() => setPaymentType("one_time")}
            >
              <strong>One-Time Payment</strong>
              <span>Pay full remaining amount now</span>
              <em>₹{remaining.toLocaleString()}</em>
            </button>
            <button
              type="button"
              className={`payment-type-card ${paymentType === "monthly" ? "active" : ""}`}
              onClick={() => setPaymentType("monthly")}
            >
              <strong>Monthly Payment</strong>
              <span>Pay one month at a time</span>
              <em>₹{Math.min(booking.monthlyRent, remaining).toLocaleString()}</em>
            </button>
            <button
              type="button"
              className="payment-continue"
              onClick={startPayment}
            >
              Continue to Payment
            </button>
          </div>
        ) : (
          <form onSubmit={submitPayment} className="payment-form">
            <div className="payment-methods">
              <button
                type="button"
                className={paymentMethod === "card" ? "active" : ""}
                onClick={() => setPaymentMethod("card")}
              >
                Card
              </button>
              <button
                type="button"
                className={paymentMethod === "upi" ? "active" : ""}
                onClick={() => setPaymentMethod("upi")}
              >
                UPI
              </button>
            </div>

            {paymentMethod === "card" ? (
              <>
                <input
                  type="text"
                  placeholder="Card Number"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}
                  required
                />
                <div className="payment-row">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    maxLength={5}
                    required
                  />
                  <input
                    type="password"
                    placeholder="CVV"
                    value={cvv}
                    onChange={(e) =>
                      setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    maxLength={4}
                    required
                  />
                </div>
                <input
                  type="text"
                  placeholder="Cardholder Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </>
            ) : (
              <input
                type="text"
                placeholder="UPI ID (e.g. name@upi)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}

            <button type="submit" className="payment-submit" disabled={processing}>
              {processing
                ? "Processing..."
                : `Pay ₹${(paymentData?.amount || payAmount).toLocaleString()}`}
            </button>
            <button
              type="button"
              className="payment-back"
              onClick={() => setStep("type")}
            >
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default PaymentButton;
