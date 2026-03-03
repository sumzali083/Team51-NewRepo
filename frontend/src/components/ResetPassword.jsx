import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import api from "../api";

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token.");
    }
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }
    if (!password || !confirm) {
      setError("Please fill in both password fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/users/reset-password", {
        token,
        password,
      });
      setMessage(res.data?.message || "Password reset successfully.");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error("Reset password error:", err);
      const msg =
        err?.response?.data?.message || "Could not reset password. Try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="osai-auth-page">
      <div className="osai-auth-card">
        <h2 className="osai-auth-title">Reset Password</h2>
        <p className="osai-auth-sub">Enter and confirm your new password.</p>

        {error && <div className="osai-alert osai-alert-error">{error}</div>}
        {message && <div className="osai-alert osai-alert-success">{message}</div>}

        <form onSubmit={handleSubmit} className="osai-auth-form">
          <label className="osai-auth-label" htmlFor="reset-password">
            New password
          </label>
          <input
            id="reset-password"
            className="osai-auth-input"
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label className="osai-auth-label" htmlFor="reset-confirm">
            Confirm password
          </label>
          <input
            id="reset-confirm"
            className="osai-auth-input"
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

          <button type="submit" disabled={loading} className="osai-cta-primary">
            {loading ? "Saving..." : "Set new password"}
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
