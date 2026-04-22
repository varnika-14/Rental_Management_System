import React, { useEffect, useState } from "react";
import API from "../services/api";
import "../styles/property.css";
import { useNavigate } from "react-router-dom";
function MyProperties() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    if (!user?._id) return;
    const fetchProperties = async () => {
      try {
        const res = await API.get(`/property/owner/${user._id}`);
        setProperties(res.data);
      } catch (err) {
        alert("Error loading properties");
      }
    };
    fetchProperties();
  }, [user?._id]);

  const handleDelete = async (propertyId) => {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this property?",
    );
    if (!shouldDelete) return;

    try {
      await API.delete(`/property/${propertyId}`, {
        data: { ownerId: user?._id },
      });
      setProperties((prev) => prev.filter((p) => p._id !== propertyId));
      alert("Property deleted successfully");
    } catch (err) {
      console.error("Error deleting property:", err);
      alert("Failed to delete property");
    }
  };

  return (
    <div className="property-container">
      <h2>My Properties</h2>
      {properties.length === 0 ? (
        <div className="empty-state">
          <p>You haven’t added any properties yet.</p>
          <p>Add your first property from the dashboard.</p>
        </div>
      ) : (
        <div className="property-grid">
          {properties.map((p) => (
            <div key={p._id} className="property-card">
              <div className="property-card-content">
                <h3>{p.title}</h3>
                <p>
                  <b>Type:</b> {p.type}
                </p>
                <p>
                  <b>Location:</b> {p.location}
                </p>
                <p className="rent">₹ {p.rent} / month</p>

                <div className="property-card-actions">
                  <button
                    type="button"
                    onClick={() => navigate(`/properties/${p._id}`)}
                    className="property-action-btn view-btn"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/edit-property/${p._id}`)}
                    className="property-action-btn edit-btn"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p._id)}
                    className="property-action-btn delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyProperties;
