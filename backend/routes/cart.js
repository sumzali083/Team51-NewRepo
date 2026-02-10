// backend/routes/cart.js
const express = require("express");
const db = require("../config/db"); // mysql2/promise pool

const router = express.Router();

// Table name for cart items
const TABLE_NAME = "basket_items";

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
 * - if item exists for that user+product → increase quantity
 * - else → insert new row
 */
router.post("/", getUserId, async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res
        .status(400)
        .json({ message: "productId and quantity are required" });
    }

    // 1. check if this product is already in the user's cart
    const [existingRows] = await db.query(
      `SELECT * FROM ${TABLE_NAME} WHERE user_id = ? AND product_id = ?`,
      [userId, productId]
    );

    if (existingRows.length > 0) {
      // update quantity (add to existing)
      const current = existingRows[0];
      const newQty = current.quantity + Number(quantity);

      await db.query(
        `UPDATE ${TABLE_NAME} SET quantity = ? WHERE id = ?`,
        [newQty, current.id]
      );

      return res.json({
        message: "Cart item updated",
        itemId: current.id,
        quantity: newQty,
      });
    } else {
      // insert new row
      const [result] = await db.query(
        `INSERT INTO ${TABLE_NAME} (user_id, product_id, quantity)
         VALUES (?, ?, ?)`,
        [userId, productId, quantity]
      );

      return res.status(201).json({
        message: "Item added to cart",
        itemId: result.insertId,
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
        b.*, 
        p.name, 
        p.price, 
        COALESCE(
          (SELECT pi.url 
           FROM product_images pi 
           WHERE pi.product_id = p.id 
           ORDER BY pi.sort_order ASC 
           LIMIT 1),
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
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.userId;

    if (!quantity || quantity < 0) {
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

    if (quantity === 0) {
      // Delete if quantity is 0
      await db.query(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, [itemId]);
      return res.json({ message: "Cart item removed" });
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

    // Verify the item belongs to the user
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