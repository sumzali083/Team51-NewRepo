// backend/routes/admin.js
const express = require("express");
const db = require("../config/db");
const adminMiddleware = require("../middleware/adminMiddleware");
const { ensureRefundsTable, ALLOWED_STATUSES } = require("./refunds");

const router = express.Router();

/* ======================================================
   USER MANAGEMENT
====================================================== */

// GET all users
router.get("/users", adminMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, is_admin, created_at FROM users ORDER BY id DESC"
    );

    res.json(rows);
  } catch (err) {
    console.error("Admin get users error:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// DELETE user
router.delete("/users/:id", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM users WHERE id = ?",
      [id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("Admin delete user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================================================
   ORDER MANAGEMENT
====================================================== */

// GET all orders
router.get("/orders", adminMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT o.*, u.name, u.email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error("Admin get orders error:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// UPDATE order status
router.put("/orders/:id/status", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const [result] = await db.query(
      "UPDATE orders SET status = ? WHERE id = ?",
      [status, id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order status updated" });
  } catch (err) {
    console.error("Admin update order error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================================================
   INVENTORY
====================================================== */

// GET low stock products
router.get("/low-stock", adminMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM products WHERE stock <= 5 ORDER BY stock ASC"
    );

    res.json(rows);
  } catch (err) {
    console.error("Admin low stock error:", err);
    res.status(500).json({ message: "Failed to fetch low stock items" });
  }
});

/* ======================================================
   REPORTS (Required Only)
====================================================== */

router.get("/reports", adminMiddleware, async (req, res) => {
  try {
    const [[productCount]] = await db.query(
      "SELECT COUNT(*) AS totalProducts FROM products"
    );

    const [[orderCount]] = await db.query(
      "SELECT COUNT(*) AS totalOrders FROM orders"
    );

    const [[revenue]] = await db.query(
      "SELECT SUM(total_price) AS totalRevenue FROM orders"
    );

    const [[lowStock]] = await db.query(
      "SELECT COUNT(*) AS lowStockCount FROM products WHERE stock <= 5"
    );
    let refundCount = { totalRefundRequests: 0 };
    let pendingRefundCount = { pendingRefundRequests: 0 };
    try {
      await ensureRefundsTable();
      [[refundCount]] = await db.query(
        "SELECT COUNT(*) AS totalRefundRequests FROM refund_requests"
      );
      [[pendingRefundCount]] = await db.query(
        "SELECT COUNT(*) AS pendingRefundRequests FROM refund_requests WHERE status = 'pending'"
      );
    } catch (refundErr) {
      console.error("Admin refund report segment error:", refundErr);
    }

    res.json({
      totalProducts: productCount.totalProducts,
      totalOrders: orderCount.totalOrders,
      totalRevenue: revenue.totalRevenue || 0,
      lowStockCount: lowStock.lowStockCount,
      totalRefundRequests: refundCount.totalRefundRequests,
      pendingRefundRequests: pendingRefundCount.pendingRefundRequests
    });

  } catch (err) {
    console.error("Admin reports error:", err);
    res.status(500).json({ message: "Failed to generate reports" });
  }
});

/* ======================================================
   REFUND REQUESTS
====================================================== */

router.get("/refunds", adminMiddleware, async (req, res) => {
  try {
    await ensureRefundsTable();
    const [rows] = await db.query(
      `SELECT
        rr.id,
        rr.user_id,
        rr.order_id,
        rr.order_item_id,
        rr.reason,
        rr.details,
        rr.status,
        rr.admin_note,
        rr.created_at,
        rr.updated_at,
        u.name AS user_name,
        u.email AS user_email
      FROM refund_requests rr
      JOIN users u ON rr.user_id = u.id
      ORDER BY rr.created_at DESC`
    );

    res.json(rows);
  } catch (err) {
    console.error("Admin get refunds error:", err);
    res.status(500).json({ message: "Failed to fetch refund requests" });
  }
});

router.put("/refunds/:id/status", adminMiddleware, async (req, res) => {
  try {
    await ensureRefundsTable();
    const { id } = req.params;
    const { status, adminNote } = req.body || {};

    if (!ALLOWED_STATUSES.has(status)) {
      return res.status(400).json({ message: "Invalid refund status" });
    }

    const [result] = await db.query(
      `UPDATE refund_requests
       SET status = ?, admin_note = ?
       WHERE id = ?`,
      [status, adminNote ? String(adminNote).slice(0, 4000) : null, id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Refund request not found" });
    }

    res.json({ message: "Refund request updated" });
  } catch (err) {
    console.error("Admin update refund error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================================================
   CONTACT MESSAGES
====================================================== */

// GET all messages
router.get("/messages", adminMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, email, message, created_at
       FROM contact_messages
       ORDER BY created_at DESC`
    );

    res.json(rows);
  } catch (err) {
    console.error("Admin get messages error:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

// DELETE message
router.delete("/messages/:id", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM contact_messages WHERE id = ?",
      [id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.json({ message: "Message deleted" });
  } catch (err) {
    console.error("Admin delete message error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
