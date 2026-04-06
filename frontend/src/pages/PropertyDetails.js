import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import "../styles/property.css";
import "../styles/booking.css";
import { getImageUrl } from "../utils/image";
import BookingForm from "../components/BookingForm";

function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isRequestPending, setIsRequestPending] = useState(false);

  useEffect(() => {
    const fetchPropertyAndStatus = async () => {
      try {
        // 1. Fetch Property Details
        const res = await API.get(`/property/${id}`);
        setProperty(res.data);

        // 2. Get User Info from localStorage
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
          setUserRole(user.role);

          // 3. If Tenant, check if they already have a pending request for THIS property
          if (user.role === "tenant") {
            const bookingsRes = await API.get("/booking/my-bookings");
            const pending = bookingsRes.data.some(
              (b) => b.property?._id === id && b.status === "pending",
            );
            setIsRequestPending(pending);
          }
        }
      } catch (err) {
        console.error("Error loading property details:", err);
        alert("Unable to load property details");
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyAndStatus();
  }, [id]);

  if (loading) {
    return (
      <div className="property-container">
        <p>Loading property...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="property-container">
        <p>Property not found.</p>
      </div>
    );
  }

  const images = Array.isArray(property.images) ? property.images : [];

  return (
    <div className="property-container">
      <button
        type="button"
        className="property-back-button"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <div className="property-details-card">
        <div className="property-details-body">
          <h2>{property.title}</h2>
          <p className="property-details-location">
            <b>Location:</b> {property.location}
          </p>
          {property.address && (
            <p className="property-details-location">
              <b>Full address:</b> {property.address}
            </p>
          )}
          <p className="property-details-rent">₹ {property.rent} / month</p>

          {/* Availability Message */}
          {property.isBooked && (
            <div className="booking-status-alert">
              <p>
                <strong>⚠️ Currently Occupied</strong>
              </p>
              <p>
                This property is booked until:{" "}
                <b>{new Date(property.bookingEndDate).toLocaleDateString()}</b>
              </p>
              <p className="small-text">
                You can still request this property for a start date after this
                period.
              </p>
            </div>
          )}

          <p className="property-details-type">
            <b>Type:</b> {property.type}
          </p>

          <p className="property-details-description">{property.description}</p>

          {property.owner && (
            <div className="property-details-owner">
              <p>
                <b>Owner:</b> {property.owner.name} ({property.owner.email})
              </p>
            </div>
          )}
        </div>

        {/* Updated Booking Section Logic */}
        {userRole === "tenant" && (
          <div style={{ marginTop: "20px", marginBottom: "20px" }}>
            {isRequestPending ? (
              <button
                disabled
                className="btn-pending-status"
                style={{
                  backgroundColor: "#9ca3af",
                  height: "50px",
                  width: "220px",
                  borderRadius: "8px",
                  color: "white",
                  border: "none",
                  cursor: "not-allowed",
                  fontWeight: "bold",
                }}
              >
                Request Pending
              </button>
            ) : !showBookingForm ? (
              <button
                style={{
                  backgroundColor: property.isBooked ? "#6366f1" : "#3b82f6",
                  height: "50px",
                  width: "220px",
                  borderRadius: "8px",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
                onClick={() => setShowBookingForm(true)}
              >
                {property.isBooked ? "Book for Future Date" : "Request Booking"}
              </button>
            ) : (
              <BookingForm
                propertyId={property._id}
                bookedUntil={property.bookingEndDate}
                onBookingSuccess={() => {
                  setShowBookingForm(false);
                  setIsRequestPending(true);
                }}
              />
            )}
          </div>
        )}

        <b>Photos</b>
        {images.length > 0 && (
          <div className="property-details-gallery">
            {images.map((img, index) => (
              <button
                key={index}
                type="button"
                className="property-image-button"
                onClick={() => setSelectedImage(getImageUrl(img))}
              >
                <img
                  src={getImageUrl(img)}
                  alt={`${property.title} ${index + 1}`}
                  className="property-details-image"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedImage && (
        <div
          className="image-modal-overlay"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="image-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="image-modal-close"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
            <img src={selectedImage} alt="Preview" />
          </div>
        </div>
      )}
    </div>
  );
}

export default PropertyDetails;
