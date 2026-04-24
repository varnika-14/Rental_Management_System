import React, { useEffect, useState } from "react";
import API from "../services/api";
import "../styles/property.css";
import { useNavigate, useParams } from "react-router-dom";

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
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);

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
        });
      } catch (err) {
        console.error("Error loading property for edit:", err);
        alert("Unable to load property details");
        navigate("/my-properties");
      }
    };
    loadProperty();
  }, [id, isEditMode, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
      console.error("FULL ERROR:", err);
      alert("Error adding property");
    }

    setLoading(false);
  };

  return (
    <div className="property-container">
      <h2>Add New Property</h2>
      {isEditMode && <p>Edit your property details below.</p>}

      <form onSubmit={handleSubmit} className="property-form">
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Description(amenities, nearby places, etc.)"
          value={form.description}
          onChange={handleChange}
          required
        />

        <select name="type" value={form.type} onChange={handleChange}>
          <option value="Apartment">Apartment</option>
          <option value="House">House</option>
          <option value="Villa">Villa</option>
        </select>

        <input
          name="rent"
          type="number"
          placeholder="Monthly Rent"
          value={form.rent}
          onChange={handleChange}
          required
        />

        <input
          name="location"
          placeholder="City / locality"
          value={form.location}
          onChange={handleChange}
          required
        />

        <input
          name="address"
          placeholder="Full address"
          value={form.address}
          onChange={handleChange}
          required
        />

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
        />

        <button type="submit" disabled={loading}>
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
