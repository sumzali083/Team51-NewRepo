import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { AuthContext } from "../context/AuthContext";

export function ChangePassword() {
  const { user, checkAuth } = useContext(AuthContext);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="osai-auth-page">
        <div className="osai-auth-card">
          <h2 className="osai-auth-title">Change Password</h2>
          <p className="osai-auth-sub">You need to be logged in.</p>
          <div className="osai-auth-footer">
            <Link to="/login" className="osai-link-inline">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!currentPassword || !newPassword || !confirm) {
      setError("Please fill in all fields.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirm) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/users/change-password", {
        currentPassword,
        newPassword,
      });
      setMessage(res.data?.message || "Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      await checkAuth();
    } catch (err) {
      console.error("Change password error:", err);
      const msg =
        err?.response?.data?.message || "Could not change password. Try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="osai-auth-page">
      <div className="osai-auth-card">
        <h2 className="osai-auth-title">Change Password</h2>
        <p className="osai-auth-sub">Email: {user.email}</p>

        {error && <div className="osai-alert osai-alert-error">{error}</div>}
        {message && <div className="osai-alert osai-alert-success">{message}</div>}

        <form onSubmit={handleSubmit} className="osai-auth-form">
          <label className="osai-auth-label" htmlFor="current-password">
            Current password
          </label>
          <input
            id="current-password"
            className="osai-auth-input"
            type="password"
            placeholder="Old password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <label className="osai-auth-label" htmlFor="new-password">
            New password
          </label>
          <input
            id="new-password"
            className="osai-auth-input"
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <label className="osai-auth-label" htmlFor="confirm-password">
            Confirm new password
          </label>
          <input
            id="confirm-password"
            className="osai-auth-input"
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

          <div className="osai-auth-actions">
            <button type="submit" disabled={loading} className="osai-cta-primary">
              {loading ? "Saving..." : "Change Password"}
            </button>
            <Link to="/" className="osai-link-muted">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
