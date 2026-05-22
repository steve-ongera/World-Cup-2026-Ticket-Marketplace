import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ordersApi } from "../utils/api.js";
import { formatPrice, formatMatchDateTime, orderStatusLabel } from "../utils/formatters.js";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";

export default function OrderConfirmPage() {
  const { orderId } = useParams();
  const navigate    = useNavigate();
  const [order, setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.detail(orderId)
      .then(({ data }) => setOrder(data))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <LoadingSpinner fullPage text="Loading order…" />;

  const match = order?.listing?.match;
  const homeName = match?.home_team?.name ?? match?.home_team_placeholder ?? "TBD";
  const awayName = match?.away_team?.name ?? match?.away_team_placeholder ?? "TBD";

  return (
    <div className="container-ko section-gap" style={{ maxWidth: 600, margin: "0 auto" }}>
      {/* Success icon */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div
          style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "var(--ko-pitch-glow)", border: "2px solid var(--ko-pitch)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1.25rem", fontSize: "2rem", color: "var(--ko-pitch)",
          }}
        >
          <i className="bi bi-check-lg" />
        </div>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Order Confirmed!</h1>
        <p style={{ color: "var(--ko-text-muted)" }}>
          Your tickets are on their way. Check your email for delivery details.
        </p>
      </div>

      {/* Order card */}
      {order && (
        <div className="ko-card" style={{ marginBottom: "1.5rem" }}>
          <div className="ko-card-body">
            <div style={{ fontSize: "0.72rem", color: "var(--ko-text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.75rem" }}>
              Order #{order.id.slice(0, 8).toUpperCase()}
            </div>

            <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.5rem" }}>
              {homeName} vs {awayName}
            </div>
            {match?.match_date && (
              <div style={{ fontSize: "0.875rem", color: "var(--ko-text-muted)", marginBottom: "0.35rem" }}>
                <i className="bi bi-calendar3 me-1" />{formatMatchDateTime(match.match_date)}
              </div>
            )}
            {match?.venue && (
              <div style={{ fontSize: "0.875rem", color: "var(--ko-text-muted)", marginBottom: "1rem" }}>
                <i className="bi bi-geo-alt me-1" />{match.venue.name}, {match.venue.city}
              </div>
            )}

            <hr className="ko-divider" />

            {[
              { label: "Quantity",      value: `${order.quantity} ticket${order.quantity > 1 ? "s" : ""}` },
              { label: "Total Paid",    value: formatPrice(order.total_price, order.currency) },
              { label: "FIFA Email",    value: order.fifa_ticketing_email },
              { label: "Status",        value: orderStatusLabel(order.status) },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "0.35rem 0", fontSize: "0.875rem" }}>
                <span style={{ color: "var(--ko-text-muted)" }}>{label}</span>
                <span style={{ fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next steps */}
      <div
        style={{
          background: "var(--ko-bg-surface)",
          border: "1px solid var(--ko-border)",
          borderRadius: "var(--radius-lg)",
          padding: "1.25rem",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: "0.875rem" }}>What happens next?</div>
        {[
          { icon: "bi-phone",       text: "Download the FIFA World Cup 2026 App (iOS or Android)." },
          { icon: "bi-person-badge",text: "Create a FIFA ID using the same email you provided." },
          { icon: "bi-ticket",      text: "Your tickets will appear in the app on the release date." },
          { icon: "bi-qr-code",     text: "Show your QR code at the stadium gate on match day." },
        ].map(({ icon, text }, i) => (
          <div key={i} style={{ display: "flex", gap: "0.75rem", marginBottom: "0.6rem", fontSize: "0.875rem" }}>
            <i className={`bi ${icon} text-pitch`} style={{ flexShrink: 0, marginTop: 2 }} />
            <span style={{ color: "var(--ko-text-secondary)" }}>{text}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "0.75rem" }}>
        <Link to="/dashboard" className="btn-ko-primary" style={{ flex: 1, justifyContent: "center" }}>
          <i className="bi bi-grid me-1" /> My Orders
        </Link>
        <Link to="/matches" className="btn-ko-ghost" style={{ flex: 1, justifyContent: "center" }}>
          Browse More Matches
        </Link>
      </div>
    </div>
  );
}