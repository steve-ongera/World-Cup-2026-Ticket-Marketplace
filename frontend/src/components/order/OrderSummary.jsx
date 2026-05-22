import React from "react";
import { formatPrice, formatMatchDateTime, categoryLabel } from "../../utils/formatters.js";
import CountryFlag from "../common/CountryFlag.jsx";

export default function OrderSummary({ selection }) {
  const { listing, match, quantity, unitPrice, serviceFee, total, currency } = selection;
  if (!listing) return null;

  const homeName = match?.home_team?.name ?? match?.home_team_placeholder ?? "TBD";
  const awayName = match?.away_team?.name ?? match?.away_team_placeholder ?? "TBD";

  const rows = [
    { label: `${categoryLabel(listing.category)} × ${quantity}`, value: formatPrice(unitPrice * quantity, currency) },
    { label: "Service Fee", value: serviceFee > 0 ? formatPrice(serviceFee, currency) : "Free" },
  ];

  return (
    <div
      style={{
        background: "var(--ko-bg-surface)",
        border: "1px solid var(--ko-border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
      }}
    >
      {/* Match header */}
      <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--ko-border)" }}>
        <div style={{ fontSize: "0.72rem", color: "var(--ko-text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.5rem" }}>
          Order Summary
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
          {match?.home_team && <CountryFlag country={match.home_team} size="sm" />}
          <span style={{ fontWeight: 700, fontSize: "1rem" }}>{homeName}</span>
          <span style={{ color: "var(--ko-text-muted)", fontSize: "0.8rem" }}>vs</span>
          <span style={{ fontWeight: 700, fontSize: "1rem" }}>{awayName}</span>
          {match?.away_team && <CountryFlag country={match.away_team} size="sm" />}
        </div>
        {match?.match_date && (
          <div style={{ fontSize: "0.8rem", color: "var(--ko-text-muted)" }}>
            <i className="bi bi-calendar3 me-1" />
            {formatMatchDateTime(match.match_date)}
          </div>
        )}
        {match?.venue && (
          <div style={{ fontSize: "0.8rem", color: "var(--ko-text-muted)", marginTop: "0.15rem" }}>
            <i className="bi bi-geo-alt me-1" />
            {match.venue.name}, {match.venue.city}
          </div>
        )}
      </div>

      {/* Line items */}
      <div style={{ padding: "1rem 1.5rem" }}>
        {rows.map(({ label, value }) => (
          <div
            key={label}
            style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", fontSize: "0.875rem" }}
          >
            <span style={{ color: "var(--ko-text-secondary)" }}>{label}</span>
            <span style={{ fontFamily: "var(--font-mono)" }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div
        style={{
          padding: "1rem 1.5rem",
          borderTop: "1px solid var(--ko-border)",
          background: "rgba(0,230,118,0.04)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontWeight: 700 }}>Total</span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "1.4rem",
            fontWeight: 600,
            color: "var(--ko-pitch)",
          }}
        >
          {formatPrice(total, currency)}
        </span>
      </div>

      {/* Guarantees */}
      <div style={{ padding: "0.875rem 1.5rem", borderTop: "1px solid var(--ko-border)" }}>
        {[
          { icon: "bi-shield-check", text: "100% buyer guarantee" },
          { icon: "bi-patch-check",  text: "Verified seller" },
          { icon: "bi-phone",        text: "Delivered via FIFA World Cup 2026 App" },
        ].map(({ icon, text }) => (
          <div key={text} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.78rem", color: "var(--ko-text-muted)", marginBottom: "0.35rem" }}>
            <i className={`bi ${icon} text-pitch`} />
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}