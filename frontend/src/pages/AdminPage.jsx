import { useContext, useEffect, useMemo, useState } from "react";
import api from "../api";
import { AuthContext } from "../context/AuthContext";

export default function AdminPage() {
  const LOW_STOCK_LIMIT = 5;
  const { user } = useContext(AuthContext);
  const [reports, setReports] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [savingStockId, setSavingStockId] = useState(null);
  const [savingOrderId, setSavingOrderId] = useState(null);
  const [savingRefundId, setSavingRefundId] = useState(null);
  const [stockDraft, setStockDraft] = useState({});
  const [orderStatusDraft, setOrderStatusDraft] = useState({});
  const [refundStatusDraft, setRefundStatusDraft] = useState({});
  const [refundAdminNoteDraft, setRefundAdminNoteDraft] = useState({});
  const [refundInstructionLinkDraft, setRefundInstructionLinkDraft] = useState({});
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [productDraft, setProductDraft] = useState({
    sku: "", name: "", category_id: 11, price: "", stock: 0,
    description: "", sizes: [], colors: ["", ""], imageFiles: [null, null, null],
  });

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [reportsRes, productsRes, ordersRes, refundsRes, usersRes, messagesRes, reviewsRes] = await Promise.all([
        api.get("/api/admin/reports"),
        api.get("/api/admin/products"),
        api.get("/api/admin/orders"),
        api.get("/api/admin/refunds"),
        api.get("/api/admin/users"),
        api.get("/api/admin/messages"),
        api.get("/api/admin/reviews"),
      ]);

      setReports(reportsRes.data || null);
      setProducts(productsRes.data || []);
      setOrders(ordersRes.data || []);
      setRefunds(refundsRes.data || []);
      setUsers(usersRes.data || []);
      setMessages(messagesRes.data || []);
      setReviews(reviewsRes.data || []);
      setStockDraft(Object.fromEntries((productsRes.data || []).map((p) => [p.id, p.stock ?? 0])));
      setOrderStatusDraft(Object.fromEntries((ordersRes.data || []).map((o) => [o.id, o.status || "pending"])));
      setRefundStatusDraft(Object.fromEntries((refundsRes.data || []).map((r) => [r.id, r.status || "pending"])));
      setRefundAdminNoteDraft(Object.fromEntries((refundsRes.data || []).map((r) => [r.id, r.admin_note || ""])));
      setRefundInstructionLinkDraft(Object.fromEntries((refundsRes.data || []).map((r) => [r.id, r.instruction_link || ""])));
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

  const updateRefundStatus = async (refundId) => {
    const status = refundStatusDraft[refundId];
    const adminNote = refundAdminNoteDraft[refundId] || "";
    const instructionLink = refundInstructionLinkDraft[refundId] || "";
    if (!status) return;

    setSavingRefundId(refundId);
    try {
      await api.put(`/api/admin/refunds/${refundId}/status`, { status, adminNote, instructionLink });
      setRefunds((prev) =>
        prev.map((r) =>
          r.id === refundId ? { ...r, status, admin_note: adminNote, instruction_link: instructionLink } : r
        )
      );
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update refund request");
    } finally {
      setSavingRefundId(null);
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

  const toggleSize = (size) => {
    setProductDraft((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const addProduct = async () => {
    const { sku, name, category_id, price, stock, description, sizes, colors, imageFiles } = productDraft;
    if (!sku.trim() || !name.trim() || !price) {
      alert("SKU, Name, and Price are required.");
      return;
    }
    if (Number(price) <= 0) {
      alert("Price must be greater than 0.");
      return;
    }
    setSubmittingProduct(true);
    try {
      // Upload each selected image file, collect returned URLs
      const uploadedUrls = [];
      for (const file of imageFiles.filter(Boolean)) {
        const fd = new FormData();
        fd.append("image", file);
        const res = await api.post("/api/admin/upload-image", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploadedUrls.push(res.data.url);
      }

      await api.post("/api/admin/products", {
        sku: sku.trim(),
        name: name.trim(),
        category_id: Number(category_id),
        price: Number(price),
        stock: Number(stock) || 0,
        description: description.trim(),
        sizes,
        colors: colors.filter((c) => c.trim()),
        images: uploadedUrls,
      });
      setProductDraft({
        sku: "", name: "", category_id: 11, price: "", stock: 0,
        description: "", sizes: [], colors: ["", ""], imageFiles: [null, null, null],
      });
      setShowAddProduct(false);
      const res = await api.get("/api/admin/products");
      setProducts(res.data || []);
      setStockDraft(Object.fromEntries((res.data || []).map((p) => [p.id, p.stock ?? 0])));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to create product");
    } finally {
      setSubmittingProduct(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Permanently delete this product and all its images, sizes, and colors?")) return;
    setDeletingProductId(id);
    try {
      await api.delete(`/api/admin/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setStockDraft((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete product");
    } finally {
      setDeletingProductId(null);
    }
  };

  const kpis = useMemo(() => {
    return [
      { label: "Products", value: reports?.totalProducts ?? products.length },
      { label: "Orders", value: reports?.totalOrders ?? orders.length },
      { label: "Refunds", value: reports?.totalRefundRequests ?? refunds.length },
      { label: "Revenue", value: `GBP ${Number(reports?.totalRevenue || 0).toFixed(2)}` },
      { label: "Low Stock", value: reports?.lowStockCount ?? 0 },
      { label: "Pending Refunds", value: reports?.pendingRefundRequests ?? 0 },
      { label: "Messages", value: messages.length },
      { label: "Reviews", value: reviews.length },
    ];
  }, [messages.length, orders.length, products.length, refunds.length, reports, reviews.length]);

  const outOfStockProducts = useMemo(
    () => products.filter((p) => Number(p.stock ?? 0) === 0),
    [products]
  );

  const lowStockProducts = useMemo(
    () =>
      products.filter((p) => {
        const stock = Number(p.stock ?? 0);
        return stock > 0 && stock <= LOW_STOCK_LIMIT;
      }),
    [products, LOW_STOCK_LIMIT]
  );

  const tabs = [
    { key: "dashboard", label: "Dashboard",        icon: "bi-speedometer2" },
    { key: "products",  label: "Products",          icon: "bi-box-seam" },
    { key: "inventory", label: "Inventory",         icon: "bi-clipboard-data" },
    { key: "stockAlerts", label: "Stock Alerts",    icon: "bi-exclamation-triangle" },
    { key: "orders",    label: "Orders",            icon: "bi-bag-check" },
    { key: "refunds",   label: "Refunds",           icon: "bi-arrow-counterclockwise" },
    { key: "reviews",   label: "Reviews",           icon: "bi-star" },
    { key: "contacts",  label: "Contact Messages",  icon: "bi-envelope" },
    { key: "users",     label: "Users",             icon: "bi-people" },
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
          <div className="card border-0 shadow-sm" style={{ position: "sticky", top: 90 }}>
            <div className="card-body">
              <p className="osai-admin-sidebar-label">Navigation</p>
              <div className="nav flex-column nav-pills gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    className={`btn text-start ${activeTab === tab.key ? "btn-dark" : "btn-outline-secondary"}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    <i className={`bi ${tab.icon}`} />
                    {tab.label}
                  </button>
                ))}
              </div>
              <hr style={{ borderColor: "var(--line)", margin: "16px 0" }} />
              <button className="btn btn-outline-dark w-100" onClick={loadAll}>
                <i className="bi bi-arrow-clockwise" /> Refresh
              </button>
            </div>
          </div>
        </aside>

        <section className="col-lg-10 col-md-9">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="osai-admin-section-title" style={{ fontSize: 28 }}>Admin Dashboard</h2>
            <span className="badge text-bg-dark px-3 py-2">
              <i className="bi bi-person-check me-1" />
              {user?.name || "Admin"}
            </span>
          </div>

          <div className="row g-3 mb-4">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="col-xl-2 col-lg-4 col-md-6">
                <div className="card border-0 shadow-sm h-100 kpi-card">
                  <div className="card-body" style={{ padding: "14px 16px" }}>
                    <div className="kpi-label">{kpi.label}</div>
                    <div className="kpi-value">{kpi.value}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {activeTab === "dashboard" && (
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="osai-admin-tab-header">
                  <h4 className="osai-admin-section-title">Overview</h4>
                </div>
                <p className="mb-1" style={{ color: "var(--sub)", fontSize: 14 }}>
                  Use the sidebar to manage products, inventory, orders, reviews, contact messages, and users.
                </p>
                <p className="mb-0" style={{ color: "var(--muted)", fontSize: 12, marginTop: 6 }}>
                  All actions on this panel are restricted to admin accounts only.
                </p>
              </div>
            </div>
          )}

          {activeTab === "products" && (
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="osai-admin-tab-header">
                  <h4 className="osai-admin-section-title">Product Management</h4>
                  <button
                    className="btn btn-dark btn-sm"
                    onClick={() => setShowAddProduct((prev) => !prev)}
                  >
                    {showAddProduct ? <><i className="bi bi-x-lg me-1" />Cancel</> : <><i className="bi bi-plus-lg me-1" />Add Product</>}
                  </button>
                </div>

                {showAddProduct && (
                  <div className="osai-admin-form-panel p-4 mb-4">
                    <h5 className="mb-4">New Product</h5>
                    <div className="row g-3">

                      <div className="col-md-4">
                        <label className="form-label">SKU *</label>
                        <input
                          className="form-control form-control-sm"
                          placeholder="e.g. m-010"
                          value={productDraft.sku}
                          onChange={(e) => setProductDraft((prev) => ({ ...prev, sku: e.target.value }))}
                        />
                      </div>
                      <div className="col-md-8">
                        <label className="form-label">Name *</label>
                        <input
                          className="form-control form-control-sm"
                          placeholder="Product name"
                          value={productDraft.name}
                          onChange={(e) => setProductDraft((prev) => ({ ...prev, name: e.target.value }))}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Category *</label>
                        <select
                          className="form-select form-select-sm"
                          value={productDraft.category_id}
                          onChange={(e) => setProductDraft((prev) => ({ ...prev, category_id: Number(e.target.value) }))}
                        >
                          <option value={11}>Mens</option>
                          <option value={12}>Womens</option>
                          <option value={13}>Kids</option>
                          <option value={14}>New Arrivals</option>
                          <option value={15}>Sale</option>
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Price (GBP) *</label>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          className="form-control form-control-sm"
                          placeholder="29.99"
                          value={productDraft.price}
                          onChange={(e) => setProductDraft((prev) => ({ ...prev, price: e.target.value }))}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Stock</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control form-control-sm"
                          placeholder="0"
                          value={productDraft.stock}
                          onChange={(e) => setProductDraft((prev) => ({ ...prev, stock: e.target.value }))}
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-control form-control-sm"
                          rows={3}
                          placeholder="Product description"
                          value={productDraft.description}
                          onChange={(e) => setProductDraft((prev) => ({ ...prev, description: e.target.value }))}
                        />
                      </div>

                      <div className="col-12 osai-admin-form-section">
                        <p className="osai-admin-form-section-label">Sizes</p>
                        <div className="d-flex flex-wrap gap-2 mb-1">
                          <small className="w-100" style={{ color: "var(--muted)", fontSize: 11 }}>Adult:</small>
                          {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                            <div key={size} className="form-check form-check-inline">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id={`size-${size}`}
                                checked={productDraft.sizes.includes(size)}
                                onChange={() => toggleSize(size)}
                              />
                              <label className="form-check-label" htmlFor={`size-${size}`}>{size}</label>
                            </div>
                          ))}
                        </div>
                        <div className="d-flex flex-wrap gap-2 mt-2">
                          <small className="w-100" style={{ color: "var(--muted)", fontSize: 11 }}>Kids:</small>
                          {["5-6", "7-8", "9-10", "11-12"].map((size) => (
                            <div key={size} className="form-check form-check-inline">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id={`size-kids-${size}`}
                                checked={productDraft.sizes.includes(size)}
                                onChange={() => toggleSize(size)}
                              />
                              <label className="form-check-label" htmlFor={`size-kids-${size}`}>{size}</label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="col-12 osai-admin-form-section">
                        <label className="form-label">Colors</label>
                        <div className="d-flex flex-wrap gap-2 align-items-center">
                          {productDraft.colors.map((color, idx) => (
                            <input
                              key={idx}
                              className="form-control form-control-sm"
                              style={{ width: 140 }}
                              placeholder={`Color ${idx + 1}`}
                              value={color}
                              onChange={(e) => {
                                const next = [...productDraft.colors];
                                next[idx] = e.target.value;
                                setProductDraft((prev) => ({ ...prev, colors: next }));
                              }}
                            />
                          ))}
                          {productDraft.colors.length < 6 && (
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() =>
                                setProductDraft((prev) => ({ ...prev, colors: [...prev.colors, ""] }))
                              }
                            >
                              + Color
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="col-12 osai-admin-form-section">
                        <label className="form-label">Product Images (up to 3)</label>
                        <div className="d-flex flex-column gap-3">
                          {productDraft.imageFiles.map((file, idx) => (
                            <div key={idx} className="d-flex align-items-center gap-3">
                              {file && (
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Preview ${idx + 1}`}
                                  style={{ width: 56, height: 56, objectFit: "cover", borderRadius: "var(--radius)", border: "1px solid var(--line)" }}
                                />
                              )}
                              {!file && (
                                <div style={{ width: 56, height: 56, background: "var(--bg)", border: "1px solid var(--line)", borderRadius: "var(--radius)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <i className="bi bi-image" style={{ color: "var(--muted)", fontSize: 20 }} />
                                </div>
                              )}
                              <div className="flex-grow-1">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="form-control form-control-sm"
                                  onChange={(e) => {
                                    const next = [...productDraft.imageFiles];
                                    next[idx] = e.target.files[0] || null;
                                    setProductDraft((prev) => ({ ...prev, imageFiles: next }));
                                  }}
                                />
                                {file && (
                                  <small style={{ color: "var(--sub)", fontSize: 11, marginTop: 3, display: "block" }}>
                                    {file.name} ({(file.size / 1024).toFixed(0)} KB)
                                  </small>
                                )}
                              </div>
                              {file && (
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm"
                                  style={{ flexShrink: 0 }}
                                  onClick={() => {
                                    const next = [...productDraft.imageFiles];
                                    next[idx] = null;
                                    setProductDraft((prev) => ({ ...prev, imageFiles: next }));
                                  }}
                                >
                                  <i className="bi bi-x" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="col-12">
                        <button
                          className="btn btn-dark btn-sm"
                          onClick={addProduct}
                          disabled={submittingProduct}
                        >
                          {submittingProduct ? "Creating..." : "Create Product"}
                        </button>
                      </div>

                    </div>
                  </div>
                )}

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
                          <td>{p.sku || "—"}</td>
                          <td>{p.name}</td>
                          <td>{p.category || "—"}</td>
                          <td>£{Number(p.price || 0).toFixed(2)}</td>
                          <td>{p.stock ?? 0}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => deleteProduct(p.id)}
                              disabled={deletingProductId === p.id}
                            >
                              {deletingProductId === p.id ? "Deleting..." : "Delete"}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {products.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center text-muted">No products found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>
          )}

          {activeTab === "inventory" && (
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="osai-admin-tab-header">
                  <h4 className="osai-admin-section-title">Inventory</h4>
                  <span style={{ color: "var(--sub)", fontSize: 12 }}>{products.length} products</span>
                </div>
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
                          <td>£{Number(p.price || 0).toFixed(2)}</td>
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

          {activeTab === "stockAlerts" && (
            <div className="d-flex flex-column gap-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="osai-admin-tab-header">
                    <h4 className="osai-admin-section-title">Out of Stock</h4>
                    <span style={{ color: "var(--sub)", fontSize: 12 }}>
                      {outOfStockProducts.length} products
                    </span>
                  </div>
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
                        {outOfStockProducts.map((p) => (
                          <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>{p.sku || "-"}</td>
                            <td>{p.name}</td>
                            <td>{p.category || "-"}</td>
                            <td>£{Number(p.price || 0).toFixed(2)}</td>
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
                        {outOfStockProducts.length === 0 && (
                          <tr>
                            <td colSpan={7} className="text-center" style={{ color: "var(--sub)" }}>
                              No out-of-stock products.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="osai-admin-tab-header">
                    <h4 className="osai-admin-section-title">Low Stock</h4>
                    <span style={{ color: "var(--sub)", fontSize: 12 }}>
                      {lowStockProducts.length} products (1-{LOW_STOCK_LIMIT})
                    </span>
                  </div>
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
                        {lowStockProducts.map((p) => (
                          <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>{p.sku || "-"}</td>
                            <td>{p.name}</td>
                            <td>{p.category || "-"}</td>
                            <td>£{Number(p.price || 0).toFixed(2)}</td>
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
                        {lowStockProducts.length === 0 && (
                          <tr>
                            <td colSpan={7} className="text-center" style={{ color: "var(--sub)" }}>
                              No low-stock products.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="osai-admin-tab-header">
                  <h4 className="osai-admin-section-title">Orders</h4>
                  <span style={{ color: "var(--sub)", fontSize: 12 }}>{orders.length} orders</span>
                </div>
                <div className="table-responsive">
                  <table className="table table-sm align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Customer</th>
                        <th>Email</th>
                        <th>Total</th>
                        <th>Current Status</th>
                        <th>Update Status</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id}>
                          <td>#{o.id}</td>
                          <td>{o.name}</td>
                          <td style={{ color: "var(--sub)" }}>{o.email}</td>
                          <td>£{Number(o.total_price || 0).toFixed(2)}</td>
                          <td>
                            <span className={`osai-status osai-status-${orderStatusDraft[o.id] || "pending"}`}>
                              {orderStatusDraft[o.id] || "pending"}
                            </span>
                          </td>
                          <td style={{ width: 150 }}>
                            <select
                              className="form-select form-select-sm"
                              value={orderStatusDraft[o.id] || "pending"}
                              onChange={(e) =>
                                setOrderStatusDraft((prev) => ({ ...prev, [o.id]: e.target.value }))
                              }
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td style={{ color: "var(--sub)", whiteSpace: "nowrap" }}>
                            {o.created_at ? new Date(o.created_at).toLocaleDateString() : "—"}
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-dark"
                              onClick={() => updateOrderStatus(o.id)}
                              disabled={savingOrderId === o.id}
                            >
                              {savingOrderId === o.id ? "Saving..." : "Save"}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr><td colSpan={8} className="text-center" style={{ color: "var(--sub)" }}>No orders yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "refunds" && (
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="osai-admin-tab-header">
                  <h4 className="osai-admin-section-title">Refund Requests</h4>
                  <span style={{ color: "var(--sub)", fontSize: 12 }}>{refunds.length} requests</span>
                </div>
                <div className="table-responsive">
                  <table className="table table-sm align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Email</th>
                        <th>Order</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Admin Note</th>
                        <th>Instructions Link / QR URL</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {refunds.map((r) => (
                        <tr key={r.id}>
                          <td>#{r.id}</td>
                          <td>{r.user_name || "-"}</td>
                          <td style={{ color: "var(--sub)" }}>{r.user_email || "-"}</td>
                          <td>#{r.order_id}</td>
                          <td style={{ maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {r.reason}
                          </td>
                          <td style={{ width: 160 }}>
                            <select
                              className="form-select form-select-sm"
                              value={refundStatusDraft[r.id] || "pending"}
                              onChange={(e) =>
                                setRefundStatusDraft((prev) => ({ ...prev, [r.id]: e.target.value }))
                              }
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="processing">Processing</option>
                              <option value="rejected">Rejected</option>
                              <option value="refunded">Refunded</option>
                            </select>
                          </td>
                          <td style={{ minWidth: 220 }}>
                            <input
                              className="form-control form-control-sm"
                              placeholder="Optional note for customer"
                              value={refundAdminNoteDraft[r.id] || ""}
                              onChange={(e) =>
                                setRefundAdminNoteDraft((prev) => ({ ...prev, [r.id]: e.target.value }))
                              }
                            />
                          </td>
                          <td style={{ minWidth: 220 }}>
                            <input
                              className="form-control form-control-sm"
                              placeholder="https://... (return label/QR)"
                              value={refundInstructionLinkDraft[r.id] || ""}
                              onChange={(e) =>
                                setRefundInstructionLinkDraft((prev) => ({ ...prev, [r.id]: e.target.value }))
                              }
                            />
                          </td>
                          <td style={{ color: "var(--sub)", whiteSpace: "nowrap" }}>
                            {r.created_at ? new Date(r.created_at).toLocaleDateString() : "-"}
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-dark"
                              onClick={() => updateRefundStatus(r.id)}
                              disabled={savingRefundId === r.id}
                            >
                              {savingRefundId === r.id ? "Saving..." : "Save"}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {refunds.length === 0 && (
                        <tr>
                          <td colSpan={10} className="text-center" style={{ color: "var(--sub)" }}>
                            No refund requests yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="osai-admin-tab-header">
                  <h4 className="osai-admin-section-title">Customer Reviews</h4>
                  <span style={{ color: "var(--sub)", fontSize: 12 }}>{reviews.length} reviews</span>
                </div>
                <div className="table-responsive">
                  <table className="table table-sm align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Product</th>
                        <th>Reviewer</th>
                        <th>Rating</th>
                        <th>Comment</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map((r) => (
                        <tr key={r.id}>
                          <td>{r.id}</td>
                          <td style={{ color: "var(--sub)" }}>#{r.product_id}</td>
                          <td>{r.reviewer_name}</td>
                          <td>
                            <span style={{ color: "#fbbf24", fontFamily: "var(--font-display)", fontWeight: 600 }}>
                              {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                            </span>
                          </td>
                          <td style={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {r.comment}
                          </td>
                          <td style={{ color: "var(--sub)", whiteSpace: "nowrap" }}>
                            {r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => deleteReview(r.id)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {reviews.length === 0 && (
                        <tr><td colSpan={7} className="text-center" style={{ color: "var(--sub)" }}>No reviews yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "contacts" && (
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="osai-admin-tab-header">
                  <h4 className="osai-admin-section-title">Contact Messages</h4>
                  <span style={{ color: "var(--sub)", fontSize: 12 }}>{messages.length} messages</span>
                </div>
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
                          <td style={{ color: "var(--sub)" }}>{m.email}</td>
                          <td style={{ maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {m.message}
                          </td>
                          <td style={{ color: "var(--sub)", whiteSpace: "nowrap" }}>
                            {m.created_at ? new Date(m.created_at).toLocaleDateString() : "—"}
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => deleteMessage(m.id)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {messages.length === 0 && (
                        <tr><td colSpan={6} className="text-center" style={{ color: "var(--sub)" }}>No messages yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="osai-admin-tab-header">
                  <h4 className="osai-admin-section-title">Users</h4>
                  <span style={{ color: "var(--sub)", fontSize: 12 }}>{users.length} accounts</span>
                </div>
                <div className="table-responsive">
                  <table className="table table-sm align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td>{u.id}</td>
                          <td>{u.name}</td>
                          <td style={{ color: "var(--sub)" }}>{u.email}</td>
                          <td>
                            {u.is_admin === 1 ? (
                              <span className="badge text-bg-dark">Admin</span>
                            ) : (
                              <span className="badge text-bg-secondary">Customer</span>
                            )}
                          </td>
                          <td style={{ color: "var(--sub)", whiteSpace: "nowrap" }}>
                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                          </td>
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
                      {users.length === 0 && (
                        <tr><td colSpan={6} className="text-center" style={{ color: "var(--sub)" }}>No users found.</td></tr>
                      )}
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
