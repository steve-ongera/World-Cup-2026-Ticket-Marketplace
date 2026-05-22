import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";

/* ─── Context ─── */

const CartContext = createContext(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

/* ─── Initial state shape ─── */
const EMPTY_SELECTION = {
  listing: null,       // Full listing object from API
  match:   null,       // Match object (from listing.match)
  quantity: 1,
  unitPrice: 0,
  serviceFee: 0,
  total: 0,
  currency: "EUR",
  fifaEmail: "",       // FIFA ticketing email for delivery
};

/* ─── Provider ─── */

export function CartProvider({ children }) {
  const [selection, setSelection] = useState(EMPTY_SELECTION);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1 = select qty, 2 = confirm, 3 = done

  /* Select a listing to purchase */
  const selectListing = useCallback((listing, qty = 1) => {
    if (!listing) {
      setSelection(EMPTY_SELECTION);
      return;
    }
    const quantity   = Math.min(Math.max(1, qty), listing.quantity);
    const unitPrice  = parseFloat(listing.price_per_ticket);
    const serviceFee = 0; // 0% fee matches backend
    const total      = unitPrice * quantity + serviceFee;

    setSelection({
      listing,
      match:    listing.match ?? null,
      quantity,
      unitPrice,
      serviceFee,
      total,
      currency: listing.currency ?? "EUR",
      fifaEmail: "",
    });
    setCheckoutStep(1);
  }, []);

  /* Update quantity (re-calculates totals) */
  const setQuantity = useCallback((qty) => {
    setSelection((prev) => {
      if (!prev.listing) return prev;
      const quantity   = Math.min(Math.max(1, qty), prev.listing.quantity);
      const total      = prev.unitPrice * quantity + prev.serviceFee;
      return { ...prev, quantity, total };
    });
  }, []);

  /* Update FIFA delivery email */
  const setFifaEmail = useCallback((email) => {
    setSelection((prev) => ({ ...prev, fifaEmail: email }));
  }, []);

  /* Clear / reset cart */
  const clearCart = useCallback(() => {
    setSelection(EMPTY_SELECTION);
    setCheckoutStep(1);
  }, []);

  /* Computed helpers */
  const hasSelection = !!selection.listing;

  const orderPayload = hasSelection
    ? {
        listing_id:          selection.listing.id,
        quantity:            selection.quantity,
        fifa_ticketing_email: selection.fifaEmail,
      }
    : null;

  const value = {
    selection,
    checkoutStep,
    hasSelection,
    orderPayload,
    selectListing,
    setQuantity,
    setFifaEmail,
    setCheckoutStep,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}