import React from "react";

export default function LoadingSpinner({ size = "md", text = "", fullPage = false }) {
  const sizes = { sm: 20, md: 36, lg: 56 };
  const px = sizes[size] ?? sizes.md;

  const spinner = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
      <div
        style={{
          width: px, height: px,
          border: `3px solid var(--ko-border)`,
          borderTopColor: "var(--ko-pitch)",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }}
      />
      {text && (
        <span style={{ color: "var(--ko-text-muted)", fontSize: "0.875rem" }}>{text}</span>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (fullPage) {
    return (
      <div
        style={{
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {spinner}
      </div>
    );
  }

  return spinner;
}