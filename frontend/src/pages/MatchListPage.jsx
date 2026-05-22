import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { matchesApi } from "../utils/api.js";
import MatchCard from "../components/match/MatchCard.jsx";
import MatchFilters from "../components/match/MatchFilters.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import ErrorAlert from "../components/common/ErrorAlert.jsx";

export default function MatchListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [matches, setMatches]   = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filters = {
    stage:    searchParams.get("stage")    ?? "",
    group:    searchParams.get("group")    ?? "",
    search:   searchParams.get("search")   ?? "",
    ordering: searchParams.get("ordering") ?? "match_date",
    date_from:searchParams.get("date_from")?? "",
    date_to:  searchParams.get("date_to")  ?? "",
    page:     parseInt(searchParams.get("page") ?? "1"),
  };

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== "" && v !== 1 || typeof v === "number")
      );
      const { data } = await matchesApi.list({ ...params, page_size: 24 });
      setMatches(data.results ?? data);
      setTotal(data.count ?? (data.results ?? data).length);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [searchParams.toString()]);

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  function updateFilters(newFilters) {
    const params = {};
    Object.entries(newFilters).forEach(([k, v]) => { if (v) params[k] = v; });
    setSearchParams(params);
  }

  const totalPages = Math.ceil(total / 24);

  return (
    <div className="container-ko section-gap-sm">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", margin: 0 }}>World Cup 2026 Tickets</h1>
          <p style={{ color: "var(--ko-text-muted)", margin: "0.25rem 0 0", fontSize: "0.875rem" }}>
            {loading ? "Loading…" : `${total.toLocaleString()} matches found`}
          </p>
        </div>
        <button
          className="btn-ko-ghost d-md-none"
          onClick={() => setFiltersOpen((o) => !o)}
        >
          <i className={`bi bi-funnel${filtersOpen ? "-fill" : ""}`} /> Filters
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "1.5rem", alignItems: "start" }}>
        {/* Sidebar filters — desktop always visible, mobile toggleable */}
        <div className={`d-none d-md-block`}>
          <MatchFilters filters={filters} onChange={updateFilters} />
        </div>
        {filtersOpen && (
          <div className="d-md-none" style={{ gridColumn: "1 / -1" }}>
            <MatchFilters filters={filters} onChange={(f) => { updateFilters(f); setFiltersOpen(false); }} />
          </div>
        )}

        {/* Match grid */}
        <div>
          <ErrorAlert error={error} onRetry={fetchMatches} />

          {loading ? (
            <LoadingSpinner fullPage text="Loading matches…" />
          ) : matches.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><i className="bi bi-calendar-x" /></div>
              <div className="empty-state-title">No matches found</div>
              <div className="empty-state-desc">Try adjusting your filters or search term.</div>
              <button className="btn-ko-ghost" onClick={() => updateFilters({})}>Clear Filters</button>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
                {matches.map((m) => <MatchCard key={m.id} match={m} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "1rem" }}>
                  <button
                    className="btn-ko-ghost"
                    disabled={filters.page <= 1}
                    onClick={() => updateFilters({ ...filters, page: filters.page - 1 })}
                  >
                    <i className="bi bi-chevron-left" /> Prev
                  </button>
                  <span style={{ padding: "0.6rem 1rem", color: "var(--ko-text-muted)", fontSize: "0.875rem" }}>
                    Page {filters.page} of {totalPages}
                  </span>
                  <button
                    className="btn-ko-ghost"
                    disabled={filters.page >= totalPages}
                    onClick={() => updateFilters({ ...filters, page: filters.page + 1 })}
                  >
                    Next <i className="bi bi-chevron-right" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}