import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/dashboard.css";
import API from "../services/api";
function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    primaryLabel: "Loading...",
    primaryValue: 0,
    unreadMessages: 0,
    status: "Checking...",
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      fetchDashboardData();
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await API.get("/auth/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStats(response.data);
      setLoadingStats(false);
    } catch (error) {
      console.error("Error fetching real-time stats:", error);
      setLoadingStats(false);
    }
  };

  if (!user)
    return <div className="loading-state">Loading your workspace...</div>;

  return (
    <div className="dashboard-wrapper">
      <header className="welcome-banner">
        <div className="welcome-text">
          <h1>Welcome, {user.name} </h1>
          <p>
            Manage your {user.role === "owner" ? "properties" : "rentals"} and
            communications in one place.
          </p>
        </div>
        <div className="user-badge">
          <span className="role-chip">{user.role}</span>
        </div>
      </header>

      <section className="overview-stats">
        {user.role === "owner" ? (
          <>
            <div className="stat-card">
              <div className="stat-info">
                <h3>{loadingStats ? "Loading..." : stats.primaryLabel}</h3>
                <p className="number">
                  {loadingStats ? "--" : stats.primaryValue}
                </p>
              </div>
              <div className="stat-icon gray">🏠</div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <h3>Booking Requests</h3>
                <p className="number">
                  {loadingStats ? "--" : stats.bookingRequests || 0}
                </p>
              </div>
              <div className="stat-icon orange">📋</div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <h3>Unread Messages</h3>
                <p className="number">
                  {loadingStats ? "--" : stats.unreadMessages}
                </p>
              </div>
              <div className="stat-icon blue">💬</div>
            </div>
          </>
        ) : (
          <>
            <div className="stat-card">
              <div className="stat-info">
                <h3>{loadingStats ? "Loading..." : stats.primaryLabel}</h3>
                <p className="number">
                  {loadingStats ? "--" : stats.primaryValue}
                </p>
              </div>
              <div className="stat-icon gray">📅</div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <h3>Accepted Bookings</h3>
                <p className="number">
                  {loadingStats ? "--" : stats.acceptedBookings || 0}
                </p>
              </div>
              <div className="stat-icon green">✅</div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <h3>Unread Messages</h3>
                <p className="number">
                  {loadingStats ? "--" : stats.unreadMessages}
                </p>
              </div>
              <div className="stat-icon blue">💬</div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <h3>Pending Bookings</h3>
                <p className="number">
                  {loadingStats ? "--" : stats.pendingBookings || 0}
                </p>
              </div>
              <div className="stat-icon orange">⏳</div>
            </div>
          </>
        )}
      </section>

      <div className="dashboard-grid">
        <div className="feature-section">
          <h2 className="group-title">Property Management</h2>
          <div className="button-grid">
            {user.role === "owner" ? (
              <>
                <Link to="/add-property" className="feature-btn">
                  <span className="btn-icon">➕</span>
                  <div className="btn-label">
                    <strong>Add Property</strong>
                    <small>List a new space</small>
                  </div>
                </Link>
                <Link to="/my-properties" className="feature-btn">
                  <span className="btn-icon">📑</span>
                  <div className="btn-label">
                    <strong>My Properties</strong>
                    <small>Manage your listings</small>
                  </div>
                </Link>
              </>
            ) : (
              <Link to="/properties" className="feature-btn">
                <span className="btn-icon">🔍</span>
                <div className="btn-label">
                  <strong>Browse Properties</strong>
                  <small>Find your next home</small>
                </div>
              </Link>
            )}
            <Link to="/my-bookings" className="feature-btn">
              <span className="btn-icon">📅</span>
              <div className="btn-label">
                <strong>My Bookings</strong>
                <small>View booking history</small>
              </div>
            </Link>
          </div>
        </div>

        <div className="feature-section">
          <h2 className="group-title">Account & Communication</h2>
          <div className="button-grid">
            <Link to="/chats" className="feature-btn">
              <span className="btn-icon">💬</span>
              <div className="btn-label">
                <strong>Messages</strong>
                <small>
                  Contact {user.role === "owner" ? "tenants" : "owners"}
                </small>
              </div>
            </Link>
            <Link to="/profile" className="feature-btn">
              <span className="btn-icon">👤</span>
              <div className="btn-label">
                <strong>Edit Profile</strong>
                <small>Update your details</small>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
