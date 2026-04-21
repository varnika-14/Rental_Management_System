import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/dashboard.css";

function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Re-read from localStorage every time Dashboard is viewed
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <h1>Welcome, {user.name}</h1> {/* Updated name will show here */}
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
        <Link to="/profile" className="card">
          Edit Profile
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
