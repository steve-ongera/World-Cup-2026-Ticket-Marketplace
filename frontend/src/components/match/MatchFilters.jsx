import React from "react";

const STAGES = [
  { value: "", label: "All Stages" },
  { value: "group",        label: "Group Stage" },
  { value: "round_of_32",  label: "Round of 32" },
  { value: "round_of_16",  label: "Round of 16" },
  { value: "quarter_final",label: "Quarter Finals" },
  { value: "semi_final",   label: "Semi Finals" },
  { value: "bronze_final", label: "Bronze Final" },
  { value: "final",        label: "Final" },
];

const GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"];

export default function MatchFilters({ filters, onChange }) {
  function set(key, value) {
    onChange({ ...filters, [key]: value, page: 1 });
  }

  return (
    <div
      style={{
        background: "var(--ko-bg-surface)",
        border: "1px solid var(--ko-border)",
        borderRadius: "var(--radius-lg)",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
      }}
    >
      <div style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ko-text-muted)" }}>
        Filters
      </div>

      {/* Stage */}
      <div className="ko-field" style={{ marginBottom: 0 }}>
        <label className="ko-label">Stage</label>
        <select
          className="ko-select"
          value={filters.stage ?? ""}
          onChange={(e) => set("stage", e.target.value)}
        >
          {STAGES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Group (only when stage is group) */}
      {(filters.stage === "group" || !filters.stage) && (
        <div className="ko-field" style={{ marginBottom: 0 }}>
          <label className="ko-label">Group</label>
          <select
            className="ko-select"
            value={filters.group ?? ""}
            onChange={(e) => set("group", e.target.value)}
          >
            <option value="">All Groups</option>
            {GROUPS.map((g) => (
              <option key={g} value={g}>Group {g}</option>
            ))}
          </select>
        </div>
      )}

      {/* Date range */}
      <div className="ko-field" style={{ marginBottom: 0 }}>
        <label className="ko-label">Date From</label>
        <input
          type="date"
          className="ko-input"
          value={filters.date_from ?? ""}
          min="2026-06-11"
          max="2026-07-19"
          onChange={(e) => set("date_from", e.target.value)}
        />
      </div>
      <div className="ko-field" style={{ marginBottom: 0 }}>
        <label className="ko-label">Date To</label>
        <input
          type="date"
          className="ko-input"
          value={filters.date_to ?? ""}
          min="2026-06-11"
          max="2026-07-19"
          onChange={(e) => set("date_to", e.target.value)}
        />
      </div>

      {/* Price range */}
      <div className="ko-field" style={{ marginBottom: 0 }}>
        <label className="ko-label">Min Price (€)</label>
        <input
          type="number"
          className="ko-input"
          placeholder="e.g. 100"
          value={filters.min_price ?? ""}
          min={0}
          onChange={(e) => set("min_price", e.target.value)}
        />
      </div>
      <div className="ko-field" style={{ marginBottom: 0 }}>
        <label className="ko-label">Max Price (€)</label>
        <input
          type="number"
          className="ko-input"
          placeholder="e.g. 5000"
          value={filters.max_price ?? ""}
          min={0}
          onChange={(e) => set("max_price", e.target.value)}
        />
      </div>

      {/* Sort */}
      <div className="ko-field" style={{ marginBottom: 0 }}>
        <label className="ko-label">Sort By</label>
        <select
          className="ko-select"
          value={filters.ordering ?? "match_date"}
          onChange={(e) => set("ordering", e.target.value)}
        >
          <option value="match_date">Date (earliest)</option>
          <option value="-match_date">Date (latest)</option>
          <option value="min_price">Price (lowest)</option>
          <option value="-min_price">Price (highest)</option>
        </select>
      </div>

      {/* Reset */}
      {Object.values(filters).some(Boolean) && (
        <button
          className="btn-ko-ghost w-full"
          onClick={() => onChange({ ordering: "match_date" })}
          style={{ width: "100%", justifyContent: "center" }}
        >
          <i className="bi bi-x-circle" /> Clear Filters
        </button>
      )}
    </div>
  );
}