import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import "../styles/property.css";
import "../styles/booking.css";
import { getImageUrl } from "../utils/image";
import BookingForm from "../components/BookingForm";
import { startConversation } from "../services/chatApi";

function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isRequestPending, setIsRequestPending] = useState(false);
  const [acceptedBookings, setAcceptedBookings] = useState([]);
  const [showOccupiedDetails, setShowOccupiedDetails] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    const fetchPropertyAndStatus = async () => {
      try {
        const res = await API.get(`/property/${id}`);
        setProperty(res.data);

        const scheduleRes = await API.get(`/booking/property/${id}/accepted`);
        setAcceptedBookings(scheduleRes.data);

        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
          setUserRole(user.role);

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
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const ownerId =
    typeof property.owner === "object" ? property.owner?._id : property.owner;
  const isOwner = storedUser?.role === "owner" && storedUser?._id === ownerId;

  const handleDelete = async () => {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this property?",
    );
    if (!shouldDelete) return;

    try {
      await API.delete(`/property/${id}`, {
        data: { ownerId: storedUser?._id },
      });
      alert("Property deleted successfully");
      navigate("/my-properties");
    } catch (err) {
      console.error("Error deleting property:", err);
      alert("Failed to delete property");
    }
  };

  const handleStartChat = async () => {
    try {
      const res = await startConversation({
        propertyId: property._id,
        ownerId: ownerId,
        tenantId: storedUser?._id,
      });
      navigate(`/chats?conversation=${res.data._id}`);
    } catch (err) {
      console.error("Error starting chat:", err);
      alert(err.response?.data?.message || "Unable to start chat");
    }
  };

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
          <p className="property-details-type">
            <b>Type:</b> {property.type}
          </p>
          <p className="property-details-description">{property.description}</p>
          <p className="property-details-rent">₹ {property.rent} / month</p>

          {isOwner && (
            <div className="property-owner-actions">
              <button
                type="button"
                className="property-action-btn edit-btn"
                onClick={() => navigate(`/edit-property/${property._id}`)}
              >
                Edit Property
              </button>
              <button
                type="button"
                className="property-action-btn delete-btn"
                onClick={handleDelete}
              >
                Delete Property
              </button>
            </div>
          )}
        </div>
        <div className="property-photos-section">
          <h3>Photos</h3>
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

        {property.owner && userRole === "tenant" && (
          <div className="property-owner-section">
            <h3>Owner Details</h3>
            <div className="property-details-owner">
              <p>
                <b>Owner:</b> {property.owner.name} ({property.owner.email})
              </p>
              <div className="owner-actions-row">
                <button
                  type="button"
                  className="property-action-btn view-btn"
                  onClick={() => navigate(`/users/${property.owner._id}`)}
                >
                  Owner Details
                </button>
                <button
                  type="button"
                  className="property-action-btn view-btn"
                  onClick={handleStartChat}
                >
                  Chat with Owner
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="property-occupied-section">
          <h3>Property Occupied Details</h3>
          <div className="booking-status-alert">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>
                <strong>
                  {acceptedBookings.length > 0
                    ? "📅 Property Occupied"
                    : "✅ Property Available"}
                </strong>
              </span>
              {acceptedBookings.length > 0 && (
                <button
                  onClick={() => setShowOccupiedDetails(!showOccupiedDetails)}
                  className="btn-details-toggle"
                  style={{
                    padding: "4px 10px",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    backgroundColor: "#92400e",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                  }}
                >
                  {showOccupiedDetails ? "Hide" : "View Dates"}
                </button>
              )}
            </div>

            {showOccupiedDetails && (
              <div
                className="occupied-list"
                style={{
                  marginTop: "10px",
                  borderTop: "1px dashed #fcd34d",
                  paddingTop: "10px",
                }}
              >
                {acceptedBookings.map((b, index) => (
                  <div
                    key={index}
                    className="occupied-item"
                    style={{ fontSize: "0.85rem", marginBottom: "5px" }}
                  >
                    🚫 Reserved: <b>{formatDate(b.startDate)}</b> to{" "}
                    <b>{formatDate(b.endDate)}</b>
                  </div>
                ))}
                <p
                  className="small-text"
                  style={{ marginTop: "8px", fontStyle: "italic" }}
                >
                  You can request any date outside these ranges.
                </p>
              </div>
            )}

            {acceptedBookings.length === 0 && (
              <p className="small-text">
                No current bookings. You can request any start date!
              </p>
            )}
          </div>
        </div>

        {userRole === "tenant" && (
          <div className="property-booking-section">
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
                className="booking-date-btn"
                style={{
                  backgroundColor:
                    acceptedBookings.length > 0 ? "#6366f1" : "#3b82f6",
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
                {acceptedBookings.length > 0
                  ? "Book for Free Date"
                  : "Request Booking"}
              </button>
            ) : (
              <div className="booking-form-wrapper">
                <BookingForm
                  propertyId={property._id}
                  acceptedBookings={acceptedBookings}
                  onBookingSuccess={() => {
                    setShowBookingForm(false);
                    setIsRequestPending(true);
                    window.location.reload();
                  }}
                />
              </div>
            )}
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
