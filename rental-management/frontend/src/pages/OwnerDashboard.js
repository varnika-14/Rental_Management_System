import React from "react";
import { Link } from "react-router-dom";
import "../styles/dashboard.css";

function OwnerDashboard() {
  return (
    <div className="dashboard-container">
      <h2>Owner Dashboard</h2>

      <div className="dash-buttons">
        <Link to="/add-property">
          <button>Add Property</button>
        </Link>

        <Link to="/my-properties">
          <button>View My Properties</button>
        </Link>
      </div>
    </div>
  );
}

export default OwnerDashboard;
