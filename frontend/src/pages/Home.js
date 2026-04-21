import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";

function Home() {
  const navigate = useNavigate();

  const handleNavigation = (role) => {
    // Passes the selected role to the Register page state
    navigate("/register", { state: { role } });
  };

  // High-quality placeholder images
  const tenantImg = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1500";
  const ownerImg = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1500";

  return (
    <div className="modern-home">
      <nav className="main-nav">
        <div className="nav-brand">RENTAL MANAGER</div>
        <div className="nav-actions">
          <button className="btn-text" onClick={() => navigate("/login")}>Login</button>
          <button className="btn-primary-sm" onClick={() => navigate("/register")}>Get Started</button>
        </div>
      </nav>

      <main className="split-screen">
        {/* LEFT: TENANT */}
        <section 
          className="split-panel tenant-panel"
          style={{ backgroundImage: `url(${tenantImg})` }}
        >
          <div className="panel-content">
            <span className="panel-subtitle">For Seekers</span>
            <h2 className="panel-title">Find your <br /><span className="accent-text">perfect</span> space.</h2>
            <p className="panel-description">Browse curated listings, connect with verified owners, and secure your new home effortlessly.</p>
            <button className="panel-cta" onClick={() => handleNavigation("tenant")}>
              Explore Homes
            </button>
          </div>
        </section>

        {/* RIGHT: OWNER */}
        <section 
          className="split-panel owner-panel"
          style={{ backgroundImage: `url(${ownerImg})` }}
        >
          <div className="panel-content">
            <span className="panel-subtitle">For Owners</span>
            <h2 className="panel-title">Manage with <br /><span className="accent-text">clarity</span> & ease.</h2>
            <p className="panel-description">Verify your property, list in minutes, accept bookings, and track your revenue securely.</p>
            <button className="panel-cta cta-dark" onClick={() => handleNavigation("owner")}>
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