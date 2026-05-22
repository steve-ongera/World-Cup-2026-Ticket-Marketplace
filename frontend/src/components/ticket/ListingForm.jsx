import React, { useState, useEffect } from "react";
import { matchesApi, listingsApi } from "../../utils/api.js";
import ErrorAlert from "../common/ErrorAlert.jsx";

const CATEGORIES = [
  { value: "behind_goal",   label: "Behind Goal" },
  { value: "side_line",     label: "Side Line" },
  { value: "center_line",   label: "Center Line Block" },
  { value: "vip",           label: "VIP / Hospitality" },
  { value: "accessibility", label: "Accessibility" },
  { value: "match_pack",    label: "Match Pack" },
];

const INITIAL = {
  match: "",
  category: "behind_goal",
  quantity: 2,
  price_per_ticket: "",
  currency: "EUR",
  face_value: "",
  section: "",
  row: "",
  seat_numbers: "",
  is_early_delivery: false,
  notes: "",
};

export default function ListingForm({ existing = null, onSuccess }) {
  const [form, setForm]       = useState(existing ?? INITIAL);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    matchesApi.list({ page_size: 200, ordering: "match_date" })
      .then(({ data }) => setMatches(data.results ?? data))
      .catch(() => {});
  }, []);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = {
        ...form,
        quantity:         parseInt(form.quantity),
        price_per_ticket: parseFloat(form.price_per_ticket),
        face_value:       form.face_value ? parseFloat(form.face_value) : null,
      };
      if (existing) {
        await listingsApi.update(existing.id, payload);
      } else {
        await listingsApi.create(payload);
      }
      onSuccess?.();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <ErrorAlert error={error} />

      <div className="ko-field">
        <label className="ko-label">Match *</label>
        <select
          className="ko-select"
          value={form.match}
          onChange={(e) => set("match", e.target.value)}
          required
        >
          <option value="">Select a match…</option>
          {matches.map((m) => (
            <option key={m.id} value={m.id}>
              {m.display_name} — {m.venue?.city}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div className="ko-field">
          <label className="ko-label">Category *</label>
          <select
            className="ko-select"
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            required
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="ko-field">
          <label className="ko-label">Quantity *</label>
          <input
            type="number"
            className="ko-input"
            value={form.quantity}
            min={1} max={8}
            onChange={(e) => set("quantity", e.target.value)}
            required
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div className="ko-field">
          <label className="ko-label">Price Per Ticket (€) *</label>
          <input
            type="number"
            className="ko-input"
            placeholder="e.g. 850"
            value={form.price_per_ticket}
            min={1}
            step="0.01"
            onChange={(e) => set("price_per_ticket", e.target.value)}
            required
          />
        </div>
        <div className="ko-field">
          <label className="ko-label">Face Value (€)</label>
          <input
            type="number"
            className="ko-input"
            placeholder="Original price"
            value={form.face_value}
            min={1}
            step="0.01"
            onChange={(e) => set("face_value", e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
        <div className="ko-field">
          <label className="ko-label">Section</label>
          <input className="ko-input" placeholder="e.g. 112" value={form.section} onChange={(e) => set("section", e.target.value)} />
        </div>
        <div className="ko-field">
          <label className="ko-label">Row</label>
          <input className="ko-input" placeholder="e.g. G" value={form.row} onChange={(e) => set("row", e.target.value)} />
        </div>
        <div className="ko-field">
          <label className="ko-label">Seat Numbers</label>
          <input className="ko-input" placeholder="e.g. 14-15" value={form.seat_numbers} onChange={(e) => set("seat_numbers", e.target.value)} />
        </div>
      </div>

      <div className="ko-field">
        <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={form.is_early_delivery}
            onChange={(e) => set("is_early_delivery", e.target.checked)}
            style={{ width: 16, height: 16, accentColor: "var(--ko-pitch)" }}
          />
          <span style={{ fontSize: "0.875rem", color: "var(--ko-text-primary)" }}>
            Offer early delivery
            <span style={{ color: "var(--ko-text-muted)", marginLeft: "0.35rem", fontSize: "0.78rem" }}>
              (send tickets before FIFA app release date)
            </span>
          </span>
        </label>
      </div>

      <div className="ko-field">
        <label className="ko-label">Notes</label>
        <textarea
          className="ko-input"
          rows={3}
          placeholder="Additional information for buyers…"
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          style={{ resize: "vertical" }}
        />
      </div>

      <button
        type="submit"
        className="btn-ko-primary"
        disabled={loading}
        style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}
      >
        {loading ? (
          <><span className="spinner-border spinner-border-sm me-2" />Submitting…</>
        ) : (
          <><i className="bi bi-tag-fill me-2" />{existing ? "Update Listing" : "List Tickets"}</>
        )}
      </button>
    </form>
  );
}