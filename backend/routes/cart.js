const express = require("express");
const db = require("../config/db"); // mysql2/promise pool

const router = express.Router();

// Table name for cart items
const TABLE_NAME = "basket_items";
let _hasProductSizeStock = null;

async function ensureProductSizeStockColumn() {
  const [tableRows] = await db.query("SHOW TABLES LIKE 'product_sizes'");
  if (!tableRows.length) return;
  if (_hasProductSizeStock === null) {
    const [rows] = await db.query(
      `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'product_sizes' AND COLUMN_NAME = 'stock' LIMIT 1`
    );
    _hasProductSizeStock = rows.length > 0;
  }
  if (!_hasProductSizeStock) {
    await db.query("ALTER TABLE product_sizes ADD COLUMN stock INT NOT NULL DEFAULT 0");
    _hasProductSizeStock = true;
    await db.query(
      `UPDATE product_sizes ps
       JOIN products p ON p.id = ps.product_id
       SET ps.stock = COALESCE(p.stock, 0)
       WHERE ps.stock IS NULL OR ps.stock = 0`
    );
  }
}

// Ensure color/size/selected_image_url columns exist (run once on startup)
(async () => {
  try {
    const cols = ["color VARCHAR(100)", "size VARCHAR(50)", "selected_image_url VARCHAR(1000)"];
    for (const col of cols) {
      const colName = col.split(" ")[0];
      const [rows] = await db.query(
        `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1`,
        [TABLE_NAME, colName]
      );
      if (!rows.length) {
        await db.query(`ALTER TABLE ${TABLE_NAME} ADD COLUMN ${col}`);
      }
    }
  } catch (_) {
    // Non-fatal: app still works, color/size just won't persist for logged-in users
  }
})();

/**
 * Middleware to get userId from session
 */
const getUserId = (req, res, next) => {
  if (req.session && req.session.userId) {
    req.userId = req.session.userId;
    next();
  } else {
    return res.status(401).json({ message: "Please log in to add items to cart" });
  }
};

/**
 * POST /api/cart
 * Body: { productId, quantity }
 * Uses userId from session
 * - Finds the real numeric ID if a SKU string is sent
 * - if item exists for that user+product -> increase quantity
 * - else -> insert new row
 */
