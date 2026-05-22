import React from "react";

export default function SellerBadge({ seller }) {
  if (!seller) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
      <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>
        {seller.username}
      </span>
      {seller.is_verified_seller && (
        <span className="badge-ko badge-verified" style={{ fontSize: "0.65rem" }}>
          <i className="bi bi-patch-check-fill" /> Verified
        </span>
      )}
      {seller.average_rating != null && (
        <span style={{ fontSize: "0.72rem", color: "var(--ko-amber)", display: "flex", alignItems: "center", gap: "0.2rem" }}>
          <i className="bi bi-star-fill" />
          {seller.average_rating.toFixed(1)}
          <span style={{ color: "var(--ko-text-muted)" }}>({seller.total_reviews})</span>
        </span>
      )}
    </div>
  );
}