// backend/routes/admin.js
const express = require("express");
const db = require("../config/db");
const adminMiddleware = require("../middleware/adminMiddleware");
const { ensureRefundsTable, ALLOWED_STATUSES } = require("./refunds");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const uploadsPath = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsPath),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = ext && ext.length <= 6 ? ext : ".jpg";
    cb(null, `product-${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});
const upload = multer({ storage });

async function tableExists(tableName) {
  const [rows] = await db.query("SHOW TABLES LIKE ?", [tableName]);
  return rows.length > 0;
}

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
   PRODUCT MANAGEMENT
====================================================== */

router.get("/products", adminMiddleware, async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
        p.id,
        p.sku,
        p.name,
        p.price,
        p.stock,
        p.category_id,
        c.name AS category,
        p.description,
        p.created_at
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ORDER BY p.id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Admin get products error:", err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

router.post("/upload-image", adminMiddleware, upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image uploaded" });
  return res.json({ url: `/uploads/${req.file.filename}` });
});

router.post("/products", adminMiddleware, async (req, res) => {
  const {
    sku,
    name,
    category_id,
    price,
    stock = 0,
    description = "",
    sizes = [],
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

    const [ins] = await conn.query(
      `INSERT INTO products (sku, category_id, name, description, price, stock)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [String(sku).trim(), Number(category_id), String(name).trim(), String(description).trim(), Number(price), Number(stock) || 0]
    );
    const productId = ins.insertId;

    if ((await tableExists("product_sizes")) && Array.isArray(sizes) && sizes.length) {
      for (const s of sizes) {
        await conn.query("INSERT INTO product_sizes (product_id, size) VALUES (?, ?)", [productId, String(s)]);
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

router.delete("/products/:id", adminMiddleware, async (req, res) => {
  const { id } = req.params;
  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    if (await tableExists("product_images")) {
      await conn.query("DELETE FROM product_images WHERE product_id = ?", [id]);
    }
    if (await tableExists("product_sizes")) {
      await conn.query("DELETE FROM product_sizes WHERE product_id = ?", [id]);
    }
    if (await tableExists("product_colors")) {
      await conn.query("DELETE FROM product_colors WHERE product_id = ?", [id]);
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
