import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";

function Home() {
  const navigate = useNavigate();

  const handleNavigation = (role) => {
    navigate("/register", { state: { role } });
  };

  const tenantImg =
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1500";
  const ownerImg =
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1500";

  return (
    <div className="modern-home">
      <nav className="main-nav">
        <div className="nav-brand">RENTAL MANAGER</div>
        <div className="nav-actions">
          <button className="btn-text" onClick={() => navigate("/login")}>
            Login
          </button>
        </div>
      </nav>

      <main className="split-screen">
        <section
          className="split-panel tenant-panel"
          style={{ backgroundImage: `url(${tenantImg})` }}
        >
          <div className="panel-content">
            <span className="panel-subtitle">For Tenants</span>
            <h2 className="panel-title">
              Find your <br />
              <span className="accent-text">perfect</span> space.
            </h2>
            <p className="panel-description">
              Browse properties, connect with owners, and find your new home
              effortlessly.
            </p>
            <button
              className="panel-cta"
              onClick={() => handleNavigation("tenant")}
            >
              Explore Homes
            </button>
          </div>
        </section>

        <section
          className="split-panel owner-panel"
          style={{ backgroundImage: `url(${ownerImg})` }}
        >
          <div className="panel-content">
            <span className="panel-subtitle">For Owners</span>
            <h2 className="panel-title">
              Manage with <br />
              <span className="accent-text">clarity</span> & ease.
            </h2>
            <p className="panel-description">
              List your properties in minutes, accept bookings and connect with
              tenants.
            </p>
            <button
              className="panel-cta cta-dark"
              onClick={() => handleNavigation("owner")}
            >
              List Your Property
            </button>
          </div>
        </section>
      </main>

      <footer className="minimal-footer">
        © 2026 Rental Manager Platform. All rights reserved.
      </footer>
    </div>
  );
}

export default Home;
