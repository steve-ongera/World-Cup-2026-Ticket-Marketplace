import React from "react";
import { useNavigate } from "react-router-dom";
import {
  formatPrice, categoryLabel, categoryCssClass, seatDescription, timeAgo,
} from "../../utils/formatters.js";
import SellerBadge from "../user/SellerBadge.jsx";

export default function ListingCard({ listing, onBuy }) {
  const navigate = useNavigate();

  return (
    <div className="listing-row">
      {/* Category */}
      <div>
        <span className={`badge-ko ${categoryCssClass(listing.category)}`}>
          {categoryLabel(listing.category)}
        </span>
        {listing.is_early_delivery && (
          <span className="badge-ko badge-early-delivery ms-1">
            <i className="bi bi-lightning-fill" /> Early Delivery
          </span>
        )}
        <div
          className="col-section"
          style={{ fontSize: "0.78rem", color: "var(--ko-text-muted)", marginTop: "0.2rem" }}
        >
          {seatDescription(listing)}
        </div>
      </div>

      {/* Seller */}
      <div style={{ textAlign: "center" }}>
        <SellerBadge seller={listing.seller} />
        <div style={{ fontSize: "0.7rem", color: "var(--ko-text-muted)", marginTop: "0.2rem" }}>
          {timeAgo(listing.created_at)}
        </div>
      </div>

      {/* Quantity */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>
          ×{listing.quantity}
        </div>
        <div style={{ fontSize: "0.72rem", color: "var(--ko-text-muted)" }}>tickets</div>
      </div>

      {/* Price */}
      <div style={{ textAlign: "right" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "1.1rem",
            fontWeight: 600,
            color: "var(--ko-pitch)",
          }}
        >
          {formatPrice(listing.price_per_ticket, listing.currency)}
        </div>
        <div style={{ fontSize: "0.72rem", color: "var(--ko-text-muted)" }}>per ticket</div>
        {listing.face_value && (
          <div style={{ fontSize: "0.7rem", color: "var(--ko-text-muted)", textDecoration: "line-through" }}>
            {formatPrice(listing.face_value, listing.currency)} face
          </div>
        )}
      </div>

      {/* Buy */}
      <div>
        <button
          className="btn-ko-primary"
          onClick={() =>
            onBuy
              ? onBuy(listing)
              : navigate(`/checkout/${listing.id}`)
          }
        >
          BUY
        </button>
      </div>
    </div>
  );
}