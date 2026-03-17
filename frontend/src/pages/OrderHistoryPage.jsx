import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { AuthContext } from "../context/AuthContext";

function refundButtonLabel(status) {
  if (status === "pending") return "Refund requested";
  if (status === "approved" || status === "processing") return "Refund in progress";
  if (status === "refunded") return "Refund completed";
  if (status === "rejected") return "Request again";
  return "Request refund";
}

function orderStatus(order) {
  if (order?.refund?.status === "refunded") return "refunded";
  return String(order?.status || "completed").toLowerCase();
}

function itemImage(item) {
  return (
    item?.image ||
    (Array.isArray(item?.images) ? item.images[0] : null) ||
    "/images/placeholder.jpg"
  );
}

function statusPillClass(status) {
  if (status === "delivered" || status === "completed" || status === "refunded") return "ok";
  if (status === "processing" || status === "pending") return "warn";
  if (status === "cancelled" || status === "rejected") return "bad";
  return "neutral";
}

const STATUS_TABS = ["all", "pending", "processing", "completed", "cancelled", "refunded"];

function tabButtonStyle(active) {
  return {
    border: "1px solid rgba(255,255,255,0.22)",
    background: active ? "rgba(255,255,255,0.12)" : "transparent",
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontSize: 11,
    fontWeight: 700,
    padding: "8px 12px",
  };
}

function statusPillStyle(kind) {
  if (kind === "ok") {
    return {
      background: "rgba(56, 161, 105, 0.18)",
      color: "#9ef0bf",
      border: "1px solid rgba(56, 161, 105, 0.45)",
    };
  }
  if (kind === "warn") {
    return {
      background: "rgba(214, 158, 46, 0.18)",
      color: "#ffd98c",
      border: "1px solid rgba(214, 158, 46, 0.45)",
    };
  }
  if (kind === "bad") {
    return {
      background: "rgba(229, 62, 62, 0.15)",
      color: "#ff9a9a",
      border: "1px solid rgba(229, 62, 62, 0.45)",
    };
  }
  return {
    background: "rgba(255,255,255,0.08)",
    color: "#d1d5db",
    border: "1px solid rgba(255,255,255,0.22)",
  };
}

