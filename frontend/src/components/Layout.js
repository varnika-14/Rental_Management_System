import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/layout.css";

function Layout({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <h2 className="logo">Rental Manager</h2>

          <nav className="nav-links">
            <Link to="/dashboard">Dashboard</Link>

            {user?.role === "owner" && (
              <>
                <Link to="/add-property">Add Property</Link>
                <Link to="/my-properties">My Properties</Link>
                <Link to="/booking-requests">Booking Requests</Link>
              </>
            )}

            {user?.role === "tenant" && (
              <>
                <Link to="/properties">Browse Properties</Link>
                <Link to="/my-bookings">My Bookings</Link>
                <Link to="/rent-history">Rent History</Link>
              </>
            )}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <p className="user-name">{user?.name}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">{children}</main>
    </div>
  );
}

export default Layout;
