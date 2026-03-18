import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import "../styles/property.css";
import { getImageUrl } from "../utils/image";

function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

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

    fetchProperty();
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
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getImageUrl(null);
                  }}
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
            <img src={selectedImage} alt={property.title} />
            <button
              type="button"
              className="image-modal-close"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PropertyDetails;
