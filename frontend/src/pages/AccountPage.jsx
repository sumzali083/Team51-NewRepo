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
      </div>
    </div>
  );
}
