<<<<<<< HEAD
// frontend/src/pages/cart.jsx
import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom"; // <-- Added

export default function Cart() {
  const cartContext = useContext(CartContext);
  const navigate = useNavigate(); // <-- Added

  if (!cartContext) {
    return <div className="container mt-4">Loading cart...</div>;
  }

  const { cart, removeFromCart, changeQuantity } = cartContext;
=======
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
>>>>>>> deploy-branch

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

<<<<<<< HEAD
  const getImageUrl = (item) => {
    if (item.image) return item.image;
    if (item.image_url) return item.image_url;
    if (item.images && item.images.length > 0) return item.images[0];
    return "/placeholder.jpg";
  };

  const handleQuantityChange = (id, value) => {
    const parsedValue = parseInt(value, 10);
    if (!isNaN(parsedValue) && parsedValue >= 1) {
      changeQuantity(id, parsedValue);
    } else {
      changeQuantity(id, 1);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Your Basket</h2>

      {cart.length === 0 ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "250px" }}
        >
          <h4>Your basket is empty.</h4>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => {
                  const img = getImageUrl(item);
                  const priceNum = Number(item.price || 0);
                  const qtyNum = Number(item.quantity || 0);
                  const lineTotal = priceNum * qtyNum;

                  return (
                    <tr key={item.id}>
                      <td>
                        <img
                          src={img}
                          alt={item.name}
                          width="50"
                          height="50"
                          className="me-2 object-fit-cover"
                          onError={(e) => {
                            e.target.src = "/placeholder.jpg";
                            e.target.onerror = null;
                          }}
                        />
                        <div className="d-inline-block">
                          <div>{item.name}</div>
                          <div>
                            {item.size && (
                              <small className="text-muted d-block">
                                Size: {item.size}
                              </small>
                            )}
                            {item.color && (
                              <small className="text-muted d-block">
                                Color: {item.color}
                              </small>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>£{priceNum.toFixed(2)}</td>

                      <td>
                        <input
                          type="number"
                          className="form-control"
                          style={{ width: "80px" }}
                          value={qtyNum}
                          min="1"
                          max="99"
                          onChange={(e) =>
                            handleQuantityChange(item.id, e.target.value)
                          }
                        />
                      </td>

                      <td>£{lineTotal.toFixed(2)}</td>

                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => removeFromCart(item.id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-4">
            <h4 className="mb-0">Total: £{total.toFixed(2)}</h4>
            <button
              className="btn btn-success"
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
=======
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
        ...titleSlideFadeIn,
      }}>
        Your Basket
        {cart.length > 0 && (
          <span style={{ fontSize: "0.4em", color: "#888", marginLeft: 16, fontFamily: "Inter,sans-serif", letterSpacing: "0.1em" }}>
            {cart.reduce((s, i) => s + (i.quantity || 0), 0)} item{cart.reduce((s, i) => s + (i.quantity || 0), 0) !== 1 ? "s" : ""}
          </span>
        )}
      </h1>

      {cart.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", ...contentSlideFadeIn }}>
          <p style={{ color: "#888", marginBottom: 24, fontSize: 16 }}>Your basket is empty.</p>
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
                      style={{ color: "#fff", fontWeight: 600, fontSize: 15, display: "block", marginBottom: 6, textDecoration: "none" }}>
                      {item.name}
                    </Link>

                    <div style={{ display: "flex", gap: 16, marginBottom: 10, flexWrap: "wrap" }}>
                      {item.size && (
                        <span style={{ fontSize: 11, color: "#888", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                          Size: <span style={{ color: "#ccc" }}>{item.size}</span>
                        </span>
                      )}
                      {item.color && (
                        <span style={{ fontSize: 11, color: "#888", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                          Colour: <span style={{ color: "#ccc" }}>{item.color}</span>
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 12 }}>
                      £{priceNum.toFixed(2)}
                    </div>

                    {/* Qty stepper */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <span style={{ fontSize: 11, color: "#888", letterSpacing: "0.08em", textTransform: "uppercase" }}>Qty</span>
                      <button
                        onClick={() => changeQuantity(item.id, Math.max(1, qtyNum - 1))}
                        style={{
                          width: 28, height: 28, border: "1px solid rgba(255,255,255,0.15)",
                          background: "transparent", color: "#fff", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                        }}
                      >−</button>
                      <span style={{ minWidth: 24, textAlign: "center", color: "#fff", fontSize: 14, fontWeight: 600 }}>
                        {qtyNum}
                      </span>
                      <button
                        onClick={() => changeQuantity(item.id, qtyNum + 1)}
                        style={{
                          width: 28, height: 28, border: "1px solid rgba(255,255,255,0.15)",
                          background: "transparent", color: "#fff", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                        }}
                      >+</button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{
                        background: "transparent", border: "none", padding: 0,
                        fontSize: 11, color: "#666", cursor: "pointer",
                        letterSpacing: "0.08em", textTransform: "uppercase",
                        textDecoration: "underline", textUnderlineOffset: 3,
                      }}
                    >
                      Remove
                    </button>
                  </div>

                  {/* Line total */}
                  <div style={{ fontWeight: 700, color: "#fff", fontSize: 15, whiteSpace: "nowrap", paddingTop: 2 }}>
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
                <span style={{ color: "#888", flex: 1, lineHeight: 1.4 }}>
                  {item.name}
                  {item.size && <span style={{ display: "block", fontSize: 11, color: "#555" }}>Size: {item.size}</span>}
                  {item.color && <span style={{ display: "block", fontSize: 11, color: "#555" }}>Colour: {item.color}</span>}
                  <span style={{ display: "block", fontSize: 11, color: "#555" }}>x{item.quantity}</span>
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
              <span style={{ color: "#888" }}>Shipping</span>
              <span style={{ color: "#888" }}>Calculated at checkout</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, fontSize: 16, fontWeight: 700 }}>
              <span style={{ color: "#fff" }}>Total</span>
              <span style={{ color: "#fff" }}>£{total.toFixed(2)}</span>
            </div>

            <button
              className="osai-cta-primary"
              style={{ width: "100%", justifyContent: "center", cursor: "pointer" }}
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
>>>>>>> deploy-branch
      )}
    </div>
  );
}
