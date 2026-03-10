import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setResetUrl("");

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/users/forgot-password", { email });
      setMessage(
        res.data?.message ||
          "If this email exists, you will receive a password reset link."
      );
      if (res.data?.resetUrl) {
        setResetUrl(res.data.resetUrl);
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      const msg =
        err?.response?.data?.message || "Something went wrong. Try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: "40px auto" }}>
      <div
        style={{
          background: "#111",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
          color: "#fff",
        }}
      >
        <h2 style={{ color: "#ff5a00", fontWeight: 800, marginBottom: 8 }}>
          Forgot Password
        </h2>
        <p style={{ color: "#bbb", marginBottom: 16 }}>
          Enter your account email and we will generate a reset link.
        </p>

        {error && (
          <div style={{ background: "#5c1a1a", padding: 10, marginBottom: 10 }}>
            {error}
          </div>
        )}
        {message && (
          <div style={{ background: "#1d3b21", padding: 10, marginBottom: 10 }}>
            {message}
          </div>
        )}
        {resetUrl && (
          <div style={{ background: "#203549", padding: 10, marginBottom: 10 }}>
            <div style={{ marginBottom: 6 }}>Reset link (demo):</div>
            <a href={resetUrl} style={{ color: "#9ad0ff", wordBreak: "break-all" }}>
              {resetUrl}
            </a>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 8,
                border: "1px solid #333",
                background: "#222",
                color: "#fff",
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? "#aa4400" : "#ff5a00",
              color: "#fff",
              borderRadius: 8,
              padding: "12px 18px",
              fontWeight: 700,
              border: "none",
            }}
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <div style={{ marginTop: 12 }}>
          <Link to="/login" style={{ color: "#ff5a00", textDecoration: "none", fontWeight: 600 }}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
