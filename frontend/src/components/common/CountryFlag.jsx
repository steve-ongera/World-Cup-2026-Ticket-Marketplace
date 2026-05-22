import React from "react";
import { countryFlag } from "../../utils/formatters.js";

export default function CountryFlag({ country, size = "md", showName = false }) {
  const sizes = { sm: "1rem", md: "1.4rem", lg: "2rem" };
  const flag = countryFlag(country);
  const name = country?.name ?? "";

  return (
    <span
      style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
      title={name}
    >
      <span style={{ fontSize: sizes[size], lineHeight: 1 }}>{flag}</span>
      {showName && (
        <span style={{ fontSize: "0.875rem", color: "var(--ko-text-primary)" }}>{name}</span>
      )}
    </span>
  );
}