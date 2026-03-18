// backend/routes/admin.js
const express = require("express");
const db = require("../config/db");
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  ensureRefundsTable,
  ALLOWED_STATUSES,
  getRefundColumns,
  canTransitionRefundStatus,
  appendRefundEvent,
} = require("./refunds");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const { ensureStockMovementsTable, recordStockMovement } = require("../services/stockMovements");

const router = express.Router();

const uploadsPath = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });

// Memory storage so we can process with sharp before writing to disk
const uploadMemory = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

function csvCell(value) {
  if (value == null) return "";
  let str = String(value);
  // Prevent CSV formula injection in spreadsheet tools.
  if (/^\s*[=+\-@]/.test(str)) {
    str = `'${str}`;
  }
  if (!/[",\n\r]/.test(str)) return str;
  return `"${str.replace(/"/g, '""')}"`;
}

function asCsv(rows, headers) {
  const head = headers.map((h) => csvCell(h.label)).join(",");
  const body = rows.map((row) => headers.map((h) => csvCell(row[h.key])).join(",")).join("\n");
  return `${head}\n${body}`;
}

async function tableExists(tableName) {
  const [rows] = await db.query("SHOW TABLES LIKE ?", [tableName]);
  return rows.length > 0;
}

async function ensureProductSizeStockColumn() {
  if (!(await tableExists("product_sizes"))) return;
  const hasStock = await columnExists("product_sizes", "stock");
  if (!hasStock) {
    await db.query("ALTER TABLE product_sizes ADD COLUMN stock INT NOT NULL DEFAULT 0");
    _colCache["product_sizes.stock"] = true;
    await db.query(
      `UPDATE product_sizes ps
       JOIN products p ON p.id = ps.product_id
       SET ps.stock = COALESCE(p.stock, 0)
       WHERE ps.stock IS NULL OR ps.stock = 0`
    );
  }
}

// Cache column existence checks so we only query INFORMATION_SCHEMA once per process
const _colCache = {};
async function columnExists(table, column) {
  const key = `${table}.${column}`;
  if (_colCache[key] !== undefined) return _colCache[key];
  const [rows] = await db.query(
    `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1`,
    [table, column]
  );
  _colCache[key] = rows.length > 0;
  return _colCache[key];
}

async function ensureContactMessageStatusColumn() {
  const hasStatus = await columnExists("contact_messages", "status");
  if (hasStatus) return;

  await db.query(
    `ALTER TABLE contact_messages
     ADD COLUMN status ENUM('unread', 'read', 'archived') NOT NULL DEFAULT 'unread'`
  );
  _colCache["contact_messages.status"] = true;
}

async function ensureAdminAuditTable() {
  await db.query(
    `CREATE TABLE IF NOT EXISTS admin_audit_log (
      id INT NOT NULL AUTO_INCREMENT,
      admin_id INT NOT NULL,
      action VARCHAR(60) NOT NULL,
      target_type VARCHAR(40) NOT NULL,
      target_id INT NULL,
      details TEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_admin_audit_created (created_at),
      KEY idx_admin_audit_admin (admin_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci`
  );
}

async function appendAdminAuditLog({
  adminId,
  action,
  targetType,
  targetId = null,
  details = null,
}) {
  await ensureAdminAuditTable();
  await db.query(
    `INSERT INTO admin_audit_log
      (admin_id, action, target_type, target_id, details)
     VALUES (?, ?, ?, ?, ?)`,
    [
      Number(adminId),
      String(action || "").slice(0, 60),
      String(targetType || "").slice(0, 40),
      targetId == null ? null : Number(targetId),
      details ? String(details).slice(0, 4000) : null,
    ]
  );
}

async function ensureUserManagementColumns() {
  const hasSuspended = await columnExists("users", "is_suspended");
  if (!hasSuspended) {
    await db.query("ALTER TABLE users ADD COLUMN is_suspended TINYINT(1) NOT NULL DEFAULT 0");
    _colCache["users.is_suspended"] = true;
  }
  const hasSuspendedAt = await columnExists("users", "suspended_at");
  if (!hasSuspendedAt) {
    await db.query("ALTER TABLE users ADD COLUMN suspended_at DATETIME NULL");
    _colCache["users.suspended_at"] = true;
  }
  const hasSuspensionReason = await columnExists("users", "suspension_reason");
  if (!hasSuspensionReason) {
    await db.query("ALTER TABLE users ADD COLUMN suspension_reason VARCHAR(255) NULL");
    _colCache["users.suspension_reason"] = true;
  }
}

async function ensureUserProfileColumns() {
  const columnsToAdd = [
    ["phone", "VARCHAR(30) NULL"],
    ["address_line1", "VARCHAR(255) NULL"],
    ["address_line2", "VARCHAR(255) NULL"],
    ["city", "VARCHAR(120) NULL"],
    ["postcode", "VARCHAR(32) NULL"],
  ];

  for (const [col, def] of columnsToAdd) {
    const hasCol = await columnExists("users", col);
    if (!hasCol) {
      await db.query(`ALTER TABLE users ADD COLUMN ${col} ${def}`);
      _colCache[`users.${col}`] = true;
    }
  }
}

async function ensureAuthColumnsAndRoleRequests() {
  const hasMustChangePassword = await columnExists("users", "must_change_password");
  if (!hasMustChangePassword) {
    await db.query("ALTER TABLE users ADD COLUMN must_change_password TINYINT(1) NOT NULL DEFAULT 0");
    _colCache["users.must_change_password"] = true;
  }

  await db.query(
    `CREATE TABLE IF NOT EXISTS admin_role_requests (
      id INT NOT NULL AUTO_INCREMENT,
      user_id INT NOT NULL,
      reason VARCHAR(500) NULL,
      status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
      reviewed_by INT NULL,
      reviewed_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_admin_role_requests_user (user_id),
      KEY idx_admin_role_requests_status (status),
      KEY idx_admin_role_requests_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci`
  );
}

/* ======================================================
   USER MANAGEMENT
====================================================== */

// GET all users
router.get("/users", adminMiddleware, async (req, res) => {
  try {
    await ensureUserManagementColumns();
    await ensureUserProfileColumns();
    const [rows] = await db.query(
      `SELECT
        u.id, u.name, u.email, u.phone, u.address_line1, u.address_line2, u.city, u.postcode,
        u.is_admin, u.created_at, u.is_suspended, u.suspended_at, u.suspension_reason,
        (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS order_count,
        (SELECT COUNT(*) FROM refund_requests rr WHERE rr.user_id = u.id) AS refund_count,
        (SELECT MAX(o.created_at) FROM orders o WHERE o.user_id = u.id) AS last_order_at
      FROM users u
      ORDER BY u.id DESC`
    );

    res.json(rows);
  } catch (err) {
    console.error("Admin get users error:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

router.get("/users/export.csv", adminMiddleware, async (req, res) => {
  try {
    await ensureUserManagementColumns();
    await ensureUserProfileColumns();
    let refundCountSelect = "0 AS refund_count";
    try {
      await ensureRefundsTable();
      refundCountSelect = "(SELECT COUNT(*) FROM refund_requests rr WHERE rr.user_id = u.id) AS refund_count";
    } catch (_err) {
      // Keep users export available even if refund tables are not ready.
      refundCountSelect = "0 AS refund_count";
    }

    const q = String(req.query.q || "").trim();
    const role = String(req.query.role || "all").toLowerCase();
    const status = String(req.query.status || "all").toLowerCase();

    const where = [];
    const params = [];

    if (role === "admin") {
      where.push("u.is_admin = 1");
    } else if (role === "customer") {
      where.push("u.is_admin = 0");
    }

    if (status === "active") {
      where.push("u.is_suspended = 0");
    } else if (status === "suspended") {
      where.push("u.is_suspended = 1");
    }

    if (q) {
      const like = `%${q}%`;
      where.push("(CAST(u.id AS CHAR) LIKE ? OR u.name LIKE ? OR u.email LIKE ?)");
      params.push(like, like, like);
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const [rows] = await db.query(
      `SELECT
         u.id,
         u.name,
         u.email,
         u.phone,
         u.city,
         u.postcode,
         u.is_admin,
         u.is_suspended,
         u.created_at,
         (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS order_count,
         ${refundCountSelect},
         (SELECT MAX(o.created_at) FROM orders o WHERE o.user_id = u.id) AS last_order_at
       FROM users u
       ${whereClause}
       ORDER BY u.id DESC`,
      params
    );

    const csv = asCsv((rows || []).map((row) => ({
      ...row,
      role: Number(row.is_admin) === 1 ? "admin" : "customer",
      account_status: Number(row.is_suspended) === 1 ? "suspended" : "active",
    })), [
      { key: "id", label: "user_id" },
      { key: "name", label: "name" },
      { key: "email", label: "email" },
      { key: "role", label: "role" },
      { key: "account_status", label: "account_status" },
      { key: "phone", label: "phone" },
      { key: "city", label: "city" },
      { key: "postcode", label: "postcode" },
      { key: "order_count", label: "order_count" },
      { key: "refund_count", label: "refund_count" },
      { key: "last_order_at", label: "last_order_at" },
      { key: "created_at", label: "created_at" },
    ]);

    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="users-export-${stamp}.csv"`);
    return res.status(200).send(csv);
  } catch (err) {
    console.error("Admin export users CSV error:", err);
    return res.status(500).json({ message: "Failed to export users CSV" });
  }
});

// DELETE user
router.delete("/users/:id", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const targetId = Number(id);
    if (targetId === Number(req.session?.userId)) {
      return res.status(400).json({ message: "You cannot delete your own account." });
    }

    const [result] = await db.query(
      "DELETE FROM users WHERE id = ?",
      [targetId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "User not found" });
    }

    await appendAdminAuditLog({
      adminId: req.session.userId,
      action: "user_delete",
      targetType: "user",
      targetId,
    });

    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("Admin delete user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/users/:id/summary", adminMiddleware, async (req, res) => {
  try {
    await ensureUserManagementColumns();
    await ensureUserProfileColumns();
    const userId = Number(req.params.id);
    const [[userRow]] = await db.query(
      `SELECT id, name, email, phone, address_line1, address_line2, city, postcode,
              is_admin, is_suspended, suspended_at, suspension_reason, created_at
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [userId]
    );
    if (!userRow) return res.status(404).json({ message: "User not found" });

    const [[ordersStats]] = await db.query(
      `SELECT COUNT(*) AS total_orders, COALESCE(SUM(total_price), 0) AS total_spend, MAX(created_at) AS last_order_at
       FROM orders
       WHERE user_id = ?`,
      [userId]
    );

    let refundStats = { total_refunds: 0, refunded_count: 0, pending_refunds: 0, last_refund_at: null };
    try {
      await ensureRefundsTable();
      const [[rr]] = await db.query(
        `SELECT
          COUNT(*) AS total_refunds,
          SUM(CASE WHEN status = 'refunded' THEN 1 ELSE 0 END) AS refunded_count,
          SUM(CASE WHEN status IN ('pending','approved','processing') THEN 1 ELSE 0 END) AS pending_refunds,
          MAX(created_at) AS last_refund_at
        FROM refund_requests
        WHERE user_id = ?`,
        [userId]
      );
      refundStats = {
        total_refunds: Number(rr.total_refunds || 0),
        refunded_count: Number(rr.refunded_count || 0),
        pending_refunds: Number(rr.pending_refunds || 0),
        last_refund_at: rr.last_refund_at || null,
      };
    } catch (_) {}

    let messageStats = { total_messages: 0, last_message_at: null };
    try {
      const [[msg]] = await db.query(
        `SELECT COUNT(*) AS total_messages, MAX(created_at) AS last_message_at
         FROM contact_messages
         WHERE email = ?`,
        [userRow.email]
      );
      messageStats = {
        total_messages: Number(msg.total_messages || 0),
        last_message_at: msg.last_message_at || null,
      };
    } catch (_) {}

    return res.json({
      user: userRow,
      orders: ordersStats,
      refunds: refundStats,
      messages: messageStats,
    });
  } catch (err) {
    console.error("Admin user summary error:", err);
    return res.status(500).json({ message: "Failed to fetch user summary" });
  }
});

router.get("/users/:id/orders", adminMiddleware, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const rawPage = Number.parseInt(String(req.query.page || "1"), 10);
    const rawPageSize = Number.parseInt(String(req.query.pageSize || "10"), 10);
    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
    const pageSize = Number.isFinite(rawPageSize) && rawPageSize > 0
      ? Math.min(50, rawPageSize)
      : 10;
    const offset = (page - 1) * pageSize;

    const [[userRow]] = await db.query(
      "SELECT id FROM users WHERE id = ? LIMIT 1",
      [userId]
    );
    if (!userRow) return res.status(404).json({ message: "User not found" });

    const [[countRow]] = await db.query(
      "SELECT COUNT(*) AS total FROM orders WHERE user_id = ?",
      [userId]
    );
    const total = Number(countRow?.total || 0);

    const [rows] = await db.query(
      `SELECT
         o.id,
         o.total_price,
         o.status,
         o.created_at,
         (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS item_count
       FROM orders o
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, pageSize, offset]
    );

    return res.json({
      rows: rows || [],
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (err) {
    console.error("Admin user orders error:", err);
    return res.status(500).json({ message: "Failed to fetch user order history" });
  }
});

router.put("/users/:id/profile", adminMiddleware, async (req, res) => {
  try {
    await ensureUserProfileColumns();
    const userId = Number(req.params.id);
    const {
      name,
      email,
      phone = "",
      address_line1 = "",
      address_line2 = "",
      city = "",
      postcode = "",
    } = req.body || {};

    const normalizedName = String(name || "").trim();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedPhone = String(phone || "").trim();
    const normalizedAddress1 = String(address_line1 || "").trim();
    const normalizedAddress2 = String(address_line2 || "").trim();
    const normalizedCity = String(city || "").trim();
    const normalizedPostcode = String(postcode || "").trim();

    if (!normalizedName || !normalizedEmail) {
      return res.status(400).json({ message: "Name and email are required" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const [existsRows] = await db.query("SELECT id FROM users WHERE id = ? LIMIT 1", [userId]);
    if (!existsRows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const [emailTakenRows] = await db.query(
      "SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1",
      [normalizedEmail, userId]
    );
    if (emailTakenRows.length) {
      return res.status(409).json({ message: "Email already in use" });
    }

    await db.query(
      `UPDATE users
          SET name = ?, email = ?, phone = ?, address_line1 = ?, address_line2 = ?, city = ?, postcode = ?
        WHERE id = ?`,
      [
        normalizedName,
        normalizedEmail,
        normalizedPhone || null,
        normalizedAddress1 || null,
        normalizedAddress2 || null,
        normalizedCity || null,
        normalizedPostcode || null,
        userId,
      ]
    );

    await appendAdminAuditLog({
      adminId: req.session.userId,
      action: "user_profile_update",
      targetType: "user",
      targetId: userId,
      details: JSON.stringify({
        fields: ["name", "email", "phone", "address_line1", "address_line2", "city", "postcode"],
      }),
    });

    return res.json({
      message: "User details updated",
      user: {
        id: userId,
        name: normalizedName,
        email: normalizedEmail,
        phone: normalizedPhone,
        address_line1: normalizedAddress1,
        address_line2: normalizedAddress2,
        city: normalizedCity,
        postcode: normalizedPostcode,
      },
    });
  } catch (err) {
    console.error("Admin update user profile error:", err);
    return res.status(500).json({ message: "Failed to update user details" });
  }
});

router.put("/users/:id/suspend", adminMiddleware, async (req, res) => {
  try {
    await ensureUserManagementColumns();
    const userId = Number(req.params.id);
    const { suspended, reason } = req.body || {};
    if (typeof suspended !== "boolean") {
      return res.status(400).json({ message: "suspended must be true or false" });
    }
    if (userId === Number(req.session?.userId)) {
      return res.status(400).json({ message: "You cannot suspend your own account." });
    }

    const [result] = await db.query(
      `UPDATE users
       SET is_suspended = ?, suspended_at = ?, suspension_reason = ?
       WHERE id = ?`,
      [
        suspended ? 1 : 0,
        suspended ? new Date() : null,
        suspended ? (reason ? String(reason).slice(0, 255) : "Suspended by admin") : null,
        userId,
      ]
    );
    if (!result.affectedRows) return res.status(404).json({ message: "User not found" });

    await appendAdminAuditLog({
      adminId: req.session.userId,
      action: suspended ? "user_suspend" : "user_unsuspend",
      targetType: "user",
      targetId: userId,
      details: suspended ? String(reason || "Suspended by admin") : "Unsuspended",
    });

    return res.json({ message: suspended ? "User suspended" : "User unsuspended" });
  } catch (err) {
    console.error("Admin suspend user error:", err);
    return res.status(500).json({ message: "Failed to update user status" });
  }
});

router.put("/users/:id/role", adminMiddleware, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { isAdmin } = req.body || {};
    if (typeof isAdmin !== "boolean") {
      return res.status(400).json({ message: "isAdmin must be true or false" });
    }

    const [[target]] = await db.query(
      "SELECT id, is_admin FROM users WHERE id = ? LIMIT 1",
      [userId]
    );
    if (!target) return res.status(404).json({ message: "User not found" });

    const nextRole = isAdmin ? 1 : 0;
    if (Number(target.is_admin) === nextRole) {
      return res.json({ message: "Role unchanged" });
    }

    if (Number(target.is_admin) === 1 && nextRole === 0) {
      const [[adminsCountRow]] = await db.query(
        "SELECT COUNT(*) AS admins_count FROM users WHERE is_admin = 1"
      );
      const adminsCount = Number(adminsCountRow?.admins_count || 0);
      if (adminsCount <= 1) {
        return res.status(400).json({ message: "Cannot remove the last admin account." });
      }
    }

    const [result] = await db.query(
      "UPDATE users SET is_admin = ? WHERE id = ?",
      [nextRole, userId]
    );
    if (!result.affectedRows) return res.status(404).json({ message: "User not found" });

    await appendAdminAuditLog({
      adminId: req.session.userId,
      action: nextRole === 1 ? "user_role_promote_admin" : "user_role_demote_admin",
      targetType: "user",
      targetId: userId,
      details: JSON.stringify({ from: Number(target.is_admin) === 1 ? "admin" : "customer", to: nextRole === 1 ? "admin" : "customer" }),
    });

    return res.json({ message: nextRole === 1 ? "User promoted to admin" : "User changed to customer" });
  } catch (err) {
    console.error("Admin user role update error:", err);
    return res.status(500).json({ message: "Failed to update user role" });
  }
});

router.post("/users/bulk-action", adminMiddleware, async (req, res) => {
  try {
    await ensureUserManagementColumns();
    const { userIds, action, reason } = req.body || {};
    if (!Array.isArray(userIds) || !userIds.length) {
      return res.status(400).json({ message: "userIds is required" });
    }
    if (!["delete", "suspend", "unsuspend"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const normalizedIds = [...new Set(userIds.map((v) => Number(v)).filter((v) => Number.isInteger(v) && v > 0))];
    const filteredIds = normalizedIds.filter((id) => id !== Number(req.session?.userId));
    if (!filteredIds.length) {
      return res.status(400).json({ message: "No valid target users" });
    }

    let affectedRows = 0;
    if (action === "delete") {
      const [result] = await db.query("DELETE FROM users WHERE id IN (?)", [filteredIds]);
      affectedRows = result.affectedRows || 0;
    } else if (action === "suspend") {
      const [result] = await db.query(
        "UPDATE users SET is_suspended = 1, suspended_at = ?, suspension_reason = ? WHERE id IN (?)",
        [new Date(), reason ? String(reason).slice(0, 255) : "Suspended by admin", filteredIds]
      );
      affectedRows = result.affectedRows || 0;
    } else {
      const [result] = await db.query(
        "UPDATE users SET is_suspended = 0, suspended_at = NULL, suspension_reason = NULL WHERE id IN (?)",
        [filteredIds]
      );
      affectedRows = result.affectedRows || 0;
    }

    await appendAdminAuditLog({
      adminId: req.session.userId,
      action: `users_bulk_${action}`,
      targetType: "users",
      details: JSON.stringify({ count: filteredIds.length, reason: reason || null }),
    });

    return res.json({ message: `Bulk ${action} completed`, affectedRows });
  } catch (err) {
    console.error("Admin bulk user action error:", err);
    return res.status(500).json({ message: "Failed to apply bulk action" });
  }
});

router.get("/users/audit-log", adminMiddleware, async (req, res) => {
  try {
    await ensureAdminAuditTable();
    const limit = Math.max(1, Math.min(100, Number(req.query.limit || 20)));
    const [rows] = await db.query(
      `SELECT l.id, l.action, l.target_type, l.target_id, l.details, l.created_at, u.name AS admin_name
       FROM admin_audit_log l
       LEFT JOIN users u ON u.id = l.admin_id
       ORDER BY l.created_at DESC
       LIMIT ?`,
      [limit]
    );
    return res.json(rows);
  } catch (err) {
    console.error("Admin audit log error:", err);
    return res.status(500).json({ message: "Failed to fetch audit log" });
  }
});

router.get("/admin-role-requests", adminMiddleware, async (_req, res) => {
  try {
    await ensureAuthColumnsAndRoleRequests();
    const [rows] = await db.query(
      `SELECT
         r.id, r.user_id, r.reason, r.status, r.reviewed_by, r.reviewed_at, r.created_at,
         u.name, u.email,
         reviewer.name AS reviewer_name
       FROM admin_role_requests r
       JOIN users u ON u.id = r.user_id
       LEFT JOIN users reviewer ON reviewer.id = r.reviewed_by
       ORDER BY
         CASE WHEN r.status = 'pending' THEN 0 ELSE 1 END,
         r.created_at DESC`
    );
    return res.json(rows);
  } catch (err) {
    console.error("Admin role requests fetch error:", err);
    return res.status(500).json({ message: "Failed to fetch admin role requests" });
  }
});

router.put("/admin-role-requests/:id", adminMiddleware, async (req, res) => {
  const requestId = Number(req.params.id);
  const { decision } = req.body || {};
  if (!["approved", "rejected"].includes(decision)) {
    return res.status(400).json({ message: "decision must be approved or rejected" });
  }

  let conn;
  try {
    await ensureAuthColumnsAndRoleRequests();
    conn = await db.getConnection();
    await conn.beginTransaction();

    const [[requestRow]] = await conn.query(
      `SELECT id, user_id, status
       FROM admin_role_requests
       WHERE id = ?
       LIMIT 1`,
      [requestId]
    );
    if (!requestRow) {
      await conn.rollback();
      return res.status(404).json({ message: "Request not found" });
    }
    if (requestRow.status !== "pending") {
      await conn.rollback();
      return res.status(400).json({ message: "Request already reviewed" });
    }

    await conn.query(
      `UPDATE admin_role_requests
       SET status = ?, reviewed_by = ?, reviewed_at = NOW()
       WHERE id = ?`,
      [decision, req.session.userId, requestId]
    );

    if (decision === "approved") {
      await conn.query(
        "UPDATE users SET is_admin = 1, must_change_password = 1 WHERE id = ?",
        [requestRow.user_id]
      );
    }

    await conn.commit();

    await appendAdminAuditLog({
      adminId: req.session.userId,
      action: decision === "approved" ? "admin_role_request_approved" : "admin_role_request_rejected",
      targetType: "user",
      targetId: requestRow.user_id,
      details: JSON.stringify({ requestId }),
    });

    return res.json({ message: decision === "approved" ? "Admin request approved" : "Admin request rejected" });
  } catch (err) {
    if (conn) {
      try { await conn.rollback(); } catch (_) {}
    }
    console.error("Admin role request decision error:", err);
    return res.status(500).json({ message: "Failed to process request" });
  } finally {
    if (conn) conn.release();
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

router.get("/orders/export.csv", adminMiddleware, async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    const status = String(req.query.status || "all").toLowerCase();
    const dateRange = String(req.query.date || "all").toLowerCase();
    const sort = String(req.query.sort || "newest").toLowerCase();

    const where = [];
    const params = [];

    if (["pending", "processing", "shipped", "delivered", "cancelled"].includes(status)) {
      where.push("o.status = ?");
      params.push(status);
    }

    if (["7d", "30d", "90d"].includes(dateRange)) {
      const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
      where.push("o.created_at >= (NOW() - INTERVAL ? DAY)");
      params.push(days);
    }

    if (q) {
      where.push("(CAST(o.id AS CHAR) LIKE ? OR u.name LIKE ? OR u.email LIKE ?)");
      const like = `%${q}%`;
      params.push(like, like, like);
    }

    let orderBy = "o.created_at DESC";
    if (sort === "oldest") {
      orderBy = "o.created_at ASC";
    } else if (sort === "highest") {
      orderBy = "o.total_price DESC, o.created_at DESC";
    } else if (sort === "pending_first") {
      orderBy = "CASE WHEN o.status = 'pending' THEN 0 ELSE 1 END ASC, o.created_at DESC";
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const [rows] = await db.query(
      `SELECT
         o.id,
         o.user_id,
         u.name,
         u.email,
         o.status,
         o.total_price,
         o.created_at,
         (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS item_count
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ${whereClause}
       ORDER BY ${orderBy}`,
      params
    );

    const csv = asCsv(rows || [], [
      { key: "id", label: "order_id" },
      { key: "user_id", label: "user_id" },
      { key: "name", label: "customer_name" },
      { key: "email", label: "customer_email" },
      { key: "status", label: "status" },
      { key: "total_price", label: "total_price" },
      { key: "item_count", label: "item_count" },
      { key: "created_at", label: "created_at" },
    ]);

    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="orders-export-${stamp}.csv"`);
    return res.status(200).send(csv);
  } catch (err) {
    console.error("Admin export orders CSV error:", err);
    return res.status(500).json({ message: "Failed to export orders CSV" });
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

router.post("/orders/bulk-status", adminMiddleware, async (req, res) => {
  try {
    const { orderIds, status } = req.body || {};
    if (!Array.isArray(orderIds) || !orderIds.length) {
      return res.status(400).json({ message: "orderIds is required" });
    }
    if (!["pending", "processing", "shipped", "delivered", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const ids = [...new Set(orderIds.map((v) => Number(v)).filter((v) => Number.isInteger(v) && v > 0))];
    if (!ids.length) return res.status(400).json({ message: "No valid order ids" });

    const [result] = await db.query(
      "UPDATE orders SET status = ? WHERE id IN (?)",
      [status, ids]
    );

    await appendAdminAuditLog({
      adminId: req.session.userId,
      action: "orders_bulk_status",
      targetType: "orders",
      details: JSON.stringify({ count: ids.length, status }),
    });

    return res.json({ message: "Bulk order status updated", affectedRows: result.affectedRows || 0 });
  } catch (err) {
    console.error("Admin bulk order status error:", err);
    return res.status(500).json({ message: "Failed to bulk update orders" });
  }
});

router.get("/orders/:id/details", adminMiddleware, async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const [[order]] = await db.query(
      `SELECT o.id, o.user_id, o.total_price, o.status, o.created_at, u.name, u.email
       FROM orders o
       JOIN users u ON u.id = o.user_id
       WHERE o.id = ?
       LIMIT 1`,
      [orderId]
    );
    if (!order) return res.status(404).json({ message: "Order not found" });

    const [items] = await db.query(
      `SELECT
        oi.id,
        oi.product_id,
        oi.quantity,
        oi.price_each,
        p.name AS product_name,
        p.sku,
        (SELECT pi.url FROM product_images pi WHERE pi.product_id = oi.product_id ORDER BY pi.sort_order ASC LIMIT 1) AS product_image
      FROM order_items oi
      LEFT JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ?
      ORDER BY oi.id ASC`,
      [orderId]
    );

    return res.json({ order, items: items || [] });
  } catch (err) {
    console.error("Admin order details error:", err);
    return res.status(500).json({ message: "Failed to load order details" });
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
    await ensureStockMovementsTable();
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
    const [[movementTotals]] = await db.query(
      `SELECT
         COALESCE(SUM(CASE WHEN movement_type = 'incoming' AND created_at >= (NOW() - INTERVAL 7 DAY) THEN quantity ELSE 0 END), 0) AS incoming_7d,
         COALESCE(SUM(CASE WHEN movement_type = 'outgoing' AND created_at >= (NOW() - INTERVAL 7 DAY) THEN quantity ELSE 0 END), 0) AS outgoing_7d
       FROM stock_movements`
    );
    const [productFlow7d] = await db.query(
      `SELECT
         p.id AS product_id,
         p.sku,
         p.name,
         COALESCE(SUM(CASE WHEN sm.movement_type = 'incoming' THEN sm.quantity ELSE 0 END), 0) AS incoming_units,
         COALESCE(SUM(CASE WHEN sm.movement_type = 'outgoing' THEN sm.quantity ELSE 0 END), 0) AS outgoing_units
       FROM products p
       LEFT JOIN stock_movements sm
         ON sm.product_id = p.id
        AND sm.created_at >= (NOW() - INTERVAL 7 DAY)
       GROUP BY p.id, p.sku, p.name
       HAVING incoming_units > 0 OR outgoing_units > 0
       ORDER BY (incoming_units + outgoing_units) DESC
       LIMIT 20`
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
      totalIncomingUnits7d: Number(movementTotals.incoming_7d || 0),
      totalOutgoingUnits7d: Number(movementTotals.outgoing_7d || 0),
      productFlow7d: (productFlow7d || []).map((r) => ({
        product_id: Number(r.product_id),
        sku: r.sku,
        name: r.name,
        incoming_units: Number(r.incoming_units || 0),
        outgoing_units: Number(r.outgoing_units || 0),
        net_units: Number(r.incoming_units || 0) - Number(r.outgoing_units || 0),
      })),
      totalRefundRequests: refundCount.totalRefundRequests,
      pendingRefundRequests: pendingRefundCount.pendingRefundRequests
    });

  } catch (err) {
    console.error("Admin reports error:", err);
    res.status(500).json({ message: "Failed to generate reports" });
  }
});

/* ======================================================
   PRODUCT MANAGEMENT
====================================================== */

router.get("/categories", adminMiddleware, async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT id, name FROM categories ORDER BY id ASC");
    res.json(rows);
  } catch (err) {
    console.error("Admin get categories error:", err);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

router.get("/products", adminMiddleware, async (_req, res) => {
  try {
    await ensureProductSizeStockColumn();
    const hasOriginalPrice = await columnExists("products", "original_price");
    const opSelect = hasOriginalPrice ? "p.original_price," : "NULL AS original_price,";
    const opGroup  = hasOriginalPrice ? "p.original_price," : "";

    const [rows] = await db.query(
      `SELECT
        p.id,
        p.sku,
        p.name,
        p.price,
        ${opSelect}
        p.stock,
        p.category_id,
        c.name AS category,
        p.description,
        p.created_at,
        GROUP_CONCAT(DISTINCT pi.url ORDER BY pi.sort_order SEPARATOR '||') AS images,
        GROUP_CONCAT(DISTINCT ps.size ORDER BY ps.size SEPARATOR '||') AS sizes,
        GROUP_CONCAT(DISTINCT CONCAT(ps.size, ':', COALESCE(ps.stock, 0)) ORDER BY ps.size SEPARATOR '||') AS size_stocks,
        (SELECT GROUP_CONCAT(color SEPARATOR '||') FROM product_colors WHERE product_id = p.id) AS colors
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN product_images pi ON pi.product_id = p.id
      LEFT JOIN product_sizes  ps ON ps.product_id = p.id
      GROUP BY p.id, p.sku, p.name, p.price, ${opGroup} p.stock, p.category_id, c.name, p.description, p.created_at
      ORDER BY p.id DESC`
    );
    res.json(rows.map((r) => ({
      ...r,
      images: r.images ? r.images.split("||").filter(Boolean) : [],
      sizes:  r.sizes  ? r.sizes.split("||").filter(Boolean)  : [],
      sizeStocks: r.size_stocks
        ? r.size_stocks
            .split("||")
            .map((entry) => {
              const idx = entry.lastIndexOf(":");
              if (idx <= 0) return null;
              const size = entry.slice(0, idx);
              const stock = Number(entry.slice(idx + 1));
              return { size, stock: Number.isFinite(stock) ? stock : 0 };
            })
            .filter(Boolean)
        : [],
      colors: r.colors ? r.colors.split("||").filter(Boolean) : [],
    })));
  } catch (err) {
    console.error("Admin get products error:", err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

router.get("/products/export.csv", adminMiddleware, async (req, res) => {
  try {
    await ensureProductSizeStockColumn();
    const hasOriginalPrice = await columnExists("products", "original_price");
    const opSelect = hasOriginalPrice ? "p.original_price," : "NULL AS original_price,";
    const opGroup = hasOriginalPrice ? "p.original_price," : "";

    const q = String(req.query.q || "").trim();
    const where = [];
    const params = [];
    if (q) {
      const like = `%${q}%`;
      where.push("(CAST(p.id AS CHAR) LIKE ? OR p.sku LIKE ? OR p.name LIKE ? OR c.name LIKE ?)");
      params.push(like, like, like, like);
    }
    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows] = await db.query(
      `SELECT
         p.id,
         p.sku,
         p.name,
         c.name AS category,
         p.price,
         ${opSelect}
         p.stock,
         p.created_at,
         COALESCE((SELECT SUM(oi.quantity) FROM order_items oi WHERE oi.product_id = p.id), 0) AS total_units_sold
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       ${whereClause}
       GROUP BY p.id, p.sku, p.name, c.name, p.price, ${opGroup} p.stock, p.created_at
       ORDER BY p.id DESC`,
      params
    );

    const csv = asCsv(rows || [], [
      { key: "id", label: "product_id" },
      { key: "sku", label: "sku" },
      { key: "name", label: "name" },
      { key: "category", label: "category" },
      { key: "price", label: "price" },
      { key: "original_price", label: "original_price" },
      { key: "stock", label: "stock" },
      { key: "total_units_sold", label: "total_units_sold" },
      { key: "created_at", label: "created_at" },
    ]);

    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="products-export-${stamp}.csv"`);
    return res.status(200).send(csv);
  } catch (err) {
    console.error("Admin export products CSV error:", err);
    return res.status(500).json({ message: "Failed to export products CSV" });
  }
});

router.post("/upload-image", adminMiddleware, uploadMemory.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image uploaded" });
  try {
    // All product images are standardised to 800×1067 (3:4 portrait ratio),
    // matching the dimensions of the existing product catalogue images.
    const filename = `product-${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
    const outPath = path.join(uploadsPath, filename);
    await sharp(req.file.buffer)
      .resize(800, 1067, { fit: "cover", position: "centre" })
      .jpeg({ quality: 85, mozjpeg: true })
      .toFile(outPath);
    return res.json({ url: `/uploads/${filename}` });
  } catch (err) {
    console.error("Image resize error:", err);
    return res.status(500).json({ message: "Failed to process image" });
  }
});

router.post("/products", adminMiddleware, async (req, res) => {
  const {
    sku,
    name,
    category_id,
    price,
    original_price = null,
    stock = 0,
    description = "",
    sizes = [],
    sizeStocks = {},
    colors = [],
    images = [],
  } = req.body || {};

  if (!sku || !name || !category_id || !price) {
    return res.status(400).json({ message: "sku, name, category_id and price are required" });
  }

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    const hasOP = await columnExists("products", "original_price");
    const originalPriceVal = original_price ? Number(original_price) : null;
    const opCol = hasOP ? ", original_price" : "";
    const opPlaceholder = hasOP ? ", ?" : "";
    const opValues = hasOP ? [originalPriceVal] : [];
    const [ins] = await conn.query(
      `INSERT INTO products (sku, category_id, name, description, price${opCol}, stock)
       VALUES (?, ?, ?, ?, ?${opPlaceholder}, ?)`,
      [String(sku).trim(), Number(category_id), String(name).trim(), String(description).trim(), Number(price), ...opValues, Number(stock) || 0]
    );
    const productId = ins.insertId;

    await ensureProductSizeStockColumn();
    if ((await tableExists("product_sizes")) && Array.isArray(sizes) && sizes.length) {
      for (const s of sizes) {
        const sizeKey = String(s);
        const sizeStockRaw = sizeStocks && typeof sizeStocks === "object" ? sizeStocks[sizeKey] : null;
        const parsedSizeStock = Number(sizeStockRaw);
        const sizeStock = Number.isFinite(parsedSizeStock) && parsedSizeStock >= 0
          ? Math.floor(parsedSizeStock)
          : Number(stock) || 0;
        await conn.query("INSERT INTO product_sizes (product_id, size, stock) VALUES (?, ?, ?)", [productId, sizeKey, sizeStock]);
      }
    }

    if ((await tableExists("product_colors")) && Array.isArray(colors) && colors.length) {
      for (const c of colors) {
        if (!String(c).trim()) continue;
        await conn.query("INSERT INTO product_colors (product_id, color) VALUES (?, ?)", [productId, String(c).trim()]);
      }
    }

    if ((await tableExists("product_images")) && Array.isArray(images) && images.length) {
      for (let i = 0; i < images.length; i += 1) {
        const url = String(images[i] || "").trim();
        if (!url) continue;
        await conn.query(
          "INSERT INTO product_images (product_id, url, sort_order) VALUES (?, ?, ?)",
          [productId, url, i]
        );
      }
    }

    await conn.commit();
    return res.status(201).json({ message: "Product created", id: productId });
  } catch (err) {
    if (conn) {
      try {
        await conn.rollback();
      } catch (rollbackErr) {
        console.error("Admin add product rollback error:", rollbackErr);
      }
    }
    console.error("Admin add product error:", err);
    return res.status(500).json({ message: "Failed to create product" });
  } finally {
    if (conn) conn.release();
  }
});

router.put("/products/:id", adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const {
    sku, name, category_id, price, original_price = null,
    stock = 0, description = "", sizes = [], sizeStocks = {}, colors = [], images,
  } = req.body || {};

  if (!name || !price) {
    return res.status(400).json({ message: "name and price are required" });
  }

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    const hasOP = await columnExists("products", "original_price");
    const originalPriceVal = original_price ? Number(original_price) : null;
    const opSet = hasOP ? ", original_price=?" : "";
    const opValues = hasOP ? [originalPriceVal] : [];
    await conn.query(
      `UPDATE products SET sku=?, name=?, category_id=?, price=?${opSet}, stock=?, description=? WHERE id=?`,
      [String(sku || "").trim(), String(name).trim(), Number(category_id), Number(price), ...opValues, Number(stock) || 0, String(description).trim(), id]
    );

    await ensureProductSizeStockColumn();
    if (await tableExists("product_sizes")) {
      await conn.query("DELETE FROM product_sizes WHERE product_id=?", [id]);
      for (const s of (sizes || [])) {
        if (String(s).trim()) {
          const sizeKey = String(s).trim();
          const sizeStockRaw = sizeStocks && typeof sizeStocks === "object" ? sizeStocks[sizeKey] : null;
          const parsedSizeStock = Number(sizeStockRaw);
          const sizeStock = Number.isFinite(parsedSizeStock) && parsedSizeStock >= 0
            ? Math.floor(parsedSizeStock)
            : Number(stock) || 0;
          await conn.query("INSERT INTO product_sizes (product_id, size, stock) VALUES (?,?,?)", [id, sizeKey, sizeStock]);
        }
      }
    }

    if (await tableExists("product_colors")) {
      await conn.query("DELETE FROM product_colors WHERE product_id=?", [id]);
      for (const c of (colors || [])) {
        if (String(c).trim()) {
          await conn.query("INSERT INTO product_colors (product_id, color) VALUES (?,?)", [id, String(c).trim()]);
        }
      }
    }

    if (await tableExists("product_images") && Array.isArray(images)) {
      await conn.query("DELETE FROM product_images WHERE product_id=?", [id]);
      for (let i = 0; i < images.length; i++) {
        const url = String(images[i] || "").trim();
        if (url) {
          await conn.query("INSERT INTO product_images (product_id, url, sort_order) VALUES (?,?,?)", [id, url, i]);
        }
      }
    }

    await conn.commit();
    return res.json({ message: "Product updated" });
  } catch (err) {
    if (conn) { try { await conn.rollback(); } catch (_) {} }
    console.error("Admin update product error:", err);
    return res.status(500).json({ message: "Failed to update product" });
  } finally {
    if (conn) conn.release();
  }
});

router.put("/products/:id/stock", adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { stock } = req.body || {};
  const n = Number(stock);
  if (!Number.isInteger(n) || n < 0) {
    return res.status(400).json({ message: "stock must be a non-negative integer" });
  }
  try {
    const [result] = await db.query("UPDATE products SET stock = ? WHERE id = ?", [n, id]);
    if (!result.affectedRows) return res.status(404).json({ message: "Product not found" });
    return res.json({ message: "Stock updated" });
  } catch (err) {
    console.error("Admin update stock error:", err);
    return res.status(500).json({ message: "Failed to update stock" });
  }
});

router.post("/products/:id/incoming", adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { quantity, size = null, note = "" } = req.body || {};
  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty <= 0) {
    return res.status(400).json({ message: "quantity must be a positive integer" });
  }

  let conn;
  try {
    await ensureProductSizeStockColumn();
    await ensureStockMovementsTable();

    conn = await db.getConnection();
    await conn.beginTransaction();

    const [[product]] = await conn.query(
      "SELECT id, stock FROM products WHERE id = ? LIMIT 1",
      [id]
    );
    if (!product) {
      await conn.rollback();
      return res.status(404).json({ message: "Product not found" });
    }

    if (size && String(size).trim()) {
      const [sizeResult] = await conn.query(
        `UPDATE product_sizes
         SET stock = stock + ?
         WHERE product_id = ? AND size = ?`,
        [qty, id, String(size).trim()]
      );
      if (!sizeResult.affectedRows) {
        await conn.rollback();
        return res.status(404).json({ message: "Size not found for this product" });
      }
    }

    await conn.query(
      "UPDATE products SET stock = stock + ? WHERE id = ?",
      [qty, id]
    );

    await recordStockMovement({
      conn,
      productId: id,
      size: size ? String(size).trim() : null,
      movementType: "incoming",
      quantity: qty,
      referenceType: "incoming_order",
      referenceId: null,
      note: note ? String(note).slice(0, 255) : "Manual incoming stock",
      actorUserId: req.session?.userId || null,
    });

    await conn.commit();
    return res.json({ message: "Incoming stock processed" });
  } catch (err) {
    if (conn) {
      try { await conn.rollback(); } catch (_) {}
    }
    console.error("Admin incoming stock error:", err);
    return res.status(500).json({ message: "Failed to process incoming stock" });
  } finally {
    if (conn) conn.release();
  }
});

router.put("/products/:id/size-stock", adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { size, stock } = req.body || {};
  const n = Number(stock);
  if (!size || !String(size).trim()) {
    return res.status(400).json({ message: "size is required" });
  }
  if (!Number.isInteger(n) || n < 0) {
    return res.status(400).json({ message: "stock must be a non-negative integer" });
  }
  try {
    await ensureProductSizeStockColumn();
    const [result] = await db.query(
      "UPDATE product_sizes SET stock = ? WHERE product_id = ? AND size = ?",
      [n, id, String(size).trim()]
    );
    if (!result.affectedRows) {
      return res.status(404).json({ message: "Size record not found for this product" });
    }

    // Keep product stock aligned to sum of size-level stock where size records exist.
    await db.query(
      `UPDATE products p
       JOIN (
         SELECT product_id, COALESCE(SUM(stock), 0) AS total_size_stock
         FROM product_sizes
         WHERE product_id = ?
         GROUP BY product_id
       ) s ON s.product_id = p.id
       SET p.stock = s.total_size_stock
       WHERE p.id = ?`,
      [id, id]
    );

    return res.json({ message: "Size stock updated" });
  } catch (err) {
    console.error("Admin update size stock error:", err);
    return res.status(500).json({ message: "Failed to update size stock" });
  }
});

router.delete("/products/:id", adminMiddleware, async (req, res) => {
  const { id } = req.params;
  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    // Remove all child rows that reference this product (FK constraints)
    if (await tableExists("product_images")) {
      await conn.query("DELETE FROM product_images WHERE product_id = ?", [id]);
    }
    if (await tableExists("product_sizes")) {
      await conn.query("DELETE FROM product_sizes WHERE product_id = ?", [id]);
    }
    if (await tableExists("product_colors")) {
      await conn.query("DELETE FROM product_colors WHERE product_id = ?", [id]);
    }
    if (await tableExists("basket_items")) {
      await conn.query("DELETE FROM basket_items WHERE product_id = ?", [id]);
    }
    if (await tableExists("wishlist_items")) {
      await conn.query("DELETE FROM wishlist_items WHERE product_id = ?", [id]);
    }
    if (await tableExists("reviews")) {
      await conn.query("DELETE FROM reviews WHERE product_id = ?", [id]);
    }
    // order_items: remove line items referencing this product
    // (the order record itself and its total_price are preserved)
    if (await tableExists("order_items")) {
      await conn.query("DELETE FROM order_items WHERE product_id = ?", [id]);
    }

    const [result] = await conn.query("DELETE FROM products WHERE id = ?", [id]);
    if (!result.affectedRows) {
      await conn.rollback();
      return res.status(404).json({ message: "Product not found" });
    }

    await conn.commit();
    return res.json({ message: "Product deleted" });
  } catch (err) {
    if (conn) {
      try {
        await conn.rollback();
      } catch (rollbackErr) {
        console.error("Admin delete product rollback error:", rollbackErr);
      }
    }
    console.error("Admin delete product error:", err);
    return res.status(500).json({ message: "Failed to delete product" });
  } finally {
    if (conn) conn.release();
  }
});

/* ======================================================
   REFUND REQUESTS
====================================================== */

router.get("/refunds", adminMiddleware, async (req, res) => {
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
        rr.user_id,
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
        ${resolvedAtExpr},
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
    const cols = await getRefundColumns();
    if (!cols) return res.status(503).json({ message: "Refund system is not initialized on server yet" });
    const { id } = req.params;
    const { status, adminNote, instructionLink, refundAmount, refundReference } = req.body || {};

    if (!ALLOWED_STATUSES.has(status)) {
      return res.status(400).json({ message: "Invalid refund status" });
    }

    const [existingRows] = await db.query(
      "SELECT id, status FROM refund_requests WHERE id = ? LIMIT 1",
      [id]
    );
    if (!existingRows.length) {
      return res.status(404).json({ message: "Refund request not found" });
    }

    const existing = existingRows[0];
    if (!canTransitionRefundStatus(existing.status, status)) {
      return res.status(400).json({
        message: `Invalid transition from ${existing.status} to ${status}`,
      });
    }

    const normalizedAdminNote = adminNote ? String(adminNote).slice(0, 4000) : null;
    const normalizedInstructionLink = instructionLink ? String(instructionLink).slice(0, 1000) : null;
    const normalizedReference = refundReference ? String(refundReference).slice(0, 120) : null;
    const parsedAmount = refundAmount == null || refundAmount === ""
      ? null
      : Number(refundAmount);

    if (status === "refunded") {
      if (parsedAmount == null || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ message: "A valid refund amount is required when marking refunded" });
      }
      if (!normalizedReference) {
        return res.status(400).json({ message: "Refund reference is required when marking refunded" });
      }
    }

    const resolvedAtValue = status === "refunded" || status === "rejected"
      ? "CURRENT_TIMESTAMP"
      : "NULL";

    let result;
    const assignments = ["status = ?", "admin_note = ?"];
    const values = [status, normalizedAdminNote];

    if (cols.has("instruction_link")) {
      assignments.push("instruction_link = ?");
      values.push(normalizedInstructionLink);
    }
    if (cols.has("refund_amount")) {
      assignments.push("refund_amount = ?");
      values.push(status === "refunded" ? Number(parsedAmount) : null);
    }
    if (cols.has("refund_reference")) {
      assignments.push("refund_reference = ?");
      values.push(status === "refunded" ? normalizedReference : null);
    }
    if (cols.has("resolved_at")) {
      assignments.push(`resolved_at = ${resolvedAtValue}`);
    }

    values.push(id);

    [result] = await db.query(
      `UPDATE refund_requests
       SET ${assignments.join(", ")}
       WHERE id = ?`,
      values
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Refund request not found" });
    }

    if (existing.status !== status) {
      await appendRefundEvent({
        refundRequestId: Number(id),
        actorRole: "admin",
        actorId: req.session?.userId ?? null,
        eventType: "status_changed",
        fromStatus: existing.status,
        toStatus: status,
        note: normalizedAdminNote || null,
      });
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
    await ensureContactMessageStatusColumn();
    const [rows] = await db.query(
      `SELECT id, name, email, message, status, created_at
       FROM contact_messages
       ORDER BY created_at DESC`
    );

    res.json(rows);
  } catch (err) {
    console.error("Admin get messages error:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

// UPDATE message status
router.put("/messages/:id/status", adminMiddleware, async (req, res) => {
  try {
    await ensureContactMessageStatusColumn();
    const { id } = req.params;
    const { status } = req.body || {};

    if (!["unread", "read", "archived"].includes(status)) {
      return res.status(400).json({ message: "Invalid message status" });
    }

    const [result] = await db.query(
      "UPDATE contact_messages SET status = ? WHERE id = ?",
      [status, id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.json({ message: "Message status updated" });
  } catch (err) {
    console.error("Admin update message status error:", err);
    res.status(500).json({ message: "Server error" });
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

/* ======================================================
    FEEDBACK (fixed)
====================================================== */

router.get("/feedback", adminMiddleware, async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, email, rating, comments, created_at
       FROM feedback
       ORDER BY created_at DESC`
    );

    res.json(rows);
  } catch (err) {
    console.error("Admin get feedback error:", err);
    res.status(500).json({ message: "Failed to fetch feedback" });
  }
});

// DELETE feedback
router.delete("/feedback/:id", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM feedback WHERE id = ?",
      [id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.json({ message: "Feedback deleted" });
  } catch (err) {
    console.error("Admin delete feedback error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
/* ======================================================
   REVIEWS
====================================================== */

router.get("/reviews", adminMiddleware, async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, product_id, rating, comment, reviewer_name, created_at
       FROM reviews
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Admin get reviews error:", err);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

router.delete("/reviews/:id", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM reviews WHERE id = ?", [id]);

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.json({ message: "Review deleted" });
  } catch (err) {
    console.error("Admin delete review error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
