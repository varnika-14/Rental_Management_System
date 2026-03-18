import React, { useState } from "react";
import API from "../services/api";
import "../styles/property.css";
import { useNavigate } from "react-router-dom";

function AddProperty() {
  const navigate = useNavigate();

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

      await API.post("/property", data);

      alert("Property Added Successfully");
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
          placeholder="Description"
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
          {loading ? "Uploading..." : "Add Property"}
        </button>
      </form>
    </div>
  );
}

export default AddProperty;
