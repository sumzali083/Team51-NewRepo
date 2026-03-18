import { useContext, useEffect, useState } from "react";
import api from "../api";
import { AuthContext } from "../context/AuthContext";

const cardStyle = {
  maxWidth: 760,
  margin: "36px auto 80px",
  background: "#111",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 14,
  padding: 24,
  color: "#fff",
};

const labelStyle = {
  display: "block",
  fontSize: 12,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#888",
  marginBottom: 8,
};

const inputStyle = {
  width: "100%",
  background: "#0b0b0b",
  border: "1px solid rgba(255,255,255,0.16)",
  borderRadius: 8,
  color: "#fff",
  padding: "10px 12px",
  outline: "none",
};

const initialForm = {
  name: "",
  email: "",
  phone: "",
  address_line1: "",
  address_line2: "",
  city: "",
  postcode: "",
};

export default function AccountPage() {
  const { user, checkAuth } = useContext(AuthContext);
  const [form, setForm] = useState(initialForm);
  const [adminRequest, setAdminRequest] = useState(null);
  const [adminRequestReason, setAdminRequestReason] = useState("");
  const [submittingAdminRequest, setSubmittingAdminRequest] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      try {
        const res = await api.get("/api/users/me");
        if (!mounted) return;
        const u = res.data?.user || {};
        setForm({
          name: u.name || "",
          email: u.email || "",
          phone: u.phone || "",
          address_line1: u.address_line1 || "",
          address_line2: u.address_line2 || "",
          city: u.city || "",
          postcode: u.postcode || "",
        });
        setAdminRequest(u.admin_role_request || null);
      } catch (err) {
        if (mounted) setError(err?.response?.data?.message || "Failed to load account details.");
      }
    }
    loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setNotice("");
    setError("");
    setSaving(true);
    try {
      await api.put("/api/users/me", form);
      await checkAuth();
      setNotice("Profile updated.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const clearDetails = async () => {
    setNotice("");
    setError("");
    setClearing(true);
    try {
      await api.delete("/api/users/me/details");
      setForm((prev) => ({
        ...prev,
        phone: "",
        address_line1: "",
        address_line2: "",
        city: "",
        postcode: "",
      }));
      setNotice("Personal details cleared.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to clear personal details.");
    } finally {
      setClearing(false);
    }
  };

  const submitAdminRequest = async () => {
    setNotice("");
    setError("");
    setSubmittingAdminRequest(true);
    try {
      await api.post("/api/users/admin-request", {
        reason: adminRequestReason.trim(),
      });
      const res = await api.get("/api/users/me");
      const fresh = res.data?.user || {};
      setAdminRequest(fresh.admin_role_request || null);
      setAdminRequestReason("");
      setNotice("Admin access request submitted.");
      await checkAuth();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit admin request.");
    } finally {
      setSubmittingAdminRequest(false);
    }
  };

  if (!user) {
    return (
      <div style={{ minHeight: "60vh", display: "grid", placeItems: "center", color: "#aaa" }}>
        Please sign in to view account details.
      </div>
    );
  }

  return (
    <div className="container">
      <div style={cardStyle}>
        <h2 style={{ fontWeight: 800, letterSpacing: "0.05em", marginBottom: 18 }}>My Details</h2>

        {notice ? (
          <div className="alert alert-success" role="alert">{notice}</div>
        ) : null}
        {error ? (
          <div className="alert alert-danger" role="alert">{error}</div>
        ) : null}

        <form onSubmit={saveProfile}>
          <div className="row g-3">
            <div className="col-md-6">
              <label style={labelStyle} htmlFor="acc-name">Name</label>
              <input id="acc-name" style={inputStyle} value={form.name} onChange={(e) => updateField("name", e.target.value)} required />
            </div>
            <div className="col-md-6">
              <label style={labelStyle} htmlFor="acc-email">Email</label>
              <input id="acc-email" type="email" style={inputStyle} value={form.email} onChange={(e) => updateField("email", e.target.value)} required />
            </div>
            <div className="col-md-6">
              <label style={labelStyle} htmlFor="acc-phone">Phone</label>
              <input id="acc-phone" style={inputStyle} value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
            </div>
            <div className="col-md-6">
              <label style={labelStyle} htmlFor="acc-postcode">Postcode</label>
              <input id="acc-postcode" style={inputStyle} value={form.postcode} onChange={(e) => updateField("postcode", e.target.value)} />
            </div>
            <div className="col-12">
              <label style={labelStyle} htmlFor="acc-address1">Address line 1</label>
              <input id="acc-address1" style={inputStyle} value={form.address_line1} onChange={(e) => updateField("address_line1", e.target.value)} />
            </div>
            <div className="col-12">
              <label style={labelStyle} htmlFor="acc-address2">Address line 2</label>
              <input id="acc-address2" style={inputStyle} value={form.address_line2} onChange={(e) => updateField("address_line2", e.target.value)} />
            </div>
            <div className="col-md-6">
              <label style={labelStyle} htmlFor="acc-city">City</label>
              <input id="acc-city" style={inputStyle} value={form.city} onChange={(e) => updateField("city", e.target.value)} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
            <button type="submit" className="btn btn-light" disabled={saving}>
              {saving ? "Saving..." : "Save Details"}
            </button>
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={clearDetails}
              disabled={clearing}
            >
              {clearing ? "Clearing..." : "Clear Personal Details"}
            </button>
          </div>
        </form>

        {!user?.is_admin && (
          <div style={{ marginTop: 28, paddingTop: 22, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Admin Access Request</h3>
            {adminRequest ? (
              <div
                style={{
                  border: "1px solid rgba(255,255,255,0.16)",
                  borderRadius: 10,
                  padding: 12,
                  background: "rgba(255,255,255,0.03)",
                  marginBottom: 12,
                }}
              >
                <div style={{ fontSize: 12, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Latest Request
                </div>
                <div style={{ marginTop: 6, fontWeight: 700 }}>
                  Status: {(adminRequest.status || "pending").toUpperCase()}
                </div>
                <div style={{ marginTop: 4, color: "#bbb", fontSize: 13 }}>
                  Submitted: {adminRequest.created_at ? new Date(adminRequest.created_at).toLocaleString() : "-"}
                </div>
              </div>
            ) : (
              <p style={{ color: "#aaa", marginBottom: 12 }}>
                Need admin privileges? Submit a request for current admins to review.
              </p>
            )}
            <label style={labelStyle} htmlFor="admin-request-reason">Reason (optional)</label>
            <textarea
              id="admin-request-reason"
              style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
              value={adminRequestReason}
              onChange={(e) => setAdminRequestReason(e.target.value)}
              placeholder="Explain why you need admin access."
            />
            <button
              type="button"
              className="btn btn-outline-light"
              style={{ marginTop: 10 }}
              onClick={submitAdminRequest}
              disabled={submittingAdminRequest || (adminRequest && adminRequest.status === "pending")}
            >
              {submittingAdminRequest
                ? "Submitting..."
                : (adminRequest && adminRequest.status === "pending")
                  ? "Request Pending"
                  : "Request Admin Access"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
