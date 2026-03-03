import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { AuthContext } from "../context/AuthContext";

const INPUT = {
  width: "100%",
  display: "block",
  background: "#1a1a1a",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  padding: "13px 16px",
  color: "#fff",
  fontSize: 14,
  outline: "none",
  transition: "border-color 0.18s ease",
  boxSizing: "border-box",
};

const LABEL = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#888",
  marginBottom: 8,
};

export function Login({ initialEmail = "" }) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/users/login", {
        email: email.trim(),
        password,
      });

      const user = res.data?.user;
      setMessage(res.data?.message || "Login successful");

      if (user) {
        login(user);
        localStorage.setItem("osaiUser", JSON.stringify(user));
        sessionStorage.setItem("user", JSON.stringify(user));
        setTimeout(() => {
          navigate("/");
        }, 1000);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Login failed. Please check your details and try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ width: "100%" }}>
      <h2
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 22,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "#fff",
          margin: "0 0 6px",
        }}
      >
        Login
      </h2>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 28 }}>
        Enter your details to access your account.
      </p>

      {error && (
        <div
          style={{
            marginBottom: 20,
            padding: "12px 16px",
            borderRadius: 6,
            fontSize: 13,
            background: "rgba(255,60,60,0.12)",
            border: "1px solid rgba(255,60,60,0.25)",
            color: "#f87171",
          }}
        >
          {error}
        </div>
      )}

      {message && (
        <div
          style={{
            marginBottom: 20,
            padding: "12px 16px",
            borderRadius: 6,
            fontSize: 13,
            background: "rgba(0,200,80,0.12)",
            border: "1px solid rgba(0,200,80,0.25)",
            color: "#4ade80",
          }}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={LABEL} htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={INPUT}
            onFocus={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.35)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
          />
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={LABEL}>Password</span>
            <Link
              to="/forgot-password"
              style={{
                fontSize: 12,
                color: "#888",
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="login-password"
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={INPUT}
            onFocus={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.35)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            background: loading ? "#ccc" : "#fff",
            color: "#000",
            border: "none",
            borderRadius: 4,
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: loading ? "not-allowed" : "pointer",
            marginTop: 8,
            transition: "background 0.18s ease",
          }}
          onMouseEnter={(e) => {
            if (!loading) e.target.style.background = "#e0e0e0";
          }}
          onMouseLeave={(e) => {
            if (!loading) e.target.style.background = "#fff";
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <Link
          to="/account/change-password"
          style={{
            alignSelf: "flex-start",
            fontSize: 12,
            color: "#888",
            textDecoration: "underline",
            textUnderlineOffset: 3,
          }}
        >
          Change password
        </Link>
      </form>
    </div>
  );
}
