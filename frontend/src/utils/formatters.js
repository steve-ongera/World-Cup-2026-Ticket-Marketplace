/* ═══════════════════════════════════════════════════════
   formatters.js — Display helpers
═══════════════════════════════════════════════════════ */

/* ─── Currency ─── */

/**
 * Format a price number for display.
 * @param {number|string} amount
 * @param {string} currency  - ISO 4217 code, default "EUR"
 * @returns {string}  e.g. "€1,836"
 */
export function formatPrice(amount, currency = "EUR") {
  if (amount == null || amount === "") return "—";
  const num = parseFloat(amount);
  if (isNaN(num)) return "—";

  const symbols = { EUR: "€", USD: "$", GBP: "£", CAD: "CA$", MXN: "MX$" };
  const symbol = symbols[currency] ?? currency + " ";

  return (
    symbol +
    num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
  );
}

/**
 * Short price display with "from" label.
 * @returns {{ from: string, value: string }}
 */
export function priceDisplay(amount, currency = "EUR") {
  return {
    from: "from",
    value: formatPrice(amount, currency),
  };
}

/* ─── Dates ─── */

const MONTH_SHORT = [
  "JAN","FEB","MAR","APR","MAY","JUN",
  "JUL","AUG","SEP","OCT","NOV","DEC",
];
const MONTH_LONG = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const WEEKDAY_SHORT = ["SUN","MON","TUE","WED","THU","FRI","SAT"];

/**
 * Parse a date string or Date object safely.
 */
function toDate(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Returns { day, month, weekday } for the date strip on match cards.
 * e.g. { day: "11", month: "JUN", weekday: "THU" }
 */
export function matchDateParts(dateValue) {
  const d = toDate(dateValue);
  if (!d) return { day: "—", month: "—", weekday: "—" };
  return {
    day:     String(d.getDate()).padStart(2, "0"),
    month:   MONTH_SHORT[d.getMonth()],
    weekday: WEEKDAY_SHORT[d.getDay()],
  };
}

/**
 * Full date + time string.
 * e.g. "Thursday, 11 June 2026 · 18:00"
 */
export function formatMatchDateTime(dateValue) {
  const d = toDate(dateValue);
  if (!d) return "TBA";
  const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][d.getDay()];
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${weekday}, ${d.getDate()} ${MONTH_LONG[d.getMonth()]} ${d.getFullYear()} · ${time}`;
}

/**
 * Short date for tables/lists.
 * e.g. "11 Jun 2026"
 */
export function formatDateShort(dateValue) {
  const d = toDate(dateValue);
  if (!d) return "—";
  return `${d.getDate()} ${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Relative time (for reviews, listings).
 * e.g. "3 days ago", "just now"
 */
export function timeAgo(dateValue) {
  const d = toDate(dateValue);
  if (!d) return "";
  const secs = Math.floor((Date.now() - d.getTime()) / 1000);
  if (secs < 60)   return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  if (secs < 604800) return `${Math.floor(secs / 86400)}d ago`;
  return formatDateShort(d);
}

/* ─── Stage labels ─── */

const STAGE_LABELS = {
  group:        "Group Stage",
  round_of_32:  "Round of 32",
  round_of_16:  "Round of 16",
  quarter_final:"Quarter Final",
  semi_final:   "Semi Final",
  bronze_final: "Bronze Final",
  final:        "Final",
};

const STAGE_CSS = {
  group:        "badge-stage-group",
  round_of_32:  "badge-stage-r32",
  round_of_16:  "badge-stage-r16",
  quarter_final:"badge-stage-qf",
  semi_final:   "badge-stage-sf",
  bronze_final: "badge-stage-bronze",
  final:        "badge-stage-final",
};

export function stageLabel(stage) {
  return STAGE_LABELS[stage] ?? stage;
}

export function stageCssClass(stage) {
  return STAGE_CSS[stage] ?? "badge-stage-group";
}

/* ─── Category labels ─── */

const CATEGORY_LABELS = {
  behind_goal:  "Behind Goal",
  side_line:    "Side Line",
  center_line:  "Center Line",
  vip:          "VIP / Hospitality",
  accessibility:"Accessibility",
  match_pack:   "Match Pack",
};

const CATEGORY_CSS = {
  behind_goal:  "badge-cat-behind",
  side_line:    "badge-cat-side",
  center_line:  "badge-cat-center",
  vip:          "badge-cat-vip",
  accessibility:"badge-cat-access",
  match_pack:   "badge-cat-side",
};

export function categoryLabel(cat) {
  return CATEGORY_LABELS[cat] ?? cat;
}

export function categoryCssClass(cat) {
  return CATEGORY_CSS[cat] ?? "badge-cat-behind";
}

/* ─── Order status ─── */

const ORDER_STATUS_LABELS = {
  pending:            "Pending",
  payment_processing: "Processing",
  confirmed:          "Confirmed",
  tickets_sent:       "Tickets Sent",
  completed:          "Completed",
  cancelled:          "Cancelled",
  refunded:           "Refunded",
  disputed:           "Disputed",
};

const ORDER_STATUS_CSS = {
  pending:            "badge ko text-warning bg-warning bg-opacity-10",
  payment_processing: "badge text-info bg-info bg-opacity-10",
  confirmed:          "badge text-success bg-success bg-opacity-10",
  tickets_sent:       "badge text-primary bg-primary bg-opacity-10",
  completed:          "badge text-success bg-success bg-opacity-10",
  cancelled:          "badge text-danger bg-danger bg-opacity-10",
  refunded:           "badge text-secondary bg-secondary bg-opacity-10",
  disputed:           "badge text-warning bg-warning bg-opacity-10",
};

export function orderStatusLabel(status) {
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function orderStatusCss(status) {
  return ORDER_STATUS_CSS[status] ?? "badge text-secondary";
}

/* ─── Numbers ─── */

export function formatNumber(n) {
  if (n == null) return "0";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K+";
  return String(n);
}

export function pluralize(count, singular, plural) {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural ?? singular + "s"}`;
}

/* ─── Stars ─── */

/**
 * Returns array of 5 values: 'full' | 'half' | 'empty'
 */
export function ratingStars(rating) {
  return Array.from({ length: 5 }, (_, i) => {
    if (rating >= i + 1) return "full";
    if (rating >= i + 0.5) return "half";
    return "empty";
  });
}

/* ─── Flag ─── */

/**
 * Get flag emoji from country code or use stored emoji.
 * Falls back to a football emoji.
 */
export function countryFlag(country) {
  if (!country) return "⚽";
  if (country.flag_emoji) return country.flag_emoji;
  // Derive from ISO alpha-2 / alpha-3 code
  const code = (country.code ?? "").toUpperCase().slice(0, 2);
  if (code.length !== 2) return "🏳️";
  return String.fromCodePoint(
    ...code.split("").map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
  );
}

/* ─── Seat display ─── */

export function seatDescription({ section, row, seat_numbers }) {
  const parts = [];
  if (section) parts.push(`Sec ${section}`);
  if (row)     parts.push(`Row ${row}`);
  if (seat_numbers) parts.push(`Seats ${seat_numbers}`);
  return parts.length ? parts.join(" · ") : "General Admission";
}

/* ─── Truncate text ─── */

export function truncate(str, maxLen = 60) {
  if (!str) return "";
  return str.length > maxLen ? str.slice(0, maxLen - 1) + "…" : str;
}