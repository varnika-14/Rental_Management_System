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
            <button
              key={p._id}
              type="button"
              className="property-card property-card-clickable"
              onClick={() => navigate(`/properties/${p._id}`)}
            >
              <div className="property-card-content">
                <h3>{p.title}</h3>
                <p>{p.description}</p>
                <p>
                  <b>Type:</b> {p.type}
                </p>
                <p>
                  <b>Location:</b> {p.location}
                </p>
                <p className="rent">₹ {p.rent} / month</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyProperties;
