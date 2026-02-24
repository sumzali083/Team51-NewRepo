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
    <div className="osai-auth-page">
      <div className="osai-auth-card">
        <h2 className="osai-auth-title">Forgot Password</h2>
        <p className="osai-auth-sub">
          Enter your account email and we will generate a reset link.
        </p>

        {error && <div className="osai-alert osai-alert-error">{error}</div>}
        {message && <div className="osai-alert osai-alert-success">{message}</div>}
        {resetUrl && (
          <div className="osai-alert osai-alert-info">
            <div className="osai-auth-note">Reset link (demo):</div>
            <a href={resetUrl} className="osai-link-inline osai-break-all">
              {resetUrl}
            </a>
          </div>
        )}

        <form onSubmit={handleSubmit} className="osai-auth-form">
          <label className="osai-auth-label" htmlFor="forgot-email">
            Email
          </label>
          <input
            id="forgot-email"
            className="osai-auth-input"
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" disabled={loading} className="osai-cta-primary">
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <div className="osai-auth-footer">
          <Link to="/login" className="osai-link-inline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
