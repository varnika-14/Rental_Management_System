import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/property.css";

function PropertyList() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [filters, setFilters] = useState({
    location: "",
    type: "All",
    minRent: "",
    maxRent: "",
  });

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.location) params.location = filters.location;
      if (filters.type && filters.type !== "All") params.type = filters.type;
      if (filters.minRent) params.minRent = filters.minRent;
      if (filters.maxRent) params.maxRent = filters.maxRent;
      if (userRole) params.userRole = userRole;

      const res = await API.get("/property", { params });
      setProperties(res.data);
    } catch (err) {
      alert("Error loading properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getUserRole = () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        setUserRole(user.role);
      }
    };
    
    getUserRole();
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchProperties();
  };

  const handleCardClick = (id) => {
    navigate(`/properties/${id}`);
  };

  return (
    <div className="property-container">
      <h2>Available Properties</h2>

      <form className="property-filters" onSubmit={handleSubmit}>
        <input
          name="location"
          placeholder="Search by location"
          value={filters.location}
          onChange={handleChange}
        />
        <select name="type" value={filters.type} onChange={handleChange}>
          <option value="All">All Types</option>
          <option value="Apartment">Apartment</option>
          <option value="House">House</option>
          <option value="Villa">Villa</option>
        </select>
        <input
          name="minRent"
          type="number"
          placeholder="Min rent"
          value={filters.minRent}
          onChange={handleChange}
        />
        <input
          name="maxRent"
          type="number"
          placeholder="Max rent"
          value={filters.maxRent}
          onChange={handleChange}
        />
        <button type="submit" className="property-filters-submit">
          {loading ? "Filtering..." : "Apply Filters"}
        </button>
      </form>

      {properties.length === 0 && !loading ? (
        <div className="empty-state">
          <p>No properties found for these filters.</p>
        </div>
      ) : (
        <div className="property-grid">
          {properties.map((p) => (
            <button
              key={p._id}
              type="button"
              className="property-card property-card-clickable"
              onClick={() => handleCardClick(p._id)}
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

export default PropertyList;
