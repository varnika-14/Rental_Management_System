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

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await API.get(`/property/${id}`);
        setProperty(res.data);
      } catch (err) {
        alert("Unable to load property details");
      } finally {
        setLoading(false);
      }
    };

    const getUserRole = () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        setUserRole(user.role);
      }
    };

    fetchProperty();
    getUserRole();
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

          {property.isBooked && (
            <div className="booking-status booked">
              <p>
                <strong>🔒 Property Already Booked</strong>
              </p>
              <p>
                This property is currently booked until{" "}
                {new Date(property.bookingEndDate).toLocaleDateString()}
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

        {/* Booking Section */}
        {userRole === "tenant" && !property.isBooked && (
          <div>
            {!showBookingForm ? (
              <button
                style={{
                  backgroundColor: "#3b82f6",
                  height: "50px",
                  width: "200px",
                  borderRadius: "5px",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
                onClick={() => setShowBookingForm(true)}
              >
                Request Booking
              </button>
            ) : (
              <BookingForm
                propertyId={property._id}
                onBookingSuccess={() => setShowBookingForm(false)}
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
