import React from "react";
import { Link } from "react-router-dom";

const LINKS = {
  Matches: [
    { label: "All Matches",      to: "/matches" },
    { label: "Group Stage",      to: "/matches?stage=group" },
    { label: "Round of 32",      to: "/matches?stage=round_of_32" },
    { label: "Round of 16",      to: "/matches?stage=round_of_16" },
    { label: "Quarter Finals",   to: "/matches?stage=quarter_final" },
    { label: "Semi Finals",      to: "/matches?stage=semi_final" },
    { label: "Final",            to: "/matches?stage=final" },
  ],
  Account: [
    { label: "Sign In",          to: "/login" },
    { label: "Register",         to: "/register" },
    { label: "Dashboard",        to: "/dashboard" },
    { label: "My Orders",        to: "/dashboard?tab=orders" },
    { label: "Sell Tickets",     to: "/sell" },
    { label: "Wishlist",         to: "/wishlist" },
  ],
  Info: [
    { label: "How It Works",     to: "/#how-it-works" },
    { label: "Buyer Protection", to: "/#protection" },
    { label: "FAQ",              to: "/#faq" },
    { label: "Contact",          to: "/#contact" },
  ],
};

export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--ko-bg-surface)",
        borderTop: "1px solid var(--ko-border)",
        paddingTop: "3rem",
        marginTop: "auto",
      }}
    >
      <div className="container-ko">
        {/* Top grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.8fr repeat(3, 1fr)",
            gap: "2rem",
            paddingBottom: "2.5rem",
          }}
          className="footer-grid"
        >
          {/* Brand column */}
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.8rem",
                letterSpacing: "0.06em",
                marginBottom: "0.75rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <i className="bi bi-trophy-fill text-pitch" />
              KICKOFF
            </div>
            <p
              style={{
                color: "var(--ko-text-muted)",
                fontSize: "0.875rem",
                lineHeight: 1.7,
                maxWidth: 260,
                marginBottom: "1.25rem",
              }}
            >
              The guaranteed marketplace for FIFA World Cup 2026 tickets.
              All 104 matches. Verified sellers. Buyer protection on every order.
            </p>

            {/* Trust badges */}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {[
                { icon: "bi-shield-check",  label: "Buyer Protected" },
                { icon: "bi-patch-check",   label: "Verified Sellers" },
                { icon: "bi-lock-fill",     label: "Secure Checkout" },
              ].map(({ icon, label }) => (
                <span
                  key={label}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.3rem",
                    fontSize: "0.72rem", fontWeight: 600,
                    color: "var(--ko-text-secondary)",
                    background: "var(--ko-bg-elevated)",
                    border: "1px solid var(--ko-border)",
                    borderRadius: "var(--radius-pill)",
                    padding: "0.25rem 0.65rem",
                  }}
                >
                  <i className={`bi ${icon} text-pitch`} style={{ fontSize: "0.75rem" }} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, items]) => (
            <div key={title}>
              <div
                style={{
                  fontSize: "0.72rem", fontWeight: 700,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "var(--ko-text-muted)", marginBottom: "1rem",
                }}
              >
                {title}
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {items.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      style={{
                        color: "var(--ko-text-secondary)",
                        fontSize: "0.875rem",
                        transition: "color var(--t-fast)",
                      }}
                      onMouseEnter={(e) => (e.target.style.color = "var(--ko-pitch)")}
                      onMouseLeave={(e) => (e.target.style.color = "var(--ko-text-secondary)")}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid var(--ko-border)",
            padding: "1.25rem 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <span style={{ fontSize: "0.78rem", color: "var(--ko-text-muted)" }}>
            © {new Date().getFullYear()} KickOff Tickets. Prices may be higher or lower than face value.
          </span>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            {[
              { icon: "bi-twitter-x",  href: "https://twitter.com" },
              { icon: "bi-instagram",  href: "https://instagram.com" },
              { icon: "bi-facebook",   href: "https://facebook.com" },
            ].map(({ icon, href }) => (
              <a
                key={icon}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--ko-text-muted)", fontSize: "1.05rem", transition: "color var(--t-fast)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ko-pitch)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ko-text-muted)")}
              >
                <i className={`bi ${icon}`} />
              </a>
            ))}
            <span style={{ fontSize: "0.78rem", color: "var(--ko-text-muted)" }}>
              <Link to="/privacy" style={{ color: "inherit" }}>Privacy</Link>
              {" · "}
              <Link to="/terms" style={{ color: "inherit" }}>Terms</Link>
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}