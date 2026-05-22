import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { referenceApi, matchesApi } from "../utils/api.js";
import { formatPrice, stageLabel, stageCssClass } from "../utils/formatters.js";
import MatchCard from "../components/match/MatchCard.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";

const STAGE_PRICE_TABLE = [
  { stage: "group",         label: "Group Stage",    matches: 72, from: 168,  avail: "High" },
  { stage: "round_of_32",  label: "Round of 32",    matches: 16, from: 389,  avail: "Moderate" },
  { stage: "round_of_16",  label: "Round of 16",    matches: 8,  from: 739,  avail: "Moderate" },
  { stage: "quarter_final",label: "Quarter Finals",  matches: 4,  from: 1219, avail: "Limited" },
  { stage: "semi_final",   label: "Semi Finals",     matches: 2,  from: 2014, avail: "Limited" },
  { stage: "bronze_final", label: "Bronze Final",    matches: 1,  from: 908,  avail: "Moderate" },
  { stage: "final",        label: "Final",           matches: 1,  from: 7735, avail: "Very Limited" },
];

const HOW_IT_WORKS = [
  { icon: "bi-search",       title: "Browse & Filter", desc: "Find your match by team, venue, date, or price. Compare all available ticket options side by side." },
  { icon: "bi-ticket-perforated", title: "Choose Your Seats", desc: "Pick category, section, and quantity. See seller ratings and early delivery options." },
  { icon: "bi-credit-card",  title: "Secure Checkout",  desc: "Pay securely. No hidden fees. Your FIFA ticketing email receives the ticket via the official app." },
  { icon: "bi-phone",        title: "Enjoy the Game",   desc: "Download the FIFA World Cup 2026 app and your ticket will appear on your account before match day." },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [hotMatches, setHotMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      referenceApi.getSummary().catch(() => ({ data: null })),
      matchesApi.list({ ordering: "match_date", page_size: 6 }).catch(() => ({ data: { results: [] } })),
    ]).then(([sumRes, matchRes]) => {
      setSummary(sumRes.data);
      setHotMatches(matchRes.data?.results ?? []);
    }).finally(() => setLoading(false));
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    if (search.trim()) navigate(`/matches?search=${encodeURIComponent(search.trim())}`);
  }

  return (
    <div>
      {/* ─── Hero ─── */}
      <section className="hero-section">
        <div className="hero-grid-bg" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="container-ko" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: 720 }}>
            <div
              className="badge-ko badge-stage-group fade-in"
              style={{ marginBottom: "1.25rem", fontSize: "0.78rem" }}
            >
              <i className="bi bi-trophy-fill" /> FIFA World Cup 2026 · 11 Jun – 19 Jul
            </div>
            <h1 className="display-hero fade-in fade-in-delay-1">
              GET YOUR<br />
              <span className="text-pitch">WORLD CUP</span><br />
              TICKETS
            </h1>
            <p
              className="fade-in fade-in-delay-2"
              style={{ fontSize: "1.05rem", color: "var(--ko-text-secondary)", maxWidth: 480, margin: "1.5rem 0 2rem", lineHeight: 1.7 }}
            >
              All 104 matches across USA, Canada & Mexico. Verified sellers.
              Guaranteed delivery. Group stage from <strong style={{ color: "var(--ko-pitch)" }}>€168</strong>.
            </p>

            {/* Search bar */}
            <form
              onSubmit={handleSearch}
              className="fade-in fade-in-delay-3"
              style={{ display: "flex", gap: "0.5rem", maxWidth: 520, marginBottom: "1.5rem" }}
            >
              <div style={{ flex: 1, position: "relative" }}>
                <i
                  className="bi bi-search"
                  style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "var(--ko-text-muted)" }}
                />
                <input
                  className="ko-input"
                  style={{ paddingLeft: "2.4rem", height: 48 }}
                  placeholder="Search team, venue, or match…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="btn-ko-primary"
                style={{ height: 48, padding: "0 1.5rem", flexShrink: 0 }}
              >
                Search
              </button>
            </form>

            {/* Trust row */}
            <div className="fade-in fade-in-delay-4" style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              {[
                "✓ 100% Buyer Guarantee",
                "✓ Verified Sellers",
                "✓ No Hidden Fees",
                "✓ FIFA App Delivery",
              ].map((t) => (
                <span key={t} style={{ fontSize: "0.78rem", color: "var(--ko-text-muted)" }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stage Quick-Jump ─── */}
      <section style={{ background: "var(--ko-bg-surface)", borderBottom: "1px solid var(--ko-border)", padding: "1rem 0" }}>
        <div className="container-ko">
          <div className="stage-nav">
            {STAGE_PRICE_TABLE.map(({ stage, label }) => (
              <button
                key={stage}
                className="stage-pill"
                onClick={() => navigate(`/matches?stage=${stage}`)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats bar ─── */}
      {summary && (
        <section style={{ background: "var(--ko-bg-base)", borderBottom: "1px solid var(--ko-border)", padding: "1.25rem 0" }}>
          <div className="container-ko">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
              {[
                { value: summary.total_matches ?? 104, label: "Total Matches" },
                { value: `€${summary.min_group_price ?? 168}`, label: "Group Stage From" },
                { value: summary.total_listings ?? "10K+", label: "Tickets Available" },
                { value: `€${summary.min_final_price ?? "7,742"}`, label: "Final From" },
              ].map(({ value, label }) => (
                <div key={label} className="stat-card">
                  <div className="stat-value">{value}</div>
                  <div className="stat-label">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Featured Matches ─── */}
      <section className="section-gap">
        <div className="container-ko">
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.8rem", margin: 0 }}>Upcoming Matches</h2>
            <button className="btn-ko-ghost" onClick={() => navigate("/matches")}>
              View All <i className="bi bi-arrow-right" />
            </button>
          </div>

          {loading ? (
            <LoadingSpinner fullPage text="Loading matches…" />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1rem" }}>
              {hotMatches.map((m, i) => (
                <div key={m.id} className={`fade-in fade-in-delay-${Math.min(i + 1, 4)}`}>
                  <MatchCard match={m} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Price Table ─── */}
      <section className="section-gap" style={{ background: "var(--ko-bg-surface)" }}>
        <div className="container-ko">
          <h2 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>
            World Cup 2026 Ticket Prices
          </h2>
          <p style={{ color: "var(--ko-text-muted)", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
            Starting prices from the secondary market. Prices increase closer to match day.
          </p>

          <div className="ko-card">
            <div style={{ overflowX: "auto" }}>
              <div style={{ padding: "0.75rem 1.5rem", display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: "1.5rem", borderBottom: "1px solid var(--ko-border)" }}>
                {["Stage", "Matches", "Starting From", "Availability"].map((h) => (
                  <div key={h} style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ko-text-muted)" }}>{h}</div>
                ))}
              </div>
              {STAGE_PRICE_TABLE.map(({ stage, label, matches, from, avail }) => (
                <div
                  key={stage}
                  className="price-table-row"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/matches?stage=${stage}`)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <span className={`badge-ko ${stageCssClass(stage)}`}>{label}</span>
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", color: "var(--ko-text-secondary)" }}>{matches}</div>
                  <div style={{ fontFamily: "var(--font-mono)", color: "var(--ko-pitch)", fontWeight: 600 }}>
                    from {formatPrice(from, "EUR")}
                  </div>
                  <div>
                    <span style={{
                      fontSize: "0.72rem", fontWeight: 600, padding: "0.2rem 0.6rem",
                      borderRadius: "var(--radius-pill)",
                      background: avail === "High" ? "rgba(0,230,118,0.1)" : avail === "Very Limited" ? "rgba(255,59,59,0.1)" : "rgba(255,179,0,0.1)",
                      color: avail === "High" ? "var(--ko-pitch)" : avail === "Very Limited" ? "var(--ko-red)" : "var(--ko-amber)",
                    }}>{avail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="section-gap" id="how-it-works">
        <div className="container-ko">
          <h2 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>How It Works</h2>
          <p style={{ color: "var(--ko-text-muted)", marginBottom: "2rem", fontSize: "0.875rem" }}>
            Four simple steps to your World Cup seat.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" }}>
            {HOW_IT_WORKS.map(({ icon, title, desc }, i) => (
              <div key={title} className="ko-card">
                <div className="ko-card-body">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.875rem" }}>
                    <div
                      style={{
                        width: 44, height: 44, borderRadius: "var(--radius-md)",
                        background: "var(--ko-pitch-glow)", border: "1px solid rgba(0,230,118,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.2rem", color: "var(--ko-pitch)", flexShrink: 0,
                      }}
                    >
                      <i className={`bi ${icon}`} />
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--ko-text-muted)" }}>
                      STEP {String(i + 1).padStart(2, "0")}
                    </div>
                  </div>
                  <h3 style={{ fontSize: "1rem", fontFamily: "var(--font-body)", marginBottom: "0.4rem" }}>{title}</h3>
                  <p style={{ color: "var(--ko-text-muted)", fontSize: "0.875rem", lineHeight: 1.6, margin: 0 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}