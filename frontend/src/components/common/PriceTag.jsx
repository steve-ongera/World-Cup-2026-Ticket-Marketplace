import React from "react";
import { formatPrice } from "../../utils/formatters.js";

export default function PriceTag({ amount, currency = "EUR", showFrom = true, size = "md" }) {
  const fontSizes = { sm: "1rem", md: "1.35rem", lg: "1.8rem" };

  if (!amount && amount !== 0) {
    return <span style={{ color: "var(--ko-text-muted)", fontSize: "0.875rem" }}>Price TBA</span>;
  }

  return (
    <div className="price-tag">
      {showFrom && <span className="price-from">from</span>}
      <span className="price-value" style={{ fontSize: fontSizes[size] }}>
        {formatPrice(amount, currency)}
      </span>
    </div>
  );
}