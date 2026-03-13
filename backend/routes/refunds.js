const express = require("express");
const db = require("../config/db");

const router = express.Router();

const ALLOWED_STATUSES = new Set([
  "pending",
  "approved",
  "processing",
  "rejected",
  "refunded",
]);

let ensureTablePromise = null;

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  return res.status(401).json({ message: "Please log in first" });
}

async function ensureRefundsTable() {
  if (ensureTablePromise) return ensureTablePromise;

  ensureTablePromise = (async () => {
    await db.query(
      `CREATE TABLE IF NOT EXISTS refund_requests (
        id INT NOT NULL AUTO_INCREMENT,
        user_id INT NOT NULL,
        order_id INT NOT NULL,
        order_item_id INT NULL,
        reason VARCHAR(255) NOT NULL,
        details TEXT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        admin_note TEXT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_refund_user_id (user_id),
        KEY idx_refund_order_id (order_id),
        KEY idx_refund_status (status),
        KEY idx_refund_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci`
    );
  })();

  return ensureTablePromise;
}

async function resolveOrderItemId(orderId, productId) {
  if (!productId) return null;
  const [rows] = await db.query(
    `SELECT id
     FROM order_items
     WHERE order_id = ? AND product_id = ?
     ORDER BY id DESC
     LIMIT 1`,
    [orderId, productId]
  );
  return rows.length ? rows[0].id : null;
}

router.get("/my", requireAuth, async (req, res) => {
  const userId = req.session.userId;
  try {
    await ensureRefundsTable();
    const [rows] = await db.query(
      `SELECT
        rr.id,
        rr.order_id,
        rr.order_item_id,
        rr.reason,
        rr.details,
        rr.status,
        rr.admin_note,
        rr.created_at,
        rr.updated_at
      FROM refund_requests rr
      WHERE rr.user_id = ?
      ORDER BY rr.created_at DESC`,
      [userId]
    );
    return res.json(rows);
  } catch (err) {
    console.error("Get my refunds error:", err);
    return res.status(500).json({ message: "Failed to load refunds" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const { orderId, productId, reason, details } = req.body || {};

  if (!orderId || !reason || !String(reason).trim()) {
    return res.status(400).json({ message: "orderId and reason are required" });
  }

  try {
    await ensureRefundsTable();

    const [orders] = await db.query(
      "SELECT id FROM orders WHERE id = ? AND user_id = ? LIMIT 1",
      [orderId, userId]
    );
    if (!orders.length) {
      return res.status(404).json({ message: "Order not found for this user" });
    }

    let orderItemId = null;
    if (productId != null && productId !== "") {
      orderItemId = await resolveOrderItemId(orderId, productId);
      if (!orderItemId) {
        return res.status(400).json({ message: "Product not found in this order" });
      }
    }

    const duplicateParams = [userId, orderId];
    let duplicateWhere = "user_id = ? AND order_id = ?";
    if (orderItemId) {
      duplicateWhere += " AND order_item_id = ?";
      duplicateParams.push(orderItemId);
    } else {
      duplicateWhere += " AND order_item_id IS NULL";
    }
    duplicateWhere += " AND status IN ('pending', 'approved', 'processing')";

    const [dupes] = await db.query(
      `SELECT id FROM refund_requests
       WHERE ${duplicateWhere}
       LIMIT 1`,
      duplicateParams
    );
    if (dupes.length) {
      return res.status(409).json({ message: "A refund request is already open for this selection" });
    }

    const [result] = await db.query(
      `INSERT INTO refund_requests
       (user_id, order_id, order_item_id, reason, details, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [
        userId,
        orderId,
        orderItemId,
        String(reason).trim().slice(0, 255),
        details ? String(details).trim().slice(0, 4000) : null,
      ]
    );

    return res.status(201).json({
      message: "Refund request submitted",
      refundId: result.insertId,
    });
  } catch (err) {
    console.error("Create refund error:", err);
    return res.status(500).json({ message: "Failed to submit refund request" });
  }
});

module.exports = { router, ensureRefundsTable, ALLOWED_STATUSES };
