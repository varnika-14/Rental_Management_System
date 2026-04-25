import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/layout.css";

function Layout({ children }) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="app-layout">
      <button className="mobile-menu-btn" onClick={toggleMenu}>
        {isMenuOpen ? "✕" : "☰"}
      </button>

      {isMenuOpen && (
        <div className="sidebar-overlay" onClick={toggleMenu}></div>
      )}

      <aside className={`sidebar ${isMenuOpen ? "open" : ""}`}>
        <div className="sidebar-top">
          <h2 className="logo">Rental Manager</h2>

          <nav className="nav-links">
            <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
              Dashboard
            </Link>
            <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
              Profile
            </Link>
            <Link to="/chats" onClick={() => setIsMenuOpen(false)}>
              Chats
            </Link>
            {user?.role === "owner" && (
              <>
                <Link to="/add-property" onClick={() => setIsMenuOpen(false)}>
                  Add Property
                </Link>
                <Link to="/my-properties" onClick={() => setIsMenuOpen(false)}>
                  My Properties
                </Link>
                <Link
                  to="/booking-requests"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Booking Requests
                </Link>
              </>
            )}

            {user?.role === "tenant" && (
              <>
                <Link to="/properties" onClick={() => setIsMenuOpen(false)}>
                  Browse Properties
                </Link>
                <Link to="/my-bookings" onClick={() => setIsMenuOpen(false)}>
                  My Bookings
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <p className="user-name">{user?.name}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}

export default Layout;
