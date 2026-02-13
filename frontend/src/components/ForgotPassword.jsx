import React, { useState } from "react";
import api from "../api";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/users/forgot-password", { email });
      setMessage(
        res.data?.message ||
          "If this email exists, you’ll receive a password reset link."
      );
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
    <div style={{ maxWidth: 400, margin: "40px auto", color: "#fff" }}>
      <h2>Forgot Password</h2>

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

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: 10 }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ padding: "10px 16px" }}>
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>
    </div>
  );
}

