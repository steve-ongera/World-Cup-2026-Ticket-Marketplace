import React from "react";
import { orderStatusLabel, orderStatusCss } from "../../utils/formatters.js";

export default function OrderStatusBadge({ status }) {
  return (
    <span className={orderStatusCss(status)} style={{ fontSize: "0.72rem", padding: "0.25rem 0.65rem" }}>
      {orderStatusLabel(status)}
    </span>
  );
}