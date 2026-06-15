import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import { predictRentPrice } from "../services/aiService";
import "../styles/property.css";

function AddProperty() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "Apartment",
    rent: "",
    location: "",
    address: "",
    bedrooms: "",
    area: "",
    amenities: "",
    nearbyPlaces: "",
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiPredicting, setAiPredicting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState("");
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);

  useEffect(() => {
    const loadProperty = async () => {
      if (!isEditMode) return;
      try {
        const res = await API.get(`/property/${id}`);
        const p = res.data;
        setForm({
          title: p.title || "",
          description: p.description || "",
          type: p.type || "Apartment",
          rent: p.rent || "",
          location: p.location || "",
          address: p.address || "",
          bedrooms: p.bedrooms || "",
          area: p.area || "",
          amenities: p.amenities || "",
          nearbyPlaces: p.nearbyPlaces || "",
        });
      } catch (err) {
        console.error("Error loading property:", err);
        alert("Unable to load property details");
        navigate("/my-properties");
      }
    };
    loadProperty();
  }, [id, isEditMode, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const generateAIDescription = async () => {
    if (!form.title) {
      alert("Please enter property title first");
      return;
    }
    if (!form.location) {
      alert("Please enter location first");
      return;
    }

    setGeneratingDesc(true);
    setShowDescriptionModal(true);

    try {
      const amenitiesArray = form.amenities
        ? form.amenities.split(",").map((a) => a.trim())
        : [];
      const nearbyArray = form.nearbyPlaces
        ? form.nearbyPlaces.split(",").map((n) => n.trim())
        : [];

      const response = await API.post("/ai/generate-description", {
        title: form.title,
        propertyType: form.type,
        location: form.location,
        bedrooms: form.bedrooms,
        area: form.area,
        amenities: amenitiesArray,
        nearbyPlaces: nearbyArray,
      });

      setGeneratedDescription(response.data.description);
    } catch (error) {
      console.error("Description generation failed:", error);
      setGeneratedDescription(
        "Beautiful property in a prime location. Well-maintained with all modern amenities. Perfect for families and working professionals. Close to schools, hospitals, and shopping centers.",
      );
    } finally {
      setGeneratingDesc(false);
    }
  };

  const handleAIPredict = async () => {
    if (!form.location) {
      alert("Please enter location first");
      return;
    }
    if (!form.type) {
      alert("Please select property type");
      return;
    }

    setAiPredicting(true);
    setShowAiModal(true);

    try {
      const amenitiesArray = form.amenities
        ? form.amenities.split(",").map((a) => a.trim())
        : [];

      const prediction = await predictRentPrice({
        location: form.location,
        propertyType: form.type,
        bedrooms: form.bedrooms || null,
        area: form.area || null,
        amenities: amenitiesArray,
        nearbyPlaces: form.nearbyPlaces || null,
      });

      setAiSuggestion(prediction);
    } catch (error) {
      console.error("AI Prediction failed:", error);
      setAiSuggestion({
        error: true,
        message: error.error || "Prediction failed. Please try again.",
      });
    } finally {
      setAiPredicting(false);
    }
  };

  const applyAiSuggestion = () => {
    if (aiSuggestion && aiSuggestion.predictedRent) {
      setForm({ ...form, rent: aiSuggestion.predictedRent.toString() });
      alert(`Rent set to ₹${aiSuggestion.predictedRent.toLocaleString()}`);
      setShowAiModal(false);
    }
  };

  const applyDescription = () => {
    if (generatedDescription) {
      setForm({ ...form, description: generatedDescription });
      alert("Description applied successfully!");
      setShowDescriptionModal(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user._id) {
      alert("User not logged in. Please login again.");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();

      data.append("title", form.title);
      data.append("description", form.description);
      data.append("type", form.type);
      data.append("rent", form.rent);
      data.append("location", form.location);
      data.append("address", form.address);
      data.append("owner", user._id);

      if (form.bedrooms) data.append("bedrooms", form.bedrooms);
      if (form.area) data.append("area", form.area);
      if (form.amenities) data.append("amenities", form.amenities);
      if (form.nearbyPlaces) data.append("nearbyPlaces", form.nearbyPlaces);

      imageFiles.forEach((file) => {
        data.append("images", file);
      });

      if (isEditMode) {
        await API.put(`/property/${id}`, data);
      } else {
        await API.post("/property", data);
      }

      alert(
        isEditMode
          ? "Property Updated Successfully"
          : "Property Added Successfully",
      );
      navigate("/my-properties");
    } catch (err) {
      console.error("Error:", err);
      alert("Error saving property");
    }

    setLoading(false);
  };

  return (
    <div className="property-container">
      <h2>{isEditMode ? "Edit Property" : "Add New Property"}</h2>
      {isEditMode && <p>Edit your property details below.</p>}

      {/* AI Price Prediction Modal */}
      {showAiModal && (
        <div className="ai-modal-overlay" onClick={() => setShowAiModal(false)}>
          <div
            className="ai-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="ai-modal-close"
              onClick={() => setShowAiModal(false)}
            >
              ✕
            </button>

            <h3>🤖 AI Price Predictor</h3>

            {aiPredicting ? (
              <div className="ai-loading">
                <div className="ai-spinner"></div>
                <p>Analyzing market data...</p>
                <small>Mistral AI is calculating optimal rent price</small>
              </div>
            ) : aiSuggestion?.error ? (
              <div className="ai-error">
                <p>⚠️ {aiSuggestion.message}</p>
                <button onClick={() => setShowAiModal(false)}>Close</button>
              </div>
            ) : (
              <div className="ai-result">
                <div className="ai-price-big">
                  <span className="ai-label">AI Recommended Rent</span>
                  <span className="ai-price">
                    ₹{aiSuggestion?.predictedRent?.toLocaleString()}
                  </span>
                  <span className="ai-price-unit">/ month</span>
                </div>

                <div className="ai-range">
                  <span>Market Range:</span>
                  <strong>
                    ₹{aiSuggestion?.minRange?.toLocaleString()} - ₹
                    {aiSuggestion?.maxRange?.toLocaleString()}
                  </strong>
                </div>

                <div
                  className={`ai-confidence confidence-${aiSuggestion?.confidence?.toLowerCase()}`}
                >
                  <span>Confidence:</span>
                  <strong>{aiSuggestion?.confidence}</strong>
                </div>

                <div className="ai-reasoning">
                  <span>💡 Why this price?</span>
                  <p>{aiSuggestion?.reasoning}</p>
                </div>

                <div className="ai-model-info">
                  <small>Powered by: {aiSuggestion?.aiModel}</small>
                </div>

                <div className="ai-actions">
                  <button className="ai-apply-btn" onClick={applyAiSuggestion}>
                    Apply This Price
                  </button>
                  <button
                    className="ai-cancel-btn"
                    onClick={() => setShowAiModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Description Generator Modal */}
      {showDescriptionModal && (
        <div
          className="ai-modal-overlay"
          onClick={() => setShowDescriptionModal(false)}
        >
          <div
            className="ai-modal-content ai-description-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="ai-modal-close"
              onClick={() => setShowDescriptionModal(false)}
            >
              ✕
            </button>

            <h3>✍️ AI Description Generator</h3>

            {generatingDesc ? (
              <div className="ai-loading">
                <div className="ai-spinner"></div>
                <p>Crafting compelling property description...</p>
                <small>Mistral AI is writing the perfect listing</small>
              </div>
            ) : (
              <div className="ai-result">
                <div className="ai-description-preview">
                  <span className="ai-label">Generated Description</span>
                  <div className="ai-description-text">
                    {generatedDescription}
                  </div>
                </div>

                <div className="ai-actions">
                  <button className="ai-apply-btn" onClick={applyDescription}>
                    Apply Description
                  </button>
                  <button
                    className="ai-cancel-btn"
                    onClick={() => setShowDescriptionModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="property-form-modern">
        {/* Section 1: Basic Information */}
        <div className="form-section">
          <h3 className="section-title">📋 Basic Information</h3>

          <div className="form-group">
            <label>Property Title *</label>
            <input
              name="title"
              placeholder="e.g., '2BHK Luxury Apartment near City Center'"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Property Type *</label>
              <select name="type" value={form.type} onChange={handleChange}>
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
                <option value="Villa">Villa</option>
                <option value="Studio">Studio</option>
                <option value="PG">PG / Hostel</option>
              </select>
            </div>

            <div className="form-group">
              <label>Location / City *</label>
              <input
                name="location"
                placeholder="e.g., 'Andheri East, Mumbai'"
                value={form.location}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Full Address *</label>
            <input
              name="address"
              placeholder="Street, landmark, area, pin code"
              value={form.address}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Section 2: Property Details */}
        <div className="form-section">
          <h3 className="section-title">🏠 Property Details</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Bedrooms</label>
              <input
                name="bedrooms"
                type="number"
                placeholder="Number of bedrooms"
                value={form.bedrooms}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Area (sq ft)</label>
              <input
                name="area"
                type="number"
                placeholder="Total area in sq ft"
                value={form.area}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Amenities (comma separated)</label>
            <input
              name="amenities"
              placeholder="e.g., Parking, Gym, WiFi, AC, Furniture"
              value={form.amenities}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Nearby Places (comma separated)</label>
            <input
              name="nearbyPlaces"
              placeholder="e.g., Metro, Hospital, Mall, School"
              value={form.nearbyPlaces}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Section 3: Media */}
        <div className="form-section">
          <h3 className="section-title">🖼️ Property Photos</h3>

          <div className="form-group">
            <label>Upload Images (Max 10)</label>
            <div className="file-upload-area">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) =>
                  setImageFiles(Array.from(e.target.files || []))
                }
                id="file-upload"
                style={{ display: "none" }}
              />
              <label htmlFor="file-upload" className="file-upload-label">
                📁 Choose Files
              </label>
              {imageFiles.length > 0 && (
                <span className="file-count">
                  {imageFiles.length} file(s) selected
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: AI-Powered Fields (Moved to Bottom) */}
        <div className="form-section ai-section">
          <h3 className="section-title">✨ AI-Powered Fields</h3>

          {/* AI Action Buttons */}
          <div className="ai-action-buttons">
            <button
              type="button"
              className="ai-action-btn price-btn"
              onClick={handleAIPredict}
            >
              🤖 AI Predict Rent Price
            </button>
            <button
              type="button"
              className="ai-action-btn desc-btn"
              onClick={generateAIDescription}
            >
              ✍️ AI Generate Description
            </button>
          </div>

          {/* Rent Field */}
          <div className="form-group">
            <label>Monthly Rent (₹) *</label>
            <input
              name="rent"
              type="number"
              placeholder="e.g., 25000"
              value={form.rent}
              onChange={handleChange}
              required
            />
          </div>

          {/* Description Field */}
          <div className="form-group">
            <label>Property Description *</label>
            <textarea
              name="description"
              placeholder="Describe your property - amenities, nearby places, unique features..."
              value={form.description}
              onChange={handleChange}
              required
              rows="5"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading
            ? isEditMode
              ? "Updating..."
              : "Uploading..."
            : isEditMode
              ? "Update Property"
              : "Add Property"}
        </button>
      </form>
    </div>
  );
}

export default AddProperty;
