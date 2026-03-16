import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import { AuthContext } from "../context/AuthContext";

function Dropdown({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find((o) => String(o.value) === String(value));

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          ...inputStyle,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{ color: selected ? "#fff" : "#666" }}>
          {selected ? selected.label : "Select…"}
        </span>
        <span style={{ color: "#666", fontSize: 10, marginLeft: 8 }}>▼</span>
      </button>
      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 4px)",
          left: 0,
          right: 0,
          background: "#1a1a1a",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 6,
          zIndex: 999,
          maxHeight: 220,
          overflowY: "auto",
        }}>
          {options.map((o) => (
            <div
              key={o.value}
              onMouseDown={() => { onChange(String(o.value)); setOpen(false); }}
              style={{
                padding: "10px 14px",
                fontSize: 14,
                color: String(o.value) === String(value) ? "#fff" : "#bbb",
                background: String(o.value) === String(value) ? "rgba(255,255,255,0.08)" : "transparent",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
              onMouseLeave={(e) => e.currentTarget.style.background = String(o.value) === String(value) ? "rgba(255,255,255,0.08)" : "transparent"}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const STATUS_STYLES = {
  pending:  { background: "rgba(251,191,36,0.12)",  color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)"  },
  approved: { background: "rgba(52,211,153,0.12)",  color: "#34d399", border: "1px solid rgba(52,211,153,0.3)"  },
  refunded: { background: "rgba(52,211,153,0.12)",  color: "#34d399", border: "1px solid rgba(52,211,153,0.3)"  },
  rejected: { background: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.3)" },
};

function StatusPill({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span style={{
      ...s,
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
    }}>
      {status}
    </span>
  );
}

export default function RefundPage() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [orders, setOrders] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    orderId: "",
    productId: "",
    reason: "",
    details: "",
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        setError("");
        const [ordersRes, refundsRes] = await Promise.all([
          api.get("/api/orders/history"),
          api.get("/api/refunds/my"),
        ]);
        const safeOrders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
        setOrders(safeOrders);
        setRefunds(Array.isArray(refundsRes.data) ? refundsRes.data : []);
        if (safeOrders.length) {
          const queryOrderId = new URLSearchParams(location.search).get("orderId");
          const matched = safeOrders.find((o) => String(o.id) === String(queryOrderId));
          const initialOrderId = matched ? String(matched.id) : String(safeOrders[0].id);
          setForm((prev) => ({ ...prev, orderId: initialOrderId }));
        }
      } catch (err) {
        if (err?.response?.status === 401) {
          navigate("/login", { replace: true });
          return;
        }
        setError(err?.response?.data?.message || "Could not load refund page right now.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [authLoading, user, navigate, location.search]);

  const selectedOrder = useMemo(
    () => orders.find((o) => String(o.id) === String(form.orderId)) || null,
    [orders, form.orderId]
  );

  const selectedOrderItems = useMemo(
    () => (selectedOrder && Array.isArray(selectedOrder.items) ? selectedOrder.items : []),
    [selectedOrder]
  );

  const submitRefund = async (e) => {
    e.preventDefault();
    if (!form.orderId || !form.reason.trim()) {
      setError("Please select an order and enter a refund reason.");
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      await api.post("/api/refunds", {
        orderId: Number(form.orderId),
        productId: form.productId ? Number(form.productId) : null,
        reason: form.reason.trim(),
        details: form.details.trim(),
      });
      const refundsRes = await api.get("/api/refunds/my");
      setRefunds(Array.isArray(refundsRes.data) ? refundsRes.data : []);
      setSuccess("Refund request submitted successfully.");
      setForm((prev) => ({ ...prev, productId: "", reason: "", details: "" }));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit refund request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#888" }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px 100px" }}>

      {/* Page heading */}
      <h1 style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: "clamp(40px, 8vw, 72px)",
        fontWeight: 900,
        textTransform: "uppercase",
        color: "#fff",
        marginBottom: 8,
        letterSpacing: "0.02em",
      }}>
        Refund Requests
      </h1>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 40 }}>
        Submit a refund request for a recent order. We aim to respond within 2–3 business days.
      </p>

      {/* Alerts */}
      {error && (
        <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", borderRadius: 8, padding: "12px 16px", marginBottom: 24, fontSize: 14 }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", color: "#34d399", borderRadius: 8, padding: "12px 16px", marginBottom: 24, fontSize: 14 }}>
          {success}
        </div>
      )}

      {/* Request form */}
      <div style={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "32px", marginBottom: 32 }}>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#fff", marginBottom: 24 }}>
          New Request
        </h2>

        <form onSubmit={submitRefund}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Order</label>
              <Dropdown
                value={form.orderId}
                onChange={(v) => setForm((prev) => ({ ...prev, orderId: v, productId: "" }))}
                options={orders.map((o) => ({ value: o.id, label: `#${o.id} — £${Number(o.total_price || 0).toFixed(2)}` }))}
              />
            </div>

            <div>
              <label style={labelStyle}>Item (optional)</label>
              <Dropdown
                value={form.productId}
                onChange={(v) => setForm((prev) => ({ ...prev, productId: v }))}
                options={[
                  { value: "", label: "Whole order" },
                  ...selectedOrderItems.map((item) => ({
                    value: item.product_id,
                    label: `${item.name} (×${item.quantity})`,
                  })),
                ]}
              />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Reason *</label>
            <input
              style={inputStyle}
              placeholder="e.g. Item arrived damaged"
              value={form.reason}
              maxLength={255}
              onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
              required
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Additional details (optional)</label>
            <textarea
              style={{ ...inputStyle, minHeight: 96, resize: "vertical" }}
              placeholder="Describe the issue in more detail to help us process your request quickly."
              value={form.details}
              onChange={(e) => setForm((prev) => ({ ...prev, details: e.target.value }))}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              background: "#fff",
              color: "#000",
              border: "none",
              borderRadius: 6,
              padding: "11px 28px",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.6 : 1,
              transition: "opacity 0.15s",
            }}
          >
            {submitting ? "Submitting…" : "Submit Request"}
          </button>
        </form>
      </div>

      {/* Your requests */}
      <div style={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "32px" }}>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#fff", marginBottom: 24 }}>
          Your Requests
        </h2>

        {refunds.length === 0 ? (
          <p style={{ color: "#555", fontSize: 14, margin: 0 }}>No refund requests yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {refunds.map((r) => (
              <div key={r.id} style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 8,
                padding: "16px 20px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ color: "#555", fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}>
                      REQUEST #{r.id}
                    </span>
                    <span style={{ color: "#666", fontSize: 11 }}>·</span>
                    <span style={{ color: "#888", fontSize: 12 }}>Order #{r.order_id}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <StatusPill status={r.status} />
                    <span style={{ color: "#555", fontSize: 11 }}>
                      {r.created_at ? new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : ""}
                    </span>
                  </div>
                </div>

                <p style={{ color: "#ccc", fontSize: 14, margin: 0, marginBottom: r.admin_note || r.instruction_link ? 10 : 0 }}>
                  {r.reason}
                </p>

                {(r.admin_note || r.instruction_link) && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10, marginTop: 10, display: "flex", flexWrap: "wrap", gap: 16 }}>
                    {r.admin_note && (
                      <div>
                        <span style={{ color: "#555", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 2 }}>Admin note</span>
                        <span style={{ color: "#aaa", fontSize: 13 }}>{r.admin_note}</span>
                      </div>
                    )}
                    {r.instruction_link && (
                      <div>
                        <span style={{ color: "#555", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 2 }}>Instructions</span>
                        <a href={r.instruction_link} target="_blank" rel="noreferrer" style={{ color: "#fff", fontSize: 13, textDecoration: "underline", textUnderlineOffset: 3 }}>
                          View instructions →
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  color: "#888",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  marginBottom: 6,
};

const inputStyle = {
  width: "100%",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 6,
  color: "#fff",
  fontSize: 14,
  padding: "10px 12px",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};
