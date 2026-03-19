// frontend/src/components/Registration.jsx
import React, { useState } from "react";
import api from "../api";

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

export function Registration({ onSuccess }) {
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [message, setMessage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!name || !email || !password || !confirm) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/users/register", {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      setMessage(res.data?.message || "Account created successfully!");

      if (onSuccess) onSuccess(email.trim());

      setName(""); setEmail(""); setPassword(""); setConfirm("");
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Could not create account right now.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ width: "100%" }}>
      <h2 style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: 22,
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: "#fff",
        margin: "0 0 6px",
      }}>
        Create Account
      </h2>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 28 }}>
        Fill in your details to get started.
      </p>

      {error && (
        <div style={{
          marginBottom: 20,
          padding: "12px 16px",
          borderRadius: 6,
          fontSize: 13,
          background: "rgba(255,60,60,0.12)",
          border: "1px solid rgba(255,60,60,0.25)",
          color: "#f87171",
        }}>
          {error}
        </div>
      )}

      {message && (
        <div style={{
          marginBottom: 20,
          padding: "12px 16px",
          borderRadius: 6,
          fontSize: 13,
          background: "rgba(0,200,80,0.12)",
          border: "1px solid rgba(0,200,80,0.25)",
          color: "#4ade80",
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={LABEL} htmlFor="reg-name">Name</label>
          <input
            id="reg-name"
            type="text"
            placeholder="Jane Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={INPUT}
            onFocus={e => (e.target.style.borderColor = "rgba(255,255,255,0.35)")}
            onBlur={e  => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
          />
        </div>

        <div>
          <label style={LABEL} htmlFor="reg-email">Email</label>
          <input
            id="reg-email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={INPUT}
            onFocus={e => (e.target.style.borderColor = "rgba(255,255,255,0.35)")}
            onBlur={e  => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={LABEL} htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={INPUT}
              onFocus={e => (e.target.style.borderColor = "rgba(255,255,255,0.35)")}
              onBlur={e  => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>
          <div>
            <label style={LABEL} htmlFor="reg-confirm">Confirm</label>
            <input
              id="reg-confirm"
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              style={INPUT}
              onFocus={e => (e.target.style.borderColor = "rgba(255,255,255,0.35)")}
              onBlur={e  => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>
        </div>

        <button
          className="osai-auth-submit-btn"
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            border: "none",
            borderRadius: 4,
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: loading ? "not-allowed" : "pointer",
            marginTop: 8,
            transition: "background 0.18s ease, color 0.18s ease",
          }}
        >
          {loading ? "Creating account…" : "Create Account"}
        </button>
      </form>
    </div>
  );
}
