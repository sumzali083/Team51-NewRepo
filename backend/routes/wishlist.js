const express = require("express");
const db = require("../config/db");

const router = express.Router();

// Auto-create table if it doesn't exist
db.query(`
  CREATE TABLE IF NOT EXISTS wishlist_items (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    product_id  INT NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_product (user_id, product_id)
  )
`).catch(err => console.error("wishlist_items table init error:", err.message));

const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    req.userId = req.session.userId;
    next();
  } else {
    return res.status(401).json({ message: "Please log in" });
  }
};

/**
 * GET /api/wishlist
 * Returns the logged-in user's wishlist with full product info
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
        w.id,
        p.id AS product_id,
        p.name,
        p.price,
        p.sku,
        COALESCE(
          (SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.sort_order ASC LIMIT 1),
          p.image_url,
          '/images/placeholder.jpg'
        ) AS image_url
       FROM wishlist_items w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = ?
       ORDER BY w.created_at DESC`,
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error getting wishlist:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/wishlist
 * Body: { productId }  — accepts numeric ID or SKU string
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: "productId is required" });

    let realProductId = productId;
    if (isNaN(productId)) {
      const [rows] = await db.query("SELECT id FROM products WHERE sku = ?", [productId]);
      if (!rows.length) return res.status(404).json({ message: "Product not found" });
      realProductId = rows[0].id;
    }

    await db.query(
      "INSERT IGNORE INTO wishlist_items (user_id, product_id) VALUES (?, ?)",
      [req.userId, realProductId]
    );

    res.status(201).json({ message: "Added to wishlist", productId: realProductId });
  } catch (err) {
    console.error("Error adding to wishlist:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE /api/wishlist/:productId
 * Removes a single item by product ID or SKU
 */
router.delete("/:productId", requireAuth, async (req, res) => {
  try {
    const { productId } = req.params;

    let realProductId = productId;
    if (isNaN(productId)) {
      const [rows] = await db.query("SELECT id FROM products WHERE sku = ?", [productId]);
      if (!rows.length) return res.status(404).json({ message: "Product not found" });
      realProductId = rows[0].id;
    }

    await db.query(
      "DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?",
      [req.userId, realProductId]
    );

    res.json({ message: "Removed from wishlist" });
  } catch (err) {
    console.error("Error removing from wishlist:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
