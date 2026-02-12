import React, { useState, useContext } from "react";
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
    return <p style={{ color: "#fff" }}>You need to be logged in.</p>;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!currentPassword || !newPassword || !confirm) {
      setError("Please fill in all fields.");
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
    <div style={{ maxWidth: 400, margin: "40px auto", color: "#fff" }}>
      <h2>Change Password</h2>

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
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            style={{ width: "100%", padding: 10 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ width: "100%", padding: 10 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            style={{ width: "100%", padding: 10 }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ padding: "10px 16px" }}>
          {loading ? "Saving..." : "Change password"}
        </button>
      </form>
    </div>
  );
}

