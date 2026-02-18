import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { AuthContext } from "../context/AuthContext";

export function ChangePassword() {
  const { user } = useContext(AuthContext);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div style={{ maxWidth: 520, margin: "40px auto" }}>
        <div style={{ background: "#111", borderRadius: 16, padding: 24, color: "#fff" }}>
          You need to be logged in.
          <div style={{ marginTop: 12 }}>
            <Link to="/login" style={{ color: "#ff5a00", textDecoration: "none", fontWeight: 600 }}>
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
    <div style={{ maxWidth: 560, margin: "40px auto" }}>
      <div
        style={{
          background: "#111",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
          color: "#fff",
        }}
      >
        <h2 style={{ color: "#ff5a00", fontWeight: 800, marginBottom: 6 }}>
          Change Password
        </h2>
        <p style={{ color: "#bbb", marginBottom: 16 }}>
          Email: <strong>{user.email}</strong>
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

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <input
              type="password"
              placeholder="Old password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
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
          <div style={{ marginBottom: 12 }}>
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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
          <div style={{ marginBottom: 12 }}>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
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
              {loading ? "Saving..." : "Change Password"}
            </button>
            <Link to="/" style={{ color: "#bbb", textDecoration: "none" }}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
