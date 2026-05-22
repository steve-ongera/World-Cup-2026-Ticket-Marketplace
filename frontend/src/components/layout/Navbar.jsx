import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate  = useNavigate();
  const [search, setSearch]     = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const dropRef = useRef(null);

  /* Close dropdown on outside click */
  useEffect(() => {
    function handler(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/matches?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  }

  async function handleLogout() {
    setMenuOpen(false);
    await logout();
    navigate("/");
  }

  return (
    <nav className="ko-navbar" role="navigation" aria-label="Main navigation">
      {/* Brand */}
      <Link to="/" className="ko-navbar-brand" aria-label="KickOff Tickets home">
        <i className="bi bi-trophy-fill text-pitch" />
        KICKOFF
        <span className="brand-dot" />
      </Link>

      {/* Search */}
      <form className="ko-navbar-search" onSubmit={handleSearch} role="search">
        <i className="bi bi-search search-icon" aria-hidden="true" />
        <input
          className="ko-input"
          type="search"
          placeholder="Search teams, venues…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search matches"
        />
      </form>

      {/* Nav links */}
      <div className="ko-nav-links">
        <NavLink
          to="/matches"
          className={({ isActive }) => `ko-nav-link${isActive ? " active" : ""}`}
        >
          <i className="bi bi-calendar3" /> Matches
        </NavLink>

        {isAuthenticated && (
          <>
            <NavLink
              to="/sell"
              className={({ isActive }) => `ko-nav-link${isActive ? " active" : ""}`}
            >
              <i className="bi bi-tag" /> Sell
            </NavLink>
            <NavLink
              to="/wishlist"
              className={({ isActive }) => `ko-nav-link${isActive ? " active" : ""}`}
            >
              <i className="bi bi-heart" /> Wishlist
            </NavLink>
          </>
        )}

        {/* Auth section */}
        {isAuthenticated ? (
          <div className="position-relative" ref={dropRef}>
            <button
              className="ko-nav-link d-flex align-items-center gap-2"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-haspopup="true"
            >
              <span
                style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "var(--ko-pitch)", color: "var(--ko-text-inverse)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.75rem", fontWeight: 700, flexShrink: 0,
                }}
              >
                {(user?.username ?? "U")[0].toUpperCase()}
              </span>
              <span className="d-none d-md-inline">{user?.username}</span>
              <i className={`bi bi-chevron-${menuOpen ? "up" : "down"}`} style={{ fontSize: "0.7rem" }} />
            </button>

            {menuOpen && (
              <div
                style={{
                  position: "absolute", right: 0, top: "calc(100% + 8px)",
                  background: "var(--ko-bg-elevated)", border: "1px solid var(--ko-border)",
                  borderRadius: "var(--radius-lg)", minWidth: 200, zIndex: 999,
                  boxShadow: "var(--shadow-modal)", overflow: "hidden",
                  animation: "modalIn 0.15s ease",
                }}
              >
                <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--ko-border)" }}>
                  <div style={{ fontSize: "0.78rem", color: "var(--ko-text-muted)" }}>Signed in as</div>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem", marginTop: 2 }}>{user?.email}</div>
                </div>
                {[
                  { to: "/dashboard", icon: "bi-grid", label: "Dashboard" },
                  { to: "/profile",   icon: "bi-person", label: "Profile" },
                  { to: "/wishlist",  icon: "bi-heart",  label: "Wishlist" },
                  { to: "/sell",      icon: "bi-tag",    label: "Sell Tickets" },
                ].map(({ to, icon, label }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.6rem",
                      padding: "0.65rem 1rem", color: "var(--ko-text-primary)",
                      fontSize: "0.875rem", transition: "background var(--t-fast)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ko-bg-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <i className={`bi ${icon}`} style={{ color: "var(--ko-text-muted)", width: 16 }} />
                    {label}
                  </Link>
                ))}
                <div style={{ borderTop: "1px solid var(--ko-border)" }}>
                  <button
                    onClick={handleLogout}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.6rem",
                      padding: "0.65rem 1rem", color: "var(--ko-red)",
                      fontSize: "0.875rem", width: "100%", background: "none",
                      border: "none", cursor: "pointer", transition: "background var(--t-fast)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,59,59,0.06)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <i className="bi bi-box-arrow-right" style={{ width: 16 }} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login" className="ko-nav-link">Sign In</Link>
            <Link to="/register" className="btn-ko-primary ms-1">
              Get Tickets
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}