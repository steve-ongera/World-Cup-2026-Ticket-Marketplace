import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { listingsApi, ordersApi } from "../utils/api.js";
import { useCart } from "../context/CartContext.jsx";
import OrderSummary from "../components/order/OrderSummary.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import ErrorAlert from "../components/common/ErrorAlert.jsx";

export default function CheckoutPage() {
  const { listingId }  = useParams();
  const navigate       = useNavigate();
  const { selection, selectListing, setQuantity, setFifaEmail, clearCart } = useCart();

  const [loading, setLoading]   = useState(!selection.listing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState(null);

  /* Load listing if cart was cleared (e.g. page refresh) */
  useEffect(() => {
    if (!selection.listing) {
      listingsApi.detail(listingId)
        .then(({ data }) => selectListing(data))
        .catch(setError)
        .finally(() => setLoading(false));
    }
  }, [listingId]);

  async function handlePlaceOrder(e) {
    e.preventDefault();
    if (!selection.fifaEmail) { setError("Please enter your FIFA ticketing email."); return; }
    setSubmitting(true);
    setError(null);
    try {
      const { data: order } = await ordersApi.create({
        listing_id:           selection.listing.id,
        quantity:             selection.quantity,
        fifa_ticketing_email: selection.fifaEmail,
      });
      clearCart();
      navigate(`/orders/${order.id}/confirm`);
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner fullPage text="Loading listing…" />;

  return (
    <div className="container-ko section-gap-sm">
      <div style={{ marginBottom: "1.5rem" }}>
        <button className="btn-icon" onClick={() => navigate(-1)} style={{ marginRight: "0.5rem" }}>
          <i className="bi bi-arrow-left" />
        </button>
        <h1 style={{ display: "inline", fontSize: "1.8rem" }}>Checkout</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "1.5rem", alignItems: "start" }}>
        {/* Left — form */}
        <form onSubmit={handlePlaceOrder}>
          <ErrorAlert error={error} className="mb-3" />

          {/* Quantity */}
          <div
            style={{
              background: "var(--ko-bg-surface)",
              border: "1px solid var(--ko-border)",
              borderRadius: "var(--radius-lg)",
              padding: "1.5rem",
              marginBottom: "1rem",
            }}
          >
            <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ko-text-muted)", marginBottom: "1rem" }}>
              Select Quantity
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div className="qty-stepper">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity(selection.quantity - 1)}
                  disabled={selection.quantity <= 1}
                >
                  −
                </button>
                <div className="qty-display">{selection.quantity}</div>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity(selection.quantity + 1)}
                  disabled={selection.quantity >= (selection.listing?.quantity ?? 8)}
                >
                  +
                </button>
              </div>
              <span style={{ fontSize: "0.875rem", color: "var(--ko-text-muted)" }}>
                Max {selection.listing?.quantity} available · tickets must be purchased together for adjacent seats
              </span>
            </div>
          </div>

          {/* FIFA email */}
          <div
            style={{
              background: "var(--ko-bg-surface)",
              border: "1px solid var(--ko-border)",
              borderRadius: "var(--radius-lg)",
              padding: "1.5rem",
              marginBottom: "1rem",
            }}
          >
            <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ko-text-muted)", marginBottom: "1rem" }}>
              FIFA Ticketing Email
            </div>
            <label className="ko-label">
              Email linked to your FIFA ID *
            </label>
            <input
              type="email"
              className="ko-input"
              placeholder="your@email.com"
              value={selection.fifaEmail}
              onChange={(e) => setFifaEmail(e.target.value)}
              required
            />
            <div style={{ marginTop: "0.6rem", fontSize: "0.78rem", color: "var(--ko-text-muted)", display: "flex", gap: "0.4rem" }}>
              <i className="bi bi-info-circle" />
              Tickets are delivered digitally through the FIFA World Cup 2026 app to this email.
              Make sure it matches your FIFA ID account exactly.
            </div>
          </div>

          {/* Buyer guarantee */}
          <div
            style={{
              background: "var(--ko-pitch-glow)",
              border: "1px solid rgba(0,230,118,0.2)",
              borderRadius: "var(--radius-lg)",
              padding: "1rem 1.25rem",
              marginBottom: "1.5rem",
              display: "flex",
              gap: "0.75rem",
              alignItems: "flex-start",
            }}
          >
            <i className="bi bi-shield-check-fill text-pitch" style={{ fontSize: "1.1rem", flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.2rem" }}>100% Buyer Guarantee</div>
              <div style={{ fontSize: "0.78rem", color: "var(--ko-text-secondary)" }}>
                You're guaranteed to receive your tickets before the match, or your money back.
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn-ko-primary"
            disabled={submitting}
            style={{ width: "100%", justifyContent: "center", padding: "0.875rem", fontSize: "1rem" }}
          >
            {submitting ? (
              <><span className="spinner-border spinner-border-sm me-2" />Placing Order…</>
            ) : (
              <><i className="bi bi-lock-fill me-2" />Confirm & Pay</>
            )}
          </button>
          <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--ko-text-muted)", marginTop: "0.75rem" }}>
            By continuing you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.
          </p>
        </form>

        {/* Right — summary */}
        <OrderSummary selection={selection} />
      </div>
    </div>
  );
}