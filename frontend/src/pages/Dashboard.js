import React from "react";
import { Link } from "react-router-dom";
import "../styles/dashboard.css";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="dashboard">
      <h1>Welcome, {user?.name}</h1>

      <div className="cards">
        {user.role === "owner" && (
          <>
            <Link to="/add-property" className="card">
              Add Property
            </Link>
            <Link to="/my-properties" className="card">
              My Properties
            </Link>
          </>
        )}

        {user.role === "tenant" && (
          <Link to="/properties" className="card">
            Browse Properties
          </Link>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
