import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import api from "../api";
import "./CheckoutPage.css";

const CheckoutPage = () => {
  const { cart, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [deliveryType, setDeliveryType] = useState("SHIP");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postcode: "",
    email: "",
    phone: "",
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );
  const shipping = cart.length > 0 ? 8 : 0;
  const total = subtotal + shipping;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleShippingNext = (e) => {
    e.preventDefault();
    setCheckoutError("");
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!user?.id) {
      setCheckoutError("Please log in to complete checkout.");
      return;
    }

    if (!cart.length) {
      setCheckoutError("Your basket is empty.");
      return;
    }

    setIsSubmitting(true);
    setCheckoutError("");

    try {
      await api.post("/api/orders/checkout", { userId: user.id });
      await clearCart();
      setStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setCheckoutError(
        err?.response?.data?.message || "Checkout failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 3) {
    return (
      <div className="co-confirmed">
        <div className="co-confirmed-inner">
          <div className="co-confirmed-icon">OK</div>
          <h1 className="co-confirmed-title">Order Confirmed</h1>
          <p className="co-confirmed-sub">
            Thank you, {form.firstName || "there"}! Your order has been placed.
            <br />
            A confirmation will be sent to <strong>{form.email || "your email"}</strong>.
          </p>
          <Link to="/" className="co-confirmed-btn">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="co-wrapper">
      <div className="co-topbar">
        <Link to="/" className="co-topbar-logo">
          <img src="/images/logo.png" alt="OSAI" />
        </Link>
        <span className="co-topbar-secure">
          <i className="bi bi-lock-fill" /> Secure Checkout
        </span>
      </div>

      <div className="co-steps">
        <div className={`co-step ${step >= 1 ? "active" : ""}`}>
          <span className="co-step-num">1</span> Shipping
        </div>
        <div className="co-step-divider" />
        <div className={`co-step ${step >= 2 ? "active" : ""}`}>
          <span className="co-step-num">2</span> Payment
        </div>
      </div>

      <div className="co-grid">
        <div className="co-left">
          {step === 1 && (
            <form onSubmit={handleShippingNext} noValidate>
              <h2 className="co-section-heading">Shipping Details</h2>

              <div className="co-toggle-row">
                {["SHIP", "PICK UP"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`co-toggle ${deliveryType === type ? "co-toggle-active" : ""}`}
                    onClick={() => setDeliveryType(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="co-field-row">
                <div className="co-field">
                  <label className="co-label">First Name</label>
                  <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Jane" className="co-input" required />
                </div>
                <div className="co-field">
                  <label className="co-label">Last Name</label>
                  <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Smith" className="co-input" required />
                </div>
              </div>

              <div className="co-field co-field-full">
                <label className="co-label">Street Address</label>
                <input name="address" value={form.address} onChange={handleChange} placeholder="123 High Street" className="co-input" required />
              </div>

              <div className="co-field-row">
                <div className="co-field">
                  <label className="co-label">City</label>
                  <input name="city" value={form.city} onChange={handleChange} placeholder="Birmingham" className="co-input" required />
                </div>
                <div className="co-field">
                  <label className="co-label">Postcode</label>
                  <input name="postcode" value={form.postcode} onChange={handleChange} placeholder="B1 1AA" className="co-input" required />
                </div>
              </div>

              <div className="co-field-row">
                <div className="co-field">
                  <label className="co-label">Email</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="jane@example.com" className="co-input" required />
                </div>
                <div className="co-field">
                  <label className="co-label">Phone</label>
                  <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+44 7700 900000" className="co-input" />
                </div>
              </div>

              <button type="submit" className="co-btn-primary">
                Continue to Payment
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handlePlaceOrder} noValidate>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer", fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase", padding: 0, textDecoration: "underline", textUnderlineOffset: 3 }}
                >
                  Back
                </button>
                <h2 className="co-section-heading" style={{ margin: 0 }}>Payment</h2>
              </div>

              <div className="co-summary-pill">
                <span style={{ color: "#888", fontSize: 12 }}>Shipping to</span>
                <span style={{ color: "#fff", fontSize: 13 }}>
                  {form.firstName} {form.lastName}, {form.address}{form.city ? `, ${form.city}` : ""}
                </span>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "underline", padding: 0 }}
                >
                  Edit
                </button>
              </div>

              <div className="co-field co-field-full">
                <label className="co-label">Cardholder Name</label>
                <input name="cardName" value={form.cardName} onChange={handleChange} placeholder="Jane Smith" className="co-input" required />
              </div>

              <div className="co-field co-field-full">
                <label className="co-label">Card Number</label>
                <input name="cardNumber" value={form.cardNumber} onChange={handleChange} placeholder="0000  0000  0000  0000" maxLength={19} className="co-input co-input-card" required />
              </div>

              <div className="co-field-row">
                <div className="co-field">
                  <label className="co-label">Expiry Date</label>
                  <input name="expiry" value={form.expiry} onChange={handleChange} placeholder="MM / YY" maxLength={5} className="co-input" required />
                </div>
                <div className="co-field">
                  <label className="co-label">CVV</label>
                  <input name="cvv" type="password" value={form.cvv} onChange={handleChange} placeholder="***" maxLength={4} className="co-input" required />
                </div>
              </div>

              <div className="co-secure-note">
                <i className="bi bi-shield-lock-fill" /> Your payment info is encrypted and secure.
              </div>

              {checkoutError && (
                <div style={{ color: "#f87171", marginBottom: 16, fontSize: 13 }}>
                  {checkoutError}
                </div>
              )}

              <button type="submit" className="co-btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : `Place Order - GBP ${total.toFixed(2)}`}
              </button>
            </form>
          )}
        </div>

        <aside className="co-right">
          <h3 className="co-right-heading">
            Order Summary
            <span className="co-right-count">
              {cart.reduce((sum, item) => sum + (item.quantity || 0), 0)} items
            </span>
          </h3>

          <div className="co-items">
            {cart.length === 0 ? (
              <p style={{ color: "#888", fontSize: 13 }}>Your basket is empty.</p>
            ) : (
              cart.map((item) => {
                const img = item.image || (item.images && item.images[0]) || "/images/placeholder.jpg";
                const priceNum = Number(item.price || 0);
                const qtyNum = Number(item.quantity || 0);

                return (
                  <div className="co-item" key={item.id + (item.size || "") + (item.color || "")}>
                    <div className="co-item-img-wrap">
                      <img
                        src={img}
                        alt={item.name}
                        className="co-item-img"
                        onError={(e) => {
                          e.target.src = "/images/placeholder.jpg";
                        }}
                      />
                      <span className="co-item-qty">{qtyNum}</span>
                    </div>
                    <div className="co-item-info">
                      <p className="co-item-name">{item.name}</p>
                      {item.size && <p className="co-item-meta">Size: {item.size}</p>}
                      {item.color && <p className="co-item-meta">Color: {item.color}</p>}
                    </div>
                    <span className="co-item-price">GBP {(priceNum * qtyNum).toFixed(2)}</span>
                  </div>
                );
              })
            )}
          </div>

          <div className="co-divider" />

          <div className="co-price-row">
            <span>Subtotal</span>
            <span>GBP {subtotal.toFixed(2)}</span>
          </div>
          <div className="co-price-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? "-" : `GBP ${shipping.toFixed(2)}`}</span>
          </div>

          <div className="co-divider" />

          <div className="co-total-row">
            <span>Total</span>
            <span>GBP {total.toFixed(2)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CheckoutPage;
