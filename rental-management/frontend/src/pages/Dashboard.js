import React from "react";
import { Link } from "react-router-dom";
import OwnerDashboard from "./OwnerDashboard";
import "../styles/dashboard.css";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  if (user.role === "owner") return <OwnerDashboard />;
  if (user.role === "tenant")
    return (
      <div className="dashboard-container">
        <h2>Tenant Dashboard</h2>
        <p className="dashboard-subtitle">
          Browse all available rentals and find your next home.
        </p>
        <div className="dash-buttons">
          <Link to="/properties">
            <button type="button">View Properties</button>
          </Link>
        </div>
      </div>
    );
  if (user.role === "admin")
    return (
      <div className="dashboard-container">
        <h2>Admin Dashboard</h2>
        <p className="dashboard-subtitle">Manage properties and users.</p>
      </div>
    );
  return (
    <div className="dashboard-container">
      <h2>Unauthorized</h2>
    </div>
  );
}

export default Dashboard;
