// backend/routes/admin.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const db = require("../config/db");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// Multer storage: saves to backend/uploads/products/
const uploadDir = path.join(__dirname, "../uploads/products");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    cb(null, allowed.includes(file.mimetype));
  },
});

// UPLOAD product image
router.post("/upload-image", adminMiddleware, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image file provided" });
  res.json({ url: `/uploads/products/${req.file.filename}` });
});

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

// GET all products for inventory management
router.get("/products", adminMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
         p.id,
         p.sku,
         p.name,
         p.price,
         p.stock,
         c.name AS category
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY p.id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Admin get products error:", err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// UPDATE stock for one product
router.put("/products/:id/stock", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const nextStock = Number(req.body?.stock);

    if (!Number.isInteger(nextStock) || nextStock < 0) {
      return res.status(400).json({ message: "Stock must be a non-negative integer" });
    }

    const [result] = await db.query(
      "UPDATE products SET stock = ? WHERE id = ?",
      [nextStock, id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json({ message: "Stock updated successfully" });
  } catch (err) {
    console.error("Admin update stock error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE product
router.post("/products", adminMiddleware, async (req, res) => {
  try {
    const { sku, name, category_id, price, stock, description, sizes, colors, images } = req.body;
    if (!sku || !name || !category_id || price == null)
      return res.status(400).json({ message: "sku, name, category_id and price are required" });
    const parsedPrice = Number(price);
    const parsedStock = Number(stock ?? 0);
    if (isNaN(parsedPrice) || parsedPrice <= 0)
      return res.status(400).json({ message: "price must be a positive number" });
    if (!Number.isInteger(parsedStock) || parsedStock < 0)
      return res.status(400).json({ message: "stock must be a non-negative integer" });
    if (![11, 12, 13, 14, 15].includes(Number(category_id)))
      return res.status(400).json({ message: "Invalid category_id" });

    const [productResult] = await db.query(
      `INSERT INTO products (sku, category_id, name, description, price, stock) VALUES (?, ?, ?, ?, ?, ?)`,
      [sku.trim(), Number(category_id), name.trim(), description || "", parsedPrice, parsedStock]
    );
    const newId = productResult.insertId;

    const imageUrls = (images || []).filter((u) => u && u.trim());
    for (let i = 0; i < imageUrls.length; i++) {
      await db.query(
        `INSERT INTO product_images (product_id, url, sort_order) VALUES (?, ?, ?)`,
        [newId, imageUrls[i].trim(), i]
      );
    }
    for (const size of (sizes || []).filter((s) => s && s.trim())) {
      await db.query(`INSERT INTO product_sizes (product_id, size) VALUES (?, ?)`, [newId, size.trim()]);
    }
    for (const color of (colors || []).filter((c) => c && c.trim())) {
      await db.query(`INSERT INTO product_colors (product_id, color) VALUES (?, ?)`, [newId, color.trim()]);
    }

    res.status(201).json({ message: "Product created", id: newId });
  } catch (err) {
    console.error("Admin create product error:", err);
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ message: "A product with that SKU already exists" });
    res.status(500).json({ message: "Failed to create product" });
  }
});

// DELETE product + cascade child records
router.delete("/products/:id", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    // Remove from carts and wishlists first (FK references to products.id)
    await db.query(`DELETE FROM basket_items   WHERE product_id = ?`, [id]);
    await db.query(`DELETE FROM wishlist_items WHERE product_id = ?`, [id]);
    await db.query(`DELETE FROM reviews        WHERE product_id = ?`, [id]);
    await db.query(`DELETE FROM product_images WHERE product_id = ?`, [id]);
    await db.query(`DELETE FROM product_sizes  WHERE product_id = ?`, [id]);
    await db.query(`DELETE FROM product_colors WHERE product_id = ?`, [id]);
    const [result] = await db.query(`DELETE FROM products WHERE id = ?`, [id]);
    if (!result.affectedRows) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("Admin delete product error:", err);
    res.status(500).json({ message: err.message || "Failed to delete product" });
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

    res.json({
      totalProducts: productCount.totalProducts,
      totalOrders: orderCount.totalOrders,
      totalRevenue: revenue.totalRevenue || 0,
      lowStockCount: lowStock.lowStockCount
    });

  } catch (err) {
    console.error("Admin reports error:", err);
    res.status(500).json({ message: "Failed to generate reports" });
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

// GET all reviews
router.get("/reviews", adminMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.id, r.product_id, r.user_id, r.rating, r.comment, r.reviewer_name, r.created_at
       FROM reviews r
       ORDER BY r.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Admin get reviews error:", err);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

// DELETE review
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
