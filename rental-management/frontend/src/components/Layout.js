import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { getToken, logout } from "../utils/auth";
import "../styles/layout.css";

function Layout({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!getToken()) return children;

  return (
    <div className="app-layout">
      <header className="app-header">
        <Link to="/dashboard" className="app-brand">
          Rental Manager
        </Link>
        <nav className="app-nav">
          <Link to="/dashboard">Dashboard</Link>
          {user?.role === "owner" && (
            <>
              <Link to="/add-property">Add Property</Link>
              <Link to="/my-properties">My Properties</Link>
            </>
          )}
        </nav>
        <div className="app-header-actions">
          <span className="user-name">{user?.name}</span>
          <button type="button" className="btn-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}

export default Layout;
