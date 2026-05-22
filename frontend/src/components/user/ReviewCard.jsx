import React from "react";
import { ratingStars, timeAgo } from "../../utils/formatters.js";

export default function ReviewCard({ review }) {
  const stars = ratingStars(review.rating);

  return (
    <div
      style={{
        background: "var(--ko-bg-surface)",
        border: "1px solid var(--ko-border)",
        borderRadius: "var(--radius-lg)",
        padding: "1.1rem 1.25rem",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.6rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          {/* Avatar */}
          <div
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "var(--ko-pitch)", color: "var(--ko-text-inverse)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.875rem", fontWeight: 700, flexShrink: 0,
            }}
          >
            {(review.reviewer?.username ?? "?")[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>
              {review.reviewer?.username ?? "Anonymous"}
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--ko-text-muted)" }}>
              {timeAgo(review.created_at)}
            </div>
          </div>
        </div>

        {/* Stars */}
        <div className="stars">
          {stars.map((s, i) => (
            <i
              key={i}
              className={
                s === "full"  ? "bi bi-star-fill" :
                s === "half"  ? "bi bi-star-half" :
                                "bi bi-star empty"
              }
            />
          ))}
        </div>
      </div>

      {/* Comment */}
      {review.comment && (
        <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--ko-text-secondary)", lineHeight: 1.6 }}>
          "{review.comment}"
        </p>
      )}
    </div>
  );
}