router.post("/", getUserId, async (req, res) => {
  try {
    await ensureProductSizeStockColumn();
    const userId = req.userId;
    const { productId, quantity, color = null, size = null, selectedImageUrl = null } = req.body;
    const qtyToAdd = Number(quantity);

    if (!productId || !quantity) {
      return res
        .status(400)
        .json({ message: "productId and quantity are required" });
    }
    if (!Number.isInteger(qtyToAdd) || qtyToAdd <= 0) {
      return res.status(400).json({ message: "quantity must be a positive integer" });
    }

    // === STEP 1: RESOLVE SKU TO ID ===
    // The frontend might send "w-001" (string), but database needs 8 (integer)
    let realProductId = productId;

    // Check if productId is NOT a number (meaning it is a SKU string)
    if (isNaN(productId)) {
       const [productRows] = await db.query(
         "SELECT id FROM products WHERE sku = ?", 
         [productId]
       );
       
       if (productRows.length === 0) {
         return res.status(404).json({ message: "Product not found" });
       }
       // Found it! Use the real number (e.g., 8) instead of the text (w-001)
       realProductId = productRows[0].id;
    }

    // === STEP 2: CHECK STOCK ===
    const [productRowsById] = await db.query(
      "SELECT id, stock FROM products WHERE id = ? LIMIT 1",
      [realProductId]
    );
    if (!productRowsById.length) {
      return res.status(404).json({ message: "Product not found" });
    }
    const availableStock = Number(productRowsById[0].stock || 0);
    if (availableStock <= 0) {
      return res.status(409).json({ message: "This item is sold out" });
    }
    if (size) {
      const [sizeRows] = await db.query(
        "SELECT stock FROM product_sizes WHERE product_id = ? AND size = ? LIMIT 1",
        [realProductId, size]
      );
      if (!sizeRows.length) {
        return res.status(409).json({ message: "Selected size is unavailable" });
      }
      const availableSizeStock = Number(sizeRows[0].stock || 0);
      if (availableSizeStock <= 0) {
        return res.status(409).json({ message: "Selected size is sold out" });
      }
      if (qtyToAdd > availableSizeStock) {
        return res.status(409).json({
          message: `Only ${availableSizeStock} left in size ${size}`,
          availableStock: availableSizeStock,
        });
      }
    }

    // === STEP 3: CHECK IF ALREADY IN CART (match by product + color + size) ===
    const [existingRows] = await db.query(
      `SELECT * FROM ${TABLE_NAME}
       WHERE user_id = ? AND product_id = ?
         AND COALESCE(color,'') = COALESCE(?,'')
         AND COALESCE(size,'') = COALESCE(?,'')`,
      [userId, realProductId, color, size]
    );

    const currentQty = existingRows.length > 0 ? Number(existingRows[0].quantity || 0) : 0;
    const newQty = currentQty + qtyToAdd;
    if (newQty > availableStock) {
      return res.status(409).json({
        message: `Only ${availableStock} left in stock`,
        availableStock,
      });
    }
    if (size) {
      const [sizeRows] = await db.query(
        "SELECT stock FROM product_sizes WHERE product_id = ? AND size = ? LIMIT 1",
        [realProductId, size]
      );
      const availableSizeStock = sizeRows.length ? Number(sizeRows[0].stock || 0) : 0;
      if (newQty > availableSizeStock) {
        return res.status(409).json({
          message: `Only ${availableSizeStock} left in size ${size}`,
          availableStock: availableSizeStock,
        });
      }
    }

    if (existingRows.length > 0) {
      const current = existingRows[0];
      await db.query(
        `UPDATE ${TABLE_NAME} SET quantity = ?, selected_image_url = ? WHERE id = ?`,
        [newQty, selectedImageUrl || current.selected_image_url, current.id]
      );
      return res.json({
        message: "Cart item updated",
        itemId: current.id,
        quantity: newQty,
        productId: realProductId
      });
    } else {
      const [result] = await db.query(
        `INSERT INTO ${TABLE_NAME} (user_id, product_id, quantity, color, size, selected_image_url)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, realProductId, qtyToAdd, color, size, selectedImageUrl]
      );
      return res.status(201).json({
        message: "Item added to cart",
        itemId: result.insertId,
        productId: realProductId
      });
    }
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/cart
 * Returns all items in user's cart with product info
 * Uses userId from session
 */
router.get("/", getUserId, async (req, res) => {
  try {
    const userId = req.userId;

    const [rows] = await db.query(
      `SELECT
        b.id,
        b.quantity,
        b.product_id,
        b.color,
        b.size,
        b.selected_image_url,
        p.name,
        p.price,
        p.stock,
        p.sku,
        COALESCE(
          b.selected_image_url,
          (SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.sort_order ASC LIMIT 1),
          p.image_url,
          '/images/placeholder.jpg'
        ) AS image_url
       FROM ${TABLE_NAME} b
       JOIN products p ON b.product_id = p.id
       WHERE b.user_id = ?`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error getting cart:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /api/cart/:itemId
 * Updates quantity of a cart item
 */
router.put("/:itemId", getUserId, async (req, res) => {
  try {
    await ensureProductSizeStockColumn();
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.userId;

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({ message: "Valid quantity is required" });
    }

    // Verify the item belongs to the user
    const [existing] = await db.query(
      `SELECT * FROM ${TABLE_NAME} WHERE id = ? AND user_id = ?`,
      [itemId, userId]
    );

    if (!existing.length) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    if (Number(quantity) === 0) {
      // Delete if quantity is 0
      await db.query(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, [itemId]);
      return res.json({ message: "Cart item removed" });
    }

    const productId = existing[0].product_id;
    const [productRows] = await db.query(
      "SELECT stock FROM products WHERE id = ? LIMIT 1",
      [productId]
    );
    if (!productRows.length) {
      return res.status(404).json({ message: "Product not found" });
    }
    const availableStock = Number(productRows[0].stock || 0);
    if (Number(quantity) > availableStock) {
      return res.status(409).json({
        message: availableStock <= 0 ? "This item is sold out" : `Only ${availableStock} left in stock`,
        availableStock,
      });
    }

    const selectedSize = existing[0].size;
    if (selectedSize) {
      const [sizeRows] = await db.query(
        "SELECT stock FROM product_sizes WHERE product_id = ? AND size = ? LIMIT 1",
        [productId, selectedSize]
      );
      const availableSizeStock = sizeRows.length ? Number(sizeRows[0].stock || 0) : 0;
      if (Number(quantity) > availableSizeStock) {
        return res.status(409).json({
          message: availableSizeStock <= 0
            ? `Size ${selectedSize} is sold out`
            : `Only ${availableSizeStock} left in size ${selectedSize}`,
          availableStock: availableSizeStock,
        });
      }
    }

    // Update quantity
    await db.query(
      `UPDATE ${TABLE_NAME} SET quantity = ? WHERE id = ?`,
      [quantity, itemId]
    );

    res.json({ message: "Cart item updated", quantity });
  } catch (err) {
    console.error("Error updating cart item:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE /api/cart/:itemId
 * Removes a single cart item by its id
 */
router.delete("/:itemId", getUserId, async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.userId;

    // Verify the item belongs to the user and delete
    const [result] = await db.query(
      `DELETE FROM ${TABLE_NAME} WHERE id = ? AND user_id = ?`,
      [itemId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.json({ message: "Cart item removed" });
  } catch (err) {
    console.error("Error removing cart item:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE /api/cart
 * Clears all items in a user's cart
 * Uses userId from session
 */
router.delete("/", getUserId, async (req, res) => {
  try {
    const userId = req.userId;

    await db.query(
      `DELETE FROM ${TABLE_NAME} WHERE user_id = ?`,
      [userId]
    );

    res.json({ message: "Cart cleared" });
  } catch (err) {
    console.error("Error clearing cart:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