export default function OrderHistoryPage() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    async function fetchOrderHistory() {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/api/orders/history");
        setOrders(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401) {
          navigate("/login", { replace: true });
          return;
        }
        setError("Could not load order history right now.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrderHistory();
  }, [authLoading, user, navigate]);

  const statusCounts = useMemo(() => {
    const counts = { all: orders.length };
    for (const key of STATUS_TABS) {
      if (key !== "all") counts[key] = 0;
    }
    for (const order of orders) {
      const s = orderStatus(order);
      if (counts[s] != null) counts[s] += 1;
    }
    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter((order) => {
      const s = orderStatus(order);
      if (activeStatus !== "all" && s !== activeStatus) return false;
      if (!q) return true;

      const names = (order.items || []).map((i) => String(i.name || "").toLowerCase()).join(" ");
      return (
        String(order.id || "").toLowerCase().includes(q) ||
        names.includes(q)
      );
    });
  }, [orders, activeStatus, searchQuery]);

  if (authLoading || loading) {
    return <div className="container mt-4">Loading order history...</div>;
  }

  return (
    <div className="container mt-4 mb-5">
      <h2 className="mb-4">Order History</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {!error && orders.length === 0 && (
        <div className="alert alert-info">
          You have not placed any orders yet. <Link to="/mens">Start shopping</Link>.
        </div>
      )}

      {!error && orders.length > 0 && (
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <div className="d-flex flex-wrap gap-2 mb-3">
              {STATUS_TABS.map((status) => (
                <button
                  key={status}
                  className="btn btn-sm"
                  style={tabButtonStyle(activeStatus === status)}
                  onClick={() => setActiveStatus(status)}
                >
                  {status === "all" ? "All Orders" : status.charAt(0).toUpperCase() + status.slice(1)}
                  {` (${statusCounts[status] || 0})`}
                </button>
              ))}
            </div>

            <div className="mb-3">
              <input
                className="form-control"
                style={{ maxWidth: 360 }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order ID or product name"
              />
            </div>

            {filteredOrders.length === 0 ? (
              <div className="alert alert-secondary mb-0">No matching orders found.</div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {filteredOrders.map((order) => {
                  const firstItem = order.items?.[0];
                  const firstName = firstItem?.name || "Order items";
                  const firstImage = itemImage(firstItem);
                  const qtyTotal = (order.items || []).reduce((sum, i) => sum + Number(i.quantity || 0), 0);
                  const status = orderStatus(order);
                  const isExpanded = expandedOrderId === order.id;

                  return (
                    <div
                      key={order.id}
                      className="p-3 rounded-3"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--line)" }}
                    >
                      <div className="row g-3 align-items-center">
                        <div className="col-lg-4">
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={firstImage}
                              alt={firstName}
                              style={{
                                width: 64,
                                height: 64,
                                objectFit: "cover",
                                borderRadius: 8,
                                border: "1px solid rgba(255,255,255,0.10)",
                                background: "rgba(255,255,255,0.03)",
                                flexShrink: 0,
                              }}
                            />
                            <div style={{ minWidth: 0 }}>
                              <div className="fw-semibold" style={{ color: "var(--text)" }}>{firstName}</div>
                              <small style={{ color: "var(--sub)" }}>
                                {qtyTotal} item{qtyTotal !== 1 ? "s" : ""} in this order
                              </small>
                            </div>
                          </div>
                        </div>

                        <div className="col-lg-2 col-6">
                          <small style={{ color: "var(--sub)", display: "block" }}>Order</small>
                          <span style={{ fontWeight: 600 }}>#{order.id}</span>
                        </div>

                        <div className="col-lg-2 col-6">
                          <small style={{ color: "var(--sub)", display: "block" }}>Total</small>
                          <span style={{ fontWeight: 700 }}>{`\u00A3${Number(order.total_price || 0).toFixed(2)}`}</span>
                        </div>

                        <div className="col-lg-2 col-6">
                          <small style={{ color: "var(--sub)", display: "block" }}>Status</small>
                          <span
                            className="badge"
                            style={{
                              ...statusPillStyle(statusPillClass(status)),
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              fontSize: 10,
                              fontWeight: 700,
                            }}
                          >
                            {status}
                          </span>
                        </div>

                        <div className="col-lg-2 col-6 d-flex flex-wrap gap-2 justify-content-lg-end">
                          <button
                            className="btn btn-sm btn-outline-light"
                            onClick={() => setExpandedOrderId((prev) => (prev === order.id ? null : order.id))}
                          >
                            {isExpanded ? "Hide" : "View"}
                          </button>
                          <Link
                            to={`/refunds?orderId=${encodeURIComponent(order.id)}`}
                            className="btn btn-sm btn-outline-light"
                          >
                            {refundButtonLabel(order.refund?.status)}
                          </Link>
                        </div>
                      </div>

                      {order.refund && (
                        <div className="mt-3 d-flex align-items-center gap-2 flex-wrap">
                          <span
                            className="badge"
                            style={{
                              ...statusPillStyle(statusPillClass(order.refund.status)),
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              fontSize: 10,
                              fontWeight: 700,
                            }}
                          >
                            Refund: {order.refund.status}
                          </span>
                          {order.refund.admin_note && (
                            <small style={{ color: "var(--sub)" }}>{order.refund.admin_note}</small>
                          )}
                        </div>
                      )}

                      {isExpanded && (
                        <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--line)" }}>
                          <div className="d-flex flex-column gap-2">
                            {(order.items || []).map((item, idx) => (
                              <div
                                key={`${order.id}-${item.product_id}-${idx}`}
                                className="d-flex align-items-center justify-content-between gap-3"
                              >
                                <div className="d-flex align-items-center gap-2" style={{ minWidth: 0 }}>
                                  <img
                                    src={itemImage(item)}
                                    alt={item.name || "Order item"}
                                    style={{
                                      width: 40,
                                      height: 40,
                                      objectFit: "cover",
                                      borderRadius: 6,
                                      border: "1px solid rgba(255,255,255,0.12)",
                                      flexShrink: 0,
                                    }}
                                  />
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{ color: "var(--text)" }}>{item.name}</div>
                                    <small style={{ color: "var(--sub)" }}>Qty: {item.quantity}</small>
                                  </div>
                                </div>
                                <small style={{ color: "var(--sub)", whiteSpace: "nowrap" }}>
                                  {`\u00A3${Number(item.price_each || 0).toFixed(2)}`}
                                </small>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
