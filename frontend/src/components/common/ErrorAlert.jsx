import React from "react";

export default function ErrorAlert({ error, onRetry, className = "" }) {
  if (!error) return null;

  const message =
    typeof error === "string"
      ? error
      : error?.response?.data?.detail ??
        error?.response?.data?.message ??
        error?.message ??
        "Something went wrong. Please try again.";

  return (
    <div className={`ko-alert ko-alert-error ${className}`} role="alert">
      <i className="bi bi-exclamation-triangle-fill" style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1 }}>
        <span>{message}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              marginLeft: "0.75rem",
              background: "none",
              border: "none",
              color: "var(--ko-pitch)",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 600,
              padding: 0,
            }}
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}