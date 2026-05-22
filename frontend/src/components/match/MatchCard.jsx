import React from "react";
import { useNavigate } from "react-router-dom";
import { matchDateParts, stageLabel, stageCssClass, formatNumber } from "../../utils/formatters.js";
import PriceTag from "../common/PriceTag.jsx";
import CountryFlag from "../common/CountryFlag.jsx";

export default function MatchCard({ match, className = "" }) {
  const navigate = useNavigate();
  const { day, month, weekday } = matchDateParts(match.match_date);

  const homeTeam = match.home_team;
  const awayTeam = match.away_team;
  const homeName = homeTeam?.name ?? match.home_team_placeholder ?? "TBD";
  const awayName = awayTeam?.name ?? match.away_team_placeholder ?? "TBD";

  return (
    <article
      className={`match-card ${className}`}
      onClick={() => navigate(`/matches/${match.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/matches/${match.id}`)}
      aria-label={`${homeName} vs ${awayName} — ${day} ${month}`}
    >
      {/* Date strip + body side by side */}
      <div style={{ display: "flex" }}>
        {/* Date strip */}
        <div className="match-card-date-strip">
          <span className="month">{month}</span>
          <span className="day">{day}</span>
          <span className="weekday">{weekday}</span>
        </div>

        {/* Main body */}
        <div className="match-card-body" style={{ flex: 1 }}>
          {/* Stage badge */}
          <div style={{ marginBottom: "0.5rem" }}>
            <span className={`badge-ko ${stageCssClass(match.stage)}`}>
              {stageLabel(match.stage)}
              {match.group ? ` · Group ${match.group}` : ""}
            </span>
          </div>

          {/* Teams */}
          <div className="match-teams">
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", flex: 1, minWidth: 0 }}>
              {homeTeam && <CountryFlag country={homeTeam} size="sm" />}
              <span className="match-team-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {homeName}
              </span>
            </div>
            <span className="match-vs">vs</span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", flex: 1, minWidth: 0, justifyContent: "flex-end" }}>
              <span className="match-team-name" style={{ textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {awayName}
              </span>
              {awayTeam && <CountryFlag country={awayTeam} size="sm" />}
            </div>
          </div>

          {/* Venue */}
          {match.venue && (
            <div className="match-venue-text">
              <i className="bi bi-geo-alt" />
              {match.venue.name}, {match.venue.city}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="match-card-footer">
        <span className="match-ticket-count">
          <i className="bi bi-ticket" />
          {formatNumber(match.available_tickets)} tickets
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {match.is_sold_out ? (
            <span style={{ fontSize: "0.78rem", color: "var(--ko-red)", fontWeight: 600 }}>
              <i className="bi bi-x-circle" /> Sold Out
            </span>
          ) : (
            <PriceTag amount={match.min_price} currency="EUR" showFrom={true} size="sm" />
          )}
          <button
            className="btn-ko-primary"
            style={{ fontSize: "0.75rem", padding: "0.35rem 0.85rem" }}
            onClick={(e) => { e.stopPropagation(); navigate(`/matches/${match.id}`); }}
            disabled={match.is_sold_out}
          >
            BUY
          </button>
        </div>
      </div>
    </article>
  );
}