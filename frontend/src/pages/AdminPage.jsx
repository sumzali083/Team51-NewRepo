import React, { useContext, useEffect, useMemo, useState } from "react";
import api from "../api";
import { AuthContext } from "../context/AuthContext";

export default function AdminPage() {
  const { user } = useContext(AuthContext);
  const [reports, setReports] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [savingStockId, setSavingStockId] = useState(null);
  const [savingOrderId, setSavingOrderId] = useState(null);
  const [stockDraft, setStockDraft] = useState({});
  const [orderStatusDraft, setOrderStatusDraft] = useState({});

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [reportsRes, productsRes, ordersRes, usersRes, messagesRes, reviewsRes] = await Promise.all([
        api.get("/api/admin/reports"),
        api.get("/api/admin/products"),
        api.get("/api/admin/orders"),
        api.get("/api/admin/users"),
        api.get("/api/admin/messages"),
        api.get("/api/admin/reviews"),
      ]);

      setReports(reportsRes.data || null);
      setProducts(productsRes.data || []);
      setOrders(ordersRes.data || []);
      setUsers(usersRes.data || []);
      setMessages(messagesRes.data || []);
      setReviews(reviewsRes.data || []);
      setStockDraft(Object.fromEntries((productsRes.data || []).map((p) => [p.id, p.stock ?? 0])));
      setOrderStatusDraft(Object.fromEntries((ordersRes.data || []).map((o) => [o.id, o.status || "pending"])));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const updateStock = async (productId) => {
    const value = Number(stockDraft[productId]);
    if (!Number.isInteger(value) || value < 0) return;
    setSavingStockId(productId);
    try {
      await api.put(`/api/admin/products/${productId}/stock`, { stock: value });
      setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, stock: value } : p)));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update stock");
    } finally {
      setSavingStockId(null);
    }
  };

  const updateOrderStatus = async (orderId) => {
    const status = orderStatusDraft[orderId];
    if (!status) return;
    setSavingOrderId(orderId);
    try {
      await api.put(`/api/admin/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update order status");
    } finally {
      setSavingOrderId(null);
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm("Delete this contact message?")) return;
    try {
      await api.delete(`/api/admin/messages/${id}`);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete message");
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await api.delete(`/api/admin/reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete review");
    }
  };

  const deleteUser = async (id) => {
    if (Number(id) === Number(user?.id)) {
      alert("You cannot delete your own account.");
      return;
    }
    if (!window.confirm("Delete this user account?")) return;
    try {
      await api.delete(`/api/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete user");
    }
  };

  const kpis = useMemo(() => {
    return [
      { label: "Products", value: reports?.totalProducts ?? products.length },
      { label: "Orders", value: reports?.totalOrders ?? orders.length },
      { label: "Revenue", value: `GBP ${Number(reports?.totalRevenue || 0).toFixed(2)}` },
      { label: "Low Stock", value: reports?.lowStockCount ?? 0 },
      { label: "Messages", value: messages.length },
      { label: "Reviews", value: reviews.length },
    ];
  }, [messages.length, orders.length, products.length, reports, reviews.length]);

  const tabs = [
    { key: "dashboard", label: "Dashboard" },
    { key: "inventory", label: "Inventory" },
    { key: "orders", label: "Orders" },
    { key: "reviews", label: "Reviews" },
    { key: "contacts", label: "Contact Messages" },
    { key: "users", label: "Users" },
  ];

  if (loading) {
    return (
      <div className="osai-admin page-container">
        <p className="osai-admin-muted">Loading admin dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="osai-admin page-container">
        <div className="osai-alert osai-alert-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="osai-admin page-container">
      <div className="row g-4">
        <aside className="col-lg-2 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="text-uppercase text-muted mb-3">Admin</h6>
              <div className="nav flex-column nav-pills gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    className={`btn text-start ${activeTab === tab.key ? "btn-dark" : "btn-outline-secondary"}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <button className="btn btn-outline-dark w-100 mt-3" onClick={loadAll}>
                Refresh Data
              </button>
            </div>
          </div>
        </aside>

        <section className="col-lg-10 col-md-9">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="mb-0">Admin Dashboard</h2>
            <span className="badge text-bg-dark px-3 py-2">Logged in: {user?.name || "Admin"}</span>
          </div>

          <div className="row g-3 mb-4">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="col-xl-2 col-lg-4 col-md-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <div className="text-muted small">{kpi.label}</div>
                    <div className="h5 mb-0 mt-1">{kpi.value}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {activeTab === "dashboard" && (
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h4 className="mb-3">Overview</h4>
                <p className="mb-1">Use sidebar tabs to manage inventory, orders, reviews, contacts, and users.</p>
                <p className="mb-0 text-muted">All actions here are restricted to admin users only.</p>
              </div>
            </div>
          )}

          {activeTab === "inventory" && (
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h4 className="mb-3">Inventory Stock Management</h4>
                <div className="table-responsive">
                  <table className="table table-sm align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>SKU</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id}>
                          <td>{p.id}</td>
                          <td>{p.sku || "-"}</td>
                          <td>{p.name}</td>
                          <td>{p.category || "-"}</td>
                          <td>GBP {Number(p.price || 0).toFixed(2)}</td>
                          <td style={{ width: 120 }}>
                            <input
                              type="number"
                              min="0"
                              className="form-control form-control-sm"
                              value={stockDraft[p.id] ?? 0}
                              onChange={(e) =>
                                setStockDraft((prev) => ({ ...prev, [p.id]: e.target.value }))
                              }
                            />
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-dark"
                              onClick={() => updateStock(p.id)}
                              disabled={savingStockId === p.id}
                            >
                              {savingStockId === p.id ? "Saving..." : "Save"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h4 className="mb-3">Orders</h4>
                <div className="table-responsive">
                  <table className="table table-sm align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Email</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id}>
                          <td>{o.id}</td>
                          <td>{o.name}</td>
                          <td>{o.email}</td>
                          <td>GBP {Number(o.total_price || 0).toFixed(2)}</td>
                          <td style={{ width: 160 }}>
                            <select
                              className="form-select form-select-sm"
                              value={orderStatusDraft[o.id] || "pending"}
                              onChange={(e) =>
                                setOrderStatusDraft((prev) => ({ ...prev, [o.id]: e.target.value }))
                              }
                            >
                              <option value="pending">pending</option>
                              <option value="processing">processing</option>
                              <option value="shipped">shipped</option>
                              <option value="delivered">delivered</option>
                              <option value="cancelled">cancelled</option>
                            </select>
                          </td>
                          <td>{o.created_at ? new Date(o.created_at).toLocaleString() : "-"}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-dark"
                              onClick={() => updateOrderStatus(o.id)}
                              disabled={savingOrderId === o.id}
                            >
                              {savingOrderId === o.id ? "Saving..." : "Update"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h4 className="mb-3">Customer Reviews</h4>
                <div className="table-responsive">
                  <table className="table table-sm align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Product ID</th>
                        <th>User ID</th>
                        <th>Rating</th>
                        <th>Reviewer</th>
                        <th>Comment</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map((r) => (
                        <tr key={r.id}>
                          <td>{r.id}</td>
                          <td>{r.product_id}</td>
                          <td>{r.user_id}</td>
                          <td>{r.rating}</td>
                          <td>{r.reviewer_name}</td>
                          <td>{r.comment}</td>
                          <td>{r.created_at ? new Date(r.created_at).toLocaleString() : "-"}</td>
                          <td>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => deleteReview(r.id)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "contacts" && (
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h4 className="mb-3">Contact Messages</h4>
                <div className="table-responsive">
                  <table className="table table-sm align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Message</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messages.map((m) => (
                        <tr key={m.id}>
                          <td>{m.id}</td>
                          <td>{m.name}</td>
                          <td>{m.email}</td>
                          <td>{m.message}</td>
                          <td>{m.created_at ? new Date(m.created_at).toLocaleString() : "-"}</td>
                          <td>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => deleteMessage(m.id)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h4 className="mb-3">Users</h4>
                <div className="table-responsive">
                  <table className="table table-sm align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Created</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td>{u.id}</td>
                          <td>{u.name}</td>
                          <td>{u.email}</td>
                          <td>
                            {u.is_admin === 1 ? (
                              <span className="badge text-bg-dark">Admin</span>
                            ) : (
                              <span className="badge text-bg-secondary">Customer</span>
                            )}
                          </td>
                          <td>{u.created_at ? new Date(u.created_at).toLocaleString() : "-"}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => deleteUser(u.id)}
                              disabled={Number(u.id) === Number(user?.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
