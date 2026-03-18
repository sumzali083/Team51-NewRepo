const express = require("express");
const db = require("../config/db");
const { getOrderHistoryForUser } = require("../services/orderHistory");
const { ensureStockMovementsTable, recordStockMovement } = require("../services/stockMovements");
const router = express.Router();

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

/**
 * POST /api/orders/checkout
 * Body: { userId }
 *
 * Steps:
 * 1. Get all basket_items for that user joined with products (for price)
 * 2. If empty → 400
 * 3. Calculate total price
 * 4. Insert into orders
 * 5. Insert each item into order_items
 * 6. Clear basket_items for that user
 */
router.post("/checkout", async (req, res) => {
  const userId = req.session && req.session.userId;

  if (!userId) {
    //validate userId
    return res.status(401).json({ message: "Please log in to checkout" });
  }

  let connection;

  try {
    const [userRows] = await db.query("SELECT id FROM users WHERE id = ?", [userId]);
    if (!userRows.length) {
      return res.status(401).json({ message: "User does not exist" });
    }

    await ensureProductSizeStockColumn();
    await ensureStockMovementsTable();

    const [cartItems] = await db.query(
      `SELECT b.id, b.product_id, b.quantity, b.size, p.price, p.stock
       FROM basket_items b
       JOIN products p ON b.product_id = p.id
       WHERE b.user_id = ?`,
      [userId]
    );
    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product ID ${item.product_id}`,
        });
      }
      if (item.size) {
        const [sizeRows] = await db.query(
          "SELECT stock FROM product_sizes WHERE product_id = ? AND size = ? LIMIT 1",
          [item.product_id, item.size]
        );
        if (!sizeRows.length) {
          return res.status(400).json({
            message: `Size ${item.size} is not available for product ID ${item.product_id}`,
          });
        }
        if (Number(sizeRows[0].stock || 0) < Number(item.quantity || 0)) {
          return res.status(400).json({
            message: `Insufficient stock for size ${item.size} on product ID ${item.product_id}`,
          });
        }
      }
    }

    const totalPrice = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [orderResult] = await connection.query(
      "INSERT INTO orders (user_id, total_price) VALUES (?, ?)",
      [userId, totalPrice]
    );
    const orderId = orderResult.insertId;

    for (const item of cartItems) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_each)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.price]
      );

      await connection.query(
        `UPDATE products
         SET stock = stock - ?
         WHERE id = ?`,
        [item.quantity, item.product_id]
      );

      if (item.size) {
        await connection.query(
          `UPDATE product_sizes
           SET stock = stock - ?
           WHERE product_id = ? AND size = ?`,
          [item.quantity, item.product_id, item.size]
        );
      }

      await recordStockMovement({
        conn: connection,
        productId: item.product_id,
        size: item.size || null,
        movementType: "outgoing",
        quantity: item.quantity,
        referenceType: "order",
        referenceId: orderId,
        note: "Checkout order placement",
        actorUserId: userId,
      });
    }

    await connection.query("DELETE FROM basket_items WHERE user_id = ?", [userId]);

    await connection.commit();

    return res.status(201).json({
      saved: true,
      message: "Order placed",
      orderId,
      totalPrice,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        console.error("Rollback error:", rollbackErr);
      }
    }
    return res.status(500).json({ message: "Server error during checkout" });
  } finally {
    if (connection) connection.release();
  }
});

/**
 * GET /api/orders/history
 * Returns all orders for a logged in user
 */

router.get("/history", async(req,res) =>{
  const userId = req.session && req.session.userId;

  if(!userId){
    return res.status(401).json({ message: "Please log in to view order history"});
  }

  try {
    const orders = await getOrderHistoryForUser(userId);
    res.json(orders);

  } catch (err) {
    console.error("Order history error:", err);
    res.status(500).json({message:"Server error"});
  }
});

module.exports = router;
