import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { AuthContext } from "../context/AuthContext";

export default function RefundPage() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

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
          setForm((prev) => ({ ...prev, orderId: String(safeOrders[0].id) }));
        }
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401) {
          navigate("/login", { replace: true });
          return;
        }
        setError(err?.response?.data?.message || "Could not load refund page right now.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [authLoading, user, navigate]);

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
    return <div className="container mt-4">Loading refunds...</div>;
  }

  return (
    <div className="container mt-4 mb-5">
      <h2 className="mb-4">Refund Requests</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5 className="card-title">Request a Refund</h5>
          <form onSubmit={submitRefund} className="row g-3 mt-1">
            <div className="col-md-6">
              <label className="form-label">Order</label>
              <select
                className="form-select"
                value={form.orderId}
                onChange={(e) => setForm((prev) => ({ ...prev, orderId: e.target.value, productId: "" }))}
                required
              >
                {orders.map((order) => (
                  <option key={order.id} value={order.id}>
                    #{order.id} - GBP {Number(order.total_price || 0).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">Product (optional)</label>
              <select
                className="form-select"
                value={form.productId}
                onChange={(e) => setForm((prev) => ({ ...prev, productId: e.target.value }))}
              >
                <option value="">Whole order</option>
                {selectedOrderItems.map((item, idx) => (
                  <option key={`${item.product_id}-${idx}`} value={item.product_id}>
                    {item.name} (Qty: {item.quantity})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12">
              <label className="form-label">Reason</label>
              <input
                className="form-control"
                placeholder="e.g. Item arrived damaged"
                value={form.reason}
                maxLength={255}
                onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label">Details (optional)</label>
              <textarea
                className="form-control"
                rows={4}
                placeholder="Add extra detail to help us process your refund quickly."
                value={form.details}
                onChange={(e) => setForm((prev) => ({ ...prev, details: e.target.value }))}
              />
            </div>

            <div className="col-12">
              <button className="btn btn-dark" type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit refund request"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title">Your Requests</h5>
          {refunds.length === 0 ? (
            <p className="text-muted mb-0">No refund requests yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Reason</th>
                    <th>Admin Note</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {refunds.map((r) => (
                    <tr key={r.id}>
                      <td>#{r.id}</td>
                      <td>#{r.order_id}</td>
                      <td>
                        <span className={`badge text-bg-${r.status === "rejected" ? "danger" : r.status === "refunded" ? "success" : "secondary"}`}>
                          {r.status}
                        </span>
                      </td>
                      <td>{r.reason}</td>
                      <td>{r.admin_note || "-"}</td>
                      <td>{r.created_at ? new Date(r.created_at).toLocaleString() : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
