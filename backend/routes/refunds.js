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
const REFUND_TRANSITIONS = {
  pending: new Set(["approved", "rejected"]),
  approved: new Set(["processing", "rejected"]),
  processing: new Set(["refunded", "rejected"]),
  rejected: new Set([]),
  refunded: new Set([]),
};

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
        instruction_link VARCHAR(1000) NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_refund_user_id (user_id),
        KEY idx_refund_order_id (order_id),
        KEY idx_refund_status (status),
        KEY idx_refund_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci`
    );

    try {
      await db.query(
        "ALTER TABLE refund_requests ADD COLUMN instruction_link VARCHAR(1000) NULL AFTER admin_note"
      );
    } catch (err) {
      if (err?.code !== "ER_DUP_FIELDNAME") throw err;
    }

    try {
      await db.query(
        "ALTER TABLE refund_requests ADD COLUMN refund_amount DECIMAL(10,2) NULL AFTER instruction_link"
      );
    } catch (err) {
      if (err?.code !== "ER_DUP_FIELDNAME") throw err;
    }

    try {
      await db.query(
        "ALTER TABLE refund_requests ADD COLUMN refund_reference VARCHAR(120) NULL AFTER refund_amount"
      );
    } catch (err) {
      if (err?.code !== "ER_DUP_FIELDNAME") throw err;
    }

    try {
      await db.query(
        "ALTER TABLE refund_requests ADD COLUMN resolved_at DATETIME NULL AFTER updated_at"
      );
    } catch (err) {
      if (err?.code !== "ER_DUP_FIELDNAME") throw err;
    }

    await db.query(
      `CREATE TABLE IF NOT EXISTS refund_events (
        id INT NOT NULL AUTO_INCREMENT,
        refund_request_id INT NOT NULL,
        actor_role VARCHAR(20) NOT NULL,
        actor_id INT NULL,
        event_type VARCHAR(40) NOT NULL,
        from_status VARCHAR(20) NULL,
        to_status VARCHAR(20) NULL,
        note VARCHAR(500) NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_refund_events_request (refund_request_id),
        KEY idx_refund_events_created_at (created_at),
        CONSTRAINT fk_refund_events_request
          FOREIGN KEY (refund_request_id) REFERENCES refund_requests(id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci`
    );
  })();

  return ensureTablePromise;
}

async function getRefundColumns() {
  try {
    const [rows] = await db.query("SHOW COLUMNS FROM refund_requests");
    return new Set(rows.map((r) => r.Field));
  } catch (err) {
    if (err?.code === "ER_NO_SUCH_TABLE") return null;
    throw err;
  }
}

function canTransitionRefundStatus(currentStatus, nextStatus) {
  if (!currentStatus || currentStatus === nextStatus) return true;
  const allowedNext = REFUND_TRANSITIONS[currentStatus];
  if (!allowedNext) return false;
  return allowedNext.has(nextStatus);
}

async function appendRefundEvent({
  refundRequestId,
  actorRole,
  actorId = null,
  eventType,
  fromStatus = null,
  toStatus = null,
  note = null,
}) {
  await db.query(
    `INSERT INTO refund_events
      (refund_request_id, actor_role, actor_id, event_type, from_status, to_status, note)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      refundRequestId,
      String(actorRole || "").slice(0, 20),
      actorId == null ? null : Number(actorId),
      String(eventType || "").slice(0, 40),
      fromStatus ? String(fromStatus).slice(0, 20) : null,
      toStatus ? String(toStatus).slice(0, 20) : null,
      note ? String(note).slice(0, 500) : null,
    ]
  );
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
    const cols = await getRefundColumns();
    if (!cols) return res.json([]);
    const instructionExpr = cols.has("instruction_link")
      ? "rr.instruction_link"
      : "NULL AS instruction_link";
    const amountExpr = cols.has("refund_amount")
      ? "rr.refund_amount"
      : "NULL AS refund_amount";
    const referenceExpr = cols.has("refund_reference")
      ? "rr.refund_reference"
      : "NULL AS refund_reference";
    const resolvedAtExpr = cols.has("resolved_at")
      ? "rr.resolved_at"
      : "NULL AS resolved_at";
    const [rows] = await db.query(
      `SELECT
        rr.id,
        rr.order_id,
        rr.order_item_id,
        rr.reason,
        rr.details,
        rr.status,
        rr.admin_note,
        ${instructionExpr},
        ${amountExpr},
        ${referenceExpr},
        rr.created_at,
        rr.updated_at,
        ${resolvedAtExpr}
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

    await appendRefundEvent({
      refundRequestId: result.insertId,
      actorRole: "customer",
      actorId: userId,
      eventType: "created",
      toStatus: "pending",
      note: reason,
    });

    return res.status(201).json({
      message: "Refund request submitted",
      refundId: result.insertId,
    });
  } catch (err) {
    console.error("Create refund error:", err);
    if (err?.code === "ER_NO_SUCH_TABLE" || err?.code === "ER_TABLEACCESS_DENIED_ERROR") {
      return res.status(503).json({ message: "Refund system is not initialized on server yet" });
    }
    return res.status(500).json({ message: "Failed to submit refund request" });
  }
});

module.exports = {
  router,
  ensureRefundsTable,
  ALLOWED_STATUSES,
  getRefundColumns,
  canTransitionRefundStatus,
  appendRefundEvent,
};
