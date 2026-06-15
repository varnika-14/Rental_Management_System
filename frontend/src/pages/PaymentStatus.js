import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../services/api";

function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  const orderId = searchParams.get("order_id");
  const bookingId = searchParams.get("booking_id");

  useEffect(() => {
    const verifyPaymentStatus = async () => {
      if (!orderId || !bookingId) {
        setStatus("error");
        setMessage("Invalid payment information");
        return;
      }

      try {
        const response = await API.post("/payment/verify", {
          orderId,
          bookingId,
        });

        if (response.data.success) {
          setStatus("success");
          setMessage("Payment successful! Your booking is confirmed.");
          setTimeout(() => {
            navigate(`/rent-tracking?bookingId=${bookingId}`);
          }, 2000);
        } else {
          setStatus("error");
          setMessage("Payment failed. Please try again.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Payment verification failed. Please contact support.");
      }
    };

    verifyPaymentStatus();
  }, [orderId, bookingId, navigate]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "40px",
          textAlign: "center",
          maxWidth: "500px",
          width: "100%",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        }}
      >
        {status === "verifying" && (
          <>
            <div
              style={{
                fontSize: "48px",
                marginBottom: "20px",
              }}
            >
              ⏳
            </div>
            <h2>Verifying Payment...</h2>
            <p>Please wait while we confirm your transaction.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div
              style={{
                fontSize: "48px",
                marginBottom: "20px",
              }}
            >
              ✅
            </div>
            <h2 style={{ color: "#10b981" }}>Payment Successful!</h2>
            <p>{message}</p>
            <p style={{ marginTop: "20px", color: "#6b7280" }}>
              Redirecting to Rent Tracking...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div
              style={{
                fontSize: "48px",
                marginBottom: "20px",
              }}
            >
              ❌
            </div>
            <h2 style={{ color: "#ef4444" }}>Payment Failed</h2>
            <p>{message}</p>
            <button
              onClick={() => navigate(-1)}
              style={{
                marginTop: "20px",
                padding: "10px 20px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Go Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default PaymentStatus;
