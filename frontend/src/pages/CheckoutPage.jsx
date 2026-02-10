// frontend/src/pages/CheckoutPage.jsx
import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import "./CheckoutPage.css";

const CheckoutPage = () => {
  const { cart } = useContext(CartContext);
  const [deliveryType, setDeliveryType] = useState("SHIP");
  const [deliveryOption, setDeliveryOption] = useState("Home/Office");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    address: "",
    email: "",
    phone: "",
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  // Calculate subtotal safely
  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );
  const shipping = cart.length > 0 ? 8 : 0;
  const total = subtotal + shipping;

  function handleFormChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleDeliveryType(type) {
    setDeliveryType(type);
  }

  function handleDeliveryOption(e) {
    setDeliveryOption(e.target.value);
  }

  function handlePayment(e) {
    e.preventDefault();
    alert("Payment processed! Thank you for your order.");
  }

  return (
    <>
      <h1 className="checkout-title">Checkout</h1>
      <div className="checkout-wrapper">
        <div className="checkout-container">
          {/* LEFT SIDE */}
          <form className="checkout-left" onSubmit={handlePayment}>
            <h2 className="section-title">1. DELIVERY OPTIONS</h2>
            <div className="tab-row">
              <button
                type="button"
                className={`tab${deliveryType === "SHIP" ? " active" : ""}`}
                onClick={() => handleDeliveryType("SHIP")}
              >
                SHIP
              </button>
              <button
                type="button"
                className={`tab${deliveryType === "PICK UP" ? " active" : ""}`}
                onClick={() => handleDeliveryType("PICK UP")}
              >
                PICK UP
              </button>
            </div>
            <div className="radio-row">
              <label>
                <input
                  type="radio"
                  name="delivery"
                  value="Home/Office"
                  checked={deliveryOption === "Home/Office"}
                  onChange={handleDeliveryOption}
                />
                Home/Office
              </label>
              <label>
                <input
                  type="radio"
                  name="delivery"
                  value="APO/FPO"
                  checked={deliveryOption === "APO/FPO"}
                  onChange={handleDeliveryOption}
                />
                APO/FPO
              </label>
            </div>
            <div className="form-grid">
              <input
                name="firstName"
                placeholder="First Name"
                value={form.firstName}
                onChange={handleFormChange}
                required
              />
              <input
                name="lastName"
                placeholder="Last Name"
                value={form.lastName}
                onChange={handleFormChange}
                required
              />
              <input
                name="address"
                className="full"
                placeholder="Start typing the first line of your address"
                value={form.address}
                onChange={handleFormChange}
                required
              />
              <a href="#" className="manual-link">
                Enter address manually
              </a>
              <input
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleFormChange}
                required
              />
              <input
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleFormChange}
                required
              />
            </div>
            <button className="continue-btn" type="submit">
              SAVE & CONTINUE
            </button>
            <h2 className="section-title">2. PAYMENT</h2>
            <div className="form-grid">
              <input
                name="cardName"
                className="full"
                placeholder="Cardholder Name"
                value={form.cardName}
                onChange={handleFormChange}
                required
              />
              <input
                name="cardNumber"
                className="full"
                placeholder="Card Number"
                value={form.cardNumber}
                onChange={handleFormChange}
                required
              />
              <input
                name="expiry"
                placeholder="Expiry (MM/YY)"
                value={form.expiry}
                onChange={handleFormChange}
                required
              />
              <input
                name="cvv"
                placeholder="CVV"
                type="password"
                value={form.cvv}
                onChange={handleFormChange}
                required
              />
            </div>
            <button className="continue-btn" type="submit">
              PAY NOW
            </button>
          </form>

          {/* RIGHT SIDE */}
          <div className="checkout-right">
            <h3 className="bag-title">IN YOUR BAG</h3>
            <div className="price-row">
              <span>Subtotal</span>
              <span>£{subtotal.toFixed(2)}</span>
            </div>
            <div className="price-row">
              <span>Estimated Shipping</span>
              <span>£{shipping.toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>TOTAL</span>
              <span className="total-amount">£{total.toFixed(2)}</span>
            </div>

            {cart.length === 0 ? (
              <div className="product-box">
                <p>Your cart is empty.</p>
              </div>
            ) : (
              cart.map((item) => {
                const img = item.image || item.image_url || "/images/placeholder.jpg";
                const priceNum = Number(item.price || 0);
                const qtyNum = Number(item.quantity || 0);
                const itemTotal = priceNum * qtyNum;

                return (
                  <div className="product-box" key={item.id}>
                    <p className="arrival-text">ARRIVES BY THU, JUN 24</p>
                    <div className="product-row">
                      <img
                        src={img}
                        alt={item.name}
                        className="product-img"
                      />
                      <div className="product-info">
                        <p className="product-name">{item.name}</p>
                        <p className="product-meta">
                          Price: £{priceNum.toFixed(2)}
                        </p>
                        <p className="product-meta">Qty: {qtyNum}</p>
                        <p className="product-meta fw-bold">
                          Item Total: £{itemTotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;