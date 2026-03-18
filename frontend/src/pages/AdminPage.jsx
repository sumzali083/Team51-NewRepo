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
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [orderDateFilter, setOrderDateFilter] = useState("all");
  const [orderSortBy, setOrderSortBy] = useState("newest");
  const [ordersPage, setOrdersPage] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState({});
  const [bulkOrderStatus, setBulkOrderStatus] = useState("processing");
  const [runningBulkOrderAction, setRunningBulkOrderAction] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
  const [refunds, setRefunds] = useState([]);
  const [users, setUsers] = useState([]);
  const [userAuditLog, setUserAuditLog] = useState([]);
  const [adminRoleRequests, setAdminRoleRequests] = useState([]);
  const [usersSearch, setUsersSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userStatusFilter, setUserStatusFilter] = useState("all");
  const [usersPage, setUsersPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState({});
  const [bulkUserAction, setBulkUserAction] = useState("suspend");
  const [bulkUserReason, setBulkUserReason] = useState("");
  const [userSummary, setUserSummary] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserDraft, setEditUserDraft] = useState(null);
  const [loadingUserSummary, setLoadingUserSummary] = useState(false);
  const [messages, setMessages] = useState([]);
  //  ADDED FEEDBACK STATE
  const [feedback, setFeedback] = useState([]);
  const [feedbackSearch, setFeedbackSearch] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [messageSearch, setMessageSearch] = useState("");
  const [messageStatusFilter, setMessageStatusFilter] = useState("all");
  const [messagePage, setMessagePage] = useState(1);
  const [reviewSearch, setReviewSearch] = useState("");
  const [reviewRatingFilter, setReviewRatingFilter] = useState("all");
  const [reviewDateFilter, setReviewDateFilter] = useState("all");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dashboardRange, setDashboardRange] = useState("30d");
  const [inventorySearch, setInventorySearch] = useState("");
  const [savingStockId, setSavingStockId] = useState(null);
  const [savingOrderId, setSavingOrderId] = useState(null);
  const [savingRefundId, setSavingRefundId] = useState(null);
  const [savingUserId, setSavingUserId] = useState(null);
  const [savingUserRoleId, setSavingUserRoleId] = useState(null);
  const [savingUserProfileId, setSavingUserProfileId] = useState(null);
  const [runningBulkUsersAction, setRunningBulkUsersAction] = useState(false);
  const [reviewingRoleRequestId, setReviewingRoleRequestId] = useState(null);
  const [actionMenuUserId, setActionMenuUserId] = useState(null);
  const [stockDraft, setStockDraft] = useState({});
  const [incomingProductId, setIncomingProductId] = useState("");
  const [incomingSize, setIncomingSize] = useState("");
  const [incomingQty, setIncomingQty] = useState("1");
  const [incomingNote, setIncomingNote] = useState("");
  const [processingIncoming, setProcessingIncoming] = useState(false);
  const [orderStatusDraft, setOrderStatusDraft] = useState({});
  const [refundStatusDraft, setRefundStatusDraft] = useState({});
  const [refundAdminNoteDraft, setRefundAdminNoteDraft] = useState({});
  const [refundInstructionLinkDraft, setRefundInstructionLinkDraft] = useState({});
  const [refundAmountDraft, setRefundAmountDraft] = useState({});
  const [refundReferenceDraft, setRefundReferenceDraft] = useState({});
  const [expandedRefunds, setExpandedRefunds] = useState({});
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [productDraft, setProductDraft] = useState({
    sku: "", name: "", category_id: 0, price: "", original_price: "", stock: 0,
    description: "", sizes: [], sizeStocks: {}, colors: ["", ""], imageFiles: [null, null, null],
  });
  const [editingProductId, setEditingProductId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [savingEditId, setSavingEditId] = useState(null);
  const [categories, setCategories] = useState([]);

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [
        reportsRes,
        productsRes,
        ordersRes,
        refundsRes,
        usersRes,
        messagesRes,
        reviewsRes,
        feedbackRes, //  ADDED
        categoriesRes,
        auditRes,
        roleReqRes
      ] = await Promise.all([
        api.get("/api/admin/reports"),
        api.get("/api/admin/products"),
        api.get("/api/admin/orders"),
        api.get("/api/admin/refunds"),
        api.get("/api/admin/users"),
        api.get("/api/admin/messages"),
        api.get("/api/admin/reviews"),
        api.get("/api/admin/feedback"), //  ADDED
        api.get("/api/admin/categories").catch(() => ({ data: [] })),
        api.get("/api/admin/users/audit-log?limit=12").catch(() => ({ data: [] })),
        api.get("/api/admin/admin-role-requests").catch(() => ({ data: [] })),
      ]);

      setReports(reportsRes.data || null);
      setProducts(productsRes.data || []);
      setOrders(ordersRes.data || []);
      setRefunds(refundsRes.data || []);
      setUsers(usersRes.data || []);
      setUserAuditLog(auditRes.data || []);
      setAdminRoleRequests(roleReqRes.data || []);
      setMessages(messagesRes.data || []);
      setReviews(reviewsRes.data || []);
      setFeedback(feedbackRes.data || []);

      const cats = categoriesRes.data || [];
      setCategories(cats);

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

  //  FEEDBACK FILTER (LIKE REVIEWS SEARCH)
  const filteredFeedback = useMemo(() => {
    return feedback.filter((f) =>
      (f.name || "").toLowerCase().includes(feedbackSearch.toLowerCase()) ||
      (f.email || "").toLowerCase().includes(feedbackSearch.toLowerCase()) ||
      (f.comments || "").toLowerCase().includes(feedbackSearch.toLowerCase())
    );
  }, [feedback, feedbackSearch]);
  
  const updateStock = async (productId) => {
    const value = Number(stockDraft[productId]);
    if (!Number.isInteger(value) || value < 0) return;
    const current = products.find((p) => Number(p.id) === Number(productId));
    if (current && Number(current.stock ?? 0) === value) return;
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
    const current = orders.find((o) => Number(o.id) === Number(orderId));
    if (!status) return;
    if (current && String(current.status || "") === String(status)) return;
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
  const toggleRefundExpanded = (refundId) => {
    setExpandedRefunds((prev) => ({ ...prev, [refundId]: !prev[refundId] }));
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

  useEffect(() => {
    setOrdersPage(1);
  }, [orderSearch, orderStatusFilter, orderDateFilter, orderSortBy]);

  useEffect(() => {
    setUsersPage(1);
  }, [usersSearch, userRoleFilter, userStatusFilter]);

  useEffect(() => {
    const closeMenu = () => setActionMenuUserId(null);
    const onKeyDown = (e) => {
      if (e.key === "Escape") setActionMenuUserId(null);
    };
    document.addEventListener("mousedown", closeMenu);
    document.addEventListener("scroll", closeMenu, true);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", closeMenu);
      document.removeEventListener("scroll", closeMenu, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const deleteReview = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await api.delete(`/api/admin/reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete review");
    }
  };

  const deleteFeedback = async (id) => {
    if (!window.confirm("Delete this feedback entry?")) return;
    try {
      await api.delete(`/api/admin/feedback/${id}`);
      setFeedback((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete feedback");
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

  const updateUserSuspension = async (targetUser, suspended) => {
    if (Number(targetUser?.id) === Number(user?.id)) {
      alert("You cannot change your own admin account status.");
      return;
    }
    const reason = suspended
      ? (window.prompt("Reason for suspension (optional):", "") || "")
      : "";
    setSavingUserId(targetUser.id);
    try {
      await api.put(`/api/admin/users/${targetUser.id}/suspend`, { suspended, reason });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetUser.id
            ? {
                ...u,
                is_suspended: suspended ? 1 : 0,
                suspended_at: suspended ? new Date().toISOString() : null,
                suspension_reason: suspended ? (reason || "Suspended by admin") : null,
              }
            : u
        )
      );
      const auditRes = await api.get("/api/admin/users/audit-log?limit=12").catch(() => ({ data: [] }));
      setUserAuditLog(auditRes.data || []);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update user suspension");
    } finally {
      setSavingUserId(null);
    }
  };

  const updateUserRole = async (targetUser, makeAdmin) => {
    const actionText = makeAdmin ? "promote to admin" : "remove admin access";
    const typed = window.prompt(`Type ADMIN to confirm you want to ${actionText} for ${targetUser?.email || "this user"}.`, "");
    if (typed !== "ADMIN") return;

    setSavingUserRoleId(targetUser.id);
    try {
      await api.put(`/api/admin/users/${targetUser.id}/role`, { isAdmin: makeAdmin });
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, is_admin: makeAdmin ? 1 : 0 } : u))
      );
      const auditRes = await api.get("/api/admin/users/audit-log?limit=12").catch(() => ({ data: [] }));
      setUserAuditLog(auditRes.data || []);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update user role");
    } finally {
      setSavingUserRoleId(null);
    }
  };

  const reviewAdminRoleRequest = async (requestId, decision) => {
    if (!["approved", "rejected"].includes(decision)) return;
    setReviewingRoleRequestId(requestId);
    try {
      await api.put(`/api/admin/admin-role-requests/${requestId}`, { decision });
      const [requestsRes, usersRes, auditRes] = await Promise.all([
        api.get("/api/admin/admin-role-requests").catch(() => ({ data: [] })),
        api.get("/api/admin/users").catch(() => ({ data: [] })),
        api.get("/api/admin/users/audit-log?limit=12").catch(() => ({ data: [] })),
      ]);
      setAdminRoleRequests(requestsRes.data || []);
      setUsers(usersRes.data || []);
      setUserAuditLog(auditRes.data || []);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to process admin request");
    } finally {
      setReviewingRoleRequestId(null);
    }
  };

  const toggleOrderSelection = (orderId) => {
    setSelectedOrders((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const selectedOrderIds = useMemo(
    () => Object.keys(selectedOrders).filter((id) => selectedOrders[id]).map((id) => Number(id)),
    [selectedOrders]
  );

  const runBulkOrderStatus = async () => {
    if (!selectedOrderIds.length) {
      alert("Select at least one order first.");
      return;
    }
    if (!window.confirm(`Update ${selectedOrderIds.length} selected orders to ${bulkOrderStatus}?`)) return;
    setRunningBulkOrderAction(true);
    try {
      await api.post("/api/admin/orders/bulk-status", { orderIds: selectedOrderIds, status: bulkOrderStatus });
      setOrders((prev) =>
        prev.map((o) => (selectedOrderIds.includes(Number(o.id)) ? { ...o, status: bulkOrderStatus } : o))
      );
      setOrderStatusDraft((prev) => {
        const next = { ...prev };
        for (const id of selectedOrderIds) next[id] = bulkOrderStatus;
        return next;
      });
      setSelectedOrders({});
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to bulk update orders");
    } finally {
      setRunningBulkOrderAction(false);
    }
  };

  const openOrderDetails = async (orderId) => {
    setLoadingOrderDetails(true);
    try {
      const res = await api.get(`/api/admin/orders/${orderId}/details`);
      setSelectedOrderDetails(res.data || null);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to load order details");
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  const closeOrderDetails = () => setSelectedOrderDetails(null);

  const openReviewModal = (review) => setSelectedReview(review);
  const closeReviewModal = () => setSelectedReview(null);

  const toggleUserSelection = (targetId) => {
    setSelectedUsers((prev) => ({ ...prev, [targetId]: !prev[targetId] }));
  };

  const selectedUserIds = useMemo(
    () => Object.keys(selectedUsers).filter((id) => selectedUsers[id]).map((id) => Number(id)),
    [selectedUsers]
  );

  const runBulkUserAction = async () => {
    if (!selectedUserIds.length) {
      alert("Select at least one user first.");
      return;
    }
    if (!window.confirm(`Run ${bulkUserAction} for ${selectedUserIds.length} users?`)) return;
    setRunningBulkUsersAction(true);
    try {
      await api.post("/api/admin/users/bulk-action", {
        userIds: selectedUserIds,
        action: bulkUserAction,
        reason: bulkUserReason,
      });
      const [usersRes, auditRes] = await Promise.all([
        api.get("/api/admin/users"),
        api.get("/api/admin/users/audit-log?limit=12").catch(() => ({ data: [] })),
      ]);
      setUsers(usersRes.data || []);
      setUserAuditLog(auditRes.data || []);
      setSelectedUsers({});
      setBulkUserReason("");
    } catch (err) {
      alert(err?.response?.data?.message || "Bulk action failed");
    } finally {
      setRunningBulkUsersAction(false);
    }
  };

  const openUserSummary = async (targetUser) => {
    setLoadingUserSummary(true);
    try {
      const res = await api.get(`/api/admin/users/${targetUser.id}/summary`);
      setUserSummary(res.data || null);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to load user summary");
    } finally {
      setLoadingUserSummary(false);
    }
  };

  const closeUserSummary = () => setUserSummary(null);

  const openUserEditor = (targetUser) => {
    setEditingUser(targetUser);
    setEditUserDraft({
      name: targetUser?.name || "",
      email: targetUser?.email || "",
      phone: targetUser?.phone || "",
      address_line1: targetUser?.address_line1 || "",
      address_line2: targetUser?.address_line2 || "",
      city: targetUser?.city || "",
      postcode: targetUser?.postcode || "",
    });
  };

  const closeUserEditor = () => {
    setEditingUser(null);
    setEditUserDraft(null);
  };

  const saveUserEditor = async () => {
    if (!editingUser || !editUserDraft) return;
    setSavingUserProfileId(editingUser.id);
    try {
      const res = await api.put(`/api/admin/users/${editingUser.id}/profile`, editUserDraft);
      const updated = res.data?.user || {};
      setUsers((prev) =>
        prev.map((u) =>
          Number(u.id) === Number(editingUser.id)
            ? {
                ...u,
                name: updated.name ?? u.name,
                email: updated.email ?? u.email,
                phone: updated.phone ?? u.phone,
                address_line1: updated.address_line1 ?? u.address_line1,
                address_line2: updated.address_line2 ?? u.address_line2,
                city: updated.city ?? u.city,
                postcode: updated.postcode ?? u.postcode,
              }
            : u
        )
      );
      closeUserEditor();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update user details");
    } finally {
      setSavingUserProfileId(null);
    }
  };

  const processIncomingStock = async () => {
    const productId = Number(incomingProductId);
    const quantity = Number(incomingQty);
    if (!Number.isInteger(productId) || productId <= 0) {
      alert("Select a product for incoming stock.");
      return;
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      alert("Incoming quantity must be a positive integer.");
      return;
    }
    setProcessingIncoming(true);
    try {
      await api.post(`/api/admin/products/${productId}/incoming`, {
        quantity,
        size: incomingSize || null,
        note: incomingNote || null,
      });
      const res = await api.get("/api/admin/products");
      setProducts(res.data || []);
      setStockDraft(Object.fromEntries((res.data || []).map((p) => [p.id, p.stock ?? 0])));
      setIncomingQty("1");
      setIncomingNote("");
      setIncomingSize("");
      await loadAll();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to process incoming stock");
    } finally {
      setProcessingIncoming(false);
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
      sizeStocks: Object.fromEntries(
        (Array.isArray(p.sizeStocks) ? p.sizeStocks : []).map((x) => [x.size, String(x.stock ?? 0)])
      ),
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
      sizeStocks: prev.sizes.includes(size)
        ? Object.fromEntries(Object.entries(prev.sizeStocks || {}).filter(([k]) => k !== size))
        : { ...(prev.sizeStocks || {}), [size]: String(prev.stock || "0") },
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
        sizeStocks: editDraft.sizeStocks || {},
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
      sizeStocks: prev.sizes.includes(size)
        ? Object.fromEntries(Object.entries(prev.sizeStocks || {}).filter(([k]) => k !== size))
        : { ...(prev.sizeStocks || {}), [size]: String(prev.stock || "0") },
    }));
  };

  const addProduct = async () => {
    const { sku, name, category_id, price, stock, description, sizes, sizeStocks, colors, imageFiles } = productDraft;
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
        sizeStocks: sizeStocks || {},
        colors: colors.filter((c) => c.trim()),
        images: uploadedUrls,
      });
      setProductDraft({
        sku: "", name: "", category_id: categories[0]?.id || 0, price: "", original_price: "", stock: 0,
        description: "", sizes: [], sizeStocks: {}, colors: ["", ""], imageFiles: [null, null, null],
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

  const filteredInventoryProducts = useMemo(() => {
    const q = inventorySearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      String(p.sku || "").toLowerCase().includes(q) ||
      String(p.name || "").toLowerCase().includes(q) ||
      String(p.category || "").toLowerCase().includes(q)
    );
  }, [products, inventorySearch]);

  const selectedIncomingProduct = useMemo(
    () => products.find((p) => Number(p.id) === Number(incomingProductId)) || null,
    [products, incomingProductId]
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

  const stockFlow7d = useMemo(() => {
    return Array.isArray(reports?.productFlow7d) ? reports.productFlow7d : [];
  }, [reports]);

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

  const filteredUsers = useMemo(() => {
    const q = usersSearch.trim().toLowerCase();
    return users.filter((u) => {
      const role = Number(u.is_admin) === 1 ? "admin" : "customer";
      const status = Number(u.is_suspended) === 1 ? "suspended" : "active";
      if (userRoleFilter !== "all" && role !== userRoleFilter) return false;
      if (userStatusFilter !== "all" && status !== userStatusFilter) return false;
      if (!q) return true;
      return (
        String(u.name || "").toLowerCase().includes(q) ||
        String(u.email || "").toLowerCase().includes(q) ||
        String(u.id || "").toLowerCase().includes(q)
      );
    });
  }, [users, usersSearch, userRoleFilter, userStatusFilter]);

  const usersPageSize = 10;
  const usersTotalPages = Math.max(1, Math.ceil(filteredUsers.length / usersPageSize));
  const safeUsersPage = Math.min(usersPage, usersTotalPages);
  const pagedUsers = useMemo(() => {
    const start = (safeUsersPage - 1) * usersPageSize;
    return filteredUsers.slice(start, start + usersPageSize);
  }, [filteredUsers, safeUsersPage]);

  const allPagedUsersSelected = useMemo(
    () => pagedUsers.length > 0 && pagedUsers.every((u) => selectedUsers[u.id]),
    [pagedUsers, selectedUsers]
  );

  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    const now = Date.now();
    return orders.filter((o) => {
      const status = String(o.status || "pending").toLowerCase();
      if (orderStatusFilter !== "all" && status !== orderStatusFilter) return false;

      if (orderDateFilter !== "all") {
        const created = o.created_at ? new Date(o.created_at).getTime() : NaN;
        if (!Number.isFinite(created)) return false;
        const days = orderDateFilter === "7d" ? 7 : orderDateFilter === "30d" ? 30 : 90;
        if (now - created > days * 24 * 60 * 60 * 1000) return false;
      }

      if (!q) return true;
      return (
        String(o.id || "").toLowerCase().includes(q) ||
        String(o.name || "").toLowerCase().includes(q) ||
        String(o.email || "").toLowerCase().includes(q)
      );
    });
  }, [orders, orderSearch, orderStatusFilter, orderDateFilter]);

  const sortedOrders = useMemo(() => {
    const arr = [...filteredOrders];
    if (orderSortBy === "newest") {
      arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (orderSortBy === "oldest") {
      arr.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (orderSortBy === "highest") {
      arr.sort((a, b) => Number(b.total_price || 0) - Number(a.total_price || 0));
    } else if (orderSortBy === "pending_first") {
      arr.sort((a, b) => {
        const ap = String(a.status || "") === "pending" ? 0 : 1;
        const bp = String(b.status || "") === "pending" ? 0 : 1;
        return ap - bp || new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }
    return arr;
  }, [filteredOrders, orderSortBy]);

  const ordersPageSize = 10;
  const ordersTotalPages = Math.max(1, Math.ceil(sortedOrders.length / ordersPageSize));
  const safeOrdersPage = Math.min(ordersPage, ordersTotalPages);
  const pagedOrders = useMemo(() => {
    const start = (safeOrdersPage - 1) * ordersPageSize;
    return sortedOrders.slice(start, start + ordersPageSize);
  }, [sortedOrders, safeOrdersPage]);

  const allPagedOrdersSelected = useMemo(
    () => pagedOrders.length > 0 && pagedOrders.every((o) => selectedOrders[o.id]),
    [pagedOrders, selectedOrders]
  );

  const productLookup = useMemo(() => {
    const map = new Map();
    for (const p of products) {
      map.set(String(p.id), p);
      if (p.sku) map.set(String(p.sku), p);
    }
    return map;
  }, [products]);

  const getReviewProduct = (review) => productLookup.get(String(review?.product_id)) || null;

  const filteredReviews = useMemo(() => {
    const q = reviewSearch.trim().toLowerCase();
    const now = Date.now();
    return reviews.filter((r) => {
      if (reviewRatingFilter !== "all" && Number(r.rating) !== Number(reviewRatingFilter)) return false;

      if (reviewDateFilter !== "all") {
        const created = r.created_at ? new Date(r.created_at).getTime() : NaN;
        if (!Number.isFinite(created)) return false;
        const days = reviewDateFilter === "7d" ? 7 : reviewDateFilter === "30d" ? 30 : 90;
        if (now - created > days * 24 * 60 * 60 * 1000) return false;
      }

      if (!q) return true;
      const product = getReviewProduct(r);
      return (
        String(r.reviewer_name || "").toLowerCase().includes(q) ||
        String(r.comment || "").toLowerCase().includes(q) ||
        String(r.product_id || "").toLowerCase().includes(q) ||
        String(product?.name || "").toLowerCase().includes(q) ||
        String(product?.sku || "").toLowerCase().includes(q)
      );
    });
  }, [reviews, reviewSearch, reviewRatingFilter, reviewDateFilter, productLookup]);

  const tabs = [
    { key: "dashboard", label: "Dashboard",        icon: "bi-speedometer2" },
    { key: "products",  label: "Products",          icon: "bi-box-seam" },
    { key: "inventory", label: "Inventory",         icon: "bi-clipboard-data" },
    { key: "stockAlerts", label: "Stock Alerts",    icon: "bi-exclamation-triangle" },
    { key: "orders",    label: "Orders",            icon: "bi-bag-check" },
    { key: "refunds",   label: "Refunds",           icon: "bi-arrow-counterclockwise" },
    { key: "reviews",   label: "Reviews",           icon: "bi-star" },
    { key: "feedback",  label: "Feedback",          icon: "bi-chat-left-text" },
    { key: "contacts",  label: "Contact Messages",  icon: "bi-envelope" },
    { key: "users",     label: "Users",             icon: "bi-people" }
  ];

  const overviewCardStyle = {
    border: "1px solid var(--line)",
    borderRadius: "var(--radius)",
    minHeight: 104,
    width: "100%",
    background: "rgba(255,255,255,0.01)",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    textAlign: "left",
  };

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
                    <div className="col-lg-3 col-md-6">
                      <button
                        type="button"
                        className="btn p-0"
                        style={overviewCardStyle}
                        onClick={() => setActiveTab("orders")}
                        title="Open orders"
                      >
                        <div style={{ color: "var(--muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>Orders</div>
                        <div style={{ fontSize: 24, fontWeight: 700 }}>{rangeOrders.length}</div>
                      </button>
                    </div>
                    <div className="col-lg-3 col-md-6">
                      <button
                        type="button"
                        className="btn p-0"
                        style={overviewCardStyle}
                        onClick={() => setActiveTab("refunds")}
                        title="Open refunds"
                      >
                        <div style={{ color: "var(--muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>Refund Requests</div>
                        <div style={{ fontSize: 24, fontWeight: 700 }}>{rangeRefunds.length}</div>
                      </button>
                    </div>
                    <div className="col-lg-3 col-md-6">
                      <button
                        type="button"
                        className="btn p-0"
                        style={overviewCardStyle}
                        onClick={() => setActiveTab("orders")}
                        title="Open orders and revenue data"
                      >
                        <div style={{ color: "var(--muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>Revenue</div>
                        <div style={{ fontSize: 24, fontWeight: 700 }}>GBP {rangeRevenue.toFixed(2)}</div>
                      </button>
                    </div>
                    <div className="col-lg-3 col-md-6">
                      <button
                        type="button"
                        className="btn p-0"
                        style={overviewCardStyle}
                        onClick={() => setActiveTab("inventory")}
                        title="Open inventory stock flow context"
                      >
                        <div style={{ color: "var(--muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>Stock Flow (7D)</div>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>
                          +{Number(reports?.totalIncomingUnits7d || 0)} / -{Number(reports?.totalOutgoingUnits7d || 0)}
                        </div>
                      </button>
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
                      {productDraft.sizes.length > 0 && (
                        <div className="col-12">
                          <label className="form-label">Size-level stock</label>
                          <div className="d-flex flex-wrap gap-2">
                            {productDraft.sizes.map((size) => (
                              <div key={`new-size-stock-${size}`} style={{ width: 120 }}>
                                <small style={{ color: "var(--muted)" }}>{size}</small>
                                <input
                                  type="number"
                                  min="0"
                                  className="form-control form-control-sm"
                                  value={productDraft.sizeStocks?.[size] ?? productDraft.stock ?? 0}
                                  onChange={(e) =>
                                    setProductDraft((prev) => ({
                                      ...prev,
                                      sizeStocks: { ...(prev.sizeStocks || {}), [size]: e.target.value },
                                    }))
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

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
                      {editDraft.sizes.length > 0 && (
                        <div className="col-12">
                          <label className="form-label">Size-level stock</label>
                          <div className="d-flex flex-wrap gap-2">
                            {editDraft.sizes.map((size) => (
                              <div key={`edit-size-stock-${size}`} style={{ width: 120 }}>
                                <small style={{ color: "var(--muted)" }}>{size}</small>
                                <input
                                  type="number"
                                  min="0"
                                  className="form-control form-control-sm"
                                  value={editDraft.sizeStocks?.[size] ?? editDraft.stock ?? 0}
                                  onChange={(e) =>
                                    setEditDraft((prev) => ({
                                      ...prev,
                                      sizeStocks: { ...(prev.sizeStocks || {}), [size]: e.target.value },
                                    }))
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
                  <span style={{ color: "var(--sub)", fontSize: 12 }}>{filteredInventoryProducts.length} products</span>
                </div>
                <div className="d-flex gap-2 flex-wrap mb-3">
                  <input
                    className="form-control form-control-sm"
                    style={{ maxWidth: 320 }}
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    placeholder="Search SKU, name, category"
                  />
                </div>
                <div className="card border-0 mb-3" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div className="card-body">
                    <div className="d-flex flex-wrap align-items-end gap-2">
                      <div style={{ minWidth: 180 }}>
                        <label className="form-label" style={{ fontSize: 12, color: "var(--sub)" }}>Incoming product</label>
                        <select
                          className="form-select form-select-sm"
                          value={incomingProductId}
                          onChange={(e) => {
                            setIncomingProductId(e.target.value);
                            setIncomingSize("");
                          }}
                        >
                          <option value="">Select product</option>
                          {products.map((p) => (
                            <option key={`incoming-${p.id}`} value={p.id}>
                              {p.sku || p.id} - {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div style={{ minWidth: 150 }}>
                        <label className="form-label" style={{ fontSize: 12, color: "var(--sub)" }}>Size (optional)</label>
                        <select
                          className="form-select form-select-sm"
                          value={incomingSize}
                          onChange={(e) => setIncomingSize(e.target.value)}
                          disabled={!selectedIncomingProduct || !Array.isArray(selectedIncomingProduct.sizes) || selectedIncomingProduct.sizes.length === 0}
                        >
                          <option value="">No size</option>
                          {(selectedIncomingProduct?.sizes || []).map((size) => (
                            <option key={`incoming-size-${size}`} value={size}>{size}</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ width: 120 }}>
                        <label className="form-label" style={{ fontSize: 12, color: "var(--sub)" }}>Quantity</label>
                        <input
                          type="number"
                          min="1"
                          className="form-control form-control-sm"
                          value={incomingQty}
                          onChange={(e) => setIncomingQty(e.target.value)}
                        />
                      </div>
                      <div style={{ minWidth: 220, flex: "1 1 220px" }}>
                        <label className="form-label" style={{ fontSize: 12, color: "var(--sub)" }}>Note</label>
                        <input
                          className="form-control form-control-sm"
                          placeholder="e.g. supplier restock shipment"
                          value={incomingNote}
                          onChange={(e) => setIncomingNote(e.target.value)}
                        />
                      </div>
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={processIncomingStock}
                        disabled={processingIncoming}
                      >
                        {processingIncoming ? "Processing..." : "Process Incoming"}
                      </button>
                    </div>
                  </div>
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
                      {filteredInventoryProducts.map((p) => (
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
                              disabled={savingStockId === p.id || Number(stockDraft[p.id] ?? 0) === Number(p.stock ?? 0)}
                            >
                              {savingStockId === p.id ? "Saving..." : "Save"}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredInventoryProducts.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center" style={{ color: "var(--sub)" }}>
                            No inventory items match your search.
                          </td>
                        </tr>
                      )}
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
                          <th>Image</th>
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
                            <td>
                              {Array.isArray(p.images) && p.images[0] ? (
                                <img
                                  src={p.images[0]}
                                  alt={p.name || `Product ${p.id}`}
                                  style={{
                                    width: 40,
                                    height: 40,
                                    objectFit: "cover",
                                    borderRadius: 6,
                                    border: "1px solid var(--line)",
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 6,
                                    border: "1px solid var(--line)",
                                    background: "rgba(255,255,255,0.03)",
                                  }}
                                />
                              )}
                            </td>
                            <td>{p.sku || "-"}</td>
                            <td>
                              <a
                                href={`/product/${encodeURIComponent(p.id)}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: "var(--text)", textDecoration: "underline", textUnderlineOffset: 3 }}
                              >
                                {p.name}
                              </a>
                            </td>
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
                            <td colSpan={8} className="text-center" style={{ color: "var(--sub)" }}>
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
                          <th>Image</th>
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
                            <td>
                              {Array.isArray(p.images) && p.images[0] ? (
                                <img
                                  src={p.images[0]}
                                  alt={p.name || `Product ${p.id}`}
                                  style={{
                                    width: 40,
                                    height: 40,
                                    objectFit: "cover",
                                    borderRadius: 6,
                                    border: "1px solid var(--line)",
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 6,
                                    border: "1px solid var(--line)",
                                    background: "rgba(255,255,255,0.03)",
                                  }}
                                />
                              )}
                            </td>
                            <td>{p.sku || "-"}</td>
                            <td>
                              <a
                                href={`/product/${encodeURIComponent(p.id)}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: "var(--text)", textDecoration: "underline", textUnderlineOffset: 3 }}
                              >
                                {p.name}
                              </a>
                            </td>
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
                            <td colSpan={8} className="text-center" style={{ color: "var(--sub)" }}>
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
                  <span style={{ color: "var(--sub)", fontSize: 12 }}>{filteredOrders.length} orders</span>
                </div>
                <div className="d-flex gap-2 flex-wrap mb-3">
                  <input
                    className="form-control form-control-sm"
                    style={{ maxWidth: 280 }}
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search order id, customer, email"
                  />
                  <select
                    className="form-select form-select-sm"
                    style={{ maxWidth: 180 }}
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                  >
                    <option value="all">All statuses</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <select
                    className="form-select form-select-sm"
                    style={{ maxWidth: 170 }}
                    value={orderDateFilter}
                    onChange={(e) => setOrderDateFilter(e.target.value)}
                  >
                    <option value="all">All time</option>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                  </select>
                  <select
                    className="form-select form-select-sm"
                    style={{ maxWidth: 180 }}
                    value={orderSortBy}
                    onChange={(e) => setOrderSortBy(e.target.value)}
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="highest">Highest value</option>
                    <option value="pending_first">Pending first</option>
                  </select>
                </div>
                <div
                  className="d-flex gap-2 flex-wrap align-items-center p-2 rounded mb-3"
                  style={{ border: "1px solid var(--line)", background: "rgba(255,255,255,0.02)" }}
                >
                  <span style={{ color: "var(--sub)", fontSize: 12 }}>{selectedOrderIds.length} selected</span>
                  <select
                    className="form-select form-select-sm"
                    style={{ maxWidth: 180 }}
                    value={bulkOrderStatus}
                    onChange={(e) => setBulkOrderStatus(e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button
                    className="btn btn-sm btn-outline-light"
                    onClick={runBulkOrderStatus}
                    disabled={runningBulkOrderAction || selectedOrderIds.length === 0}
                  >
                    {runningBulkOrderAction ? "Running..." : "Run Bulk Update"}
                  </button>
                </div>
                <div className="table-responsive">
                  <table className="table table-sm align-middle">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: 42 }}>
                          <input
                            type="checkbox"
                            checked={allPagedOrdersSelected}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setSelectedOrders((prev) => {
                                const next = { ...prev };
                                for (const row of pagedOrders) next[row.id] = checked;
                                return next;
                              });
                            }}
                          />
                        </th>
                        <th>ID</th>
                        <th>Customer</th>
                        <th>Email</th>
                        <th>Total</th>
                        <th>Current Status</th>
                        <th style={{ minWidth: 170 }}>Update Status</th>
                        <th>Date</th>
                        <th>Details</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedOrders.map((o) => (
                        <tr key={o.id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={!!selectedOrders[o.id]}
                              onChange={() => toggleOrderSelection(o.id)}
                            />
                          </td>
                          <td>#{o.id}</td>
                          <td>{o.name}</td>
                          <td style={{ color: "var(--sub)" }}>{o.email}</td>
                          <td>GBP {Number(o.total_price || 0).toFixed(2)}</td>
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
                            {o.created_at ? new Date(o.created_at).toLocaleDateString() : "-"}
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-light" onClick={() => openOrderDetails(o.id)}>
                              View
                            </button>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-dark"
                              onClick={() => updateOrderStatus(o.id)}
                              disabled={savingOrderId === o.id || String(orderStatusDraft[o.id] || "") === String(o.status || "")}
                            >
                              {savingOrderId === o.id ? "Saving..." : "Save"}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {pagedOrders.length === 0 && (
                        <tr><td colSpan={10} className="text-center" style={{ color: "var(--sub)" }}>No orders yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {filteredOrders.length > 0 && (
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <span style={{ color: "var(--sub)", fontSize: 12 }}>
                      Page {safeOrdersPage} of {ordersTotalPages}
                    </span>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        disabled={safeOrdersPage <= 1}
                        onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                      >
                        Prev
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        disabled={safeOrdersPage >= ordersTotalPages}
                        onClick={() => setOrdersPage((p) => Math.min(ordersTotalPages, p + 1))}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
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
                <div>
                  <table className="table table-sm align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Order</th>
                        <th>Reason</th>
                        <th style={{ minWidth: 180 }}>Status</th>
                        <th>Date</th>
                        <th>Details</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {refunds.flatMap((r) => {
                        const isOpen = !!expandedRefunds[r.id];
                        return [
                          <tr key={`refund-row-${r.id}`}>
                            <td>#{r.id}</td>
                            <td>
                              <div style={{ lineHeight: 1.2 }}>
                                <div>{r.user_name || "-"}</div>
                                <small style={{ color: "var(--sub)" }}>{r.user_email || "-"}</small>
                              </div>
                            </td>
                            <td>#{r.order_id}</td>
                            <td style={{ maxWidth: 260 }}>
                              <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.reason || ""}>
                                {r.reason || "-"}
                              </div>
                            </td>
                            <td style={{ minWidth: 180 }}>
                              <span className={`osai-status osai-status-${refundStatusDraft[r.id] || "pending"}`}>
                                {refundStatusDraft[r.id] || "pending"}
                              </span>
                            </td>
                            <td style={{ color: "var(--sub)", whiteSpace: "nowrap" }}>
                              {r.created_at ? new Date(r.created_at).toLocaleDateString() : "-"}
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-light"
                                onClick={() => toggleRefundExpanded(r.id)}
                              >
                                {isOpen ? "Hide" : "View"}
                              </button>
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
                          </tr>,
                          isOpen ? (
                            <tr key={`refund-expand-${r.id}`}>
                              <td colSpan={8}>
                                <div
                                  className="p-3 rounded-2"
                                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--line)" }}
                                >
                                  <div className="row g-3">
                                    <div className="col-12">
                                      <label style={{ color: "var(--sub)", fontSize: 12 }}>Reason</label>
                                      <div style={{ color: "var(--text)", fontSize: 14 }}>{r.reason || "-"}</div>
                                    </div>
                                    <div className="col-12 col-md-6 col-xl-3">
                                      <label style={{ color: "var(--sub)", fontSize: 12 }}>Status</label>
                                      <select
                                        className="form-select form-select-sm"
                                        style={{ color: "var(--text)", backgroundColor: "var(--bg-surface)" }}
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
                                    <div className="col-12 col-md-6 col-xl-3">
                                      <label style={{ color: "var(--sub)", fontSize: 12 }}>Refund Amount</label>
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
                                    </div>
                                    <div className="col-12 col-md-6 col-xl-3">
                                      <label style={{ color: "var(--sub)", fontSize: 12 }}>Refund Reference</label>
                                      <input
                                        className="form-control form-control-sm"
                                        placeholder="Payment ref/txn id"
                                        value={refundReferenceDraft[r.id] || ""}
                                        onChange={(e) =>
                                          setRefundReferenceDraft((prev) => ({ ...prev, [r.id]: e.target.value }))
                                        }
                                      />
                                    </div>
                                    <div className="col-12 col-md-6 col-xl-3">
                                      <label style={{ color: "var(--sub)", fontSize: 12 }}>Instructions Link / URL</label>
                                      <input
                                        className="form-control form-control-sm"
                                        placeholder="https://... (return label/QR)"
                                        value={refundInstructionLinkDraft[r.id] || ""}
                                        onChange={(e) =>
                                          setRefundInstructionLinkDraft((prev) => ({ ...prev, [r.id]: e.target.value }))
                                        }
                                      />
                                    </div>
                                    <div className="col-12">
                                      <label style={{ color: "var(--sub)", fontSize: 12 }}>Admin Note</label>
                                      <input
                                        className="form-control form-control-sm"
                                        placeholder="Optional note for customer"
                                        value={refundAdminNoteDraft[r.id] || ""}
                                        onChange={(e) =>
                                          setRefundAdminNoteDraft((prev) => ({ ...prev, [r.id]: e.target.value }))
                                        }
                                      />
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ) : null,
                        ];
                      })}
                      {refunds.length === 0 && (
                        <tr>
                          <td colSpan={8} className="text-center" style={{ color: "var(--sub)" }}>
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
                  <span style={{ color: "var(--sub)", fontSize: 12 }}>{filteredReviews.length} reviews</span>
                </div>
                <div className="d-flex gap-2 flex-wrap mb-3">
                  <input
                    className="form-control form-control-sm"
                    style={{ maxWidth: 280 }}
                    value={reviewSearch}
                    onChange={(e) => setReviewSearch(e.target.value)}
                    placeholder="Search reviewer, product, comment"
                  />
                  <select
                    className="form-select form-select-sm"
                    style={{ maxWidth: 160 }}
                    value={reviewRatingFilter}
                    onChange={(e) => setReviewRatingFilter(e.target.value)}
                  >
                    <option value="all">All ratings</option>
                    <option value="5">5 stars</option>
                    <option value="4">4 stars</option>
                    <option value="3">3 stars</option>
                    <option value="2">2 stars</option>
                    <option value="1">1 star</option>
                  </select>
                  <select
                    className="form-select form-select-sm"
                    style={{ maxWidth: 170 }}
                    value={reviewDateFilter}
                    onChange={(e) => setReviewDateFilter(e.target.value)}
                  >
                    <option value="all">All time</option>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                  </select>
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
                      {filteredReviews.map((r) => (
                        <tr key={r.id}>
                          <td>{r.id}</td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              {getReviewProduct(r)?.images?.[0] ? (
                                <img
                                  src={getReviewProduct(r).images[0]}
                                  alt={getReviewProduct(r)?.name || `Product ${r.product_id}`}
                                  style={{
                                    width: 36,
                                    height: 36,
                                    objectFit: "cover",
                                    borderRadius: 6,
                                    border: "1px solid var(--line)",
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 6,
                                    border: "1px solid var(--line)",
                                    background: "rgba(255,255,255,0.04)",
                                  }}
                                />
                              )}
                              <a
                                href={`/product/${encodeURIComponent(r.product_id)}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: "#fff", textDecoration: "underline", textUnderlineOffset: 3 }}
                              >
                                #{r.product_id}
                              </a>
                            </div>
                          </td>
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
                            <div className="d-flex gap-2 flex-wrap">
                              <button className="btn btn-sm btn-outline-light" onClick={() => openReviewModal(r)}>
                                View
                              </button>
                              <button className="btn btn-sm btn-outline-danger" onClick={() => deleteReview(r.id)}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredReviews.length === 0 && (
                        <tr><td colSpan={7} className="text-center" style={{ color: "var(--sub)" }}>No reviews yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "feedback" && (
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="osai-admin-tab-header">
                  <h4 className="osai-admin-section-title">Feedback</h4>
                  <span style={{ color: "var(--sub)", fontSize: 12 }}>
                    {filteredFeedback.length} entries
                  </span>
                </div>

                <div className="d-flex gap-2 flex-wrap mb-3">
                  <input
                    className="form-control form-control-sm"
                    style={{ maxWidth: 280 }}
                    value={feedbackSearch}
                    onChange={(e) => setFeedbackSearch(e.target.value)}
                    placeholder="Search name, email, comment"
                  />
                </div>

                <div className="table-responsive">
                  <table className="table table-sm align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Rating</th>
                        <th>Comment</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFeedback.map((f) => (
                        <tr key={f.id}>
                          <td>{f.id}</td>
                          <td>{f.name}</td>
                          <td style={{ color: "var(--sub)" }}>{f.email}</td>
                          <td>
                            <span
                              style={{
                                color: "#fbbf24",
                                fontFamily: "var(--font-display)",
                                fontWeight: 600,
                              }}
                            >
                              {"★".repeat(f.rating)}{"☆".repeat(5 - f.rating)}
                            </span>
                          </td>
                          <td
                            style={{
                              maxWidth: 260,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={f.comments || ""}
                          >
                            {f.comments}
                          </td>
                          <td style={{ color: "var(--sub)", whiteSpace: "nowrap" }}>
                            {f.created_at ? new Date(f.created_at).toLocaleDateString() : "—"}
                          </td>
                          <td>
                            <div className="d-flex gap-2 flex-wrap">
                              <button className="btn btn-sm btn-outline-danger" onClick={() => deleteFeedback(f.id)}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredFeedback.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center" style={{ color: "var(--sub)" }}>
                            No feedback yet.
                          </td>
                        </tr>
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
                  <span style={{ color: "var(--sub)", fontSize: 12 }}>{filteredUsers.length} accounts</span>
                </div>
                <div className="d-flex gap-2 flex-wrap mb-3">
                  <input
                    className="form-control form-control-sm"
                    style={{ maxWidth: 280 }}
                    value={usersSearch}
                    onChange={(e) => setUsersSearch(e.target.value)}
                    placeholder="Search id, name, email"
                  />
                  <select
                    className="form-select form-select-sm"
                    style={{ maxWidth: 180 }}
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                  >
                    <option value="all">All roles</option>
                    <option value="customer">Customers</option>
                    <option value="admin">Admins</option>
                  </select>
                  <select
                    className="form-select form-select-sm"
                    style={{ maxWidth: 180 }}
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value)}
                  >
                    <option value="all">All status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div
                  className="p-3 rounded mb-3"
                  style={{ border: "1px solid var(--line)", background: "rgba(255,255,255,0.02)" }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0" style={{ fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      Admin Access Requests
                    </h6>
                    <span style={{ color: "var(--sub)", fontSize: 12 }}>
                      {adminRoleRequests.filter((r) => r.status === "pending").length} pending
                    </span>
                  </div>
                  {adminRoleRequests.length === 0 ? (
                    <div style={{ color: "var(--sub)", fontSize: 13 }}>No admin access requests yet.</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>ID</th>
                            <th>User</th>
                            <th>Email</th>
                            <th>Reason</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminRoleRequests.slice(0, 12).map((reqRow) => (
                            <tr key={`role-req-${reqRow.id}`}>
                              <td>#{reqRow.id}</td>
                              <td>{reqRow.name || "-"}</td>
                              <td style={{ color: "var(--sub)" }}>{reqRow.email || "-"}</td>
                              <td style={{ maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {reqRow.reason || "-"}
                              </td>
                              <td>
                                <span className={`osai-status osai-status-${reqRow.status || "pending"}`}>
                                  {reqRow.status || "pending"}
                                </span>
                              </td>
                              <td style={{ color: "var(--sub)", whiteSpace: "nowrap" }}>
                                {reqRow.created_at ? new Date(reqRow.created_at).toLocaleDateString() : "-"}
                              </td>
                              <td>
                                {reqRow.status === "pending" ? (
                                  <div className="d-flex gap-2">
                                    <button
                                      className="btn btn-sm btn-outline-success"
                                      onClick={() => reviewAdminRoleRequest(reqRow.id, "approved")}
                                      disabled={reviewingRoleRequestId === reqRow.id}
                                    >
                                      {reviewingRoleRequestId === reqRow.id ? "Saving..." : "Approve"}
                                    </button>
                                    <button
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={() => reviewAdminRoleRequest(reqRow.id, "rejected")}
                                      disabled={reviewingRoleRequestId === reqRow.id}
                                    >
                                      Reject
                                    </button>
                                  </div>
                                ) : (
                                  <span style={{ color: "var(--sub)", fontSize: 12 }}>
                                    {reqRow.reviewed_at ? `Reviewed ${new Date(reqRow.reviewed_at).toLocaleDateString()}` : "Reviewed"}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div
                  className="d-flex gap-2 flex-wrap align-items-center p-2 rounded mb-3"
                  style={{ border: "1px solid var(--line)", background: "rgba(255,255,255,0.02)" }}
                >
                  <span style={{ color: "var(--sub)", fontSize: 12 }}>{selectedUserIds.length} selected</span>
                  <select
                    className="form-select form-select-sm"
                    style={{ maxWidth: 180 }}
                    value={bulkUserAction}
                    onChange={(e) => setBulkUserAction(e.target.value)}
                  >
                    <option value="suspend">Suspend</option>
                    <option value="unsuspend">Unsuspend</option>
                    <option value="delete">Delete</option>
                  </select>
                  <input
                    className="form-control form-control-sm"
                    style={{ maxWidth: 280 }}
                    value={bulkUserReason}
                    onChange={(e) => setBulkUserReason(e.target.value)}
                    placeholder="Bulk reason (optional)"
                  />
                  <button
                    className="btn btn-sm btn-outline-light"
                    onClick={runBulkUserAction}
                    disabled={runningBulkUsersAction || selectedUserIds.length === 0}
                  >
                    {runningBulkUsersAction ? "Running..." : "Run Bulk Action"}
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="table table-sm align-middle">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: 42 }}>
                          <input
                            type="checkbox"
                            checked={allPagedUsersSelected}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setSelectedUsers((prev) => {
                                const next = { ...prev };
                                for (const row of pagedUsers) next[row.id] = checked;
                                return next;
                              });
                            }}
                          />
                        </th>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedUsers.map((u) => (
                        <tr key={u.id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={!!selectedUsers[u.id]}
                              onChange={() => toggleUserSelection(u.id)}
                              disabled={Number(u.id) === Number(user?.id)}
                            />
                          </td>
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
                          <td>
                            {Number(u.is_suspended) === 1 ? (
                              <span className="badge text-bg-danger">Suspended</span>
                            ) : (
                              <span className="badge text-bg-success">Active</span>
                            )}
                          </td>
                          <td style={{ color: "var(--sub)", whiteSpace: "nowrap" }}>
                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : "-"}
                          </td>
                          <td>
                            <div className="d-flex gap-2 align-items-center">
                              <button
                                className="btn btn-sm btn-outline-light"
                                onClick={() => openUserSummary(u)}
                              >
                                View
                              </button>
                              <div style={{ position: "relative" }} onMouseDown={(e) => e.stopPropagation()}>
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() =>
                                    setActionMenuUserId((prev) => (prev === u.id ? null : u.id))
                                  }
                                  onMouseDown={(e) => e.stopPropagation()}
                                >
                                  Actions
                                </button>
                                {actionMenuUserId === u.id && (
                                  <div
                                    className="p-2 rounded-2"
                                    style={{
                                      position: "absolute",
                                      top: "calc(100% + 6px)",
                                      right: 0,
                                      zIndex: 20,
                                      minWidth: 180,
                                      background: "var(--bg-surface)",
                                      border: "1px solid var(--line)",
                                      boxShadow: "0 10px 25px rgba(0,0,0,0.35)",
                                    }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      className="btn btn-sm btn-outline-light w-100 mb-2"
                                      onClick={() => {
                                        openUserEditor(u);
                                        setActionMenuUserId(null);
                                      }}
                                    >
                                      Edit Details
                                    </button>
                                    <button
                                      className="btn btn-sm btn-outline-info w-100 mb-2"
                                      onClick={() => {
                                        updateUserRole(u, Number(u.is_admin) !== 1);
                                        setActionMenuUserId(null);
                                      }}
                                      disabled={savingUserRoleId === u.id}
                                    >
                                      {savingUserRoleId === u.id
                                        ? "Saving..."
                                        : Number(u.is_admin) === 1
                                          ? "Remove Admin"
                                          : "Make Admin"}
                                    </button>
                                    <button
                                      className="btn btn-sm btn-outline-warning w-100 mb-2"
                                      onClick={() => {
                                        updateUserSuspension(u, Number(u.is_suspended) !== 1);
                                        setActionMenuUserId(null);
                                      }}
                                      disabled={Number(u.id) === Number(user?.id) || savingUserId === u.id}
                                    >
                                      {savingUserId === u.id
                                        ? "Saving..."
                                        : Number(u.is_suspended) === 1
                                          ? "Unsuspend"
                                          : "Suspend"}
                                    </button>
                                    <button
                                      className="btn btn-sm btn-outline-danger w-100"
                                      onClick={() => {
                                        deleteUser(u.id);
                                        setActionMenuUserId(null);
                                      }}
                                      disabled={Number(u.id) === Number(user?.id)}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {pagedUsers.length === 0 && (
                        <tr><td colSpan={8} className="text-center" style={{ color: "var(--sub)" }}>No users found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {filteredUsers.length > 0 && (
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <span style={{ color: "var(--sub)", fontSize: 12 }}>
                      Page {safeUsersPage} of {usersTotalPages}
                    </span>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        disabled={safeUsersPage <= 1}
                        onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
                      >
                        Prev
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        disabled={safeUsersPage >= usersTotalPages}
                        onClick={() => setUsersPage((p) => Math.min(usersTotalPages, p + 1))}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <div className="osai-admin-tab-header" style={{ marginBottom: 10 }}>
                    <h5 className="osai-admin-section-title" style={{ fontSize: 16 }}>Admin Audit Log</h5>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-sm align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>When</th>
                          <th>Admin</th>
                          <th>Action</th>
                          <th>Target</th>
                          <th>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userAuditLog.map((a) => (
                          <tr key={a.id}>
                            <td style={{ color: "var(--sub)", whiteSpace: "nowrap" }}>
                              {a.created_at ? new Date(a.created_at).toLocaleString() : "-"}
                            </td>
                            <td>{a.admin_name || "Admin"}</td>
                            <td>{a.action}</td>
                            <td>{a.target_type}{a.target_id ? ` #${a.target_id}` : ""}</td>
                            <td style={{ maxWidth: 360, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {a.details || "-"}
                            </td>
                          </tr>
                        ))}
                        {userAuditLog.length === 0 && (
                          <tr><td colSpan={5} className="text-center" style={{ color: "var(--sub)" }}>No admin actions yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {selectedOrderDetails && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.7)", zIndex: 1999 }}
          onClick={closeOrderDetails}
        >
          <div
            className="card border-0 shadow-sm"
            style={{ width: "min(900px, 96vw)", background: "var(--bg-surface)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 osai-admin-section-title">
                  Order #{selectedOrderDetails.order?.id}
                </h5>
                <button className="btn btn-sm btn-outline-secondary" onClick={closeOrderDetails}>
                  Close
                </button>
              </div>
              {loadingOrderDetails ? (
                <div style={{ color: "var(--sub)" }}>Loading...</div>
              ) : (
                <>
                  <div className="mb-3" style={{ color: "var(--sub)", fontSize: 13 }}>
                    <div><strong style={{ color: "var(--text)" }}>Customer:</strong> {selectedOrderDetails.order?.name || "-"}</div>
                    <div><strong style={{ color: "var(--text)" }}>Email:</strong> {selectedOrderDetails.order?.email || "-"}</div>
                    <div><strong style={{ color: "var(--text)" }}>Status:</strong> {selectedOrderDetails.order?.status || "-"}</div>
                    <div><strong style={{ color: "var(--text)" }}>Total:</strong> GBP {Number(selectedOrderDetails.order?.total_price || 0).toFixed(2)}</div>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-sm align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Product</th>
                          <th>SKU</th>
                          <th>Qty</th>
                          <th>Price Each</th>
                          <th>Line Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedOrderDetails.items || []).map((it) => (
                          <tr key={it.id}>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                {it.product_image ? (
                                  <img
                                    src={it.product_image}
                                    alt={it.product_name || `Product ${it.product_id}`}
                                    style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 6, border: "1px solid var(--line)" }}
                                  />
                                ) : null}
                                <span>{it.product_name || `#${it.product_id}`}</span>
                              </div>
                            </td>
                            <td>{it.sku || "-"}</td>
                            <td>{it.quantity}</td>
                            <td>GBP {Number(it.price_each || 0).toFixed(2)}</td>
                            <td>GBP {(Number(it.price_each || 0) * Number(it.quantity || 0)).toFixed(2)}</td>
                          </tr>
                        ))}
                        {(!selectedOrderDetails.items || selectedOrderDetails.items.length === 0) && (
                          <tr><td colSpan={5} className="text-center" style={{ color: "var(--sub)" }}>No order items found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {userSummary && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.7)", zIndex: 1999 }}
          onClick={closeUserSummary}
        >
          <div
            className="card border-0 shadow-sm"
            style={{ width: "min(760px, 94vw)", background: "var(--bg-surface)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 osai-admin-section-title">User Summary #{userSummary.user?.id}</h5>
                <button className="btn btn-sm btn-outline-secondary" onClick={closeUserSummary}>
                  Close
                </button>
              </div>
              {loadingUserSummary ? (
                <div style={{ color: "var(--sub)" }}>Loading...</div>
              ) : (
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <div style={{ color: "var(--sub)", fontSize: 12 }}>Name</div>
                    <div>{userSummary.user?.name || "-"}</div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div style={{ color: "var(--sub)", fontSize: 12 }}>Email</div>
                    <div>{userSummary.user?.email || "-"}</div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div style={{ color: "var(--sub)", fontSize: 12 }}>Orders</div>
                    <div>{Number(userSummary.orders?.total_orders || 0)}</div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div style={{ color: "var(--sub)", fontSize: 12 }}>Total Spend</div>
                    <div>GBP {Number(userSummary.orders?.total_spend || 0).toFixed(2)}</div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div style={{ color: "var(--sub)", fontSize: 12 }}>Refund Requests</div>
                    <div>{Number(userSummary.refunds?.total_refunds || 0)}</div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div style={{ color: "var(--sub)", fontSize: 12 }}>Pending Refunds</div>
                    <div>{Number(userSummary.refunds?.pending_refunds || 0)}</div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div style={{ color: "var(--sub)", fontSize: 12 }}>Contact Messages</div>
                    <div>{Number(userSummary.messages?.total_messages || 0)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {editingUser && editUserDraft && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.7)", zIndex: 1999 }}
          onClick={closeUserEditor}
        >
          <div
            className="card border-0 shadow-sm"
            style={{ width: "min(760px, 94vw)", background: "var(--bg-surface)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 osai-admin-section-title">Edit User #{editingUser.id}</h5>
                <button className="btn btn-sm btn-outline-secondary" onClick={closeUserEditor}>
                  Close
                </button>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label" style={{ color: "var(--sub)", fontSize: 12 }}>Name</label>
                  <input
                    className="form-control"
                    value={editUserDraft.name}
                    onChange={(e) => setEditUserDraft((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label" style={{ color: "var(--sub)", fontSize: 12 }}>Email</label>
                  <input
                    className="form-control"
                    type="email"
                    value={editUserDraft.email}
                    onChange={(e) => setEditUserDraft((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label" style={{ color: "var(--sub)", fontSize: 12 }}>Phone</label>
                  <input
                    className="form-control"
                    value={editUserDraft.phone}
                    onChange={(e) => setEditUserDraft((p) => ({ ...p, phone: e.target.value }))}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label" style={{ color: "var(--sub)", fontSize: 12 }}>Postcode</label>
                  <input
                    className="form-control"
                    value={editUserDraft.postcode}
                    onChange={(e) => setEditUserDraft((p) => ({ ...p, postcode: e.target.value }))}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label" style={{ color: "var(--sub)", fontSize: 12 }}>Address Line 1</label>
                  <input
                    className="form-control"
                    value={editUserDraft.address_line1}
                    onChange={(e) => setEditUserDraft((p) => ({ ...p, address_line1: e.target.value }))}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label" style={{ color: "var(--sub)", fontSize: 12 }}>Address Line 2</label>
                  <input
                    className="form-control"
                    value={editUserDraft.address_line2}
                    onChange={(e) => setEditUserDraft((p) => ({ ...p, address_line2: e.target.value }))}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label" style={{ color: "var(--sub)", fontSize: 12 }}>City</label>
                  <input
                    className="form-control"
                    value={editUserDraft.city}
                    onChange={(e) => setEditUserDraft((p) => ({ ...p, city: e.target.value }))}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button className="btn btn-sm btn-outline-secondary" onClick={closeUserEditor}>
                  Cancel
                </button>
                <button
                  className="btn btn-sm btn-light"
                  onClick={saveUserEditor}
                  disabled={savingUserProfileId === editingUser.id}
                >
                  {savingUserProfileId === editingUser.id ? "Saving..." : "Save"}
                </button>
              </div>
                </div>
              </div>

              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="osai-admin-tab-header">
                    <h4 className="osai-admin-section-title">Stock Movement (Last 7 Days)</h4>
                    <span style={{ color: "var(--sub)", fontSize: 12 }}>
                      +{Number(reports?.totalIncomingUnits7d || 0)} incoming / -{Number(reports?.totalOutgoingUnits7d || 0)} outgoing
                    </span>
                  </div>
                  {stockFlow7d.length === 0 ? (
                    <p className="mb-0" style={{ color: "var(--sub)", fontSize: 13 }}>
                      No stock movements recorded yet.
                    </p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>SKU</th>
                            <th>Product</th>
                            <th>Incoming</th>
                            <th>Outgoing</th>
                            <th>Net</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stockFlow7d.map((row) => (
                            <tr key={`flow-${row.product_id}`}>
                              <td>{row.sku || "-"}</td>
                              <td>{row.name || `#${row.product_id}`}</td>
                              <td style={{ color: "#34d399", fontWeight: 700 }}>+{Number(row.incoming_units || 0)}</td>
                              <td style={{ color: "#f87171", fontWeight: 700 }}>-{Number(row.outgoing_units || 0)}</td>
                              <td style={{ fontWeight: 700 }}>{Number(row.net_units || 0)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

      {selectedReview && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.7)", zIndex: 1999 }}
          onClick={closeReviewModal}
        >
          <div
            className="card border-0 shadow-sm"
            style={{ width: "min(760px, 94vw)", background: "var(--bg-surface)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 osai-admin-section-title">Review #{selectedReview.id}</h5>
                <button className="btn btn-sm btn-outline-secondary" onClick={closeReviewModal}>
                  Close
                </button>
              </div>
              <div className="mb-3" style={{ color: "var(--sub)", fontSize: 13 }}>
                <div><strong style={{ color: "var(--text)" }}>Product:</strong> #{selectedReview.product_id}</div>
                <div><strong style={{ color: "var(--text)" }}>Reviewer:</strong> {selectedReview.reviewer_name || "-"}</div>
                <div>
                  <strong style={{ color: "var(--text)" }}>Rating:</strong>{" "}
                  <span style={{ color: "#fbbf24" }}>
                    {"★".repeat(Number(selectedReview.rating || 0))}
                    {"☆".repeat(Math.max(0, 5 - Number(selectedReview.rating || 0)))}
                  </span>
                </div>
                <div>
                  <strong style={{ color: "var(--text)" }}>Date:</strong>{" "}
                  {selectedReview.created_at ? new Date(selectedReview.created_at).toLocaleString() : "-"}
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
                {selectedReview.comment || "(No comment content)"}
              </div>
            </div>
          </div>
        </div>
      )}

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
