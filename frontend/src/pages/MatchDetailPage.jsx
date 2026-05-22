import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { matchesApi, wishlistApi } from "../utils/api.js";
import { formatMatchDateTime, stageLabel, stageCssClass, formatNumber, categoryLabel } from "../utils/formatters.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import CountryFlag from "../components/common/CountryFlag.jsx";
import ListingCard from "../components/ticket/ListingCard.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import ErrorAlert from "../components/common/ErrorAlert.jsx";

const CATEGORY_FILTER = [
  { value: "", label: "All Categories" },
  { value: "behind_goal",  label: "Behind Goal" },
  { value: "side_line",    label: "Side Line" },
  { value: "center_line",  label: "Center Line" },
  { value: "vip",          label: "VIP" },
  { value: "accessibility",label: "Accessibility" },
];

export default function MatchDetailPage() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { user }     = useAuth();
  const { selectListing } = useCart();

  const [match, setMatch]           = useState(null);
  const [listings, setListings]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [catFilter, setCatFilter]   = useState("");
  const [sortBy, setSortBy]         = useState("price_per_ticket");
  const [wishlisted, setWishlisted] = useState(null); // null = unknown, obj = wishlisted item
  const [wishLoading, setWishLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    matchesApi.detail(id)
      .then(({ data }) => {
        setMatch(data);
        setListings(data.listings ?? []);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user && id) {
      wishlistApi.check(id).then(setWishlisted).catch(() => {});
    }
  }, [user, id]);

  async function toggleWishlist() {
    if (!user) { navigate("/login"); return; }
    setWishLoading(true);
    try {
      if (wishlisted) {
        await wishlistApi.remove(wishlisted.id);
        setWishlisted(null);
      } else {
        const { data } = await wishlistApi.add(id);
        setWishlisted(data);
      }
    } catch { /* ignore */ } finally { setWishLoading(false); }
  }

  function handleBuy(listing) {
    if (!user) { navigate("/login"); return; }
    selectListing(listing);
    navigate(`/checkout/${listing.id}`);
  }

  if (loading) return <LoadingSpinner fullPage text="Loading match…" />;
  if (error)   return <div className="container-ko section-gap"><ErrorAlert error={error} onRetry={() => window.location.reload()} /></div>;
  if (!match)  return null;

  const homeName = match.home_team?.name ?? match.home_team_placeholder ?? "TBD";
  const awayName = match.away_team?.name ?? match.away_team_placeholder ?? "TBD";

  const filtered = listings
    .filter((l) => !catFilter || l.category === catFilter)
    .sort((a, b) =>
      sortBy === "price_per_ticket"
        ? a.price_per_ticket - b.price_per_ticket
        : b.price_per_ticket - a.price_per_ticket
    );

  return (
    <div>
      {/* ─── Hero ─── */}
      <div
        style={{
          background: "linear-gradient(180deg, var(--ko-bg-elevated) 0%, var(--ko-bg-base) 100%)",
          borderBottom: "1px solid var(--ko-border)",
          padding: "2.5rem 0",
        }}
      >
        <div className="container-ko">
          {/* Breadcrumb */}
          <div style={{ fontSize: "0.78rem", color: "var(--ko-text-muted)", marginBottom: "1rem", display: "flex", gap: "0.4rem", alignItems: "center" }}>
            <button className="btn-icon" onClick={() => navigate("/matches")}>
              <i className="bi bi-arrow-left" />
            </button>
            <span
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/matches")}
              onMouseEnter={(e) => (e.target.style.color = "var(--ko-pitch)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--ko-text-muted)")}
            >
              All Matches
            </span>
            <span>/</span>
            <span>{match.match_number}</span>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              {/* Stage badge */}
              <span className={`badge-ko ${stageCssClass(match.stage)}`} style={{ marginBottom: "0.875rem", display: "inline-flex" }}>
                {stageLabel(match.stage)}
                {match.group ? ` · Group ${match.group}` : ""}
              </span>

              {/* Teams */}
              <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "0.875rem", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {match.home_team && <CountryFlag country={match.home_team} size="lg" />}
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem,4vw,2.8rem)", letterSpacing: "0.04em" }}>{homeName}</span>
                </div>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--ko-text-muted)", fontSize: "1.1rem" }}>vs</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem,4vw,2.8rem)", letterSpacing: "0.04em" }}>{awayName}</span>
                  {match.away_team && <CountryFlag country={match.away_team} size="lg" />}
                </div>
              </div>

              {/* Meta */}
              <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
                {[
                  { icon: "bi-calendar3", text: formatMatchDateTime(match.match_date) },
                  match.venue && { icon: "bi-geo-alt", text: `${match.venue.name}, ${match.venue.city}, ${match.venue.country}` },
                  { icon: "bi-ticket",    text: `${formatNumber(listings.length)} tickets available` },
                ].filter(Boolean).map(({ icon, text }) => (
                  <span key={text} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.875rem", color: "var(--ko-text-secondary)" }}>
                    <i className={`bi ${icon} text-pitch`} />
                    {text}
                  </span>
                ))}
              </div>
            </div>

            {/* Wishlist button */}
            <button
              className="btn-ko-ghost"
              onClick={toggleWishlist}
              disabled={wishLoading}
              style={wishlisted ? { borderColor: "var(--ko-red)", color: "var(--ko-red)" } : {}}
            >
              <i className={`bi bi-heart${wishlisted ? "-fill" : ""}`} />
              {wishlisted ? "Saved" : "Save Match"}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Listings ─── */}
      <div className="container-ko section-gap-sm">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.3rem", margin: 0 }}>
            Available Tickets
            <span style={{ fontSize: "0.875rem", color: "var(--ko-text-muted)", fontFamily: "var(--font-body)", fontWeight: 400, marginLeft: "0.5rem" }}>
              ({filtered.length})
            </span>
          </h2>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <select className="ko-select" style={{ width: "auto" }} value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
              {CATEGORY_FILTER.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <select className="ko-select" style={{ width: "auto" }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="price_per_ticket">Price: Low → High</option>
              <option value="-price_per_ticket">Price: High → Low</option>
            </select>
          </div>
        </div>

        {/* Table header */}
        <div
          style={{
            background: "var(--ko-bg-surface)",
            border: "1px solid var(--ko-border)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto auto auto auto",
              gap: "1rem",
              padding: "0.75rem 1.5rem",
              borderBottom: "1px solid var(--ko-border)",
            }}
          >
            {["Category / Seat", "Seller", "Qty", "Price / Ticket", ""].map((h) => (
              <div key={h} style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--ko-text-muted)" }}>{h}</div>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><i className="bi bi-ticket-perforated" /></div>
              <div className="empty-state-title">No tickets found</div>
              <div className="empty-state-desc">Try a different category or check back later.</div>
            </div>
          ) : (
            filtered.map((listing) => (
              <ListingCard key={listing.id} listing={listing} onBuy={handleBuy} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}