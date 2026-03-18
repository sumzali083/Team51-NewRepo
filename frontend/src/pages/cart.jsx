// frontend/src/pages/Cart.jsx
import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";

export default function Cart() {
  const { cart, removeFromCart, changeQuantity } = useContext(CartContext);
  const navigate = useNavigate();
  const revealRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!revealRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(revealRef.current);

    return () => observer.disconnect();
  }, []);

  const titleSlideFadeIn = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translateX(0)" : "translateX(-90px)",
    transition: "opacity 0.8s ease, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
  };

  const contentSlideFadeIn = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translateX(0)" : "translateX(-120px)",
    transition: "opacity 0.9s ease 0.12s, transform 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.12s",
  };

  const summarySlideFadeIn = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translateX(0)" : "translateX(120px)",
    transition: "opacity 0.9s ease 0.18s, transform 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.18s",
  };

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );
  const shipping = cart.length > 0 ? 8 : 0;
  const grandTotal = total + shipping;

  return (
    <div className="page-padded" ref={revealRef}>
      <h1 style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: "clamp(32px,6vw,64px)",
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        marginBottom: 32,
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        paddingBottom: 24,
        color: "var(--text)",
        ...titleSlideFadeIn,
      }}>
        Your Basket
        {cart.length > 0 && (
          <span style={{ fontSize: "0.4em", color: "var(--sub)", marginLeft: 16, fontFamily: "Inter,sans-serif", letterSpacing: "0.1em" }}>
            {cart.reduce((s, i) => s + (i.quantity || 0), 0)} item{cart.reduce((s, i) => s + (i.quantity || 0), 0) !== 1 ? "s" : ""}
          </span>
        )}
      </h1>

      {cart.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", ...contentSlideFadeIn }}>
          <p style={{ color: "var(--sub)", marginBottom: 24, fontSize: 16 }}>Your basket is empty.</p>
          <Link to="/" className="osai-cta-primary">Continue Shopping →</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "start" }}>

          {/* ── Item list ── */}
          <div style={{ flex: "1 1 480px", minWidth: 0, ...contentSlideFadeIn }}>
            {cart.map((item) => {
              const img = item.image || (item.images && item.images[0]) || "/images/placeholder.jpg";
              const priceNum = Number(item.price || 0);
              const qtyNum = Number(item.quantity || 0);

              return (
                <div key={item.id + (item.size || "") + (item.color || "")} style={{
                  display: "grid",
                  gridTemplateColumns: "100px 1fr auto",
                  gap: 20,
                  padding: "20px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                  alignItems: "start",
                }}>
                  {/* Product image */}
                  <Link to={`/product/${encodeURIComponent(item.id)}`}>
                    <img
                      src={img}
                      alt={item.name}
                      style={{
                        width: "100px",
                        height: "120px",
                        objectFit: "cover",
                        display: "block",
                        borderRadius: 2,
                        background: "#111",
                      }}
                      onError={(e) => { e.target.src = "/images/placeholder.jpg"; }}
                    />
                  </Link>

                  {/* Product info */}
                  <div>
                    <Link to={`/product/${encodeURIComponent(item.id)}`}
                      style={{ color: "var(--text)", fontWeight: 600, fontSize: 15, display: "block", marginBottom: 6, textDecoration: "none" }}>
                      {item.name}
                    </Link>

                    <div style={{ display: "flex", gap: 16, marginBottom: 10, flexWrap: "wrap" }}>
                      {item.size && (
                        <span style={{ fontSize: 11, color: "var(--sub)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                          Size: <span style={{ color: "var(--text)" }}>{item.size}</span>
                        </span>
                      )}
                      {item.color && (
                        <span style={{ fontSize: 11, color: "var(--sub)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                          Colour: <span style={{ color: "var(--text)" }}>{item.color}</span>
                        </span>
                      )}
                    </div>

                    {item.originalPrice ? (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ color: "#888", fontSize: 13, textDecoration: "line-through" }}>
                            £{Number(item.originalPrice).toFixed(2)}
                          </span>
                          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>
                            £{priceNum.toFixed(2)}
                          </span>
                          <span style={{
                            background: "#e53935", color: "#fff",
                            fontSize: 11, fontWeight: 700, padding: "2px 6px",
                            borderRadius: 3, letterSpacing: "0.04em",
                          }}>
                            -{Math.round((1 - priceNum / Number(item.originalPrice)) * 100)}%
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>
                        £{priceNum.toFixed(2)}
                      </div>
                    )}

                    {/* Qty stepper */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <span style={{ fontSize: 11, color: "var(--sub)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Qty</span>
                      <button
                        onClick={() => changeQuantity(item.id, Math.max(1, qtyNum - 1))}
                        style={{
                          width: 28, height: 28, border: "1px solid rgba(255,255,255,0.15)",
                          background: "transparent", color: "var(--text)", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                        }}
                      >−</button>
                      <span style={{ minWidth: 24, textAlign: "center", color: "var(--text)", fontSize: 14, fontWeight: 600 }}>
                        {qtyNum}
                      </span>
                      <button
                        onClick={() => changeQuantity(item.id, qtyNum + 1)}
                        style={{
                          width: 28, height: 28, border: "1px solid rgba(255,255,255,0.15)",
                          background: "transparent", color: "var(--text)", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                        }}
                      >+</button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{
                        background: "transparent", border: "none", padding: 0,
                        fontSize: 11, color: "var(--muted)", cursor: "pointer",
                        letterSpacing: "0.08em", textTransform: "uppercase",
                        textDecoration: "underline", textUnderlineOffset: 3,
                      }}
                    >
                      Remove
                    </button>
                  </div>

                  {/* Line total */}
                  <div style={{ fontWeight: 700, color: "var(--text)", fontSize: 15, whiteSpace: "nowrap", paddingTop: 2 }}>
                    £{(priceNum * qtyNum).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Order summary ── */}
          <div style={{
            flex: "0 0 300px",
            width: 300,
            background: "#111",
            border: "1px solid rgba(255,255,255,0.08)",
            padding: 24,
            position: "sticky",
            top: 80,
            ...summarySlideFadeIn,
          }}>
            <h3 style={{
              fontFamily: "'Barlow Condensed',sans-serif",
              fontSize: 18,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: 20,
              color: "#fff",
            }}>
              Order Summary
            </h3>

            {cart.map((item) => (
              <div key={item.id + (item.size || "") + (item.color || "")} style={{
                display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                marginBottom: 10, fontSize: 13, gap: 12,
              }}>
                <span style={{ color: "#b8b8b8", flex: 1, lineHeight: 1.4 }}>
                  {item.name}
                  {item.size && <span style={{ display: "block", fontSize: 11, color: "#666" }}>Size: {item.size}</span>}
                  {item.color && <span style={{ display: "block", fontSize: 11, color: "#666" }}>Colour: {item.color}</span>}
                  <span style={{ display: "block", fontSize: 11, color: "#666" }}>x{item.quantity}</span>
                </span>
                <span style={{ color: "#fff", fontWeight: 600, whiteSpace: "nowrap" }}>
                  £{(Number(item.price) * Number(item.quantity)).toFixed(2)}
                </span>
              </div>
            ))}

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", margin: "16px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
              <span style={{ color: "#888" }}>Subtotal</span>
              <span style={{ color: "#fff" }}>£{total.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, fontSize: 13 }}>
              <span style={{ color: "#888" }}>Delivery</span>
              <span style={{ color: "#fff" }}>£{shipping.toFixed(2)}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, fontSize: 16, fontWeight: 700 }}>
              <span style={{ color: "#fff" }}>Total</span>
              <span style={{ color: "#fff" }}>£{grandTotal.toFixed(2)}</span>
            </div>

            <button
              className="osai-cta-primary"
              style={{
                width: "100%",
                justifyContent: "center",
                cursor: "pointer",
                background: "#111",
                color: "#f2f2f2",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout →
            </button>

            <Link to="/" style={{
              display: "block", textAlign: "center", marginTop: 14,
              fontSize: 11, color: "#666", letterSpacing: "0.08em",
              textTransform: "uppercase", textDecoration: "underline", textUnderlineOffset: 3,
            }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
