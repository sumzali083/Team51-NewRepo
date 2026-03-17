import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { AuthContext } from "../context/AuthContext";

const REFUND_TRANSITIONS = {
  pending: new Set(["pending", "approved", "rejected"]),
  approved: new Set(["approved", "processing", "rejected"]),
  processing: new Set(["processing", "refunded", "rejected"]),
  rejected: new Set(["rejected"]),
  refunded: new Set(["refunded"]),
};

export default function AdminPage() {
  const LOW_STOCK_LIMIT = 5;
  const { user } = useContext(AuthContext);
  const [reports, setReports] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageSearch, setMessageSearch] = useState("");
  const [messageStatusFilter, setMessageStatusFilter] = useState("all");
  const [messagePage, setMessagePage] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dashboardRange, setDashboardRange] = useState("30d");
  const [savingStockId, setSavingStockId] = useState(null);
  const [savingOrderId, setSavingOrderId] = useState(null);
  const [savingRefundId, setSavingRefundId] = useState(null);
  const [stockDraft, setStockDraft] = useState({});
  const [orderStatusDraft, setOrderStatusDraft] = useState({});
  const [refundStatusDraft, setRefundStatusDraft] = useState({});
  const [refundAdminNoteDraft, setRefundAdminNoteDraft] = useState({});
  const [refundInstructionLinkDraft, setRefundInstructionLinkDraft] = useState({});
  const [refundAmountDraft, setRefundAmountDraft] = useState({});
  const [refundReferenceDraft, setRefundReferenceDraft] = useState({});
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [productDraft, setProductDraft] = useState({
    sku: "", name: "", category_id: 0, price: "", original_price: "", stock: 0,
    description: "", sizes: [], colors: ["", ""], imageFiles: [null, null, null],
  });
  const [editingProductId, setEditingProductId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [savingEditId, setSavingEditId] = useState(null);
  const [categories, setCategories] = useState([]);

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [reportsRes, productsRes, ordersRes, refundsRes, usersRes, messagesRes, reviewsRes, categoriesRes] = await Promise.all([
        api.get("/api/admin/reports"),
        api.get("/api/admin/products"),
        api.get("/api/admin/orders"),
        api.get("/api/admin/refunds"),
        api.get("/api/admin/users"),
        api.get("/api/admin/messages"),
        api.get("/api/admin/reviews"),
        api.get("/api/admin/categories").catch(() => ({ data: [] })),
      ]);

      setReports(reportsRes.data || null);
      setProducts(productsRes.data || []);
      setOrders(ordersRes.data || []);
      setRefunds(refundsRes.data || []);
      setUsers(usersRes.data || []);
      setMessages(messagesRes.data || []);
      setReviews(reviewsRes.data || []);
      const cats = categoriesRes.data || [];
      setCategories(cats);
      // Set default category_id to first real category
      if (cats.length > 0) {
        setProductDraft((prev) => ({ ...prev, category_id: cats[0].id }));
      }
      setStockDraft(Object.fromEntries((productsRes.data || []).map((p) => [p.id, p.stock ?? 0])));
      setOrderStatusDraft(Object.fromEntries((ordersRes.data || []).map((o) => [o.id, o.status || "pending"])));
      setRefundStatusDraft(Object.fromEntries((refundsRes.data || []).map((r) => [r.id, r.status || "pending"])));
      setRefundAdminNoteDraft(Object.fromEntries((refundsRes.data || []).map((r) => [r.id, r.admin_note || ""])));
      setRefundInstructionLinkDraft(Object.fromEntries((refundsRes.data || []).map((r) => [r.id, r.instruction_link || ""])));
      setRefundAmountDraft(Object.fromEntries((refundsRes.data || []).map((r) => [r.id, r.refund_amount == null ? "" : String(r.refund_amount)])));
      setRefundReferenceDraft(Object.fromEntries((refundsRes.data || []).map((r) => [r.id, r.refund_reference || ""])));
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
    const refundAmount = refundAmountDraft[refundId] || "";
    const refundReference = refundReferenceDraft[refundId] || "";
    if (!status) return;

    setSavingRefundId(refundId);
    try {
      await api.put(`/api/admin/refunds/${refundId}/status`, {
        status,
        adminNote,
        instructionLink,
        refundAmount,
        refundReference,
      });
      setRefunds((prev) =>
        prev.map((r) =>
          r.id === refundId
            ? {
                ...r,
                status,
                admin_note: adminNote,
                instruction_link: instructionLink,
                refund_amount: status === "refunded" ? refundAmount : null,
                refund_reference: status === "refunded" ? refundReference : null,
              }
            : r
        )
      );
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update refund request");
    } finally {
      setSavingRefundId(null);
    }
  };

  const getAllowedRefundStatuses = (currentStatus) => {
    return REFUND_TRANSITIONS[currentStatus || "pending"] || REFUND_TRANSITIONS.pending;
  };

  const deleteMessage = async (message) => {
    const sender = message?.name || "this sender";
    const email = message?.email || "unknown email";
    if (!window.confirm(`Delete message from ${sender} (${email})? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/admin/messages/${message.id}`);
      setMessages((prev) => prev.filter((m) => m.id !== message.id));
      setSelectedMessage((prev) => (prev && prev.id === message.id ? null : prev));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete message");
    }
  };

  const updateMessageStatus = async (id, status) => {
    try {
      await api.put(`/api/admin/messages/${id}/status`, { status });
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
      setSelectedMessage((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update message status");
    }
  };

  const openMessage = (message) => {
    if ((message.status || "unread") === "unread") {
      updateMessageStatus(message.id, "read");
    }
    setSelectedMessage(message);
  };

  const closeMessageModal = () => {
    setSelectedMessage(null);
  };

  const replyToMessage = (message) => {
    const email = String(message?.email || "").trim();
    if (!email) {
      alert("No email found for this message.");
      return;
    }
    const subject = encodeURIComponent("Regarding your message to OSAI");
    window.location.href = `mailto:${email}?subject=${subject}`;
  };

  useEffect(() => {
    setMessagePage(1);
  }, [messageSearch, messageStatusFilter]);

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

  const startEdit = (p) => {
    setEditingProductId(p.id);
    setEditDraft({
      sku: p.sku || "",
      name: p.name || "",
      category_id: p.category_id || 11,
      price: p.price != null ? String(p.price) : "",
      original_price: p.original_price != null ? String(p.original_price) : "",
      stock: p.stock != null ? String(p.stock) : "0",
      description: p.description || "",
      sizes: Array.isArray(p.sizes) ? [...p.sizes] : [],
      colors: Array.isArray(p.colors) && p.colors.length ? [...p.colors] : ["", ""],
      images: Array.isArray(p.images) ? [...p.images] : [],
      newImageFiles: [null, null, null],
    });
    setShowAddProduct(false);
  };

  const cancelEdit = () => {
    setEditingProductId(null);
    setEditDraft(null);
  };

  const toggleEditSize = (size) => {
    setEditDraft((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const saveEdit = async () => {
    if (!editDraft.name.trim() || !editDraft.price) {
      alert("Name and Price are required.");
      return;
    }
    setSavingEditId(editingProductId);
    try {
      // Upload any new image files
      const uploadedUrls = [];
      for (const file of (editDraft.newImageFiles || []).filter(Boolean)) {
        const fd = new FormData();
        fd.append("image", file);
        const res = await api.post("/api/admin/upload-image", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploadedUrls.push(res.data.url);
      }

      // Merge: keep existing images that weren't removed, append newly uploaded ones
      const finalImages = [...(editDraft.images || []), ...uploadedUrls];

      const payload = {
        sku: editDraft.sku.trim(),
        name: editDraft.name.trim(),
        category_id: Number(editDraft.category_id),
        price: Number(editDraft.price),
        original_price: editDraft.original_price ? Number(editDraft.original_price) : null,
        stock: Number(editDraft.stock) || 0,
        description: editDraft.description.trim(),
        sizes: editDraft.sizes,
        colors: (editDraft.colors || []).filter((c) => c.trim()),
        images: finalImages,
      };

      await api.put(`/api/admin/products/${editingProductId}`, payload);

      // Optimistically update local state immediately so UI reflects changes at once
      const catName = categories.find((c) => c.id === payload.category_id)?.name || "";
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProductId
            ? { ...p, ...payload, category: catName }
            : p
        )
      );
      setStockDraft((prev) => ({ ...prev, [editingProductId]: payload.stock }));
      cancelEdit();

      // Background re-sync to catch any server-side transformations
      api.get("/api/admin/products")
        .then((res) => {
          if (res.data) {
            setProducts(res.data);
            setStockDraft(Object.fromEntries(res.data.map((p) => [p.id, p.stock ?? 0])));
          }
        })
        .catch(() => {});
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update product");
    } finally {
      setSavingEditId(null);
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
        original_price: productDraft.original_price ? Number(productDraft.original_price) : null,
        stock: Number(stock) || 0,
        description: description.trim(),
        sizes,
        colors: colors.filter((c) => c.trim()),
        images: uploadedUrls,
      });
      setProductDraft({
        sku: "", name: "", category_id: categories[0]?.id || 0, price: "", original_price: "", stock: 0,
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
      { label: "Products", value: reports?.totalProducts ?? products.length, tab: "products" },
      { label: "Orders", value: reports?.totalOrders ?? orders.length, tab: "orders" },
      { label: "Refunds", value: reports?.totalRefundRequests ?? refunds.length, tab: "refunds" },
      { label: "Revenue", value: `GBP ${Number(reports?.totalRevenue || 0).toFixed(2)}`, tab: "orders" },
      { label: "Low Stock", value: reports?.lowStockCount ?? 0, tab: "stockAlerts" },
      { label: "Pending Refunds", value: reports?.pendingRefundRequests ?? 0, tab: "refunds" },
      { label: "Messages", value: messages.length, tab: "contacts" },
      { label: "Reviews", value: reviews.length, tab: "reviews" },
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

  const inRange = (dateValue, rangeKey) => {
    if (!dateValue) return false;
    if (rangeKey === "all") return true;
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return false;
    const now = new Date();
    const days = rangeKey === "7d" ? 7 : 30;
    return now.getTime() - d.getTime() <= days * 24 * 60 * 60 * 1000;
  };

  const rangeOrders = useMemo(
    () => orders.filter((o) => inRange(o.created_at, dashboardRange)),
    [orders, dashboardRange]
  );
  const rangeRefunds = useMemo(
    () => refunds.filter((r) => inRange(r.created_at, dashboardRange)),
    [refunds, dashboardRange]
  );
  const rangeMessages = useMemo(
    () => messages.filter((m) => inRange(m.created_at, dashboardRange)),
    [messages, dashboardRange]
  );

  const rangeRevenue = useMemo(
    () =>
      rangeOrders.reduce(
        (sum, o) => sum + Number(o.total_price || o.total || 0),
        0
      ),
    [rangeOrders]
  );

  const needsActionItems = useMemo(() => {
    const pendingRefunds = refunds.filter((r) => (r.status || "pending") === "pending").length;
    const unreadMessages = messages.filter((m) => (m.status || "unread") === "unread").length;
    return [
      {
        label: "Out of stock products",
        value: outOfStockProducts.length,
        tab: "stockAlerts",
        tone: outOfStockProducts.length > 0 ? "danger" : "secondary",
      },
      {
        label: "Low stock products",
        value: lowStockProducts.length,
        tab: "stockAlerts",
        tone: lowStockProducts.length > 0 ? "warning" : "secondary",
      },
      {
        label: "Pending refunds",
        value: pendingRefunds,
        tab: "refunds",
        tone: pendingRefunds > 0 ? "warning" : "secondary",
      },
      {
        label: "Unread contact messages",
        value: unreadMessages,
        tab: "contacts",
        tone: unreadMessages > 0 ? "info" : "secondary",
      },
    ];
  }, [messages, outOfStockProducts.length, lowStockProducts.length, refunds]);

  const recentActivity = useMemo(() => {
    const orderItems = orders.map((o) => ({
      key: `order-${o.id}`,
      when: o.created_at,
      text: `Order #${o.id} placed`,
      tab: "orders",
    }));
    const refundItems = refunds.map((r) => ({
      key: `refund-${r.id}`,
      when: r.created_at,
      text: `Refund #${r.id} is ${r.status || "pending"}`,
      tab: "refunds",
    }));
    const messageItems = messages.map((m) => ({
      key: `message-${m.id}`,
      when: m.created_at,
      text: `New contact message from ${m.name || m.email || "customer"}`,
      tab: "contacts",
    }));

    return [...orderItems, ...refundItems, ...messageItems]
      .filter((x) => x.when)
      .sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime())
      .slice(0, 8);
  }, [orders, refunds, messages]);

  const filteredMessages = useMemo(() => {
    const q = messageSearch.trim().toLowerCase();
    return messages.filter((m) => {
      const status = (m.status || "unread").toLowerCase();
      if (messageStatusFilter !== "all" && status !== messageStatusFilter) return false;
      if (!q) return true;

      return (
        String(m.name || "").toLowerCase().includes(q) ||
        String(m.email || "").toLowerCase().includes(q) ||
        String(m.message || "").toLowerCase().includes(q)
      );
    });
  }, [messages, messageSearch, messageStatusFilter]);

  const messagePageSize = 10;
  const messageTotalPages = Math.max(1, Math.ceil(filteredMessages.length / messagePageSize));
  const safeMessagePage = Math.min(messagePage, messageTotalPages);
  const pagedMessages = useMemo(() => {
    const start = (safeMessagePage - 1) * messagePageSize;
    return filteredMessages.slice(start, start + messagePageSize);
  }, [filteredMessages, safeMessagePage]);

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
      <div className="osai-admin page-container" style={{ paddingBottom: 160 }}>
        <div className="osai-alert osai-alert-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="osai-admin page-container" style={{ paddingBottom: 160 }}>
      <div className="row g-4" style={{ alignItems: "flex-start" }}>
        <aside className="col-lg-2 col-md-3" style={{ alignSelf: "flex-start" }}>
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
                <button
                  type="button"
                  className="card border-0 shadow-sm h-100 kpi-card text-start w-100"
                  onClick={() => setActiveTab(kpi.tab)}
                  title={`Open ${kpi.label}`}
                  style={{ cursor: "pointer", padding: 0, background: "none" }}
                >
                  <div className="card-body" style={{ padding: "14px 16px" }}>
                    <div className="kpi-label">{kpi.label}</div>
                    <div className="kpi-value">{kpi.value}</div>
                  </div>
                </button>
              </div>
            ))}
          </div>

          {activeTab === "dashboard" && (
            <div className="d-flex flex-column gap-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                    <h4 className="osai-admin-section-title mb-0">Overview</h4>
                    <div className="btn-group btn-group-sm" role="group" aria-label="Dashboard range">
                      {[
                        { key: "7d", label: "7D" },
                        { key: "30d", label: "30D" },
                        { key: "all", label: "All" },
                      ].map((r) => (
                        <button
                          key={r.key}
                          type="button"
                          className={`btn ${dashboardRange === r.key ? "btn-dark" : "btn-outline-secondary"}`}
                          onClick={() => setDashboardRange(r.key)}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="row g-2">
                    <div className="col-md-4">
                      <div className="p-3" style={{ border: "1px solid var(--line)", borderRadius: "var(--radius)" }}>
                        <div style={{ color: "var(--muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>Orders</div>
                        <div style={{ fontSize: 24, fontWeight: 700 }}>{rangeOrders.length}</div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3" style={{ border: "1px solid var(--line)", borderRadius: "var(--radius)" }}>
                        <div style={{ color: "var(--muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>Refund Requests</div>
                        <div style={{ fontSize: 24, fontWeight: 700 }}>{rangeRefunds.length}</div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3" style={{ border: "1px solid var(--line)", borderRadius: "var(--radius)" }}>
                        <div style={{ color: "var(--muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>Revenue</div>
                        <div style={{ fontSize: 24, fontWeight: 700 }}>GBP {rangeRevenue.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2" style={{ color: "var(--sub)", fontSize: 12 }}>
                    Contact messages in range: <strong>{rangeMessages.length}</strong>
                  </div>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-lg-5">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body">
                      <div className="osai-admin-tab-header">
                        <h4 className="osai-admin-section-title">Needs Action</h4>
                      </div>
                      <div className="d-flex flex-column gap-2">
                        {needsActionItems.map((item) => (
                          <button
                            key={item.label}
                            type="button"
                            className="btn btn-outline-secondary d-flex justify-content-between align-items-center"
                            onClick={() => setActiveTab(item.tab)}
                          >
                            <span>{item.label}</span>
                            <span className={`badge text-bg-${item.tone}`}>{item.value}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-7">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body">
                      <div className="osai-admin-tab-header">
                        <h4 className="osai-admin-section-title">Recent Activity</h4>
                      </div>
                      {recentActivity.length === 0 ? (
                        <p className="mb-0" style={{ color: "var(--sub)", fontSize: 13 }}>No recent activity yet.</p>
                      ) : (
                        <div className="d-flex flex-column gap-2">
                          {recentActivity.map((a) => (
                            <button
                              key={a.key}
                              type="button"
                              className="btn btn-outline-secondary text-start d-flex justify-content-between align-items-center"
                              onClick={() => setActiveTab(a.tab)}
                            >
                              <span>{a.text}</span>
                              <span style={{ color: "var(--sub)", fontSize: 12, whiteSpace: "nowrap" }}>
                                {new Date(a.when).toLocaleDateString()}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
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
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-3">
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
                      <div className="col-md-3">
                        <label className="form-label">Original Price <small style={{ color: "var(--muted)" }}>(sale items)</small></label>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          className="form-control form-control-sm"
                          placeholder="49.99"
                          value={productDraft.original_price}
                          onChange={(e) => setProductDraft((prev) => ({ ...prev, original_price: e.target.value }))}
                        />
                      </div>
                      <div className="col-md-2">
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
                                const val = e.target.value;
                                setProductDraft((prev) => {
                                  const next = [...(prev.colors || [])];
                                  next[idx] = val;
                                  return { ...prev, colors: next };
                                });
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

                {/* ── Edit Product Form ── */}
                {editingProductId && editDraft && (
                  <div className="osai-admin-form-panel p-4 mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">Edit Product #{editingProductId}</h5>
                      <button className="btn btn-sm btn-outline-secondary" onClick={cancelEdit}>Cancel</button>
                    </div>
                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label">SKU</label>
                        <input className="form-control form-control-sm" value={editDraft.sku}
                          onChange={(e) => setEditDraft((p) => ({ ...p, sku: e.target.value }))} />
                      </div>
                      <div className="col-md-8">
                        <label className="form-label">Name *</label>
                        <input className="form-control form-control-sm" value={editDraft.name}
                          onChange={(e) => setEditDraft((p) => ({ ...p, name: e.target.value }))} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Category *</label>
                        <select className="form-select form-select-sm" value={editDraft.category_id}
                          onChange={(e) => setEditDraft((p) => ({ ...p, category_id: Number(e.target.value) }))}>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Price (GBP) *</label>
                        <input type="number" min="0.01" step="0.01" className="form-control form-control-sm"
                          value={editDraft.price}
                          onChange={(e) => setEditDraft((p) => ({ ...p, price: e.target.value }))} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Original Price <small style={{ color: "var(--muted)" }}>(sale items)</small></label>
                        <input type="number" min="0.01" step="0.01" className="form-control form-control-sm"
                          placeholder="leave blank to remove sale"
                          value={editDraft.original_price}
                          onChange={(e) => setEditDraft((p) => ({ ...p, original_price: e.target.value }))} />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label">Stock</label>
                        <input type="number" min="0" className="form-control form-control-sm"
                          value={editDraft.stock}
                          onChange={(e) => setEditDraft((p) => ({ ...p, stock: e.target.value }))} />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Description</label>
                        <textarea className="form-control form-control-sm" rows={3}
                          value={editDraft.description}
                          onChange={(e) => setEditDraft((p) => ({ ...p, description: e.target.value }))} />
                      </div>
                      <div className="col-12 osai-admin-form-section">
                        <p className="osai-admin-form-section-label">Sizes</p>
                        <div className="d-flex flex-wrap gap-2 mb-1">
                          <small className="w-100" style={{ color: "var(--muted)", fontSize: 11 }}>Adult:</small>
                          {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                            <div key={size} className="form-check form-check-inline">
                              <input type="checkbox" className="form-check-input" id={`edit-size-${size}`}
                                checked={editDraft.sizes.includes(size)}
                                onChange={() => toggleEditSize(size)} />
                              <label className="form-check-label" htmlFor={`edit-size-${size}`}>{size}</label>
                            </div>
                          ))}
                        </div>
                        <div className="d-flex flex-wrap gap-2 mt-2">
                          <small className="w-100" style={{ color: "var(--muted)", fontSize: 11 }}>Kids:</small>
                          {["5-6", "7-8", "9-10", "11-12"].map((size) => (
                            <div key={size} className="form-check form-check-inline">
                              <input type="checkbox" className="form-check-input" id={`edit-size-kids-${size}`}
                                checked={editDraft.sizes.includes(size)}
                                onChange={() => toggleEditSize(size)} />
                              <label className="form-check-label" htmlFor={`edit-size-kids-${size}`}>{size}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="col-12 osai-admin-form-section">
                        <label className="form-label">Colors</label>
                        <div className="d-flex flex-wrap gap-2 align-items-center">
                          {(editDraft.colors || []).map((color, idx) => (
                            <input key={idx} className="form-control form-control-sm" style={{ width: 140 }}
                              placeholder={`Color ${idx + 1}`} value={color}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditDraft((p) => {
                                  const next = [...(p.colors || [])];
                                  next[idx] = val;
                                  return { ...p, colors: next };
                                });
                              }} />
                          ))}
                          {(editDraft.colors || []).length < 6 && (
                            <button type="button" className="btn btn-outline-secondary btn-sm"
                              onClick={() => setEditDraft((p) => ({ ...p, colors: [...(p.colors || []), ""] }))}>
                              + Color
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="col-12 osai-admin-form-section">
                        <label className="form-label">Current Images</label>
                        <div className="d-flex flex-wrap gap-2 mb-2">
                          {(editDraft.images || []).map((url, idx) => (
                            <div key={idx} style={{ position: "relative" }}>
                              <img src={url} alt={`img-${idx}`}
                                style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 4, border: "1px solid var(--line)" }}
                                onError={(e) => { e.target.style.display = "none"; }} />
                              <button type="button"
                                style={{ position: "absolute", top: -6, right: -6, background: "#e53935", border: "none", borderRadius: "50%", width: 18, height: 18, color: "#fff", fontSize: 10, lineHeight: "18px", padding: 0, cursor: "pointer" }}
                                onClick={() => setEditDraft((p) => ({ ...p, images: p.images.filter((_, i) => i !== idx) }))}>
                                ×
                              </button>
                            </div>
                          ))}
                          {(editDraft.images || []).length === 0 && (
                            <small style={{ color: "var(--muted)" }}>No images yet</small>
                          )}
                        </div>
                        <label className="form-label">Upload New Images</label>
                        <div className="d-flex flex-column gap-2">
                          {(editDraft.newImageFiles || [null, null, null]).map((file, idx) => (
                            <div key={idx} className="d-flex align-items-center gap-2">
                              <input type="file" accept="image/*" className="form-control form-control-sm"
                                onChange={(e) => {
                                  const next = [...(editDraft.newImageFiles || [null, null, null])];
                                  next[idx] = e.target.files[0] || null;
                                  setEditDraft((p) => ({ ...p, newImageFiles: next }));
                                }} />
                              {file && <small style={{ color: "var(--sub)", whiteSpace: "nowrap" }}>{file.name}</small>}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="col-12">
                        <button className="btn btn-dark btn-sm me-2" onClick={saveEdit} disabled={savingEditId === editingProductId}>
                          {savingEditId === editingProductId ? "Saving..." : "Save Changes"}
                        </button>
                        <button className="btn btn-outline-secondary btn-sm" onClick={cancelEdit}>Cancel</button>
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
                        <th>Sale Price</th>
                        <th>Stock</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id} style={editingProductId === p.id ? { background: "rgba(255,255,255,0.04)" } : {}}>
                          <td>{p.id}</td>
                          <td>{p.sku || "—"}</td>
                          <td>
                            <Link
                              to={`/product/${p.sku || p.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "var(--text)", textDecoration: "underline", textDecorationColor: "rgba(255,255,255,0.2)", textUnderlineOffset: 3 }}
                            >
                              {p.name}
                            </Link>
                          </td>
                          <td>{p.category || "—"}</td>
                          <td>
                            {p.original_price
                              ? <><span style={{ textDecoration: "line-through", color: "#888", fontSize: 12 }}>£{Number(p.original_price).toFixed(2)}</span>{" "}</>
                              : null}
                            £{Number(p.price || 0).toFixed(2)}
                          </td>
                          <td>{p.original_price ? `£${Number(p.price || 0).toFixed(2)}` : "—"}</td>
                          <td>{p.stock ?? 0}</td>
                          <td>
                            <div className="d-flex gap-1">
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => startEdit(p)}
                                disabled={deletingProductId === p.id}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => deleteProduct(p.id)}
                                disabled={deletingProductId === p.id}
                              >
                                {deletingProductId === p.id ? "Deleting..." : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {products.length === 0 && (
                        <tr>
                          <td colSpan={8} className="text-center text-muted">No products found.</td>
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
                        <th style={{ minWidth: 170 }}>Update Status</th>
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
                          <td style={{ minWidth: 170 }}>
                            <select
                              className="form-select form-select-sm"
                              style={{ minWidth: 160, color: "var(--text)", backgroundColor: "var(--bg-surface)" }}
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
                        <th style={{ minWidth: 170 }}>Status</th>
                        <th>Admin Note</th>
                        <th>Instructions Link / QR URL</th>
                        <th>Refund Amount</th>
                        <th>Refund Reference</th>
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
                          <td style={{ minWidth: 190 }}>
                            <div className="d-flex flex-column gap-2">
                              <span className={`osai-status osai-status-${refundStatusDraft[r.id] || "pending"}`}>
                                {refundStatusDraft[r.id] || "pending"}
                              </span>
                              <select
                                className="form-select form-select-sm"
                                style={{ minWidth: 170, color: "var(--text)", backgroundColor: "var(--bg-surface)" }}
                                value={refundStatusDraft[r.id] || "pending"}
                                onChange={(e) =>
                                  setRefundStatusDraft((prev) => ({ ...prev, [r.id]: e.target.value }))
                                }
                              >
                                {["pending", "approved", "processing", "rejected", "refunded"].map((nextStatus) => (
                                  <option
                                    key={nextStatus}
                                    value={nextStatus}
                                    disabled={!getAllowedRefundStatuses(r.status || "pending").has(nextStatus)}
                                  >
                                    {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
                                  </option>
                                ))}
                              </select>
                            </div>
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
                          <td style={{ minWidth: 140 }}>
                            <input
                              className="form-control form-control-sm"
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              value={refundAmountDraft[r.id] || ""}
                              onChange={(e) =>
                                setRefundAmountDraft((prev) => ({ ...prev, [r.id]: e.target.value }))
                              }
                            />
                          </td>
                          <td style={{ minWidth: 170 }}>
                            <input
                              className="form-control form-control-sm"
                              placeholder="Payment ref/txn id"
                              value={refundReferenceDraft[r.id] || ""}
                              onChange={(e) =>
                                setRefundReferenceDraft((prev) => ({ ...prev, [r.id]: e.target.value }))
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
                          <td colSpan={12} className="text-center" style={{ color: "var(--sub)" }}>
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
                  <span style={{ color: "var(--sub)", fontSize: 12 }}>{filteredMessages.length} messages</span>
                </div>
                <div className="d-flex gap-2 flex-wrap mb-3">
                  <input
                    className="form-control form-control-sm"
                    style={{ maxWidth: 280 }}
                    value={messageSearch}
                    onChange={(e) => setMessageSearch(e.target.value)}
                    placeholder="Search name, email, message"
                  />
                  <select
                    className="form-select form-select-sm"
                    style={{ maxWidth: 180 }}
                    value={messageStatusFilter}
                    onChange={(e) => setMessageStatusFilter(e.target.value)}
                  >
                    <option value="all">All statuses</option>
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="table-responsive">
                  <table className="table table-sm align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Message</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedMessages.map((m) => (
                        <tr key={m.id}>
                          <td>{m.id}</td>
                          <td>{m.name}</td>
                          <td style={{ color: "var(--sub)" }}>{m.email}</td>
                          <td style={{ whiteSpace: "nowrap" }}>
                            <span className={`osai-status osai-status-${m.status || "unread"}`}>
                              {m.status || "unread"}
                            </span>
                          </td>
                          <td
                            style={{ maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                            title={m.message || ""}
                          >
                            {String(m.message || "").length > 80
                              ? `${String(m.message || "").slice(0, 80)}...`
                              : m.message}
                          </td>
                          <td style={{ color: "var(--sub)", whiteSpace: "nowrap" }}>
                            {m.created_at ? new Date(m.created_at).toLocaleDateString() : "—"}
                          </td>
                          <td>
                            <div className="d-flex gap-2 flex-wrap">
                              <button className="btn btn-sm btn-outline-light" onClick={() => openMessage(m)}>
                                View
                              </button>
                              {(m.status || "unread") !== "archived" ? (
                                <button className="btn btn-sm btn-outline-secondary" onClick={() => updateMessageStatus(m.id, "archived")}>
                                  Archive
                                </button>
                              ) : (
                                <button className="btn btn-sm btn-outline-secondary" onClick={() => updateMessageStatus(m.id, "unread")}>
                                  Unarchive
                                </button>
                              )}
                              <button className="btn btn-sm btn-outline-info" onClick={() => replyToMessage(m)}>
                                Reply
                              </button>
                              <button className="btn btn-sm btn-outline-danger" onClick={() => deleteMessage(m)}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {pagedMessages.length === 0 && (
                        <tr><td colSpan={7} className="text-center" style={{ color: "var(--sub)" }}>No messages yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {filteredMessages.length > 0 && (
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <span style={{ color: "var(--sub)", fontSize: 12 }}>
                      Page {safeMessagePage} of {messageTotalPages}
                    </span>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        disabled={safeMessagePage <= 1}
                        onClick={() => setMessagePage((p) => Math.max(1, p - 1))}
                      >
                        Prev
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        disabled={safeMessagePage >= messageTotalPages}
                        onClick={() => setMessagePage((p) => Math.min(messageTotalPages, p + 1))}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
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

      {selectedMessage && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.7)", zIndex: 2000 }}
          onClick={closeMessageModal}
        >
          <div
            className="card border-0 shadow-sm"
            style={{ width: "min(720px, 92vw)", background: "var(--bg-surface)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 osai-admin-section-title">Message #{selectedMessage.id}</h5>
                <button className="btn btn-sm btn-outline-secondary" onClick={closeMessageModal}>
                  Close
                </button>
              </div>

              <div className="mb-3" style={{ color: "var(--sub)", fontSize: 13 }}>
                <div><strong style={{ color: "var(--text)" }}>From:</strong> {selectedMessage.name || "-"}</div>
                <div><strong style={{ color: "var(--text)" }}>Email:</strong> {selectedMessage.email || "-"}</div>
                <div>
                  <strong style={{ color: "var(--text)" }}>Status:</strong>{" "}
                  <span className={`osai-status osai-status-${selectedMessage.status || "unread"}`}>
                    {selectedMessage.status || "unread"}
                  </span>
                </div>
                <div>
                  <strong style={{ color: "var(--text)" }}>Date:</strong>{" "}
                  {selectedMessage.created_at ? new Date(selectedMessage.created_at).toLocaleString() : "-"}
                </div>
              </div>

              <div
                className="p-3 rounded-2"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--line)",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  maxHeight: "45vh",
                  overflowY: "auto",
                }}
              >
                {selectedMessage.message || "(No message content)"}
              </div>

              <div className="d-flex gap-2 mt-3 flex-wrap">
                <button className="btn btn-sm btn-outline-info" onClick={() => replyToMessage(selectedMessage)}>
                  Reply via Email
                </button>
                {(selectedMessage.status || "unread") !== "archived" ? (
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => updateMessageStatus(selectedMessage.id, "archived")}
                  >
                    Archive
                  </button>
                ) : (
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => updateMessageStatus(selectedMessage.id, "unread")}
                  >
                    Unarchive
                  </button>
                )}
                <button className="btn btn-sm btn-outline-danger" onClick={() => deleteMessage(selectedMessage)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
