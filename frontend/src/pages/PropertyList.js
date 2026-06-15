import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import NaturalLanguageSearch from "../components/NaturalLanguageSearch";
import "../styles/property.css";

function PropertyList() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [searchMode, setSearchMode] = useState("filter"); // "filter" or "nl"
  const [activeFilters, setActiveFilters] = useState({
    location: "",
    type: "All",
    minRent: "",
    maxRent: "",
  });
  const [aiFilters, setAiFilters] = useState(null);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeFilters.location) params.location = activeFilters.location;
      if (activeFilters.type && activeFilters.type !== "All")
        params.type = activeFilters.type;
      if (activeFilters.minRent) params.minRent = activeFilters.minRent;
      if (activeFilters.maxRent) params.maxRent = activeFilters.maxRent;

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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setActiveFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setSearchMode("filter");
    setAiFilters(null);
    fetchProperties();
  };

  const handleNLSearchResults = (results, filtersApplied) => {
    setProperties(results);
    setAiFilters(filtersApplied);
    setSearchMode("nl");
    setLoading(false);
  };

  const handleNLClear = () => {
    setSearchMode("filter");
    setAiFilters(null);
    fetchProperties();
  };

  const handleCardClick = (id) => {
    navigate(`/properties/${id}`);
  };

  return (
    <div className="property-container">
      <h2>Available Properties</h2>

      {/* Search Mode Toggle */}
      <div className="search-mode-toggle">
        <button
          className={`mode-btn ${searchMode === "filter" ? "active" : ""}`}
          onClick={() => {
            setSearchMode("filter");
            handleNLClear();
          }}
        >
          🔧 Filter Search
        </button>
        <button
          className={`mode-btn ${searchMode === "nl" ? "active" : ""}`}
          onClick={() => setSearchMode("nl")}
        >
          🤖 AI Natural Language
        </button>
      </div>

      {/* Natural Language Search */}
      {searchMode === "nl" && (
        <NaturalLanguageSearch
          onSearchResults={handleNLSearchResults}
          onClear={handleNLClear}
        />
      )}

      {/* Traditional Filters */}
      {searchMode === "filter" && (
        <form className="property-filters" onSubmit={handleFilterSubmit}>
          <input
            name="location"
            placeholder="Search by location"
            value={activeFilters.location}
            onChange={handleFilterChange}
          />
          <select
            name="type"
            value={activeFilters.type}
            onChange={handleFilterChange}
          >
            <option value="All">All Types</option>
            <option value="Apartment">Apartment</option>
            <option value="House">House</option>
            <option value="Villa">Villa</option>
            <option value="Studio">Studio</option>
            <option value="PG">PG / Hostel</option>
          </select>
          <input
            name="minRent"
            type="number"
            placeholder="Min rent"
            value={activeFilters.minRent}
            onChange={handleFilterChange}
          />
          <input
            name="maxRent"
            type="number"
            placeholder="Max rent"
            value={activeFilters.maxRent}
            onChange={handleFilterChange}
          />
          <button type="submit" className="property-filters-submit">
            {loading ? "Filtering..." : "Apply Filters"}
          </button>
        </form>
      )}

      {/* AI Applied Filters Badge */}
      {aiFilters && (
        <div className="ai-filters-badge">
          <span>🤖 AI Applied Filters:</span>
          {aiFilters.locations?.length > 0 && (
            <span className="filter-tag">
              📍 {aiFilters.locations.join(", ")}
            </span>
          )}
          {aiFilters.maxRent && (
            <span className="filter-tag">
              💰 Max ₹{aiFilters.maxRent.toLocaleString()}
            </span>
          )}
          {aiFilters.minRent && (
            <span className="filter-tag">
              💰 Min ₹{aiFilters.minRent.toLocaleString()}
            </span>
          )}
          {aiFilters.propertyType && (
            <span className="filter-tag">🏠 {aiFilters.propertyType}</span>
          )}
          {aiFilters.minBedrooms && (
            <span className="filter-tag">🛏️ {aiFilters.minBedrooms}+ BHK</span>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="results-count">
        Found <strong>{properties.length}</strong> properties
      </div>

      {/* Property Grid */}
      {properties.length === 0 && !loading ? (
        <div className="empty-state">
          <span>🏠</span>
          <p>No properties found matching your criteria.</p>
          {searchMode === "nl" && (
            <p className="empty-state-hint">
              Try being more specific or use different keywords in your search.
            </p>
          )}
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
              {p.images && p.images[0] && (
                <div className="property-card-image">
                  <img src={p.images[0]} alt={p.title} />
                </div>
              )}
              <div className="property-card-content">
                <h3>{p.title}</h3>
                <p className="property-description">
                  {p.description.substring(0, 100)}...
                </p>
                <p>
                  <b>Type:</b> {p.type}
                </p>
                <p>
                  <b>Location:</b> {p.location}
                </p>
                {p.bedrooms && (
                  <p>
                    <b>Bedrooms:</b> {p.bedrooms}
                  </p>
                )}
                <p className="rent">₹ {p.rent.toLocaleString()} / month</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default PropertyList;
